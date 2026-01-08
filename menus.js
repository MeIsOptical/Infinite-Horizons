// Dream Game/menus.js

//#region IndexedDB Storage Helper
const GameStorage = {
    dbName: 'DreamGameDB',
    storeName: 'saves',
    db: null,

    init: async function() {
        if (this.db) return;
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName); // Key-Value store
                }
            };

            request.onsuccess = (e) => {
                this.db = e.target.result;
                resolve();
            };
            
            request.onerror = (e) => {
                console.error("Database error:", e);
                reject(e);
            };
        });
    },

    getSaves: async function() {
        await this.init();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([this.storeName], 'readonly');
            const store = tx.objectStore(this.storeName);
            const req = store.get('all_worlds'); // We store all worlds in one array for compatibility

            req.onsuccess = () => {
                resolve(req.result || []);
            };
            req.onerror = () => reject(req.error);
        });
    },

    saveAll: async function(savesArray) {
        await this.init();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([this.storeName], 'readwrite');
            const store = tx.objectStore(this.storeName);
            const req = store.put(savesArray, 'all_worlds');

            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    }
};
//#endregion

//#region UI Setup
async function setupMainMenu() {
    // Initialize DB immediately
    try {
        await GameStorage.init();
    } catch (e) {
        console.error("Failed to init storage", e);
    }

    // Menu Views
    const mainMenu = document.getElementById('main-menu');
    const settingsMenu = document.getElementById('new-world-settings');
    const worldManager = document.getElementById('world-manager');
    const loadingMenu = document.getElementById('world-gen-loading');
    const ingameMenu = document.getElementById('ingame-menu');
    const gameHud = document.getElementById('hud');
    const menuBg = document.getElementById('menu-background');

    // Main Menu Buttons
    const startBtn = document.getElementById('start-btn');
    const manageBtn = document.getElementById('manage-btn');

    // Settings/Generation Elements
    const generateBtn = document.getElementById('generate-btn');
    const backBtn = document.getElementById('back-btn');
    const promptInput = document.getElementById('world-prompt');
    const storyInput = document.getElementById('story-prompt'); 
    const loadingBar = document.getElementById('world-gen-loading-bar');
    const loadingMessage = document.getElementById('world-gen-loading-text');

    // Manager Elements
    const managerBackBtn = document.getElementById('manager-back-btn');
    const worldListContainer = document.getElementById('world-list-container');

    // In-Game Settings Elements
    const ingameSettingsBtn = document.getElementById('ingame-settings-btn');
    const resumeBtn = document.getElementById('resume-btn');
    const leaveWorldBtn = document.getElementById('leave-world-btn');
    
    // NEW: Preset Elements
    const presetSelect = document.getElementById('world-preset-select');
    // Note: We no longer toggle the promptContainer visibility, just the disabled state of inputs

    // --- POPULATE PRESETS ---
    // Extract worlds from training data
    if (typeof DATA_WORLD_EXAMPLES !== 'undefined') {
        DATA_WORLD_EXAMPLES.forEach((ex, index) => {
            if (ex.role === 'model') {
                try {
                    // In your trainingData.js, the text is the result of JSON.stringify
                    // We parse it here to get the world name for the UI
                    const parts = ex.parts || [{text: ex.content}]; 
                    const data = JSON.parse(parts[0].text);
                    
                    const option = document.createElement('option');
                    option.value = index; // Store the index of the MODEL response
                    option.text = `Preset: ${data.name || "Untitled World"}`;
                    presetSelect.appendChild(option);
                } catch(e) {
                    console.warn("Could not parse training example for preset menu", e);
                }
            }
        });
    }

    // --- PRESET SELECTION LOGIC ---
    presetSelect.addEventListener('change', () => {
        const isCustom = presetSelect.value === 'custom';

        // 1. Disable/Enable Inputs
        promptInput.disabled = !isCustom;
        if (storyInput) storyInput.disabled = !isCustom;

        // 2. Adjust Opacity for visual feedback
        promptInput.style.opacity = isCustom ? "1" : "0.7";
        if (storyInput) storyInput.style.opacity = isCustom ? "1" : "0.7";

        if (isCustom) {
            // Clear inputs for custom mode
            promptInput.value = '';
            if (storyInput) storyInput.value = '';
        } else {
            // Populate inputs from Training Data
            // The dropdown value is the index of the MODEL response.
            // The USER prompt (containing the description) is the entry immediately BEFORE it.
            const modelIndex = parseInt(presetSelect.value);
            const userIndex = modelIndex - 1;

            if (userIndex >= 0 && typeof DATA_WORLD_EXAMPLES !== 'undefined') {
                const example = DATA_WORLD_EXAMPLES[userIndex];
                
                // Safety check to ensure we have the 'parts' array as seen in your file
                if (example && example.parts && example.parts.length > 0) {
                    const fullText = example.parts[0].text;

                    // Regex to extract text inside quotes, supporting multi-line strings ([\s\S]*?)
                    const descMatch = fullText.match(/WORLD:\s*"([\s\S]*?)"/i);
                    const storyMatch = fullText.match(/STORY:\s*"([\s\S]*?)"/i);

                    if (descMatch && descMatch[1]) {
                        promptInput.value = descMatch[1].trim();
                    }
                    if (storyMatch && storyMatch[1] && storyInput) {
                        storyInput.value = storyMatch[1].trim();
                    }
                }
            }
        }
    });


    // --- MAIN MENU NAVIGATION ---

    // Open "New World" Settings
    startBtn.addEventListener('click', () => {
        // Reset to Custom by default when opening menu
        presetSelect.value = 'custom';
        presetSelect.dispatchEvent(new Event('change')); // Trigger change to reset inputs

        mainMenu.style.display = 'none';
        settingsMenu.style.display = 'flex';
    });

    // Open "World Manager"
    manageBtn.addEventListener('click', async () => {
        mainMenu.style.display = 'none';
        worldManager.style.display = 'flex';
        // Now Async
        await renderWorldList(worldListContainer, (selectedWorld) => {
            // On Play
            worldManager.style.display = 'none';
            launchGame(selectedWorld, menuBg, loadingMenu, gameHud, null, true);
        });
    });

    // Back from "New World"
    backBtn.addEventListener('click', () => {
        settingsMenu.style.display = 'none';
        mainMenu.style.display = 'flex';
    });

    // Back from "Manager"
    managerBackBtn.addEventListener('click', () => {
        worldManager.style.display = 'none';
        mainMenu.style.display = 'flex';
    });


    // --- WORLD GENERATION ---

    generateBtn.addEventListener('click', async () => {
        const maxLoadingStep = 3; 
        
        // 1. UI: Start Loading
        settingsMenu.style.display = 'none';
        loadingMenu.style.display = 'flex';
        updateLoading(loadingBar, loadingMessage, 0, maxLoadingStep, "Preparing...");

        setTimeout(() => {
            updateLoading(loadingBar, loadingMessage, 1, maxLoadingStep, "Contemplating infinite possibilities...");
        }, 500);

        let worldData = null;
        let chapterOne = null;
        const selectedPreset = presetSelect.value;

        // --- BRANCH: CUSTOM VS PRESET ---
        if (selectedPreset === 'custom') {
            // ONLINE MODE (AI API)
            const worldPrompt = promptInput.value;
            const storyPrompt = storyInput ? storyInput.value : "";
            
            worldData = await fetchWorldConfig(worldPrompt, storyPrompt);
            
            // Logic continues below...
            if (worldData) {
                 updateLoading(loadingBar, loadingMessage, 2, maxLoadingStep, "Writing destiny...");
                 chapterOne = await fetchFirstChapter(worldData, storyPrompt);
            }

        } else {
            // OFFLINE MODE (Use Data from libraries/trainingData.js)
            console.log("Generating from Preset Index:", selectedPreset);
            
            try {
                const presetIndex = parseInt(selectedPreset);
                
                // 1. Get World Data
                const worldEx = DATA_WORLD_EXAMPLES[presetIndex];
                const wParts = worldEx.parts || [{text: worldEx.content}];
                worldData = JSON.parse(wParts[0].text);

                // 2. Get Story Data (Matching the Index)
                // We use the same index because the arrays are parallel (aligned).
                if (typeof DATA_STORY_EXAMPLES !== 'undefined') {
                    const storyEx = DATA_STORY_EXAMPLES[presetIndex]; // <--- FIXED: Use presetIndex
                    
                    if (storyEx && storyEx.role === 'model') {
                         const sParts = storyEx.parts || [{text: storyEx.content}];
                         chapterOne = JSON.parse(sParts[0].text);
                    } else {
                        console.warn("No matching story found at index", presetIndex);
                    }
                }

                // Simulate slight delay for effect
                await new Promise(r => setTimeout(r, 1000));

            } catch (e) {
                console.error("Error loading preset:", e);
                alert("Error loading preset data. Check console.");
                loadingMenu.style.display = 'none';
                settingsMenu.style.display = 'flex';
                return;
            }
        }

        // --- VALIDATION ---
        if (!worldData) {
            alert("Failed to generate world. Please try again.");
            loadingMenu.style.display = 'none';
            settingsMenu.style.display = 'flex';
            return;
        }

        console.log("World Ready:", worldData);
       
        // Save to storage immediately (Async)
        await saveWorldToStorage(worldData);
        
        // Apply to game engine
        setWorld(worldData);
        // Generate initial chunks
        console.log("Pre-generating starting area...");
        if (typeof getChunk === 'function') {
            for(let x = -1; x <= 1; x++) {
                for(let y = -1; y <= 1; y++) {
                    getChunk(x, y);
                }
            }
        }

        // FINISH
        updateLoading(loadingBar, loadingMessage, 3, maxLoadingStep, "Done!");
        
        setTimeout(() => {
            launchGame(worldData, menuBg, loadingMenu, gameHud, () => {
                
                if (window.QuestSystem && chapterOne) {
                    // A. Show the Story Modal
                    window.QuestSystem.startNewQuest(chapterOne, "Offline Story");
                } else {
                    // B. Fallback
                    if (window.startGame) window.startGame();
                }
                
            }, false);
            
        }, 800);
    });

    


    // --- IN-GAME SETTINGS ---

    // Open Settings (Pause)
    ingameSettingsBtn.addEventListener('click', () => {
        ingameMenu.style.display = 'flex';
        // Completely stop the game loop
        if (window.stopGame) window.stopGame();
    });

    // Resume Game
    resumeBtn.addEventListener('click', () => {
        ingameMenu.style.display = 'none';
        // Resume the game loop
        if (window.startGame) window.startGame();
    });

    // Leave World (Return to Main Menu)
    leaveWorldBtn.addEventListener('click', async () => {
        // --- SAVE CURRENT STATE BEFORE LEAVING ---
        await saveGameProgress();

        ingameMenu.style.display = 'none';
        gameHud.style.display = 'none';
        
        // Stop the game loop
        if (window.stopGame) window.stopGame();
        
        // Show Main Menu
        menuBg.style.display = 'block';
        mainMenu.style.display = 'flex';
    });
}
//#endregion


