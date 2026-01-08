// Dream Game/aiHandler.js

//#region Configuration
const API_URL = `https://infinite-horizons-api.tobixepremium.workers.dev`;

// List of models to try in order of preference/availability
const AI_MODELS = [
    "gemini-3-flash-preview",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
];
//#endregion

//#region Core API Logic

/**
 * Sends a prompt to the AI API, handling retries across multiple models.
 * @param {string} prompt - The user prompt to send.
 * @param {Array} trainingExamples - Few-shot training examples (history).
 * @returns {Promise<string|null>} The raw text response or null on failure.
 */
async function callAiApi(prompt, trainingExamples = []) {

    console.log(`Sending AI request...`);

    // 2. ADAPTER: Convert Google-format history to Groq/OpenAI format
    const validRoles = { "user": "user", "model": "assistant" };
    
    const formattedHistory = trainingExamples.map(ex => {
        let textContent = "";
        if (ex.parts && ex.parts[0].text) textContent = ex.parts[0].text;
        else if (ex.content) textContent = ex.content;
        
        return {
            role: validRoles[ex.role] || "user",
            content: textContent
        };
    });

    // Add the current prompt
    formattedHistory.push({ role: "user", content: prompt });

    // 3. RETRY LOOP: Try models one by one
    for (const modelName of AI_MODELS) {
        try {
            console.log(`Attempting with model: ${modelName}`);

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: modelName, 
                    messages: formattedHistory,
                    temperature: 0.7, 
                    max_completion_tokens: 65000 
                })
            });
            
            const data = await response.json();
            
            // Check for API errors
            if (data.error) {
                console.warn(`Error with ${modelName}:`, data.error);
                console.log("Switching to fallback model...");
                continue; 
            }

            // Success Parser
            if (data.choices && data.choices[0] && data.choices[0].message) {
                let rawText = data.choices[0].message.content;
                console.log(`Success with ${modelName}!`);
                return rawText.replace(/```json|```/g, '').trim();
            }

        } catch (e) {
            console.error(`Network/Parsing Error with ${modelName}:`, e);
            // Continue loop on network errors
            continue;
        }
    }

    // If loop finishes without returning, all models failed
    alert("AI Connection Failed: Rate limits reached on all available models. Please wait a moment and try again.");
    return null;
}
//#endregion

//#region Context Building

/**
 * Creates a string representation of the world to give context to the AI.
 * @param {Object} worldData - The world configuration object.
 */
function buildDetailedContext(worldData) {
    if (!worldData || !worldData.biomes) return "Unknown World";

    let context = `WORLD: Named '${worldData.name}', Description: '${worldData.description}'\n`;

    context += `DISTANCES CONTEXT: <700 = very close, <1200 = medium, <3000 = Far, 3000+ = Very far\n`;

    // 1. Add Biomes (All info)
    if (worldData.biomes && worldData.biomes.length > 0) {
        context += `\nBIOMES:\n${JSON.stringify(worldData.biomes, null, 2)}\n`;
    }

    // 2. Add Entities, Objects, and Structures
    // We check these arrays in worldData and filter out internal assets
    const categories = [
        { key: 'entities', label: 'ENTITIES' },
        { key: 'objects', label: 'OBJECTS' },
        { key: 'structures', label: 'STRUCTURES' }
    ];

    categories.forEach(cat => {
        if (worldData[cat.key] && Array.isArray(worldData[cat.key])) {
            // Filter out items that are marked as internal
            const visibleItems = worldData[cat.key].filter(item => !item.isInternal);
            
            if (visibleItems.length > 0) {
                // JSON.stringify includes all relevant parameters (behavior, custom name, distance, etc.)
                // provided they are properties of the objects in the array.
                context += `\n${cat.label}:\n${JSON.stringify(visibleItems, null, 2)}\n`;
            }
        }
    });

    return context;
}

function getFullAssetContext() {
    const allKeys = Object.keys(ASSET_LIBRARY);
    
    const items = allKeys.filter(key => ASSET_LIBRARY[key].isItem).join(', ');
    const entities = allKeys.filter(key => ASSET_LIBRARY[key].isEntity).join(', ');
    const objects = allKeys.filter(key => !ASSET_LIBRARY[key].isEntity && !ASSET_LIBRARY[key].isInternal).join(', ');
    const structures = Object.keys(STRUCTURE_LIBRARY).filter(key => !STRUCTURE_LIBRARY[key].isInternal).join(', ');

    return `
    AVAILABLE ASSETS (Use these IDs for 'target' and 'spawn' types):
    - ENTITIES: ${entities}
    - OBJECTS: ${objects}
    - ITEMS: ${items}
    - STRUCTURES: ${structures}
    `;
}
//#endregion

