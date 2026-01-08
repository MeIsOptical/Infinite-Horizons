
//#region VARIABLES

// Reset the player to defaults
window.getFreshPlayer = function() {

    window.playerModel = window.playerModel || 'bald_man';

    return {
        // Movement
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        speed: 0.6,
        friction: 0.9,
        maxSpeed: 3.5,
        flipped: false,
        
        // Collisions
        width: ASSET_LIBRARY[window.playerModel].width,
        height: ASSET_LIBRARY[window.playerModel].height,        
        
        // Zoom
        minZoom: 0.7,
        maxZoom: 1.7,

        // Health
        health: 80,
        maxHealth: 80,

        // Level
        xp: 0,
        level: 1,
        perkPoints: 0,

        // Fighting
        lastHitTime: 0, // For damaged cooldown from enemies
        attackDamage: 10,
        lastAttackTime: 0, // For attack cooldown for the player
        attackLunge: 2, // Pushes player forward when attacking
        lungeSpeedUncap: 0,
        isAttacking: false,
        attackAngle: 0,
        attackReach: 80,
        attackDuration: 500,
        attackArc: 70,
        attackColorAccent: "#d5d1cbff",

        // Inventory
        selectedItemIndex: 0,
        maxInventoryLength: 6,
        inventory: []
    };
};

window.player = window.getFreshPlayer();
//#endregion


//#region  LEVEL

function giveXp(minXp, maxXp) {

    if (maxXp) { // Min and Max defined, pick random
        window.player.xp += minXp + Math.random() * (maxXp - minXp);
    } else { // Otherwise, just add the single value
        window.player.xp += minXp;
    }

    let leveledUp = false;
    while (window.player.xp >= getMaxXp(window.player.level)) {
        window.player.xp -= getMaxXp(window.player.level);
        window.player.level++;
        window.player.perkPoints++;
        leveledUp = true;        
    }

    if (leveledUp) {
        // Animation
        const msg = document.createElement('div');
        msg.innerText = "LEVEL UP!";
        msg.className = "level-up-msg";
        document.body.appendChild(msg);
        setTimeout(() => {
            msg.remove();
        }, 3000);
    }
}

function getMaxXp(level) {
    return 40 * Math.sqrt(0.5 * level) - 10;
}

//#endregion


//#region INPUTS
const keys = { w: false, a: false, s: false, d: false };
window.addEventListener('keydown', (e) => {
    // Movement
    if (e.key === 'w') keys.w = true;
    if (e.key === 'a') keys.a = true;
    if (e.key === 's') keys.s = true;
    if (e.key === 'd') keys.d = true;

    // Drop item
    if (e.key === 'q') dropSelectedItem();

    // Use item
    if (e.key === 'e') useSelectedItem();

    // Change selected item
    if (e.key === '1' && window.player.maxInventoryLength > 0) window.player.selectedItemIndex = 0;
    if (e.key === '2' && window.player.maxInventoryLength > 1) window.player.selectedItemIndex = 1;
    if (e.key === '3' && window.player.maxInventoryLength > 2) window.player.selectedItemIndex = 2;
    if (e.key === '4' && window.player.maxInventoryLength > 3) window.player.selectedItemIndex = 3;
    if (e.key === '5' && window.player.maxInventoryLength > 4) window.player.selectedItemIndex = 4;
    if (e.key === '6' && window.player.maxInventoryLength > 5) window.player.selectedItemIndex = 5;
    if (e.key === '7' && window.player.maxInventoryLength > 6) window.player.selectedItemIndex = 6;
    if (e.key === '8' && window.player.maxInventoryLength > 7) window.player.selectedItemIndex = 7;
    if (e.key === '9' && window.player.maxInventoryLength > 8) window.player.selectedItemIndex = 8;
});

window.addEventListener('keyup', (e) => {
    // Movement
    if (e.key === 'w') keys.w = false;
    if (e.key === 'a') keys.a = false;
    if (e.key === 's') keys.s = false;
    if (e.key === 'd') keys.d = false;
});

