
//#region GENERAL HELPERS

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//#endregion


//#region GLOBAL VARIABLES
const CHUNK_SIZE = 6000;

// CHANGED: Attached to window for Save/Load access
window.loadedChunks = {}; // Stores visited chunks
window.worldSeed = 0;

let currentWorldSettings = null; // Stores the active world data
let visibleObjectsRef = []; // Reference to currently rendered objects for click logic

// Game Loop Control
let gameRunning = false;
let animationFrameId;

// Game Settings
const settings = {
    minObjectRenderSize: 5, // Minimum size in pixels to render an object
    noiseThresholdMultiplier: 0.16, // Adjusts ground noise detail based on zoom
    simulationDistance: 2500 // Radius around the player in which entities become active
}

// Camera
let camera = {
    x: 0,
    y: 0,
    zoom: 1,
    targetZoom: 1
};

//#endregion


//#region PHYSICS
function getHitbox(obj) {
    const asset = ASSET_LIBRARY[obj.type] || {};

    // Get the current size
    const totalWidth = obj.width;
    const totalHeight = obj.height;

    // Get hitbox size
    const hitW = asset.hitboxWidth || (totalWidth - 13);
    const hitH = asset.hitboxHeight || (totalHeight * 0.35);

    return {
        // Centered horizontally
        x: obj.x + (totalWidth - hitW) / 2,
        // Aligned to bottom
        y: obj.y + (totalHeight - hitH),
        width: hitW,
        height: hitH
    };
}

function checkCollision(rect1, rect2) {
    // If any of these return true, they are not touching
    if (
        rect1.x + rect1.width < rect2.x ||
        rect1.x > rect2.x + rect2.width ||
        rect1.y + rect1.height < rect2.y ||
        rect1.y > rect2.y + rect2.height
    ) {
        return false;
    }
    
    return true; 
}
//#endregion


//#region GAME LOOP
window.startGame = function() {
    if (gameRunning) return;
    gameRunning = true;
    gameLoop();
};

window.stopGame = function() {
    gameRunning = false;
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
};