//#region PERKS MENU

const perksBtn = document.getElementById('perk-menu-btn');
const perksMenu = document.getElementById('perk-menu');
const perksLeaveBtn = document.getElementById('perks-leave-btn');
const perksPoints = document.getElementById('perks-menu-points');
const perkUpgradeBtns = document.querySelectorAll('.perk-item button');
const perkValueSpeed = document.getElementById('perk-val-speed');
const perkValueZoom = document.getElementById('perk-val-zoom');
const perkValueHealth = document.getElementById('perk-val-health');
const perkValuePunch = document.getElementById('perk-val-punch');

perksBtn.onclick = () => {
    window.stopGame();
    perksMenu.style.display = 'flex';
    updatePerkUI();
}

perksLeaveBtn.onclick = () => {
    perksMenu.style.display = 'none';
    window.startGame();
}

function updatePerkUI() {
    perkUpgradeBtns.forEach(btn => {btn.disabled = window.player.perkPoints < 1});

    perksPoints.innerHTML = `<span id="perk-points-colored">` + window.player.perkPoints + `</span> perk point${window.player.perkPoints == 1 ? "" : "s"} available`;

    // Stats
    perkValueSpeed.innerText = window.player.maxSpeed.toFixed(1);
    perkValueZoom.innerText = (1/window.player.minZoom*100).toFixed(0);
    perkValueHealth.innerText = window.player.maxHealth.toFixed(0);
    perkValuePunch.innerText = window.player.attackDamage.toFixed(0);
}