window.addEventListener('wheel', (e) => {
    const zoomAmount = -e.deltaY * 0.001;
    camera.targetZoom += zoomAmount;
    camera.targetZoom = Math.max(window.player.minZoom, Math.min(window.player.maxZoom, camera.targetZoom));
});



// Attack Logic
window.addEventListener('contextmenu', e => e.preventDefault());
window.addEventListener('mousedown', (e) => {
    if (!gameRunning) return; // Disable clicks if game not running
    if (!visibleObjectsRef) return;
    if (e.target.id !== 'gameCanvas') return; // For button clicking

    if (e.button === 2) { 
        handleInteraction(e);
        return;
    }

    // Convert screen click to world coordinates
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left - canvas.width / 2) / camera.zoom + camera.x + canvas.width / 2;
    const clickY = (e.clientY - rect.top - canvas.height / 2) / camera.zoom + camera.y + canvas.height / 2;

    performAttack(clickX, clickY);
});



// Function to execute a directional swing
function performAttack(clickX, clickY) {

    let playerDamage = window.player.attackDamage;
    let attackReach = window.player.attackReach;
    let attackDuration = window.player.attackDuration;
    let attackArc = window.player.attackArc;
    let attackLunge = window.player.attackLunge; 

    // Get held item stats
    const heldItem = window.player.inventory[window.player.selectedItemIndex]
    if (heldItem) {
        const itemData = heldItem.itemData || heldItem; // Handle both structures
        if (itemData.category === 'weapon') {
            if (itemData.weaponDamage) playerDamage = itemData.weaponDamage;
            if (itemData.weaponReach) attackReach = itemData.weaponReach;
            if (itemData.weaponAttackDuration) attackDuration = itemData.weaponAttackDuration;
            if (itemData.weaponAttackArc) attackArc = itemData.weaponAttackArc;
            if (itemData.weaponAttackLunge) attackLunge = itemData.weaponAttackLunge;
        }
    }

    const now = Date.now();
    if (now - window.player.lastAttackTime < attackDuration - 100) return;

    // 1. Set State
    window.player.lastAttackTime = now;
    window.player.isAttacking = true;
    window.player.lungeSpeedUncap = now + 200;
    
    // Calculate angle
    const dx = clickX - window.player.x;
    const dy = clickY - window.player.y;
    const angle = Math.atan2(dy, dx);
    window.player.attackAngle = angle;
    
    // Face the click
    window.player.flipped = dx < 0;

    // 2. PHYSICS ANIMATION: The "Lunge"    
    window.player.vx += Math.cos(angle) * attackLunge;
    window.player.vy += Math.sin(angle) * attackLunge;

    // 3. Collision Logic (The "Kill Box")
    const playerCx = window.player.x + window.player.width / 2;
    const playerCy = window.player.y + window.player.height / 2;
    
    const knockbackStrength = Math.sqrt(2*playerDamage) + 2; 

    // --- VISUAL ALIGNMENT FIX (DEGREES) ---
    // Convert the Degree value (e.g. 120) to Radians for the math check
    const arcRadians = attackArc * (Math.PI / 180); 
    
    // We add a tiny buffer (15px) to reach. 
    // If the sprite visually touches a pixel of the enemy, players expect a hit.
    // Pure math is often too strict for "good game feel".
    const effectiveReach = attackReach + 15; 

    visibleObjectsRef.forEach(obj => {
        if (obj.isEntity && !obj.dead) {

            const objCx = obj.x + obj.width / 2;
            const objCy = obj.y + obj.height / 2;

            const dist = Math.sqrt((objCx - playerCx)**2 + (objCy - playerCy)**2);

            const enemyRadius = Math.max(obj.width, obj.height) / 2;
            
            // Reach Check
            if (dist - enemyRadius < effectiveReach) {
                const enemyAngle = Math.atan2(objCy - playerCy, objCx - playerCx);
                let angleDiff = enemyAngle - angle;
                
                // Normalize angle to -PI to +PI
                while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

                // Angle Check (Using the CORRECT radian width)
                if (Math.abs(angleDiff) < arcRadians / 2) {
                    
                    // --- HIT CONFIRMED ---
                    obj.health -= playerDamage;
                    
                    // Knockback
                    obj.vx += Math.cos(enemyAngle) * knockbackStrength;
                    obj.vy += Math.sin(enemyAngle) * knockbackStrength;
                    
                    // Hit Particles
                    for(let i=0; i<10; i++) {
                         createParticle(
                             obj.x + Math.random() * obj.width, 
                             obj.y + Math.random() * obj.height, 
                             { color: 'red', size: 2 + Math.random() * 3, life: 20, speed: 3 }
                         );
                    }

                    if (obj.health <= 0) {
                        obj.dead = true;
                        if (obj.behavior == 'hostile') giveXp(5, 12);
                        if(window.QuestSystem) window.QuestSystem.reportEvent('ENTITY_DEATH', { victim: obj });
                    }
                }
            }
        }
    });
}