//#region World Generation

/**
 * Requests the AI to generate a world configuration JSON.
 */
async function fetchWorldConfig(userDescription, storyPrompt) {
    const prompt = generateWorldPrompt(userDescription, storyPrompt);
    
    // CHANGED: Pass DATA_WORLD_EXAMPLES
    const jsonString = await callAiApi(prompt, DATA_WORLD_EXAMPLES);
    if (!jsonString) return null;

    try {
        const worldData = JSON.parse(jsonString);
        
        if (worldData.biomes) {
            worldData.biomes.forEach(biome => {
                // Remove invalid assets so the game doesn't crash
                if (biome.structures) biome.structures = biome.structures.filter(s => STRUCTURE_LIBRARY[s.type]);
                if (biome.objects) biome.objects = biome.objects.filter(o => ASSET_LIBRARY[o.type]);
                if (biome.entities) biome.entities = biome.entities.filter(e => ASSET_LIBRARY[e.type]);
            });
        }
        return worldData;
    } catch (e) {
        console.error("Invalid JSON from AI:", jsonString);
        return null;
    }
}

function generateWorldPrompt(userDescription, storyPrompt) {
    // Get dynamic lists
    const allKeys = Object.keys(ASSET_LIBRARY);
    
    const entities = allKeys.filter(key => ASSET_LIBRARY[key].isEntity).join(', ');
    const items = allKeys.filter(key => ASSET_LIBRARY[key].isItem).join(', ');
    const staticObjects = allKeys.filter(key => !ASSET_LIBRARY[key].isEntity && !ASSET_LIBRARY[key].isInternal).join(', ');
    
    const availableStructures = Object.keys(STRUCTURE_LIBRARY).filter(key => !STRUCTURE_LIBRARY[key].isInternal).join(', ');

    // Build the message
    const prompt = `
    You are a world designer for a procedurally generated 2D world in a video game. Generate a JSON object containing the properties to generate a unique world based on these properties:
    
    - WORLD DESCRIPTION: "${userDescription}"
    - STORY: "${storyPrompt}"
    The story is given for context. Do not generate story elements, you simply have to build the world where the story will take place.

    RULES:
    - Output valid JSON only. No markdown, no comments.
    - Generate at least 8 biomes. These biomes are very large, and always the same size.
    - Use ONLY these assets for environment objects: ${staticObjects}
    - Use ONLY these assets for items: ${items}
    - Use ONLY these assets for structures: ${availableStructures}
    - Use ONLY these assets for entities and player: ${entities}
    - Only use assets relevant to the theme, and prioritize quality over quantity.
    - Follow this JSON structure exactly: ${JSON.stringify(jsonWorldFormat)}
    `;

    return prompt;
}