function upgradeStat(stat) {
    if (window.player.perkPoints < 1) return;

    let success = true;    
    switch (stat) {
        case 'punch':
            window.player.attackDamage += 2;
            break;

        case 'speed':
            window.player.maxSpeed += 0.1;
            break;

        case 'zoom':
            window.player.minZoom -= 0.03;
            break;

        case 'health':
            window.player.health += 5;
            window.player.maxHealth += 5;
            break;

        default:
            success = false;
            break;            
    }

    if (success) {
        window.player.perkPoints--;
    } else {
        console.warn("Invalid upgrade button.");
    }
    updatePerkUI();
}

//#endregion


//#region Helper Functions

function launchGame(worldData, bgElement, loadingElement, hudElement, onGameReady, autoPlay = true) {
    // 1. Set the world data
    setWorld(worldData);

    // 2. Hide loading screen and background
    setTimeout(() => {
        if(loadingElement) loadingElement.style.display = 'none';
        bgElement.style.display = 'none';
        hudElement.style.display = 'block';
        
        // 3. Start the game loop ONLY if autoPlay is true
        if (autoPlay && window.startGame) {
            window.startGame();
        }

        // 4. Run the callback
        if (onGameReady) {
            onGameReady();
        }

    }, 1000);
}


function updateLoading(barObj, messageObj, step, maxStep, message) {
    let barPercent = Math.round(step / maxStep * 100);
    barObj.style.width = `${barPercent}%`;
    messageObj.textContent = message;
}
//#endregion