// Handles right-click interactions (Talk, Collect, etc.)
function handleInteraction(e) {
    if (!visibleObjectsRef) return;

    // ... (Coordinate calculation) ...
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left - canvas.width / 2) / camera.zoom + camera.x + canvas.width / 2;
    const clickY = (e.clientY - rect.top - canvas.height / 2) / camera.zoom + camera.y + canvas.height / 2;

    for (let obj of visibleObjectsRef) {
        if (obj.type === 'ground' || obj.isParticle || obj.dead) continue;

        const centerDist = Math.sqrt((obj.x - window.player.x)**2 + (obj.y - window.player.y)**2);
        const reach = 200 + Math.max(obj.width, obj.height) / 2;
        
        if (centerDist <= reach) {
            if (clickX >= obj.x && clickX <= obj.x + obj.width &&
                clickY >= obj.y && clickY <= obj.y + obj.height) {
                
                // 1. Check if it's a Quest Target
                let isRelevant = false;
                let questType = null;
                if (window.QuestSystem) {
                    isRelevant = window.QuestSystem.isQuestTarget(obj);
                    questType = window.QuestSystem.getQuestType();
                }

                if (window.QuestSystem.gameState.currentObjective.progress >= window.QuestSystem.gameState.currentObjective.count) return;
                

                if (!obj.isEntity) {
                    // OBJECT LOGIC
                    if (isRelevant) {
                        switch (questType) {
                        
                            case ('talk'): // Interact
                                console.log("Interacted with quest object:", obj.type);
                                createParticle(obj.x + obj.width/2, obj.y, {
                                    color: 'cyan', size: 8, life: 40, speed: 1, gravity: -0.1
                                });
                                window.QuestSystem.reportEvent('ENTITY_TALK', { item: obj });
                                break;


                            case ('collect'): // Collect the object

                                if (obj.isItem) { // If is an item, pick it up. Otherwise, just 'kill' it
                                    if (!pickUpItem(obj)) break; // If can't pick up, don't update quest
                                }
                                else {
                                    obj.dead = true; 
                                }                            
                                
                                for(let i=0; i < 8; i++) {
                                    createParticle(obj.x + obj.width/2, obj.y + obj.height/2, {
                                        color: 'gold', size: 7, life: 40, speed: 4
                                    });
                                }

                                window.QuestSystem.reportEvent('ITEM_COLLECT', { item: obj });
                                break;
                            

                            case ('kill'):
                                // 'Kill' the object
                                obj.dead = true; 
                                
                                for(let i=0; i < 8; i++) {
                                    createParticle(obj.x + obj.width/2, obj.y + obj.height/2, {
                                        color: 'gray', size: 5, life: 30, speed: 4
                                    });
                                }
                                window.QuestSystem.reportEvent('ITEM_KILL', { item: obj });
                                break;
                        }
                    } 
                    else if (obj.isItem) { // Logic for picking up items
                        pickUpItem(obj);
                    }
                    else {
                        continue; // Not relevant
                    }

                } else {
                    // ENTITY LOGIC
                    if (window.QuestSystem) {
                        if (isRelevant && questType === 'talk') {
                            createParticle(obj.x + obj.width/2, obj.y, {
                                color: 'white', size: 8, life: 40, speed: 1, gravity: -0.1
                            });
                            window.QuestSystem.reportEvent('ENTITY_TALK', { entity: obj });
                        } else {
                             createParticle(obj.x + obj.width/2, obj.y, {
                                color: 'gray', size: 5, life: 20, speed: 0.5, gravity: -0.1
                            });
                        }
                    }
                    continue;
                }
            }
        }
    }
}




