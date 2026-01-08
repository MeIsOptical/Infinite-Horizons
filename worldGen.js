// Dream Game/worldGen.js

//#region World Initialization

/**
 * Applies the world settings to the global state.
 * Handles both fresh starts and loading from save files.
 */
function setWorld(settings) {
    currentWorldSettings = settings;
    
    // Global tracker for structures spawned by AI that need to be generated in future chunks
    window.pendingStructures = {}; 
    // NEW: Tracker for chunks that must be a specific biome type (requested by AI)
    window.forcedBiomes = {};

    // NEW: Update Player Model if provided and valid
    if (settings.playerModel && ASSET_LIBRARY[settings.playerModel]) {
        window.playerModel = settings.playerModel;
        
        // Update the existing player object's dimensions to match the new model
        if (typeof window.player !== 'undefined') {
            window.player.width = ASSET_LIBRARY[window.playerModel].width;
            window.player.height = ASSET_LIBRARY[window.playerModel].height;
        }
    }

    // --- SAVE RESTORATION LOGIC ---
    if (settings.savedState) {
        console.log("Restoring saved world state...");
        window.worldSeed = settings.savedState.seed;
        window.loadedChunks = settings.savedState.chunks || {};
        window.player = settings.savedState.player;
        window.camera = settings.savedState.camera;
        if (settings.savedState.pendingStructures) window.pendingStructures = settings.savedState.pendingStructures;
        // Restore forced biomes
        if (settings.savedState.forcedBiomes) window.forcedBiomes = settings.savedState.forcedBiomes;
        
        // ADDED: Restore Quest System State
        if (settings.savedState.questState && window.QuestSystem) {
             window.QuestSystem.gameState = settings.savedState.questState;
             
             // Restore UI for active quest
             if (window.QuestSystem.gameState.questActive && window.QuestSystem.gameState.currentObjective) {
                 const obj = window.QuestSystem.gameState.currentObjective;
                 const descEl = document.getElementById('quest-tracker-desc');
                 // Restore the description text on the HUD
                 if (descEl) descEl.textContent = obj.description;
                 // Force a HUD update to show progress (e.g., 2/5 wolves)
                 window.QuestSystem.updateHUD();
             }
        }
        
    } else {
        // --- NEW WORLD INITIALIZATION ---
        console.log("Initializing new world...");
        window.worldSeed = Math.floor(Math.random() * 100000);
        
        // Clear chunks
        for (var key in window.loadedChunks) delete window.loadedChunks[key];
        
        // Reset Player
        window.player = window.getFreshPlayer();
    }
    
    window.worldBackgroundColor = settings.skyTint || '#000';
}
//#endregion

//#region Chunk Generation

// Helper: Generates a list of (dx, dy) coordinates in a spiral pattern
// count: Number of steps to generate (e.g., 49 covers a 7x7 grid)
function generateSpiralOffsets(count) {
    const offsets = [];
    let x = 0, y = 0;
    let dx = 0, dy = -1;
    
    for (let i = 0; i < count; i++) {
        offsets.push({ x, y });
        if (x === y || (x < 0 && x === -y) || (x > 0 && x === 1 - y)) {
            const temp = dx;
            dx = -dy;
            dy = temp;
        }
        x += dx;
        y += dy;
    }
    
    // Remove (0,0) since that's the starting chunk usually checked first manually
    return offsets.slice(1); 
}

