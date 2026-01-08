// Dream Game/visuals.js

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

//#region Canvas Management

// Canvas Resizing
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

//#endregion

//#region Entity Rendering

/**
 * Main render function for a single game entity or object.
 * Handles sprites, ground noise generation, health bars, and name tags.
 */
function drawEntity(ctx, type, x, y, width, height, color, flipped = false, biome = {}, rawObject = null) {
    const asset = ASSET_LIBRARY[type] || ASSET_LIBRARY['unknown'];
    const img = loadedImages[type];

    if (img && img.complete && img.naturalHeight !== 0) {

        // Draw shadow
        if (!asset.isFlat) {
            ctx.save();

            ctx.filter = 'brightness(0)';
            ctx.globalAlpha = 0.5;

            const shadowOffset = 5; 

            if (flipped) {
                ctx.save();
                // Apply offset to the translation origin so direction is consistent
                ctx.translate(x + width / 2 + shadowOffset, y + height / 2);
                ctx.scale(-1, 1);
                ctx.drawImage(img, -width / 2, -height / 2, width, height);
                ctx.restore();
            } else{
                ctx.drawImage(img, x + shadowOffset, y, width, height);
            }

            ctx.restore();
        }

        // Draw the actual image
        if (flipped) {
            ctx.save();
            ctx.translate(x + width / 2, y + height / 2);
            ctx.scale(-1, 1);
            ctx.drawImage(img, -width / 2, -height / 2, width, height);
            ctx.restore();
        } else{
            ctx.drawImage(img, x, y, width, height);
        }


        // --- DRAW HELD ITEM ---
        if (rawObject && rawObject.heldItem) {
            const heldItem = rawObject.heldItem;
            const itemImg = loadedImages[heldItem.type];
            
            if (itemImg) {
                ctx.save();
                
                const itemWidth = heldItem.width;
                const itemHeight = heldItem.height;

                // Calculate Hand Position
                const handX = flipped ? x + width * 0.25 : x + width * 0.75;
                const handY = y + height * 0.95; 

                ctx.translate(handX, handY);

                // 3. Flip & Rotate
                if (flipped) {
                    ctx.scale(-1, 1); 
                }
                ctx.rotate(Math.PI / 10);

                // 4. Draw Item
                const gripDepth = 8; 
                ctx.drawImage(itemImg, -gripDepth, -itemHeight, itemWidth, itemHeight);

                ctx.restore();
            }
        }
    } 
    else if (type === 'ground') {
        const tileSize = CHUNK_SIZE / 250; 
        const cols = width / tileSize;
        const rows = height / tileSize;

        // Draw base color
        ctx.fillStyle = color || asset.color || '#000000ff';
        ctx.fillRect(x, y, width + 1, height + 1);

        // Level of detail
        const noiseThreshold = Math.max(0.5, settings.noiseThresholdMultiplier / camera.zoom);

        // Shadow overlays
        ctx.fillStyle = "black";
        
        // FIX: Correctly calculate the visible area in "draw space" accounting for centered zoom.
        // The transform maps the center of the drawing space to the center of the screen.
        // Formula: DrawCoord = (ScreenCoord - Center) / Zoom + Center
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        const viewMinX = (0 - cx) / camera.zoom + cx;
        const viewMaxX = (canvas.width - cx) / camera.zoom + cx;
        const viewMinY = (0 - cy) / camera.zoom + cy;
        const viewMaxY = (canvas.height - cy) / camera.zoom + cy;

        // Calculate intersection of the visible view and the current chunk
        // x and y are the top-left of the chunk in draw space
        const startCol = Math.floor(Math.max(0, (viewMinX - x) / tileSize));
        const endCol = Math.min(cols, Math.ceil((viewMaxX - x) / tileSize));
        
        const startRow = Math.floor(Math.max(0, (viewMinY - y) / tileSize));
        const endRow = Math.min(rows, Math.ceil((viewMaxY - y) / tileSize));
        
        for (let r = startRow; r < endRow; r++) {
            for (let c = startCol; c < endCol; c++) {
                const worldTileX = x + (c * tileSize) + camera.x;
                const worldTileY = y + (r * tileSize) + camera.y;
                
                const noise = pseudoRandom(worldTileX, worldTileY);

                const NoiseIntensity = biome.groundNoiseIntensity ?? 0.1;

                if (noise > noiseThreshold) {
                    ctx.globalAlpha = noise * NoiseIntensity; 
                    ctx.fillRect(x + c * tileSize, y + r * tileSize, tileSize * 1.02, tileSize * 1.02);
                }
            }
        }
        // Reset alpha so other objects aren't transparent
        ctx.globalAlpha = 1.0;
    }
    else {
        // Default for rocks, player, etc.
        ctx.fillStyle = color || asset.color || 'magenta';


        // Shadow
        if (!asset.isFlat) {
            ctx.save();

            ctx.filter = 'brightness(0)';
            ctx.globalAlpha = 0.5;
            
            // FIX: Shadow offset
            const shadowOffset = 5;
            ctx.fillRect(x + shadowOffset + width * 0.02, y + height * 0.01, width, height);

            ctx.restore();
        }


        ctx.fillRect(x, y, width * 1.02, height * 1.02);
    }
    
    // Health bar and name
    if (rawObject && rawObject.isEntity) {
        
        // Draw Health Bar if damaged
        if (rawObject.health < rawObject.maxHealth || rawObject.behavior == 'hostile') {
            const barWidth = 40;
            const barHeight = 5;
            const barX = x + width / 2 - barWidth / 2;
            const barY = y - 10;
            
            const healthPercent = Math.max(0, rawObject.health / rawObject.maxHealth);
            
            // Background
            ctx.fillStyle = '#2d2d2dff';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            
            // Foreground
            ctx.fillStyle = '#ff0000ff';
            ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        }

        // 2. Draw Name
        if (rawObject.name && rawObject.nameVisibility) {
            ctx.save();
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 3;
            ctx.font = '40px "Jersey 10", sans-serif';
            ctx.textAlign = 'center';

            const textX = x + width / 2;
            // If damaged, shift text up further to clear the health bar
            const textOffset = (rawObject.health < rawObject.maxHealth) ? 25 : 15;
            const textY = y - textOffset;

            ctx.strokeText(rawObject.name, textX, textY);
            ctx.fillText(rawObject.name, textX, textY);
            ctx.restore();
        }
    }
}
//#endregion