// Pick up item
function pickUpItem(item) {

    if (item.isItem) {
        const inventory = window.player.inventory;
        const slotIndex = window.player.selectedItemIndex;
        const maxSlots = window.player.maxInventoryLength;

        if (!inventory[slotIndex]) { // Put in hand if available
            inventory[slotIndex] = item;
            item.dead = true;
            return true;
        }

        // If selected slot is occupied, find first empty slot
        for (let i = 0; i < maxSlots; i++) {
            if (!inventory[i]) {
                inventory[i] = item;
                item.dead = true;
                return true;
            }
        }
    }

    return false;
    
}


// Drop selected inventory item
function dropSelectedItem() {
    const inventory = window.player.inventory;
    const itemIndex = window.player.selectedItemIndex;

    // Check if there is actually an item in this slot
    if (inventory[itemIndex]) {
        
        const item = inventory[itemIndex];
        
        // Remove from inventory
        inventory[itemIndex] = null; 

        // Get chunk
        item.dead = false; 
        item.x = window.player.x;
        item.y = window.player.y;

        const size = (typeof CHUNK_SIZE !== 'undefined') ? CHUNK_SIZE : 6000;
        const chunkX = Math.floor(item.x / size);
        const chunkY = Math.floor(item.y / size);
        const key = `${chunkX},${chunkY}`;

        // Add back to world
        if (window.loadedChunks[key]) {
            window.loadedChunks[key].push(item);
        } else {
            console.error("Chunk not loaded, returning item to inventory.");
            // Put it back in the slot if dropping failed
            inventory[itemIndex] = item;
        }
    }
}



// Use selected inventory item
function useSelectedItem() {
    const inventory = window.player.inventory;
    const itemIndex = window.player.selectedItemIndex;

    // Check if there is actually an item in this slot
    if (inventory[itemIndex]) {
        
        const item = inventory[itemIndex];
        
        if (item.itemData.category === 'consumable' && window.player.health < window.player.maxHealth) {
            // Remove from inventory
            inventory[itemIndex] = null;
            // Heal
            const healValue = item.itemData.consumeValue || 0;
            window.player.health = Math.min(window.player.maxHealth, window.player.health + healValue);
        }

    }
}




// Move player
function movePlayer(dx, dy, visibleObjects) {
    if (dx < 0) { window.player.flipped = true; }
    else if (dx > 0) window.player.flipped = false;

    const futureX = window.player.x + dx;
    const futureY = window.player.y + dy;

    const futureHitboxX = getHitbox({
        x: futureX, y: window.player.y,
        width: window.player.width, height: window.player.height,
        type: window.playerModel
    });

    const futureHitboxY = getHitbox({
        x: window.player.x, y: futureY,
        width: window.player.width, height: window.player.height,
        type: window.playerModel
    });

    let canMoveX = true;
    let canMoveY = true;

    visibleObjects.forEach(obj => {
        if (obj.type === 'ground' || obj.isParticle || obj.dead) return;

        const asset = ASSET_LIBRARY[obj.type] || {};
        if (asset.hasCollision) {
            const objHitbox = getHitbox(obj);
            if (checkCollision(futureHitboxX, objHitbox)) canMoveX = false;
            if (checkCollision(futureHitboxY, objHitbox)) canMoveY = false;
        }
    });
    
    if (canMoveX) window.player.x = futureX;
    if (canMoveY) window.player.y = futureY;
}
//#endregion