// Helper to requeue failed structures to neighbor chunks in a spiral pattern
function retryStructureInNeighbor(structData, currentChunkX, currentChunkY, currentBiomeName) {
    const attempts = structData.retryCount || 0;
    const maxAttempts = 48; // Try up to ~7x7 grid area

    if (attempts >= maxAttempts) {
        console.error(`[WorldGen] CRITICAL: Could not spawn structure ${structData.type} after ${maxAttempts} chunk retries.`);
        return;
    }

    // Generate offsets (once and cached in reality, but cheap enough to regen)
    const offsets = generateSpiralOffsets(maxAttempts + 1); 
    const offset = offsets[attempts]; // Get the next offset in the spiral

    // Determine the "Origin" chunk. If this is the first retry, the current chunk is the origin.
    // If it's a subsequent retry, we must rely on the stored origin to spiral correctly.
    const originX = (structData.originX !== undefined) ? structData.originX : currentChunkX;
    const originY = (structData.originY !== undefined) ? structData.originY : currentChunkY;

    // Calculate Absolute Target Chunk based on Origin + Spiral Offset
    const nextChunkX = originX + offset.x;
    const nextChunkY = originY + offset.y;
    const nextKey = `${nextChunkX},${nextChunkY}`;

    console.log(`[WorldGen] Structure ${structData.type} failed. Try #${attempts + 1} at ${nextKey} (Origin: ${originX},${originY})`);

    // 1. Force Biome compatibility
    if (!window.forcedBiomes[nextKey]) {
        window.forcedBiomes[nextKey] = currentBiomeName;
    }

    // 2. Queue in the specific target neighbor
    if (!window.pendingStructures[nextKey]) window.pendingStructures[nextKey] = [];

    window.pendingStructures[nextKey].push({
        type: structData.type,
        name: structData.name,
        x: null, // Reset position preference
        y: null,
        retryCount: attempts + 1,
        originX: originX, // Persist the origin
        originY: originY
    });

    // 3. FORCE LOAD THE NEIGHBOR to trigger immediate retry
    setTimeout(() => {
        getChunk(nextChunkX, nextChunkY);
    }, 0);
}

/**
 * Retreives a chunk. If it doesn't exist, it generates it procedurally.
 * Handles biome selection, object placement, and pending structure injection.
 * @param {number} chunkX - The X coordinate of the chunk index.
 * @param {number} chunkY - The Y coordinate of the chunk index.
 */
function getChunk(chunkX, chunkY) {
    const key = `${chunkX},${chunkY}`;

    // If we already visited this chunk, return the saved version
    if (window.loadedChunks[key]) {
        
        // FIX: Check for pending structures even if the chunk is already loaded
        if (window.pendingStructures[key]) {
            console.log(`Injecting pending structures into existing chunk ${key}`);
            const pendingList = window.pendingStructures[key];
            const chunkObjects = window.loadedChunks[key];

            // Recover the biome from the existing ground object so we use the correct structure legend
            const groundObj = chunkObjects.find(o => o.type === 'ground');
            const currentBiome = groundObj ? groundObj.biome : currentWorldSettings.biomes[0];

            pendingList.forEach(structData => {
                let structType = structData;
                let structName = null;
                let targetX = null;
                let targetY = null;

                if (typeof structData === 'object') {
                    structType = structData.type;
                    structName = structData.name;
                    targetX = structData.x;
                    targetY = structData.y;
                }

                const blueprint = { type: structType, count: 1, chance: 1.0, name: structName };
                
                // Attempt to place
                const success = placeStructureForced(blueprint, currentBiome, chunkX, chunkY, chunkObjects, targetX, targetY);
                
                // NEW: Retry logic if placement failed
                if (!success && typeof structData === 'object') {
                    retryStructureInNeighbor(structData, chunkX, chunkY, currentBiome.name);
                }
            });
            
            // Clear pending list so they don't spawn again (or are moved to neighbor)
            delete window.pendingStructures[key];
        }

        window.loadedChunks[key] = window.loadedChunks[key].filter(obj => !obj.dead);
        return window.loadedChunks[key];
    }

    const newChunkObjects = [];

    // Select a random biome
    const biomes = currentWorldSettings.biomes;
    let biome = null;

    // 1. Check if this chunk was forced to be a specific biome by the AI
    if (window.forcedBiomes && window.forcedBiomes[key]) {
        const forcedName = window.forcedBiomes[key];
        biome = biomes.find(b => b.name === forcedName);
    }

    // 2. If not forced (or invalid), use random generation
    if (!biome) {
        let totalWeight = 0;
        biomes.forEach(b => totalWeight += (b.rarity || 1));
        let randomWeight = pseudoRandom(chunkX, chunkY) * totalWeight;
        biome = biomes[0];
        for (let i = 0; i < biomes.length; i++) {
            if (randomWeight < biomes[i].rarity) {
                biome = biomes[i];
                break;
            }
            randomWeight -= biomes[i].rarity;
        }
    }

    // Add Ground
    newChunkObjects.push({
        x: chunkX * CHUNK_SIZE,
        y: chunkY * CHUNK_SIZE,
        width: CHUNK_SIZE,
        height: CHUNK_SIZE,
        color: biome.groundColor,
        skyTint: biome.skyTint,
        type: 'ground',
        biome: biome
    });


    // --- NEW: Spawn Pending AI Structures ---
    if (window.pendingStructures[key]) {
        const pendingList = window.pendingStructures[key];
        pendingList.forEach(structData => {
            let structType = structData;
            let structName = null;
            let targetX = null;
            let targetY = null;

            if (typeof structData === 'object') {
                structType = structData.type;
                structName = structData.name;
                targetX = structData.x;
                targetY = structData.y;
            }

            // Force spawn a specific structure at a random spot in this chunk
            const blueprint = { type: structType, count: 1, chance: 1.0, name: structName };
            
            // Attempt placement
            const success = placeStructureForced(blueprint, biome, chunkX, chunkY, newChunkObjects, targetX, targetY);

            // NEW: Retry logic if placement failed
            if (!success && typeof structData === 'object') {
                retryStructureInNeighbor(structData, chunkX, chunkY, biome.name);
            }
        });
        // Clear pending after spawning
        delete window.pendingStructures[key];
    }


    // --- Spawn Structures ---
    if (biome.structures) {
        const generationType = biome.structureGenerationType || 'scattered';
        biome.structures.forEach(structBlueprint => {
            if (generationType === 'grid') {
                placeStructuresInGrid(structBlueprint, biome, chunkX, chunkY, newChunkObjects);
            } else {
                placeStructuresScattered(structBlueprint, biome, chunkX, chunkY, newChunkObjects);
            }
        });
    }


    // --- Add Objects ---
    if (biome.objects) {
        biome.objects.forEach(blueprint => {
            spawnObjectOrEntity(blueprint, chunkX, chunkY, newChunkObjects, false, false);
        });
    }

    // --- Add Items ---
    if (biome.items) {
        biome.items.forEach(blueprint => {
            spawnObjectOrEntity(blueprint, chunkX, chunkY, newChunkObjects, false, true, blueprint.itemData);
        });
    }

    // --- Add Entities ---
    if (biome.entities) {
        biome.entities.forEach(blueprint => {
            spawnObjectOrEntity(blueprint, chunkX, chunkY, newChunkObjects, true, false);
        });
    }

    window.loadedChunks[key] = newChunkObjects;
    return newChunkObjects;
}