//#region Quest Indicators

// Visual Indicators for Quests (Exclamation marks & Arrows)
window.drawQuestIndicators = function(ctx, renderList, camera, player) {
    // 1. Check if system exists and quest is active
    if (!window.QuestSystem || !window.QuestSystem.gameState.questActive) return;
    if (!window.loadedChunks) return;

    const MAX_INDICATORS = Math.max(0, window.QuestSystem.gameState.currentObjective.count - window.QuestSystem.gameState.currentObjective.progress) ?? 10;
    
    // Structure groups are now arrays of objects to allow distance checking
    // Format: { id, name, xSum, ySum, count, minX, maxX, minY, maxY }
    const activeStructureGroups = [];
    const standaloneTargets = [];

    // CONSTANTS
    const GROUPING_DISTANCE_THRESHOLD = 800; // Pixels. If a tile is further than this from a group, it's a separate building.

    // 2. Collect ALL valid targets from loaded chunks
    Object.values(window.loadedChunks).forEach(chunk => {
        chunk.forEach(obj => {
            if (obj.dead || obj.type === 'ground' || obj.isParticle) return;

            if (window.QuestSystem.isQuestTarget(obj)) {
                
                // --- LOGIC FOR STRUCTURE TILES ---
                if (obj.structureId) {
                    let addedToGroup = false;

                    // Try to find an existing group this tile belongs to
                    for (let group of activeStructureGroups) {
                        // Must match ID and Name
                        if (group.id === obj.structureId && group.name === obj.structureName) {
                            
                            // Check Proximity: Is this tile reasonably close to the group's current center?
                            const currentCenterX = group.xSum / group.count;
                            const currentCenterY = group.ySum / group.count;
                            
                            const dist = Math.sqrt((obj.x - currentCenterX)**2 + (obj.y - currentCenterY)**2);

                            if (dist < GROUPING_DISTANCE_THRESHOLD) {
                                group.xSum += obj.x;
                                group.ySum += obj.y;
                                group.count++;
                                group.objRef = obj; // Update ref
                                addedToGroup = true;
                                break;
                            }
                        }
                    }

                    // If no suitable group found nearby, create a NEW one
                    if (!addedToGroup) {
                        activeStructureGroups.push({
                            id: obj.structureId,
                            name: obj.structureName,
                            xSum: obj.x,
                            ySum: obj.y,
                            count: 1,
                            objRef: obj,
                            type: 'structure'
                        });
                    }
                } 
                // --- LOGIC FOR STANDALONE ENTITIES ---
                else {
                    const distSq = (obj.x - player.x)**2 + (obj.y - player.y)**2;
                    standaloneTargets.push({
                        obj: obj,
                        x: obj.x,
                        y: obj.y,
                        distSq: distSq,
                        isStructure: false
                    });
                }
            }
        });
    });

    // 3. Convert Structure Groups into Renderable Targets
    const finalTargets = [...standaloneTargets];

    activeStructureGroups.forEach(group => {
        const centerX = group.xSum / group.count;
        const centerY = group.ySum / group.count;
        
        const distSq = (centerX - player.x)**2 + (centerY - player.y)**2;

        finalTargets.push({
            obj: { 
                ...group.objRef, 
                x: centerX, 
                y: centerY,
                width: 50, 
                height: 50
            },
            x: centerX,
            y: centerY,
            distSq: distSq,
            isStructure: true
        });
    });

    // 4. Sort ALL targets by distance and slice
    finalTargets.sort((a, b) => a.distSq - b.distSq);
    const closestTargets = finalTargets.slice(0, MAX_INDICATORS);

    // 5. Draw indicators
    closestTargets.forEach(item => {
        const obj = item.obj;

        // Calculate screen position
        const screenX = item.x - camera.x;
        const screenY = item.y - camera.y;

        // Calculate Bounds relative to screen center
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        const relativeX = screenX - centerX;
        const relativeY = screenY - centerY;

        const halfViewW = canvas.width / (2 * camera.zoom);
        const halfViewH = canvas.height / (2 * camera.zoom);

        const isOnScreen = (
            relativeX >= -halfViewW - 50 && relativeX <= halfViewW + 50 &&
            relativeY >= -halfViewH - 50 && relativeY <= halfViewH + 50
        );

        const fillColor = window.QuestSystem.getQuestType() === 'kill' ? '#ff0000ff' : '#ffc400ff';

        if (isOnScreen) {
            // Draw "!" above object/structure center
            ctx.save();
            ctx.fillStyle = fillColor;
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.font = 'bold 40px "Jersey 10", sans-serif';
            ctx.textAlign = 'center';
            
            const bounce = Math.sin(Date.now() / 200) * 10;
            
            const yOffset = item.isStructure ? 0 : -40;

            ctx.strokeText("!", screenX + obj.width / 2, screenY + yOffset + bounce);
            ctx.fillText("!", screenX + obj.width / 2, screenY + yOffset + bounce);
            ctx.restore();
        } else {
            // Draw Arrow
            const dx = item.x - player.x;
            const dy = item.y - player.y;
            const angle = Math.atan2(dy, dx);
            
            const radius = 250; 
            const playerCenterX = player.x + player.width / 2;
            const playerCenterY = player.y + player.height / 2;

            const arrowX = Math.cos(angle) * radius + (playerCenterX - camera.x);
            const arrowY = Math.sin(angle) * radius + (playerCenterY - camera.y);

            ctx.save();
            ctx.translate(arrowX, arrowY);
            ctx.rotate(angle);
            
            ctx.fillStyle = fillColor;
            ctx.beginPath();
            ctx.moveTo(15, 0);      
            ctx.lineTo(-15, 15);    
            ctx.lineTo(-15, -15);   
            ctx.fill();
            
            ctx.restore();
        }
    });
};
//#endregion