//#region Save/Load System

async function saveWorldToStorage(worldData) {
    try {
        const saves = await GameStorage.getSaves();
        
        // Check if a world with this name already exists
        const existingIndex = saves.findIndex(w => w.name === worldData.name);
        
        if (existingIndex >= 0) {
            // If it exists, update it
            saves[existingIndex] = worldData;
        } else {
            saves.push(worldData);
        }
        
        await GameStorage.saveAll(saves);
    } catch (e) {
        console.error("Save Failed:", e);
        alert("Could not save world data.");
    }
}

// Function to capture current game state and update the save file
async function saveGameProgress() {
    if (!currentWorldSettings) return;

    try {
        console.log("Saving game progress...");
        const saves = await GameStorage.getSaves();
        const index = saves.findIndex(w => w.name === currentWorldSettings.name);

        if (index >= 0) {
            // Create the snapshot of current state
            const currentState = {
                seed: window.worldSeed,
                player: window.player,
                camera: camera,
                chunks: window.loadedChunks,
                // Quest System State
                questState: window.QuestSystem ? window.QuestSystem.gameState : null
            };

            // Attach this state to the save object
            saves[index].savedState = currentState;

            // Write back to storage
            await GameStorage.saveAll(saves);
            console.log("Game saved successfully (IndexedDB).");
        }
    } catch (e) {
        console.error("Failed to save game:", e);
        alert("Warning: Failed to save progress.");
    }
}

async function renderWorldList(container, onPlayCallback) {
    container.innerHTML = 'Loading saves...';
    
    let saves = [];
    try {
        saves = await GameStorage.getSaves();
    } catch (e) {
        container.innerHTML = '<p style="color: red;">Error loading saves.</p>';
        return;
    }

    container.innerHTML = '';

    if (saves.length === 0) {
        container.innerHTML = '<p style="color: #888; text-align: center; margin-top: 50px;">No saved worlds found.</p>';
        return;
    }

    saves.forEach((world, index) => {
        const item = document.createElement('div');
        item.className = 'world-list-item';

        const info = document.createElement('div');
        info.className = 'world-info';
        
        info.innerHTML = `
            <h3>${world.name || "Untitled World"}</h3>
            <p>${world.description || ""}</p>
        `;

        const btnGroup = document.createElement('div');

        // Play Button with Pixel Art SVG
        const playBtn = document.createElement('button');
        playBtn.className = 'play-world-btn';
        playBtn.title = "Play World";
        playBtn.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><path d="M7 5 v14 h2 v-2 h2 v-2 h2 v-2 h2 v-2 h-2 v-2 h-2 v-2 h-2 v-2 z"/></svg>`;
        playBtn.onclick = () => onPlayCallback(world);

        // Delete Button with Pixel Art SVG
        const delBtn = document.createElement('button');
        delBtn.className = 'delete-world-btn';
        delBtn.title = "Delete World";
        delBtn.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><path d="M8 4 h8 v2 h3 v3 h-2 v11 h-10 v-11 h-2 v-3 h3 z M10 10 h1 v7 h-1 z M13 10 h1 v7 h-1 z"/></svg>`;
        delBtn.onclick = async () => {
            if (confirm(`Delete "${world.name}"?`)) {
                saves.splice(index, 1);
                await GameStorage.saveAll(saves); // Async save
                renderWorldList(container, onPlayCallback); // Re-render
            }
        };

        btnGroup.appendChild(delBtn);
        btnGroup.appendChild(playBtn);
        
        item.appendChild(info);
        item.appendChild(btnGroup);
        container.appendChild(item);
    });
}
//#endregion