function gameLoop() {
    if (!gameRunning) return;

    const zoomRange = 1;
    const currentChunkX = Math.floor(window.player.x / CHUNK_SIZE);
    const currentChunkY = Math.floor(window.player.y / CHUNK_SIZE);

    const renderList = [];

    // Load chunks
    for (let x = currentChunkX - zoomRange; x <= currentChunkX + zoomRange; x++) {
        for (let y = currentChunkY - zoomRange; y <= currentChunkY + zoomRange; y++) {
            const chunkObjs = getChunk(x, y);
            renderList.push(...chunkObjs);
        }
    }
    
    // Save reference for click handler
    visibleObjectsRef = renderList;

    // Add Particles to Render List
    particles.forEach(p => {
        renderList.push({
            x: p.x,
            y: p.y,
            width: p.size,
            height: p.size, // Use size as height for sorting
            type: 'particle', // Special type
            isParticle: true, // Flag for the renderer
            // Pass through visual properties
            color: p.color,
            life: p.life,
            maxLife: p.maxLife,
            size: p.size,
            shrink: p.shrink
        });
    });

    // 3. Update Physics & Player
    if (Date.now() > window.player.lungeSpeedUncap) {
        if (keys.w) window.player.vy -= window.player.speed;
        if (keys.s) window.player.vy += window.player.speed;
        if (keys.a) window.player.vx -= window.player.speed;
        if (keys.d) window.player.vx += window.player.speed;

        window.player.vx = Math.max(-window.player.maxSpeed, Math.min(window.player.maxSpeed, window.player.vx));
        window.player.vy = Math.max(-window.player.maxSpeed, Math.min(window.player.maxSpeed, window.player.vy));
    }
    

    movePlayer(window.player.vx, window.player.vy, renderList);
    
    // Update Entities
    updateEntities(renderList);

    // Check for nearby enemies for visual indicator
    window.player.showAttackRange = false;
    for(let obj of renderList) {
        if (obj.isEntity && !obj.dead) {
            const dist = Math.sqrt((obj.x - window.player.x)**2 + (obj.y - window.player.y)**2);
            if (dist < window.player.attackRange * 3) {
                window.player.showAttackRange = true;
                break;
            }
        }
    }

    // Particle Updates
    updateParticles();
    
    // Spawn Dust
    if ((Math.abs(window.player.vx) > 0.5 || Math.abs(window.player.vy) > 0.5) && Math.random() > 0.7) {
        const spawnX = window.player.x + (Math.random() * window.player.width); 
        const spawnY = window.player.y + window.player.height + (Math.random() * 20 - 15);
        
        createParticle(spawnX, spawnY, {
            color: '#ffffffc6',
            size: Math.random() * 7 + 3,
            life: 10 + Math.random() * 10,
            speed: 0.6,
            gravity: 0,
            friction: 0.5,
            shrink: false
        });
    }

    window.player.vx *= window.player.friction;
    window.player.vy *= window.player.friction;

    // 4. Update Camera
    camera.zoom += (camera.targetZoom - camera.zoom) * 0.1;
    const targetX = window.player.x - camera.x - canvas.width / 2 + window.player.width / 2;
    const targetY = window.player.y - camera.y - canvas.height / 2 + window.player.height / 2;
    camera.x += targetX * 0.08;
    camera.y += targetY * 0.1;

    // Add player to render list with the DYNAMIC MODEL TYPE
    const heldItem = window.player.inventory[window.player.selectedItemIndex];
    renderList.push({
        x: window.player.x,
        y: window.player.y,
        width: window.player.width,
        height: window.player.height,
        type: window.playerModel, // Changed from 'player'
        flipped: window.player.flipped,
        heldItem: heldItem
    });

    // 5. Culling & Sorting
    const offX = (canvas.width / camera.zoom - canvas.width) / 2;
    const offY = (canvas.height / camera.zoom - canvas.height) / 2;
    
    const visibleList = renderList.filter(obj => {
        // Skip dead objects
        if (obj.dead) return false;

        const drawX = obj.x - camera.x;
        const drawY = obj.y - camera.y;
        
        return drawX + obj.width > -offX &&
               drawX < canvas.width + offX &&
               drawY + obj.height > -offY &&
               drawY < canvas.height + offY;
    });

    visibleList.sort((a, b) => {
        const assetA = ASSET_LIBRARY[a.type] || { isFlat: false };
        const assetB = ASSET_LIBRARY[b.type] || { isFlat: false };
        
        // Ground always first
        if (a.type === 'ground') return -1;
        if (b.type === 'ground') return 1;
        
        // Floor tiles below everything else (except ground)
        if (a.type === 'floor' && b.type !== 'floor') return -1;
        if (b.type === 'floor' && a.type !== 'floor') return 1;

        // Flat objects below other objects
        const aIsFlat = a.isParticle ? false : assetA.isFlat;
        const bIsFlat = b.isParticle ? false : assetB.isFlat;

        if (aIsFlat && !bIsFlat) return -1;
        if (!aIsFlat && bIsFlat) return 1;
        
        // Y-Sorting for objects in the same layer
        return (a.y + a.height) - (b.y + b.height);
    });

    // 6. Draw
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    visibleList.forEach(obj => {
        const drawX = obj.x - camera.x;
        const drawY = obj.y - camera.y;

        // Custom drawing for particles
        if (obj.isParticle) {
            const alpha = obj.life / obj.maxLife;
            let size = obj.size;
            if (obj.shrink) size = obj.size * alpha;

            ctx.globalAlpha = alpha;
            ctx.fillStyle = obj.color;
            
            ctx.fillRect(drawX - size / 2, drawY - size / 2, size, size);
            
            ctx.globalAlpha = 1.0;
            return;
        }

        // Standard drawing for entities
        const screenWidth = obj.width * camera.zoom;
        const screenHeight = obj.height * camera.zoom;
        if (screenWidth < settings.minObjectRenderSize || screenHeight < settings.minObjectRenderSize) return;

        // NEW: Pass the health object directly to drawEntity to handle health bars
        drawEntity(ctx, obj.type, drawX, drawY, obj.width, obj.height, obj.color, obj.flipped, obj.biome, obj);
    });


    if (window.drawAttackSlash) window.drawAttackSlash(ctx, window.player, camera);

    // Draw sky
    window.drawSky(ctx);
    
    // Draw Quest Indicators (Arrows and Exclamations)
    if (window.drawQuestIndicators) {
        window.drawQuestIndicators(ctx, renderList, camera, window.player);
    }

    ctx.restore();

    animationFrameId = requestAnimationFrame(gameLoop);

    // Update Quests
    if (window.QuestSystem && window.QuestSystem.update) {
        window.QuestSystem.update();
    }

    // HUD
    updateHUD();
}

loadAssets(() => {
    console.log("All assets loaded. Starting game.");
    resizeCanvas();
    setupMainMenu();
});
//#endregion