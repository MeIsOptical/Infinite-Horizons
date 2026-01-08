// Dream Game/entities.js

//#region Entity Update Loop
/**
 * Updates position and behavior for all active entities within simulation distance.
 * Handles AI behaviors (hostile, flee, neutral) and Collision Detection.
 * @param {Array} renderList - List of all objects currently in the active chunks.
 */
function updateEntities(renderList) {
    const maxDist = window.simulationDistance || 3000;
    renderList.forEach(obj => {
        if (!obj.isEntity || obj.dead) return;

        if (typeof obj.vx === 'undefined') { obj.vx = 0; obj.vy = 0; }
        obj.vx *= 0.9; 
        obj.vy *= 0.9;
        if (Math.abs(obj.vx) < 0.05) obj.vx = 0;
        if (Math.abs(obj.vy) < 0.05) obj.vy = 0;

        const dx = player.x - obj.x;
        const dy = player.y - obj.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const detectRange = 800;

        if (dist > maxDist) return;

        let moveX = 0;
        let moveY = 0;

        // --- Behavior Logic ---
        if (obj.behavior === 'hostile' && dist < detectRange) {
            // Chase Player
            if (dist > 1) {
                moveX = (dx / dist) * obj.speed;
                moveY = (dy / dist) * obj.speed;
                obj.flipped = dx < 0;
            }
            
        } else if (obj.behavior === 'flee' && dist < detectRange) {
            // Run away from Player
            moveX = -(dx / dist) * (obj.speed * 1.2);
            moveY = -(dy / dist) * (obj.speed * 1.2);
            obj.flipped = dx > 0;
        } else {
            // Wander Randomly
            if (Math.random() < 0.01) obj.wanderAngle = Math.random() * Math.PI * 2;
            moveX = Math.cos(obj.wanderAngle) * (obj.speed * 0.5);
            moveY = Math.sin(obj.wanderAngle) * (obj.speed * 0.5);
            obj.flipped = moveX < 0;
        }


        moveX += obj.vx;
        moveY += obj.vy;

        // --- Collision & Movement Logic ---
        if (moveX !== 0 || moveY !== 0) {
            // Check X axis
            let canMoveX = true;
            const nextHitboxX = getHitbox({
                x: obj.x + moveX, y: obj.y,
                width: obj.width, height: obj.height, type: obj.type
            });

            // Check Y axis
            let canMoveY = true;
            const nextHitboxY = getHitbox({
                x: obj.x, y: obj.y + moveY,
                width: obj.width, height: obj.height, type: obj.type
            });
            
            // Create a pseudo-player object for checking collision against
            // UPDATED: Use window.playerModel
            const playerObj = {
                x: player.x,
                y: player.y,
                width: player.width,
                height: player.height,
                type: window.playerModel, 
                flipped: player.flipped
            };
            const playerHitbox = getHitbox(playerObj);
            
            // 1. Check Collision with Player
            
            // X Axis Player Collision
            if (checkCollision(nextHitboxX, playerHitbox)) {
                canMoveX = false;
                if (obj.behavior === 'hostile') applyPlayerDamage(moveX, moveY);
            }

            // Y Axis Player Collision
            if (checkCollision(nextHitboxY, playerHitbox)) {
                canMoveY = false;
                if (obj.behavior === 'hostile') applyPlayerDamage(moveX, moveY);
            }

            // 2. Check Collision with World Objects
            renderList.forEach(obstacle => {
                if (obstacle === obj || obstacle.type === 'ground' || obstacle.isParticle || obstacle.dead) return;
                
                if (!canMoveX && !canMoveY) return;

                const buffer = 100;

                if (
                    obj.x + obj.width + buffer < obstacle.x ||       // to the left of obstacle
                    obj.x - buffer > obstacle.x + obstacle.width ||  // to the right of obstacle
                    obj.y + obj.height + buffer < obstacle.y ||      // above obstacle
                    obj.y - buffer > obstacle.y + obstacle.height    // below obstacle
                ) {
                    return; // Skip expensive hitbox math
                }

                if (obstacle.hasCollision || ASSET_LIBRARY[obstacle.type]?.hasCollision) {
                    const obstacleHitbox = getHitbox(obstacle);
                    if (canMoveX && checkCollision(nextHitboxX, obstacleHitbox)) canMoveX = false;
                    if (canMoveY && checkCollision(nextHitboxY, obstacleHitbox)) canMoveY = false;
                }
            });

            // Apply movement
            if (canMoveX) obj.x += moveX;
            if (canMoveY) obj.y += moveY;

            // Spawn dust if moved
            if ((canMoveX && Math.abs(moveX) > 0.01) || (canMoveY && Math.abs(moveY) > 0.01)) {
                if (Math.random() > 0.85) {
                    createParticle(obj.x + obj.width/2, obj.y + obj.height, {
                        color: '#ffffffc6',
                        size: Math.random() * 7 + 3,
                        life: 10 + Math.random() * 10,
                        speed: 0.6,
                        gravity: 0,
                        friction: 0.5,
                        shrink: false
                    });
                }
            }
        }
    });
}
//#endregion
        
//#region Combat Helpers
// Helper function to handle damage logic
function applyPlayerDamage(knockbackX, knockbackY) {
    const now = Date.now();
    if (now - player.lastHitTime > 1000) { // 1 second cooldown
        player.health -= 10;
        player.lastHitTime = now;
        
        // Knockback
        player.vx += (knockbackX / Math.abs(knockbackX || 1)) * 15;
        player.vy += (knockbackY / Math.abs(knockbackY || 1)) * 15;
        
        if (player.health < 0) {
            player.health = 0;

            // Quest tracking
            if (window.QuestSystem) {
             window.QuestSystem.reportEvent('PLAYER_DEATH', { cause: 'Combat' });
            }
        }
    }
}
//#endregion