//#region HUD


function updateHUD() {
    const hudCoords = document.getElementById('coords');
    const hudHealth = document.getElementById('player-health-bar');
    const hudXp = document.getElementById('player-xp-bar');
    
    // Determine chunk player is in
    const chunkX = Math.floor(window.player.x / CHUNK_SIZE);
    const chunkY = Math.floor(window.player.y / CHUNK_SIZE);
    const key = `${chunkX},${chunkY}`;
    
    // Look up that chunk in our memory
    const chunk = window.loadedChunks[key];
    let biomeName = "Unknown";
    
    // Find the 'ground' object to get the biome name
    if (chunk) {
        const ground = chunk.find(obj => obj.type === 'ground');
        if (ground && ground.biome) {
            biomeName = ground.biome.name;
        }
    }

    // Quest tracking
    if (window.QuestSystem && window.QuestSystem.gameState.lastBiome !== biomeName) {
        window.QuestSystem.reportEvent('ZONE_ENTER', { biomeName: biomeName });
        window.QuestSystem.gameState.lastBiome = biomeName;
    }

    // Update the text
    hudCoords.innerText = `Pos: ${Math.floor(window.player.x)}, ${Math.floor(window.player.y)} | Location: ${biomeName}`;

    // Update health bar
    const healthPercent = Math.max(0, (window.player.health / window.player.maxHealth) * 100);
    hudHealth.style.width = `${healthPercent}%`;

    // Update xp bar
    const xpPercent = Math.max(0, (window.player.xp / getMaxXp(window.player.level)) * 100);
    hudXp.style.width = `${xpPercent}%`;

    // Update level display
    const levelTxt = document.getElementById('player-level');
    levelTxt.innerText = "Lv. " + window.player.level;

    // Update inventory
    updateInventoryUI();
}



// Update the player's inventory
function updateInventoryUI() {
    const player = window.player;
    // Target the wrapper
    const container = document.getElementById('inv-slots-wrapper'); 
    
    // Get text element
    const infoText = document.getElementById('inv-item-info');

    if (!player || !container) return;

    // Generate slots if not already
    if (container.children.length !== player.maxInventoryLength) {
        container.innerHTML = '';
        
        for (let i = 0; i < player.maxInventoryLength; i++) {
            const newSlot = document.createElement('div');
            newSlot.className = 'inv-slot';
            container.appendChild(newSlot);
        }
    }

    // Update slot content
    const slots = container.children;
    
    for (let index = 0; index < slots.length; index++) {
        const slot = slots[index];

        // Handle Selection Styling
        if (index === player.selectedItemIndex) {
            slot.style.borderColor = 'var(--primary-color)';
            slot.style.boxShadow = '0 0 10px var(--primary-color)';
            slot.style.transform = 'scale(1.05)';
            slot.style.zIndex = '9999';
            
            // Update text when we find the selected slot
            if (infoText) {
                const item = player.inventory[index];
                if (item) {
                     const data = item.itemData || item;
                     let nameText = item.name || 'Unnamed Item';
                     
                     switch (data.category) {
                        case 'weapon':
                            nameText += ' <span>[Left Click]</span>';
                            break;

                        case 'consumable':
                            nameText += ` <span>['E']</span>`;
                            break;
                     }
                     infoText.innerHTML = nameText;
                } else {
                    infoText.textContent = '';
                }
            }

        } else {
            slot.style.borderColor = '#111';
            slot.style.boxShadow = 'none';
            slot.style.transform = 'scale(1)';
            slot.style.zIndex = '9998';
        }

        // Add image (Your existing logic)
        const item = player.inventory[index];
        const existingImg = slot.querySelector('img');

        if (item) {
            const asset = ASSET_LIBRARY[item.type] || ASSET_LIBRARY['unknown'];
            if (asset && asset.src) {
                if (!existingImg) {
                    const img = document.createElement('img');
                    img.src = asset.src;
                    img.dataset.type = item.type;
                    slot.appendChild(img);
                } 
                else if (existingImg.dataset.type !== item.type) {
                    existingImg.src = asset.src;
                    existingImg.dataset.type = item.type;
                }
            }
        } else {
            if (existingImg) {
                slot.innerHTML = '';
            }
        }
    }
}

//#endregion