// Rotates a 2D grid (matrix) 90 degrees
function rotateLayout(structData) {
    const matrix = structData.layout || structData;

    if (!matrix || !Array.isArray(matrix) || !matrix[0]) {
        console.error("Rotation failed: Invalid layout format", structData);
        return matrix;
    }

    return matrix[0].map((_, index) => 
        matrix.map(row => row[index]).reverse()
    );
}


// Semi-random number generator based on coordinates (Deterministic Noise)
function pseudoRandom(x, y) {
    let n = Math.sin(x * 12.9898 + y * 78.233 + window.worldSeed) * 43758.5453;
    return n - Math.floor(n);
}

// Checks if a rectangular area is free of collidable objects
function isSpaceFree(candidate, existingObjects) {
    const candidateHitbox = getHitbox(candidate);

    for (const obj of existingObjects) {
        if (obj.type === 'ground') continue;

        if (checkCollision(candidateHitbox, getHitbox(obj))) {
            return false;
        }
    }

    return true; // No collisions found
}

//#endregion

//#region AI Asset Injection

// Function called by QuestSystem to spawn AI generated assets
window.spawnQuestAssets = function(spawnList) {
    if (!spawnList || !Array.isArray(spawnList)) return;

    spawnList.forEach(item => {
        const count = item.count || 1;
        const type = item.type;
        const name = item.name || null;
        const behavior = item.behavior || null;
        
        // Distance parsing
        let minDist = 1000;
        let maxDist = 1800;

        if (item.distance === 'close') { minDist = 250; maxDist = 800; }
        else if (item.distance === 'medium') { minDist = 1200; maxDist = 2000; }
        else if (item.distance === 'far') { minDist = 3000; maxDist = 6000; }
        else if (item.distance === 'very far') { minDist = 7000; maxDist = 10000; }
        
        if (!type) return;

        // Try to find a valid spot
        const attempts = 100;
        
        for (let i = 0; i < count; i++) {
            let spawned = false;

            // --- ATTEMPT 1: Random Sampling (Good for natural scatter) ---
            for (let attempt = 0; attempt < attempts; attempt++) {
                // Random angle
                const angle = Math.random() * Math.PI * 2;
                const dist = minDist + (Math.random() * (maxDist - minDist));

                const spawnX = window.player.x + Math.cos(angle) * dist;
                const spawnY = window.player.y + Math.sin(angle) * dist;

                // Determine which chunk this is in
                const cx = Math.floor(spawnX / CHUNK_SIZE);
                const cy = Math.floor(spawnY / CHUNK_SIZE);
                const key = `${cx},${cy}`;

                // --- Biome Check ---
                if (item.biome) {
                    // Case 1: Chunk is already loaded
                    if (window.loadedChunks[key]) {
                        const chunkBiome = window.loadedChunks[key][0].biome.name;
                        if (chunkBiome !== item.biome) {
                            // Soft retry: push boundaries out slightly to find new lands
                            minDist += 100;
                            maxDist += 100;
                            continue;
                        }
                    } 
                    // Case 2: Chunk is not loaded -> Force it
                    else {
                        if (!window.forcedBiomes) window.forcedBiomes = {};
                        window.forcedBiomes[key] = item.biome;
                        getChunk(cx, cy);
                    }
                }

                // --- Structure Logic ---
                // Structures are complex and handle their own placement in getChunk via pendingStructures
                if (item.category === 'structure') {
                    if (!window.pendingStructures[key]) window.pendingStructures[key] = [];
                    
                    const relX = spawnX - (cx * CHUNK_SIZE);
                    const relY = spawnY - (cy * CHUNK_SIZE);

                    window.pendingStructures[key].push({ 
                        type: type, 
                        name: name,
                        x: relX,
                        y: relY,
                        retryCount: 0,
                        originX: cx, // Set Origin for Spiral logic
                        originY: cy
                    });

                    console.log(`Queued structure ${type} (Name: ${name}) at ${spawnX}, ${spawnY}`);
                    getChunk(cx, cy); // Force load to trigger the spawn
                    spawned = true;
                    break;
                } 
                // --- Entity/Object Logic (WITH SCALING & COLLISION) ---
                else {
                    if (!window.loadedChunks[key]) {
                        getChunk(cx, cy); 
                    }

                    if (trySpawnEntityAt(type, spawnX, spawnY, item, behavior, name, window.loadedChunks[key])) {
                        spawned = true;
                        break;
                    }
                }
            }
            
            // --- ATTEMPT 2: Emergency Deterministic Spawn (If RNG failed) ---
            // Only for Entities/Objects (Structures handle retries internally)
            if (!spawned && item.category !== 'structure') {
                console.log(`[QuestSystem] RNG Spawn failed for ${type}. Entering Expanding Spiral Search...`);
                
                // Spiral search for a valid chunk (up to 49 chunks ~ 7x7 grid)
                const spiralOffsets = generateSpiralOffsets(50);

                const currentCx = Math.floor(window.player.x / CHUNK_SIZE);
                const currentCy = Math.floor(window.player.y / CHUNK_SIZE);
                
                // Check current chunk first (implied index 0) if not checked
                spiralOffsets.unshift({x:0, y:0});

                for (let offset of spiralOffsets) {
                    const cx = currentCx + offset.x;
                    const cy = currentCy + offset.y;
                    const key = `${cx},${cy}`;
                    
                    // Check Biome Compatibility
                    if (item.biome) {
                        if (window.loadedChunks[key]) {
                            // If loaded and wrong biome, skip this chunk completely
                            if (window.loadedChunks[key][0].biome.name !== item.biome) continue;
                        } else {
                            // If unloaded, FORCE it to be the correct biome
                            if (!window.forcedBiomes) window.forcedBiomes = {};
                            window.forcedBiomes[key] = item.biome;
                        }
                    }

                    // Ensure chunk is loaded (Generates it if needed, applying Forced Biome)
                    const chunkObjs = getChunk(cx, cy);

                    // Try 50 random spots WITHIN this specific valid chunk
                    for(let k=0; k<50; k++) {
                        const spotX = (cx * CHUNK_SIZE) + (Math.random() * (CHUNK_SIZE - 200)) + 100;
                        const spotY = (cy * CHUNK_SIZE) + (Math.random() * (CHUNK_SIZE - 200)) + 100;

                        if (trySpawnEntityAt(type, spotX, spotY, item, behavior, name, chunkObjs)) {
                            console.log(`[QuestSystem] Emergency spawn successful at ${spotX}, ${spotY}`);
                            spawned = true;
                            break;
                        }
                    }
                    if (spawned) break;
                }
            }

            if (!spawned) {
                console.warn(`Could not spawn ${type} after 100 RNG attempts + Spiral Search.`);
            }
        }
    });
};