// The format expected from the api response
const jsonWorldFormat = {
    name: "String: Unique name for the world",
    description: "String: A very short description of the world.",
    playerModel: "String: Must be in ENTITIES LIBRARY - Very important value, will massively change gameplay. Human characters are recommended.",
    skyTint: "String: Hex color (#rrggbb) for the sky.",
    biomes: [
        {
            name: "String: Give a meaningful name that describes the biome.",
            skyTint: "String (optional): Hex color (#rrggbb) for the sky of this biome.",
            rarity: "Int: 1 (very rare) to 50 (common) - relative weight",
            groundColor: "String: Hex color (#rrggbb) - The color of the ground. Cities should usually have a gray color.",
            groundNoiseIntensity: "Number: 0.02 (almost flat texture, good for smooth textures like snow, sand, asphalt, cities, etc.) to 0.25 (extremely noisy, good for rocky terrains) - Ground texture noise",
            structureLegend: {
                "W": "String: Wall Hex color (#rrggbb). Should be darker, and different from the ground color.",
                "F": "String: Floor Hex color (#rrggbb). Should be lighter to contrast the walls, and different from the ground color."
            },
            structureGenerationType: "String: 'grid' or 'scattered' - Example: Should use 'grid' for villages and cities.",
            structures: [
                {
                    type: "String: Must be in STRUCTURES LIBRARY",
                    count: "Int: 1 (very few) to 200 (fill chunk, great for cities) - Structures per chunk. City-based worlds should contain a lot of buildings.",
                    chance: "Number: 0.1 (extremely rare) to 1.0 (guaranteed to spawn, this is usually right) - Spawn probability"
                }
            ],
            objects: [
                {
                    type: "String: Must be in OBJECTS LIBRARY",
                    count: "Int: 1 (extremely rare) to 1000 (extremely common) - Amount per chunk"
                }
            ],
            items: [
                {
                    type: "String: Must be in ITEMS LIBRARY",
                    name: "String: The displayed name of the item.",
                    itemData: {
                        category: "String: Must be either 'weapon' or 'consumable'",
                        weaponDamage: "Int: 10 (fist) to 200 (extremely high) - Damage dealt by this weapon. ONLY FOR THE 'WEAPON' CATEGORY",
                        weaponReach: "Int: 80 (fist) to 200 (extremely high) - Range of this weapon. ONLY FOR THE 'WEAPON' CATEGORY",
                        weaponAttackArc: "Int: 50 (very small) to 360 (full circle) - Arc of attacks in degrees. ONLY FOR THE 'WEAPON' CATEGORY",
                        weaponAttackLunge: "Int: 0 (none) to 15 (extremely high) - How much the player is pushed when using the weapon. ONLY FOR THE 'WEAPON' CATEGORY",
                        weaponAttackDuration: "Int: 100 (almost instant) to 1200 (very slow) - Duration of the attack. Heavier weapons should take longer to use. ONLY FOR THE 'WEAPON' CATEGORY",
                        weaponColorAccent: "String (optional): The hex code used in the attack animation, light color. Only use for very special items. ONLY FOR THE 'WEAPON' CATEGORY",
                        consumeValue: "Int: 5 (low) to 30 (very high) - Health restored when consumed. ONLY FOR THE 'CONSUMABLE' CATEGORY"
                    },
                    count: "Int: 1 (extremely rare) to 1000 (extremely common) - Amount per chunk"
                }
            ],
            entities: [
                {
                    type: "String: Must be in ENTITIES LIBRARY",
                    name: "String: The displayed name of this entity. Do not use names that could indicate that the entity is interactible. Do not give them proper names.",
                    nameVisibility: "Boolean: If the name is visible or hidden (hide generic names like 'cow').",
                    health: "Int: 50 (very low) to 500 (very high) - The maximum health the entity can have",
                    count: "Int: 1 to 50 - Entities per chunk",
                    behavior: "String: Must be 'hostile' (attack the player, use only for IMMEDIATE DANGERS), 'neutral' (wander), or 'flee' (run away from the player)"
                }
            ]
        }
    ]
};
//#endregion

//#region Quest Generation

/**
 * Generates the first chapter (Prologue) based on world config.
 */
async function fetchFirstChapter(worldConfig, storyPrompt) {
    const worldContext = buildDetailedContext(worldConfig);
    const assetsContext = getFullAssetContext();

    const prompt = `
    You are a story generator for a procedurally generated 2D world in a video game. You must create a story for a new world based on the given context and prompt.
    
    STORY PROMPT: "${storyPrompt || "A generic adventure"}"
    (Use this story prompt as the MAIN THEME for the narrative).

    ${worldContext}

    ${assetsContext}

    Write the prologue (Chapter 1).
    INSTRUCTIONS:
    - Break the chapter down into a sequence of at least 10-20 OBJECTIVES in chronological order to make the story progress.
    - Plan the 5 next chapters of the story in 'futureChapters' using proper story structure, including 'Exposition', 'Rising action', 'Climax', 'Falling action' and 'Resolution'.
    - For each objective, use the 'spawn' array to place objects/entities/structures relevant to that specific objective.
    - The dialogue section is optional, best paired with the 'talk' objective type.
    - This is a 2D game that used your JSON response to generate stories. Anything you write in descriptions but don't add to the output JSON WILL NOT EXIST IN THE WORLD.

    RULES:
    - Output valid JSON only. No markdown, no comments.
    - If an objective's "target" was not previously spawned by you, it does not exist: you absolutely MUST add it to the "spawn" array. If you do not spawn the target, the player will be stuck and the game will break.
    - Target ID NEEDS TO BE IN THE ASSETS LISTS.
    - Write in a CONCISE, ACTION-FOCUSED tone. No flowery or complex vocabulary.
    - Do not try to use objective types that do not exist. Adapt the story to flow with the features available to you.
    - NEVER use biomes as target. Targets should be OBJECTS, ENTITIES, or STRUCTURES.
    - Make use of the available assets provided to create a trully wonderful, deep and unique story experience for the player.
    - Follow this JSON structure exactly: ${JSON.stringify(jsonStoryFormat)}
    `;

    // CHANGED: Pass DATA_STORY_EXAMPLES
    const jsonString = await callAiApi(prompt, DATA_STORY_EXAMPLES);
    return parseStoryResponse(jsonString);
}

