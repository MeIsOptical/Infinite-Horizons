// Dream Game/questSystem.js

window.QuestSystem = {
    gameState: {
        questActive: false,
        currentObjective: null, 
        objectiveQueue: [], 
        futureChapters: [], 
        storySummary: "",
        history: [],
        playerDecisions: [], // Stores tags and decision text
        lastSurviveUpdate: 0,
        lastSafetyCheck: 0, 
        storyTheme: "",
        spawnedStoryAssets: [],
    },
    
    activeTypewriters: {},

    //#region Initialization
    init: function() {
        const btn = document.getElementById('story-continue-btn');
        if (btn) {
            btn.onclick = () => {
                document.getElementById('story-modal').style.display = 'none';
                if (window.startGame) window.startGame();
            };
        }
    },
    //#endregion

    //#region UI Helpers
    typeText: function(elementId, text, speed = 25) {
        return new Promise((resolve) => {
            const el = document.getElementById(elementId);
            if (!el) { resolve(); return; }

            if (this.activeTypewriters[elementId]) {
                clearInterval(this.activeTypewriters[elementId]);
                delete this.activeTypewriters[elementId];
            }

            el.textContent = "";
            let i = 0;
            
            if (!text || text.length === 0) { resolve(); return; }

            this.activeTypewriters[elementId] = setInterval(() => {
                el.textContent = text.substring(0, i + 1);
                i++;

                if (i >= text.length) {
                    clearInterval(this.activeTypewriters[elementId]);
                    delete this.activeTypewriters[elementId];
                    resolve();
                }
            }, speed);
        });
    },

    showNotification: function(title, message) {
        const container = document.getElementById('quest-notifications');
        if (!container) return;

        const el = document.createElement('div');
        el.className = 'notification-toast';
        el.innerHTML = `
            <div class="notif-title">${title}</div>
            <div class="notif-sub">${message}</div>
        `;

        container.appendChild(el);
        setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 4000);
    },
    //#endregion

    //#region Quest Flow Control

    startNewQuest: async function(chapterData, storyTheme = "") {
        console.log("Starting Chapter:", chapterData);

        // Get custom spawned assets
        if (chapterData.objectives) {
        chapterData.objectives.forEach(obj => {
            if (obj.spawn) {
                obj.spawn.forEach(entity => {
                    // Check if we already have an asset with this name
                    const alreadyExists = this.gameState.spawnedStoryAssets.some(asset => asset.name === entity.name);
                    
                    if (entity.name && !alreadyExists) {
                        // Store the full object
                        this.gameState.spawnedStoryAssets.push(entity);
                        console.log(`[QuestSystem] Registered new story asset: ${entity.name} (${entity.type})`);
                    }
                });
            }
        });
    }


        
        this.gameState.history.push({
            title: chapterData.chapterTitle,
            summary: chapterData.chapterContext,
            outcome: "In Progress..." 
        });

        if (this.gameState.history.length > 20) this.gameState.history.shift();

        this.gameState.questActive = true;
        if (storyTheme) this.gameState.storyTheme = storyTheme;
        
        this.gameState.futureChapters = chapterData.futureChapters || [];
        this.gameState.objectiveQueue = chapterData.objectives || [];

        document.getElementById('story-chapter-title').innerText = chapterData.chapterTitle || "NEW CHAPTER";
        
        const objDesc = document.getElementById('story-objective-desc');
        if (objDesc) objDesc.innerText = "";

        document.getElementById('story-modal').style.display = 'flex';
        if (window.stopGame) window.stopGame();

        const continueBtn = document.getElementById('story-continue-btn');
        const storyObjBox = document.getElementsByClassName('story-objective-box')[0];
        continueBtn.style.display = 'none';
        storyObjBox.style.display = 'none';

        await this.typeText('story-intro-text', chapterData.objectives[0].introText || "");

        continueBtn.style.display = 'block';
        storyObjBox.style.display = 'block';

        this.startNextObjective(true);
    },

    startNextObjective: async function(suppressNotification = false) {
        if (this.gameState.objectiveQueue.length === 0) {
            this.completeChapter();
            return;
        }

        const nextObj = this.gameState.objectiveQueue.shift();
        console.log(`[QuestSystem] Starting new objective: ${JSON.stringify(nextObj)}`);
        
        this.gameState.currentObjective = nextObj;
        this.gameState.currentObjective.progress = 0;
        this.gameState.lastSurviveUpdate = Date.now();
        this.gameState.lastSafetyCheck = Date.now(); // Reset safety timer

        if (nextObj.spawn && window.spawnQuestAssets) {
            window.spawnQuestAssets(nextObj.spawn);
        }

        this.typeText('quest-tracker-desc', nextObj.description); 
        this.updateHUD();

        if (!suppressNotification) {
            const titleEl = document.getElementById('story-chapter-title');
            if (titleEl) titleEl.innerText = "NEW OBJECTIVE";

            const objDesc = document.getElementById('story-objective-desc');
            if (objDesc) objDesc.innerText = "";

            const modal = document.getElementById('story-modal');
            if (modal) modal.style.display = 'flex';

            if (window.stopGame) window.stopGame();

            const continueBtn = document.getElementById('story-continue-btn');
            const storyObjBox = document.getElementsByClassName('story-objective-box')[0];
            continueBtn.style.display = 'none';
            storyObjBox.style.display = 'none';

            const textToType = nextObj.introText || nextObj.description;
            await this.typeText('story-intro-text', textToType);
            this.typeText('story-objective-desc', nextObj.description);

            continueBtn.style.display = 'block';
            storyObjBox.style.display = 'block';
        } else {
             this.typeText('story-objective-desc', nextObj.description);
        }
    },

    completeChapter: async function() {
        console.log("Chapter Complete. Fetching next...");
        this.gameState.questActive = false;

        let lastAction = "Unknown event";
        if (this.gameState.currentObjective) {
            lastAction = this.gameState.currentObjective.description;
        }

        if (this.gameState.history.length > 0) {
            this.gameState.history[this.gameState.history.length - 1].outcome = "Chapter Complete";
        }

        this.typeText('quest-tracker-desc', "CHAPTER COMPLETE (Generating next steps...)");
        this.showNotification("Chapter Complete", "Generating next chapter...");

        let currentPlan = [...this.gameState.futureChapters];
        if (currentPlan.length > 0) currentPlan.shift(); // Remove the first element

        try {
            if (typeof fetchNextChapter === 'function') {
                const nextChapter = await fetchNextChapter(
                    this.gameState.history, 
                    `The player just finished this objective: "${lastAction}".`, 
                    this.gameState.storyTheme,
                    currentPlan,
                    this.gameState.playerDecisions,
                    this.gameState.spawnedStoryAssets
                );

                if (nextChapter) {
                    this.startNewQuest(nextChapter);
                } else {
                    alert("The story ends here... (AI Generation Failed)");
                }
            }
        } catch (e) {
            console.error("Error continuing story:", e);
        }
    },
    
    // NEW: Trigger specific refusal logic (skips normal completion)
    triggerRefusal: async function(refusalReason) {
        console.log("Chapter ABORTED. Refusal:", refusalReason);
        this.gameState.questActive = false;

        if (this.gameState.history.length > 0) {
            this.gameState.history[this.gameState.history.length - 1].outcome = `Player changed the script. Reason: ${refusalReason}`;
        }

        this.typeText('quest-tracker-desc', "CHOICE MADE (Calculating consequences...)");
        //this.showNotification("Destiny Changed", "The story is changing...");

        try {
            if (typeof fetchRefusalChapter === 'function') {
                const nextChapter = await fetchRefusalChapter(
                    this.gameState.history, 
                    refusalReason, 
                    this.gameState.storyTheme,
                    this.gameState.futureChapters,
                    this.gameState.spawnedStoryAssets
                );

                if (nextChapter) {
                    this.startNewQuest(nextChapter);
                } else {
                    alert("The story ends here... (AI Generation Failed)");
                }
            }
        } catch (e) {
            console.error("Error diverging story:", e);
        }
    },
    //#endregion

    //#region Tracking & Checking

    // REVISED: Improved check to support Structure IDs and Names correctly
    isQuestTarget: function(obj) {
        // Safety checks
        if (!this.gameState.questActive || !this.gameState.currentObjective) return false;
        if (!obj || obj.dead) return false;
        
        // Don't mark the player itself
        if (obj === window.player) return false;
        //if (window.playerModel && obj.type === window.playerModel) return false;

        const target = this.gameState.currentObjective.target;
        const targetName = this.gameState.currentObjective.targetName;

        // 1. Check Structure ID (Crucial for Visit quests on buildings)
        // If the object is part of the target structure, it's a target.
        if (obj.structureId === target) {
            if (targetName && targetName !== "null") {
                return obj.structureName === targetName;
            }
            return true;
        }

        // 2. Check Type (For standard object/entity targets)
        if (obj.type === target) {
             // If a specific name is REQUIRED by the objective, verify it.
             if (targetName && targetName !== "null") {
                 return obj.name === targetName;
             }
             // If no specific name is required, the type match is enough.
             return true;
        }

        return false;
    },

    getQuestType: function() {
        return this.gameState.currentObjective ? this.gameState.currentObjective.type : null;
    },

    updateHUD: function() {
        const obj = this.gameState.currentObjective;
        if (!obj) return;
        const progEl = document.getElementById('quest-tracker-progress');
        if (progEl) progEl.innerText = `${obj.progress} / ${obj.count}`;
    },

    // Main update loop for time-based and location-based objectives
    update: function() {
        if (!this.gameState.questActive) return;
        const obj = this.gameState.currentObjective;
        if (!obj) return;

        // Survive Logic
        if (obj.type === 'survive') {
            const now = Date.now();
            if (now - this.gameState.lastSurviveUpdate >= 1000) { 
                obj.progress++;
                this.gameState.lastSurviveUpdate = now;
                this.updateHUD();

                if (obj.progress >= obj.count) {
                  
                    this.completeObjective(`Player survived for ${obj.count} seconds.`);
                }
            }
        }

        // Visit Logic
        if (obj.type === 'visit') {
             this.checkVisitProgress();
        }

        // --- PROGRESSION SAFETY CHECK ---
        // Every 5 seconds, verify that the target actually exists in the world.
        // If the target is missing (didn't spawn, fell off map, etc), force spawn it.
        const now = Date.now();
        if (now - (this.gameState.lastSafetyCheck || 0) > 5000) {
            this.gameState.lastSafetyCheck = now;
            this.ensureTargetExists();
        }
    },

    // Helper: Scans world for target and spawns it if missing
    ensureTargetExists: function() {
        const obj = this.gameState.currentObjective;
        if (!obj) return;

        // Skip logic for abstract objectives
        if (obj.type === 'survive' || obj.type === 'travel') return;

        // Determine if target is valid asset/structure (avoids trying to spawn Biomes)
        const isAsset = window.ASSET_LIBRARY && window.ASSET_LIBRARY[obj.target];
        const isStructure = window.STRUCTURE_LIBRARY && window.STRUCTURE_LIBRARY[obj.target];
        
        // If target isn't a known physical entity/structure, we assume it's abstract (e.g. Biome) and skip spawning
        if (!isAsset && !isStructure) return;

        let found = false;

        // Scan all loaded chunks for the target
        if (window.loadedChunks) {
            for (const key in window.loadedChunks) {
                const chunk = window.loadedChunks[key];
                for (const item of chunk) {
                    if (item.dead) continue;
                    if (this.isQuestTarget(item)) {
                        found = true;
                        break;
                    }
                }
                if (found) break;
            }
        }

        // If not found, force spawn nearby
        if (!found) {
            console.log(`[QuestSystem] Safety: Target '${obj.target}' missing. Spawning reinforcement...`);
            this.showNotification("Objective Update", "Target spotted nearby.");

            const spawnItem = {
                type: obj.target,
                count: 1,
                distance: 'medium', // Spawn relatively close so player finds it
                category: isStructure ? 'structure' : 'entity',
                name: obj.targetName
                // Note: No 'biome' property is passed, allowing it to spawn in any biome
            };

            if (window.spawnQuestAssets) {
                window.spawnQuestAssets([spawnItem]);
            }
        }
    },

    // Helper to check for structure/object visits (Updated logic)
    checkVisitProgress: function() {
        const obj = this.gameState.currentObjective;
        if (!obj || obj.type !== 'visit') return;

        if (!window.player || !window.loadedChunks) return;
        
        const pChunkX = Math.floor(window.player.x / CHUNK_SIZE);
        const pChunkY = Math.floor(window.player.y / CHUNK_SIZE);
        const VISIT_PROXIMITY_BUFFER = 200;

        for (let x = pChunkX - 1; x <= pChunkX + 1; x++) {
            for (let y = pChunkY - 1; y <= pChunkY + 1; y++) {
                const key = `${x},${y}`;
                if (window.loadedChunks[key]) {
                    const chunk = window.loadedChunks[key];
                    for (let i = 0; i < chunk.length; i++) {
                        const item = chunk[i];
                        if (item.dead) continue; 

                        let matched = false;

                        // 1. Structure Visit Check
                        if (item.structureId && item.structureId === obj.target) {
                             // FIX: Verify Name if required
                             let nameMatch = true;
                             if (obj.targetName && obj.targetName !== "null") {
                                 if (item.structureName !== obj.targetName) {
                                     nameMatch = false;
                                 }
                             }

                             if (nameMatch && this.checkCollision(window.player, item)) {
                                 matched = true;
                             }
                        }
                        
                        // 2. Object/Entity Visit Check
                        else if (item.type === obj.target || item.name === obj.target) {
                            
                            // FIX: Verify Name if required
                            let nameMatch = true;
                            if (obj.targetName && obj.targetName !== "null") {
                                if (item.name !== obj.targetName) {
                                    nameMatch = false;
                                }
                            }

                            if (nameMatch) {
                                const proximityBox = {
                                    x: item.x - VISIT_PROXIMITY_BUFFER,
                                    y: item.y - VISIT_PROXIMITY_BUFFER,
                                    width: item.width + (VISIT_PROXIMITY_BUFFER * 2),
                                    height: item.height + (VISIT_PROXIMITY_BUFFER * 2)
                                };

                                if (this.checkCollision(window.player, proximityBox)) {
                                    matched = true;
                                }
                            }
                        }

                        if (matched) {
                             this.completeObjective(`Player visited ${obj.targetName || obj.target}.`);
                             return; 
                        }
                    }
                }
            }
        }
    },

    checkCollision: function(rect1, rect2) {
        return (rect1.x < rect2.x + rect2.width &&
                rect1.x + rect1.width > rect2.x &&
                rect1.y < rect2.y + rect2.height &&
                rect1.y + rect1.height > rect2.y);
    },

    // --- NEW: Dialogue Handling ---
    showDialogue: function(dialogueData) {
        if (!dialogueData) return false;

        const modal = document.getElementById('dialogue-modal');
        const speaker = document.getElementById('dialogue-speaker');
        const text = document.getElementById('dialogue-text');
        const choicesContainer = document.getElementById('dialogue-choices');

        if (!modal || !speaker || !text || !choicesContainer) return false;

        // Pause Game
        if (window.stopGame) window.stopGame();

        speaker.innerText = dialogueData.speakerName || "Unknown";
        // Reset text
        text.innerText = "";
        
        // Clear old choices
        choicesContainer.innerHTML = '';

        modal.style.display = 'flex';

        // Typewriter effect for dialogue
        this.typeText('dialogue-text', dialogueData.text, 20).then(() => {
            // Once typing finishes, show choices
            if (dialogueData.choices && dialogueData.choices.length > 0) {
                dialogueData.choices.forEach(choice => {
                    const btn = document.createElement('button');
                    btn.className = 'dialogue-btn'; // Uses the new CSS class
                    btn.innerText = `> ${choice.text}`;
                    
                    btn.onclick = () => {
                        this.handleDialogueChoice(choice);
                    };
                    choicesContainer.appendChild(btn);
                });
            } else {
                 // Fallback "Continue" button
                 const btn = document.createElement('button');
                 btn.className = 'dialogue-btn';
                 btn.innerText = "> Continue";
                 
                 btn.onclick = () => {
                     this.handleDialogueChoice({ resultTag: 'continue', text: 'Confirmed' });
                 };
                 choicesContainer.appendChild(btn);
            }
        });

        return true;
    },

    handleDialogueChoice: function(choiceObj) {
        document.getElementById('dialogue-modal').style.display = 'none';
        
        const resultTag = choiceObj.resultTag;
        const choiceText = choiceObj.text;

        console.log(`Player choice: ${resultTag} ("${choiceText}")`);
        
        // --- BRANCHING LOGIC ---
        if (resultTag === 'change') {
            // 1. Log the refusal
            this.gameState.playerDecisions.push(`Player replied with: "${choiceText}"`);
            
            // 2. CLEAR the future objectives of this chapter (since we changed script)
            this.gameState.objectiveQueue = [];

            // 3. Force divergence immediately
            if (window.startGame) window.startGame();
            
            // Call the SPECIAL refusal function
            this.triggerRefusal(choiceText);

        } else {
            // 'continue' or other tags
            this.gameState.playerDecisions.push(`Chose: "${choiceText}"`);
            
            // Resume Game
            if (window.startGame) window.startGame();

            // Complete the objective that triggered this and move to next in queue
            const obj = this.gameState.currentObjective;
            this.completeObjective(`Player talked to ${obj.target}. Result: ${resultTag}`);
        }
    },

    reportEvent: function(eventType, data) {

        // First, check if player killed a quest entity
        if (eventType === 'ENTITY_DEATH' && data && data.victim) {
            const victimName = data.victim.name;
            if (victimName) {
                // Find this entity in story assets memory
                const assetIndex = this.gameState.spawnedStoryAssets.findIndex(a => a.name === victimName);
                if (assetIndex !== -1) {
                    // Mark it as dead so the AI knows it died
                    this.gameState.spawnedStoryAssets[assetIndex].isDead = true;
                }
            }
        }

        if (eventType === 'collect' && data) {
        const itemName = data.name || (data.item ? data.item.name : null);
        
        if (itemName) {
            const assetIndex = this.gameState.spawnedStoryAssets.findIndex(a => a.name === itemName);
            
            if (assetIndex !== -1) {
                // Mark as COLLECTED (In Inventory)
                this.gameState.spawnedStoryAssets[assetIndex].isCollected = true;
                console.log(`[QuestSystem] Story Asset '${itemName}' collected by player.`);
            }
        }
    }


        
        if (!this.gameState.questActive) return;
        const obj = this.gameState.currentObjective;
        if (!obj) return;

        if (obj.progress >= obj.count) return;

        try {
            let updated = false;

            if (eventType === 'PLAYER_DEATH') return;

            if (eventType === 'ENTITY_DEATH' && obj.type === 'kill') {
                if (data && data.victim) {
                    if (data.victim.type === obj.target || data.victim.name === obj.target) {
                        obj.progress++;
                        updated = true;
                        if (obj.progress >= obj.count) {
                            this.completeObjective(`Player killed ${obj.count} ${obj.target}(s).`);
                        }
                    }
                }
            }

            if (eventType === 'ITEM_COLLECT' && obj.type === 'collect') {
                if (data && data.item) {
                    if (data.item.type === obj.target || data.item.name === obj.target) {
                        obj.progress++;
                        updated = true;
                        if (obj.progress >= obj.count) {
                            // CHECK FOR DIALOGUE FIRST

                            this.completeObjective(`Player collected ${obj.count} ${obj.target}(s).`);
                        }
                    }
                }
            }

            if (eventType === 'ITEM_KILL' && obj.type === 'kill') {
                 if (data && data.item) {
                    if (data.item.type === obj.target || data.item.name === obj.target) {
                        obj.progress++;
                        updated = true;
                        if (obj.progress >= obj.count) {

                            this.completeObjective(`Player destroyed ${obj.count} ${obj.target}(s).`);
                        }
                    }
                }
            }

            if (eventType === 'ENTITY_TALK' && obj.type === 'talk') {
                let targetType = null;
                let targetName = null;
                
                if (data && data.entity) { targetType = data.entity.type; targetName = data.entity.name; }
                else if (data && data.item) { targetType = data.item.type; targetName = data.item.name; }
                else if (data && data.item.structureId) { targetType = data.item.structureId; targetName = data.item.structureName; }

                if ((targetType && targetType === obj.target) || (targetName && targetName === obj.target)) {
                    
                    // CHECK FOR DIALOGUE FIRST
                    if (obj.dialogue) {
                        // Show UI and STOP progress increment (handled by choice)
                        const showing = this.showDialogue(obj.dialogue);
                        if (showing) return; 
                    }

                    // Standard (non-dialogue) completion
                    obj.progress++;
                    updated = true;
                    if (obj.progress >= obj.count) {
                        this.completeObjective(`Player interacted with '${obj.target}'.`);
                    }
                }
            }

            if (eventType === 'ZONE_ENTER' && obj.type === 'visit') {
                if (data && data.biomeName === obj.target) {

                    this.completeObjective(`Player traveled to a '${obj.target}' biome.`);
                }
            }

            if (updated) this.updateHUD();

        } catch (err) {
            console.warn("Quest System Error (ignored):", err);
        }
    },

    completeObjective: function(outcomeDescription) {
        const currentObj = this.gameState.currentObjective;
        if (currentObj.progress > currentObj.count) return;
        currentObj.progress = currentObj.count + 1;

        console.log("Objective Complete:", outcomeDescription);
        
        if (this.gameState.history.length > 0) {
            let lastEntry = this.gameState.history[this.gameState.history.length - 1];
            if (lastEntry.outcome === "In Progress...") lastEntry.outcome = `Completed: ${outcomeDescription}`;
        }

        giveXp(30, 40)


        

        if (currentObj.dialogue) {
            this.startNextObjective(false);
        } else {
            const questHUD = document.getElementById('quest-tracker');
            questHUD.style.display = 'none';
            setTimeout(() => {
                questHUD.style.display = 'initial';
                this.startNextObjective(false);
            }, 2000);
        }
        
    }
    //#endregion
};

window.QuestSystem.init();