// Helper to attempt spawning a single entity at a specific spot (used by both RNG and Emergency logic)
function trySpawnEntityAt(type, x, y, item, behavior, name, chunkList) {
    const asset = ASSET_LIBRARY[type];
    if (!asset) return false;

    const minScale = asset.minScale !== undefined ? asset.minScale : 0.7;
    const maxScale = asset.maxScale !== undefined ? asset.maxScale : 1.3;
    const scale = minScale + (Math.random() * (maxScale - minScale));

    const scaledWidth = asset.width * scale;
    const scaledHeight = asset.height * scale;

    const newObj = {
        x: x,
        y: y,
        width: scaledWidth,
        height: scaledHeight,
        scale: scale,
        type: type,
        flipped: Math.random() > 0.5,
        isEntity: asset.isEntity,
        isItem: asset.isItem,
        itemData: item.itemData,
        hasCollision: asset.hasCollision,
        behavior: behavior || 'neutral',
        speed: item.category === 'entity' ? (1.5 + Math.random()) : 0,
        wanderAngle: Math.random() * Math.PI * 2,
        health: 100,
        maxHealth: 100,
        name: name, 
        nameVisibility: !!name 
    };

    // Check 1: Safe Zone (start area)
    if (checkCollision(newObj, { x: -100, y: -100, width: 250, height: 300 })) return false;

    // Check 2: World Objects
    if (isSpaceFree(newObj, chunkList)) {
        chunkList.push(newObj);
        return true;
    }

    return false;
}