//#region Particle System
const particles = [];

//Spawns a new particle in the world.
function createParticle(x, y, options = {}) {
    particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * (options.speed || 2),
        vy: (Math.random() - 0.5) * (options.speed || 2),
        life: options.life || 60,
        maxLife: options.life || 60,
        color: options.color || 'white',
        size: options.size || 5,
        gravity: options.gravity || 0,
        friction: options.friction || 0.95,
        shrink: options.shrink || false
    });
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        // Update physics
        p.life--;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= p.friction;
        p.vy *= p.friction;
        p.vy += p.gravity;

        // Remove dead particles
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}


// Player slash attack
window.drawAttackSlash = function(ctx, player, camera) {

    // Get stats
    let attackReach = player.attackReach;
    let attackDuration = player.attackDuration;
    let colorAccent = player.attackColorAccent ?? '#FFFFFF';
    let attackArc = player.attackArc;
    
    const heldItem = player.inventory[player.selectedItemIndex];
    if (heldItem) {
        const data = heldItem.itemData || heldItem; 
        if (data.category === 'weapon' || data.itemCategory === 'weapon') {
            if (data.weaponReach) attackReach = data.weaponReach;
            if (data.weaponColorAccent) colorAccent = data.weaponColorAccent;
            if (data.weaponAttackDuration) attackDuration = data.weaponAttackDuration;
            if (data.weaponAttackArc) attackArc = data.weaponAttackArc;
        }
    }

    // Check cooldown
    const age = Date.now() - player.lastAttackTime;
    if (age > attackDuration || !player.isAttacking) return;

    // Progress 0.0 to 1.0
    const progress = age / (attackDuration / 2);
    
    // Convert degrees to radians
    const swingArc = attackArc * (Math.PI / 180); 
    const startSwingAngle = player.attackAngle - (swingArc / 2);
    
    const currentTipAngle = startSwingAngle + (swingArc * progress);

    // Center point of the player
    const centerX = (player.x - camera.x) + player.width/2;
    const centerY = (player.y - camera.y) + player.height/2;

    ctx.save();

    // Draw settings
    const pixelScale = 4;
    const maxThickness = 24; // Thickness of the blade at its widest
    const trailLen = Math.PI / 2.5; // How long the tail is behind the sword

    // --- 4. COLOR & FLASH LOGIC ---
    // Flash white for the first 20% or 80ms (whichever is shorter)
    // This keeps it snappy on slow weapons and impactful on fast ones
    const flashDuration = Math.min(80, attackDuration * 0.2);
    const isFlash = age < flashDuration;
    
    ctx.fillStyle = isFlash ? '#FFFFFF' : colorAccent;

    // --- 5. DRAWING THE "COMET" SWOOSH ---
    // We loop backwards from the current tip to draw the trail
    const density = 0.05; // Gap between segments
    
    for (let a = currentTipAngle; a > currentTipAngle - trailLen; a -= density) {
        
        // Don't draw behind the starting point (makes the swing "emerge" naturally)
        if (a < startSwingAngle) break;

        // Normalized position in the tail (0.0 = Tip, 1.0 = End of Tail)
        const distanceCalls = (currentTipAngle - a) / trailLen;
        
        // SHAPE FUNCTION:
        // Thickest at the tip (0.0), thins out towards the back (1.0)
        let shapeProfile = Math.cos(distanceCalls * (Math.PI / 2)); 
        
        // TIME DECAY:
        // As the animation ends (progress > 0.6), the whole thing shrinks
        let timeDecay = 1.0;
        if (progress > 0.6) {
            timeDecay = 1 - ((progress - 0.6) / 0.4);
        }

        // Calculate size
        let size = maxThickness * shapeProfile * timeDecay;

        // PIXEL SNAP (The Crunch)
        // Round to nearest 'pixelScale' to enforce grid look
        size = Math.floor(size / pixelScale) * pixelScale;

        // If too small, skip
        if (size < pixelScale) continue;

        // Calculate Position
        const r = attackReach; // Constant radius (no jitter)
        const px = centerX + Math.cos(a) * r;
        const py = centerY + Math.sin(a) * r;

        // DRAW RECT (Aligned to pixel grid)
        // We snap the X/Y coordinates to the pixelScale grid too
        ctx.fillRect(
            Math.floor((px - size/2) / pixelScale) * pixelScale, 
            Math.floor((py - size/2) / pixelScale) * pixelScale, 
            size, 
            size
        );
    }

    ctx.restore();
};
//#endregion