/**
 * Generates follow-up chapters based on history and future plans.
 */
async function fetchNextChapter(historyArray, lastOutcome, storyTheme, futurePlans, playerDecisions, spawnedStoryAssets) {
    if (!currentWorldSettings) return null;

    const knownAssetsList = spawnedStoryAssets.length > 0 
        ? spawnedStoryAssets.map(a => {
            // Add a status tag if dead
            const status = a.isDead ? "(DEAD)" : "";
            return `- Name: "${a.name}", Type: "${a.type}", Category: "${a.category}" ${status}`;
        }).join('\n    ') 
        : "None yet.";

    const worldContext = buildDetailedContext(currentWorldSettings);
    const assetsContext = getFullAssetContext();

    const scriptHistory = historyArray.map((entry, index) => {
        return `Chapter ${index + 1}: ${entry.title}\n   - Event: ${entry.summary}\n   - Outcome: ${entry.outcome}`;
    }).join("\n");

    let planContext = "";
    if (futurePlans && futurePlans.length > 0) {
        planContext = `The story should follow this path you defined previously (the first element is the chapter you have to generate now): ${JSON.stringify(futurePlans)}`;
    }
    
    let decisionContext = "";
    if (playerDecisions && playerDecisions.length > 0) {
        decisionContext = `PLAYER DECISIONS (Adapt story based on this): ${JSON.stringify(playerDecisions)}`;
    }

    const prompt = `
    You are a story generator for a procedurally generated 2D world in a video game. You must continue the story for a world based on the given context and prompt. The new chapter must be the immediate continuation of the previous chapter.
    
    GLOBAL THEME: ${storyTheme}
    
    SCRIPT HISTORY: ${scriptHistory}

    CURRENT SITUATION: ${lastOutcome}

    ${decisionContext}

    CURRENT PLAN: ${planContext}

    ${worldContext}

    ${assetsContext}

    INSTRUCTIONS:
    - Break the chapter down into a sequence of at least 10-20 OBJECTIVES in chronological order to make the story progress. IMPORTANT: The first objective starts EXACTLY where and when the last chapter ended It is the IMMEDIATE continuation of the previous chapter.
    - Plan the 5 next chapters of the story in 'futureChapters' using proper story structure, including 'Exposition', 'Rising action', 'Climax', 'Falling action' and 'Resolution'.
    - For each objective, use the 'spawn' array to place objects/entities/structures relevant to that specific objective.
    - The dialogue section is optional, best paired with the 'talk' objective type.
    - This is a 2D game that used your JSON response to generate stories. Anything you write in descriptions but don't add to the output JSON WILL NOT EXIST IN THE WORLD.

    *** CRITICAL LOGIC FOR TARGETS ***
    - EXISTING STORY ASSETS: [ ${knownAssetsList} ]

    When you define a target for an objective, you must check:
    1. Is the target present in the 'EXISTING STORY ASSETS' list above?
        -> IF YES: Do NOT spawn it again. Just use it as target.
        -> IF NOT: You MUST add it to the 'spawn' array for that objective.
    2. If a target is marked as DEAD, you CANNOT interact with them in any way.

    RULES:
    - Output valid JSON only. No markdown, no comments.
    - If an objective's "target" was not previously spawned by you, it does not exist: you absolutely MUST add it to the "spawn" array. If you do not spawn the target, the player will be stuck and the game will break.
    - Target ID NEEDS TO BE IN THE ASSETS LISTS.
    - Write in a CONCISE, ACTION-FOCUSED tone. No flowery or complex vocabulary.
    - Do not try to use objective types that do not exist. Adapt the story to flow with the features available to you.
    - NEVER use biomes as target. Targets should be OBJECTS, ENTITIES, or STRUCTURES.
    - Make use of the available assets provided to create a trully wonderful, deep and unique story experience for the player.
    - Follow this JSON structure exactly: ${JSON.stringify(jsonStoryFormat)}
    `;

    // CHANGED: Pass DATA_STORY_EXAMPLES
    const jsonString = await callAiApi(prompt, DATA_STORY_EXAMPLES);
    return parseStoryResponse(jsonString);
}