// Helper to spawn items (avoiding code duplication for entities vs objects)
function spawnObjectOrEntity(blueprint, chunkX, chunkY, newChunkObjects, isEntity, isItem, itemData) {
    const count = Math.floor(blueprint.count / 2) + 1;

    for (let i = 0; i < count; i++) {
        for (let attempts = 0; attempts < 10; attempts++) {
            const typeOffset = blueprint.type.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const seedMod = isEntity ? 999 : 0;
            const r1 = pseudoRandom(chunkX * i + chunkY + attempts + typeOffset + seedMod, i + attempts);
            const r2 = pseudoRandom(i + attempts + seedMod, chunkY * i + chunkX + attempts + typeOffset);
            const r3 = pseudoRandom(chunkX * 7 + i * 13 + attempts, chunkY * 11 + i * 5);

            const asset = ASSET_LIBRARY[blueprint.type];
            if (!asset) continue;

            // 1. Get scale limits from asset or use defaults
            const minScale = asset.minScale !== undefined ? asset.minScale : 0.7;
            const maxScale = asset.maxScale !== undefined ? asset.maxScale : 1.3;

            // 2. Calculate the specific scale for this instance (using r1 to keep it deterministic)
            const scale = minScale + (r1 * (maxScale - minScale));

            // 3. Calculate new dimensions based on scale
            const scaledWidth = asset.width * scale;
            const scaledHeight = asset.height * scale;

            const candidate = {
                // Use scaled dimensions for positioning (centering) and collision detection
                x: (chunkX * CHUNK_SIZE + r1 * CHUNK_SIZE) - (scaledWidth / 2),
                y: (chunkY * CHUNK_SIZE + r2 * CHUNK_SIZE) - (scaledHeight / 2),
                width: scaledWidth,
                height: scaledHeight,
            };

            // Collision check uses the new, real size
            if (checkCollision(candidate, { x: -100, y: -100, width: 250, height: 300 })) continue;

            if (isSpaceFree(candidate, newChunkObjects)) {
                newChunkObjects.push({
                    ...candidate,
                    type: blueprint.type,
                    scale: scale,
                    flipped: isItem ? false : r3 > 0.5,
                    isEntity: isEntity,
                    isItem: isItem,
                    itemData: itemData,
                    hasCollision: blueprint.hasCollision,
                    behavior: blueprint.behavior || 'neutral',
                    speed: isEntity ? (1.5 + r1 * 2) : 0,
                    wanderAngle: r1 * Math.PI * 2,
                    health: blueprint.health,
                    maxHealth: blueprint.health,
                    name: blueprint.name,
                    nameVisibility: blueprint.nameVisibility
                });
                break;
            }
        }
    }
}
//#endregion