//#region Sky Rendering

// Internal state to track color for smooth fading
const skyState = { r: 0, g: 0, b: 0, initialized: false };

/**
 * Renders the sky as a colored vignette (radial gradient).
 * Clears the canvas to black, then draws a gradient that is transparent 
 * in the center and fades to the biome color at the edges.
 */
window.drawSky = function(ctx) {
    let targetHex = '#87CEEB'; 

    // 1. Determine Target Color based on Player's Biome
    if (typeof window.player !== 'undefined' && window.loadedChunks) {
        const cx = Math.floor(window.player.x / CHUNK_SIZE);
        const cy = Math.floor(window.player.y / CHUNK_SIZE);
        const key = `${cx},${cy}`;
        
        if (window.loadedChunks[key]) {
            const chunk = window.loadedChunks[key];
            const ground = chunk.find(o => o.type === 'ground');
            
            if (ground && ground.biome && ground.biome.skyTint) {
                targetHex = ground.biome.skyTint;
            } 
            else if (currentWorldSettings && currentWorldSettings.skyTint) {
                targetHex = currentWorldSettings.skyTint;
            }
        }
    }

    // 2. Parse Hex to RGB
    let tr = 0, tg = 0, tb = 0;
    const hex = targetHex.replace('#', '');

    tr = parseInt(hex.substring(0, 2), 16);
    tg = parseInt(hex.substring(2, 4), 16);
    tb = parseInt(hex.substring(4, 6), 16);
       

    // 3. Initialize state on first run
    if (!skyState.initialized) {
        skyState.r = tr;
        skyState.g = tg;
        skyState.b = tb;
        skyState.initialized = true;
    }

    // 4. Smooth Transition
    const speed = 0.01; 
    skyState.r += (tr - skyState.r) * speed;
    skyState.g += (tg - skyState.g) * speed;
    skyState.b += (tb - skyState.b) * speed;

    const r = Math.floor(skyState.r);
    const g = Math.floor(skyState.g);
    const b = Math.floor(skyState.b);

    // 5. Draw Vignette

    ctx.save();

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const width = canvas.width;
    const height = canvas.height;

    const cx = width / 2;
    const cy = height / 2;
    
    const radius = Math.sqrt(cx * cx + cy * cy);

    const gradient = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius);

    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.0)`);
    gradient.addColorStop(0.75, `rgba(${r}, ${g}, ${b}, 0.0)`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.5)`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.restore();

    window.worldBackgroundColor = `rgb(${r}, ${g}, ${b})`;
};
//#endregion