async function fetchRefusalChapter(historyArray, refusalContext, storyTheme, futurePlans, spawnedStoryAssets) {
    if (!currentWorldSettings) return null;

    const knownAssetsList = spawnedStoryAssets.length > 0 
        ? spawnedStoryAssets.map(a => {
            let status = "";
            
            // Priority Check: Dead overrides collected (if you ate the apple, it's dead/gone)
            if (a.isDead) {
                status = "(DEAD)";
            } 
            else if (a.isCollected) {
                status = "(COLLECTED)";
            }

            return `- Name: "${a.name}", Type: "${a.type}", Category: "${a.category}" ${status}`;
        }).join('\n    ') 
        : "None yet.";


    const worldContext = buildDetailedContext(currentWorldSettings);
    const assetsContext = getFullAssetContext();

    const scriptHistory = historyArray.map((entry, index) => {
        return `Chapter ${index + 1}: ${entry.title}\n   - Event: ${entry.summary}\n   - Outcome: ${entry.outcome}`;
    }).join("\n");

    let planContext = "";
    if (futurePlans && futurePlans.length > 0) {
        planContext = JSON.stringify(futurePlans);
    }

    const prompt = `
    You are a story generator for a procedurally generated 2D world in a video game.
    
    GLOBAL THEME: "${storyTheme}"
    SCRIPT HISTORY: ${scriptHistory}

    TURNING POINT: The player made a decision that affected the plan of the story.
    CONTEXT OF CHANGE: "${refusalContext}"

    ORIGINAL PLAN: ${planContext}

    ${worldContext}

    ${assetsContext}

    INSTRUCTIONS:
    - The player has changed the script. You must adapt the story accordingly by dealing with the immediate consequences of the decision.
    - You may try to steer the story back toward the ORIGINAL PLAN if it makes sense, or diverge completely if the refusal was major.
    - Break the chapter down into a sequence of at least 10-20 OBJECTIVES in chronological order to make the story progress.
    - Plan the 5 next chapters of the story in 'futureChapters' using proper story structure, including 'Exposition', 'Rising action', 'Climax', 'Falling action' and 'Resolution'.
    - For each objective, use the 'spawn' array to place objects/entities/structures relevant to that specific objective.
    - The dialogue section is optional, best paired with the 'talk' objective type.
    - This is a 2D game that used your JSON response to generate stories. Anything you write in descriptions but don't add to the output JSON WILL NOT EXIST IN THE WORLD.

    *** CRITICAL LOGIC FOR TARGETS ***
    - EXISTING STORY ASSETS: [ ${knownAssetsList} ]

    When you define a target for an objective, you must check:
    1. Is the target present in the 'EXISTING STORY ASSETS' list above?
        -> IF YES: Do NOT spawn it again. Just use it as target.
        -> IF NOT: You MUST add it to the 'spawn' array for that objective.
    2. If a target is marked as 'DEAD' or 'COLLECTED', you CANNOT interact with them in any way.

    RULES:
    - Output valid JSON only. No markdown, no comments.
    - If an objective's "target" was not previously spawned by you, it does not exist: you absolutely MUST add it to the "spawn" array. If you do not spawn the target, the player will be stuck and the game will break.
    - Target ID NEEDS TO BE IN THE ASSETS LISTS.
    - Write in a CONCISE, ACTION-FOCUSED tone. No flowery or complex vocabulary.
    - Do not try to use objective types that do not exist. Adapt the story to flow with the features available to you.
    - NEVER use biomes as target. Targets should be OBJECTS, ENTITIES, or STRUCTURES.
    - Make use of the available assets provided to create a trully wonderful, deep and unique story experience for the player.
    - Follow this JSON structure exactly: ${JSON.stringify(jsonStoryFormat)}
    `;

    const jsonString = await callAiApi(prompt, DATA_STORY_EXAMPLES);
    return parseStoryResponse(jsonString);
}