//#region Structure Builders

// Generate structure based on layout
function buildStructure(layout, startX, startY, legend, structureId, structureName) {
    if (structureName) {
        console.log(`Building structure '${structureId}' with specific Name: ${structureName}`);
    }

    const newObjects = [];
    const rows = layout.layout || layout;

    for (let r = 0; r < rows.length; r++) {
        for (let c = 0; c < rows[r].length; c++) {
            const char = rows[r][c];
            if (char === ' ') continue;

            const color = legend[char];
            let type = char === 'W' ? 'wall' : 'floor';

            if (color) {
                newObjects.push({
                    x: startX + (c * ASSET_LIBRARY[type].width),
                    y: startY + (r * ASSET_LIBRARY[type].height),
                    width: ASSET_LIBRARY[type].width,
                    height: ASSET_LIBRARY[type].height,
                    type: type,
                    color: color,
                    structureId: structureId,
                    structureName: structureName
                });
            }
        }
    }
    return newObjects;
}

// Calculate the bounds of a structure for collision detection
function getStructureBounds(layout, startX, startY) {
    let minX = startX;
    let minY = startY;
    let maxX = startX;
    let maxY = startY;

    const rows = layout.layout || layout;
    
    for (let r = 0; r < rows.length; r++) {
        for (let c = 0; c < rows[r].length; c++) {
            const char = rows[r][c];
            if (char === ' ') continue;
            
            const type = char === 'W' ? 'wall' : 'floor';
            const asset = ASSET_LIBRARY[type];
            
            const x = startX + (c * asset.width);
            const y = startY + (r * asset.height);
            
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x + asset.width);
            maxY = Math.max(maxY, y + asset.height);
        }
    }
    
    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
    };
}

// Helper to determine if an object should block structure placement
function isBlocking(obj) {
    if (obj.type === 'ground' || obj.isParticle || obj.dead) return false;
    
    // Explicitly block walls and floors (other structures)
    if (obj.type === 'wall' || obj.type === 'floor') return true;
    
    // Block anything with collision (Trees, Rocks, etc.)
    const asset = ASSET_LIBRARY[obj.type];
    if (obj.hasCollision) return true;
    if (asset && asset.hasCollision) return true;
    
    return false;
}

// Helper to get hitbox for static generation time
function getGenHitbox(obj) {
    const asset = ASSET_LIBRARY[obj.type] || {};
    const totalWidth = obj.width;
    const totalHeight = obj.height;
    
    // Mimic the main.js getHitbox logic
    const hitW = asset.hitboxWidth || (totalWidth - 13);
    const hitH = asset.hitboxHeight || (totalHeight * 0.35);

    return {
        x: obj.x + (totalWidth - hitW) / 2,
        y: obj.y + (totalHeight - hitH),
        width: hitW,
        height: hitH
    };
}

// NEW: A "Force" placement function that guarantees a spawn
// Returns TRUE if successful, FALSE if failed
function placeStructureForced(structBlueprint, biome, chunkX, chunkY, newChunkObjects, preferredRelX, preferredRelY) {
    const layoutData = STRUCTURE_LIBRARY[structBlueprint.type];
    const activeLegend = biome.structureLegend || {};
    if (!layoutData) return false;

    const chunkBounds = {
        x: chunkX * CHUNK_SIZE,
        y: chunkY * CHUNK_SIZE,
        width: CHUNK_SIZE,
        height: CHUNK_SIZE
    };

    // We make up to 50 attempts to place this structure in the current chunk
    for (let attempt = 0; attempt < 50; attempt++) {
        let startX, startY;

        // Attempt 0: Try the exact preferred position
        if (attempt === 0 && preferredRelX != null && preferredRelY != null) {
            startX = chunkBounds.x + preferredRelX;
            startY = chunkBounds.y + preferredRelY;
        } else {
            // Subsequent attempts: Pick random spot in chunk
            startX = chunkBounds.x + (Math.random() * (CHUNK_SIZE - 400));
            startY = chunkBounds.y + (Math.random() * (CHUNK_SIZE - 400));
        }

        // Snap to grid
        startX = Math.round(startX / TILE_SIZE) * TILE_SIZE;
        startY = Math.round(startY / TILE_SIZE) * TILE_SIZE;

        // Get bounds for collision check
        let finalLayout = layoutData; 
        const structBounds = getStructureBounds(finalLayout, startX, startY);

        let canPlace = true;

        // --- COLLISION CHECKS ---
        // 1. Safe Zone
        if (checkCollision(structBounds, { x: -100, y: -100, width: 250, height: 300 })) canPlace = false;

        // 2. Chunk Bounds
        if (structBounds.x < chunkBounds.x || structBounds.y < chunkBounds.y ||
            structBounds.x + structBounds.width > chunkBounds.x + chunkBounds.width ||
            structBounds.y + structBounds.height > chunkBounds.y + chunkBounds.height) {
            canPlace = false;
        }

        // 3. Existing Objects (Robust Check)
        if (canPlace) {
            for (let obj of newChunkObjects) {
                if (isBlocking(obj)) {
                    if (checkCollision(structBounds, getGenHitbox(obj))) {
                        canPlace = false;
                        break;
                    }
                }
            }
        }

        // Success!
        if (canPlace) {
            const structureParts = buildStructure(
                finalLayout, 
                startX, 
                startY, 
                activeLegend, 
                structBlueprint.type, 
                structBlueprint.name 
            );
            newChunkObjects.push(...structureParts);
            console.log(`Force-spawned structure ${structBlueprint.type} (Attempt ${attempt})`);
            return true; 
        }
    }
    
    console.warn(`Failed to force-spawn structure ${structBlueprint.type} after 50 attempts in this chunk.`);
    return false;
}

// Place structures scattered (randomly anywhere in chunk)
function placeStructuresScattered(structBlueprint, biome, chunkX, chunkY, newChunkObjects) {
    const chance = structBlueprint.chance ?? 1;
    const count = Math.max(0, Math.floor(structBlueprint.count || 1));

    const layoutData = STRUCTURE_LIBRARY[structBlueprint.type];
    const activeLegend = biome.structureLegend || {};
    if (!layoutData) return;

    for (let i = 0; i < count; i++) {
        const chanceRoll = pseudoRandom(chunkX + 123 + i, chunkY + 456 + i);
        if (chanceRoll >= chance) continue;

        const rotCount = Math.floor(pseudoRandom(chunkX + 5 + i, chunkY + 5 + i) * 4);
        let finalLayout = layoutData;
        for (let r = 0; r < rotCount; r++) finalLayout = rotateLayout(finalLayout);

        let startX = chunkX * CHUNK_SIZE + (pseudoRandom(chunkX + 7 + i, chunkY + 8 + i) * (CHUNK_SIZE - 400));
        let startY = chunkY * CHUNK_SIZE + (pseudoRandom(chunkX + 9 + i, chunkY + 10 + i) * (CHUNK_SIZE - 400));

        startX = Math.round(startX / TILE_SIZE) * TILE_SIZE;
        startY = Math.round(startY / TILE_SIZE) * TILE_SIZE;

        const structBounds = getStructureBounds(finalLayout, startX, startY);
        const chunkBounds = {
            x: chunkX * CHUNK_SIZE,
            y: chunkY * CHUNK_SIZE,
            width: CHUNK_SIZE,
            height: CHUNK_SIZE
        };

        let canPlace = true;

        if (checkCollision(structBounds, { x: -100, y: -100, width: 250, height: 300 })) {
            canPlace = false;
        }

        if (structBounds.x < chunkBounds.x ||
            structBounds.y < chunkBounds.y ||
            structBounds.x + structBounds.width > chunkBounds.x + chunkBounds.width ||
            structBounds.y + structBounds.height > chunkBounds.y + chunkBounds.height) {
            canPlace = false;
        }

        if (canPlace) {
            for (let obj of newChunkObjects) {
                if (isBlocking(obj)) {
                    if (checkCollision(structBounds, getGenHitbox(obj))) {
                        canPlace = false;
                        break;
                    }
                }
            }
        }

        if (canPlace) {
            const structureParts = buildStructure(finalLayout, startX, startY, activeLegend, structBlueprint.type, structBlueprint.name);
            newChunkObjects.push(...structureParts);
        }
    }
}