// Helper to parse story and provide fallback
function parseStoryResponse(jsonString) {
    if (!jsonString) return null;
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        alert("AI generated too many invalid responses. Please try again.");
    }
}

const jsonStoryFormat = {
    "chapterTitle": "String: A short title to identify the chapter.",
    "chapterContext": "String: 2 to 3 sentences - A deep summary of the first chapter.",
    "futureChapters": [
        "String: Deep summary of the next planned chapter. Remember to break down chapters using proper story structure.",
    ],
    "objectives": [
        {
            "introText": "String: 2 to 4 sentences - A description to end the previous objective and introduce the new current situation. Never use the exact asset names.",
            "description": "String: Describe the objective in 1 sentence.",
            "type": "String: 'kill' (to kill ENTITIES or destroy OBJECTS), 'talk' (to interact with ENTITIES and OBJECTS), 'collect' (to interact OBJECTS ONLY and make them DISAPPEAR after the interaction), 'visit' (to go to a STRUCTURE ONLY (from list of structures), or 'survive' (countdown, best paired with spawning a lot of hostile enemies)",
            "target": "String: The 'type' of the target. IMPORTANT: Must be a valid ID from the AVAILABLE ASSETS LISTS, otherwise the element will not exist and the player will be stuck. If the target ALREADY exists, use its ID. If it does not exist, you MUST also define it in the 'spawn' array below.",
            "targetName": "String: If targeting an EXISTING element from the lists, match its 'customName' exactly. If spawning a NEW unique target, define the name here. Name should be unique - can be anything.",
            "count": "Int: Amount required, or amount of seconds for 'survive' (no longer than 45 seconds)",
            "dialogue": {
                "speakerName": "String: The name of the person speaking - Usually the targetName.",
                "text": "String: The text said by the entity.",
                "choices": [
                    {
                        "text": "String: The choice text shown to the user (e.g. 'I accept', 'No way, sorry.')",
                        "resultTag": "String: Must be either 'continue' (to continue on the same story path) or 'change' (will regenerate the next objectives)."
                    }
                ]
            },
            "spawn": [
                {
                    "category": "String: 'entity', 'object', 'item', 'structure'.",
                    "type": "String: Must be a valid ID from the AVAILABLE ASSETS LISTS, otherwise the element will not spawn.",
                    "name": "String: Required to set this element as the specific 'targetName' of this and future objectives. Name should be unique - can be anything.",
                    "itemData": {
                        "category": "String: Must be either 'simple' (does nothing special), 'weapon', or 'consumable' (item be consumed)",
                        "weaponDamage": "Int: 10 (fist) to 200 (extremely high) - Damage dealt by this weapon. ONLY FOR THE 'WEAPON' CATEGORY",
                        "weaponReach": "Int: 80 (fist) to 200 (extremely high) - Range of this weapon. ONLY FOR THE 'WEAPON' CATEGORY",
                        "weaponAttackArc": "Int: 50 (very small) to 360 (full circle) - Arc of attacks in degrees. ONLY FOR THE 'WEAPON' CATEGORY",
                        "weaponAttackLunge": "Int: 0 (none) to 15 (extremely high) - How much the player is pushed when using the weapon. ONLY FOR THE 'WEAPON' CATEGORY",
                        "weaponAttackDuration": "Int: 100 (almost instant) to 1200 (very slow) - Duration of the attack. Heavier weapons should take longer to use. ONLY FOR THE 'WEAPON' CATEGORY",
                        "weaponColorAccent": "String (optional): The hex code used in the attack animation, light color. Only use for very special items. ONLY FOR THE 'WEAPON' CATEGORY",
                        "consumeValue": "Int: 5 (low) to 30 (very high) - Health restored when consumed. ONLY FOR THE 'CONSUMABLE' CATEGORY"
                    },
                    "nameVisibility": "Boolean: If the name is visible or hidden (hide generic names like 'cow').",
                    "behavior": "String: 'hostile' (will instantly attack the player when in range), 'flee' (run away from player when in range) or 'neutral' (wander around), only required if type is 'entity'.",
                    "count": "Int: Amount of that entity to spawn. 1 in most cases.",
                    "biome": "String: (Optional) Force the spawn in a specific biome. Must match a 'name' from the provided 'BIOMES' list.",
                    "distance": "String: 'close' (<800), 'medium' (<2000), 'far' (<6000), 'very far' (<10000)."
                }
            ],
            
        }
    ]
};
//#endregion