// Place structures in a grid with randomness
function placeStructuresInGrid(structBlueprint, biome, chunkX, chunkY, newChunkObjects) {
    const layoutData = STRUCTURE_LIBRARY[structBlueprint.type];
    const activeLegend = biome.structureLegend || {};

    if (!layoutData) return;

    // Calculate structure dimensions based on layout
    const rows = layoutData.layout || layoutData;
    const structHeight = rows.length * TILE_SIZE;
    const structWidth = (rows[0] ? rows[0].length : 0) * TILE_SIZE;
    
    // Grid spacing
    const gridSpacingX = structWidth + TILE_SIZE;
    const gridSpacingY = structHeight + TILE_SIZE;
    
    const gridJitter = 0.3; // Randomness in grid positions (0-1)

    const chunkBounds = {
        x: chunkX * CHUNK_SIZE,
        y: chunkY * CHUNK_SIZE,
        width: CHUNK_SIZE,
        height: CHUNK_SIZE
    };

    // Build list of grid candidate positions for deterministic selection
    const candidates = [];
    for (let gridX = 0; gridX < CHUNK_SIZE; gridX += gridSpacingX) {
        for (let gridY = 0; gridY < CHUNK_SIZE; gridY += gridSpacingY) {
            // generate deterministic random values per cell
            const cellSeedA = pseudoRandom(chunkX + Math.floor(gridX / gridSpacingX), chunkY + Math.floor(gridY / gridSpacingY));
            const cellSeedB = pseudoRandom(chunkX + Math.floor(gridX / gridSpacingX) + 11, chunkY + Math.floor(gridY / gridSpacingY) + 17);
            candidates.push({ gridX, gridY, r1: cellSeedA, r2: cellSeedB });
        }
    }

    const count = Math.max(0, Math.floor(structBlueprint.count || candidates.length));
    const chanceVal = structBlueprint.chance ?? 1;

    // Attempt `count` placements, each with `chance` to spawn
    for (let attempt = 0; attempt < count; attempt++) {
        if (candidates.length === 0) break;

        // Choose a candidate deterministically based on chunk and attempt
        const pickSeed = pseudoRandom(chunkX + attempt * 13, chunkY + attempt * 17);
        const pickIndex = Math.floor(pickSeed * candidates.length);
        const cell = candidates[pickIndex];

        // Chance roll for this attempt
        const roll = pseudoRandom(chunkX + pickIndex + attempt, chunkY + pickIndex - attempt);
        if (roll >= chanceVal) continue;

        const rand1 = cell.r1;
        const rand2Val = cell.r2;

        // Jitter the grid position
        const jitterX = (rand1 - 0.5) * gridSpacingX * gridJitter;
        const jitterY = (rand2Val - 0.5) * gridSpacingY * gridJitter;

        // Random rotation
        const rotCount = Math.floor(rand1 * 4);
        let finalLayout = layoutData;
        for (let r = 0; r < rotCount; r++) finalLayout = rotateLayout(finalLayout);

        let startX = chunkX * CHUNK_SIZE + cell.gridX + jitterX;
        let startY = chunkY * CHUNK_SIZE + cell.gridY + jitterY;

        // Snap to TILE_SIZE grid
        startX = Math.round(startX / TILE_SIZE) * TILE_SIZE;
        startY = Math.round(startY / TILE_SIZE) * TILE_SIZE;

        // Check if structure overlaps with existing structures
        const structBounds = getStructureBounds(finalLayout, startX, startY);
        let canPlace = true;

        // --- SAFE ZONE CHECK ---
        const spawnSafeZone = { x: -100, y: -100, width: 250, height: 300 };
        if (checkCollision(structBounds, spawnSafeZone)) {
            canPlace = false;
        }
        // -----------------------

        // Check if structure stays within chunk boundaries
        if (structBounds.x < chunkBounds.x ||
            structBounds.y < chunkBounds.y ||
            structBounds.x + structBounds.width > chunkBounds.x + chunkBounds.width ||
            structBounds.y + structBounds.height > chunkBounds.y + chunkBounds.height) {
            canPlace = false;
        }

        if (canPlace) {
            for (let obj of newChunkObjects) {
                // UPDATED: Use robust blocking check
                if (isBlocking(obj)) {
                    if (checkCollision(structBounds, getGenHitbox(obj))) {
                        canPlace = false;
                        break;
                    }
                }
            }
        }

        if (canPlace) {
            // UPDATED: Pass structBlueprint.type as structureId
            const structureParts = buildStructure(finalLayout, startX, startY, activeLegend, structBlueprint.type, structBlueprint.name);
            newChunkObjects.push(...structureParts);
            // remove this candidate so we don't pick it again
            candidates.splice(pickIndex, 1);
        }
    }
}
//#endregion