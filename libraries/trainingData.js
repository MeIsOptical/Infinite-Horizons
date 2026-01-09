

// This is a dataset to teach the AI how to generate proper worlds.
const DATA_WORLD_EXAMPLES = [

    //#region Kingdom of Tretus
    {
        role: "user",
        parts: [{ text: `
            WORLD: "A medieval world with castles and kingdoms"
            STORY: "The king's daughter was captured. You are a loyal knight that will be sent to rescue her before it's too late."
        `}]
    },
    {
        role: "model",
        parts: [{ text: JSON.stringify({
            name: "Kingdom of Tretus",
            description: "A land of knights, magic, and political intrigue.",
            playerModel: "golden_knight",
            skyTint: "#a7c1cbff", 
            biomes: [
                {
                    name: "Tretus Kingdom",
                    skyTint: "#ffdc97ff",
                    rarity: 30,
                    groundColor: "#bf9e6dff",
                    groundNoiseIntensity: 0.07,
                    structureLegend: { "W": "#463e33ff", "F": "#c8b698ff" },
                    structureGenerationType: "grid",
                    structures: [
                        { type: "square_house", count: 50, chance: 0.8 },
                        { type: "small_house", count: 70, chance: 1 },
                        { type: "u_shaped_closed_courtyard", count: 10, chance: 0.6 },
                        { type: "merchant_stall", count: 30, chance: 0.7 }
                    ],
                    objects: [
                        { type: "wooden_barrel", count: 80 },
                        { type: "wooden_crate", count: 60 },
                        { type: "flower_rose", count: 130 },
                        { type: "grass_patch", count: 220 },
                        { type: "generic_tree", count: 50 },
                        { type: "tree_stump", count: 20 },
                        { type: "old_light_post", count: 20 },
                        { type: "tall_clay_pot", count: 10 },
                        { type: "direction_wooden_sign", count: 10 },
                        { type: "small_rock", count: 20 },
                        { type: "vegetable_basket", count: 20 },
                    ],
                    items: [
                        {
                            type: "generic_sword",
                            name: "Sword",
                            itemData: {
                                category: "weapon",
                                weaponDamage: 30,
                                weaponReach: 95,
                                weaponAttackArc: 140,
                                weaponAttackLunge: 6,
                                weaponAttackDuration: 700,
                            },
                            count: 10
                        },
                        {
                            type: "long_sword",
                            name: "Long Sword",
                            itemData: {
                                category: "weapon",
                                weaponDamage: 30,
                                weaponReach: 140,
                                weaponAttackArc: 160,
                                weaponAttackLunge: 9,
                                weaponAttackDuration: 1100,
                            },
                            count: 5
                        },
                    ],  
                    entities: [
                        { type: "regular_knight", name: null, nameVisibility: false, health: 400, count: 8, behavior: "neutral" },
                        { type: "bald_man", name: null, nameVisibility: false, health: 250, count: 8, behavior: "neutral" },
                        { type: "blond_human", name: null, nameVisibility: false, health: 250, count: 6, behavior: "neutral" },
                        { type: "cute_asian_girl", name: null, nameVisibility: false, health: 250, count: 4, behavior: "neutral" },
                        { type: "orange_shirt_human", name: null, nameVisibility: false, health: 250, count: 8, behavior: "neutral" },
                        { type: "red_hair_woman", name: null, nameVisibility: false, health: 250, count: 7, behavior: "neutral" },
                    ]
                },
                {
                    name: "Dense Forest",
                    skyTint: "#112912ff",
                    rarity: 40,
                    groundColor: "#32632bff",
                    groundNoiseIntensity: 0.1,
                    structureLegend: { "W": "#3e2723", "F": "#9d6f5eff" },
                    structureGenerationType: "scattered",
                    structures: [
                        { type: "mini_shack", count: 5, chance: 0.4 }
                    ],
                    objects: [
                        { type: "generic_tree", count: 900 },
                        { type: "grass_patch", count: 600 },
                        { type: "bush", count: 400 },
                        { type: "small_mushroom", count: 100 },
                        { type: "small_rock", count: 80 }
                    ],
                    items: [
                        {
                            type: "red_apple",
                            name: "Apple",
                            itemData: {
                                category: "consumable",
                                consumeValue: 5
                            },
                            count: 15
                        },
                        {
                            type: "green_apple",
                            name: "Apple",
                            itemData: {
                                category: "consumable",
                                consumeValue: 5
                            },
                            count: 20
                        },
                    ],
                    entities: [
                        { type: "bald_man", name: "Woodcutter", nameVisibility: true, health: 300, count: 5, behavior: "neutral" },
                        { type: "chicken", name: null, nameVisibility: false, health: 30, count: 10, behavior: "flee" },
                        { type: "cow", name: null, nameVisibility: false, health: 200, count: 5, behavior: "flee" },
                    ]
                },
                {
                    name: "Enemy Outpost",
                    skyTint: "#652914ff",
                    rarity: 15,
                    groundColor: "#5d4037",
                    groundNoiseIntensity: 0.12,
                    structureLegend: { "W": "#212121", "F": "#616161ff" },
                    structureGenerationType: "grid",
                    structures: [
                        { type: "small_house", count: 10, chance: 0.8 },
                        { type: "small_l_shaped_room", count: 15, chance: 0.8 },
                        { type: "generic_ruins", count: 10, chance: 0.7 }
                    ],
                    objects: [
                        { type: "wooden_crate", count: 20 },
                        { type: "big_wooden_crate", count: 20 },
                        { type: "direction_wooden_sign", count: 5 },
                        { type: "small_rock", count: 20 },
                        { type: "small_mushroom", count: 20 },
                        { type: "stone_pillar", count: 10 },
                    ],
                    items: [
                        {
                            type: "generic_sword",
                            name: "Enhanced Sword",
                            itemData: {
                                category: "weapon",
                                weaponDamage: 40,
                                weaponReach: 100,
                                weaponAttackArc: 145,
                                weaponAttackLunge: 7,
                                weaponAttackDuration: 750,
                            },
                            count: 1
                        }
                    ], 
                    entities: [
                        { type: "scarred_bearded_man", name: "Enemy Citizen", nameVisibility: true, health: 150, count: 40, behavior: "hostile" },
                        { type: "armored_gladiator", name: "Enemy Knight", nameVisibility: true, health: 200, count: 30, behavior: "hostile" },
                        { type: "golden_knight", name: "Enemy Heavy Knight", nameVisibility: true, health: 500, count: 5, behavior: "hostile" },
                    ]
                },
                {
                    name: "Rocky Plains",
                    skyTint: "#f0db9fff",
                    rarity: 25,
                    groundColor: "#8d6e63",
                    groundNoiseIntensity: 0.15,
                    structureLegend: { "W": "#5d4037", "F": "#a1887f" },
                    structureGenerationType: "scattered",
                    structures: [],
                    objects: [
                        { type: "large_rock", count: 200 },
                        { type: "small_rock", count: 500 },
                        { type: "regular_cactus", count: 50 }
                    ],
                    items: [],
                    entities: [
                        { type: "stone_golem", name: "Rock Golem", nameVisibility: true, health: 600, count: 5, behavior: "hostile" }
                    ]
                },
                {
                    name: "Magical Forest",
                    skyTint: "#9667a2ff",
                    rarity: 5,
                    groundColor: "#498f61ff",
                    groundNoiseIntensity: 0.06,
                    structureLegend: { "W": "#2b2632ff", "F": "#9d90a2ff" },
                    structureGenerationType: "scattered",
                    structures: [
                        { type: "generic_ruins", count: 5, chance: 0.6 },
                        { type: "ancient_pillars", count: 5, chance: 0.5 },
                    ],
                    objects: [
                        { type: "generic_tree", count: 800 },
                        { type: "flower_rose", count: 300 },
                        { type: "yellow_flower", count: 100 },
                        { type: "small_mushroom", count: 600 },
                        { type: "ritual_obelisk", count: 20 },
                        { type: "broken_ritual_obelisk", count: 10 }
                    ],
                    items: [],
                    entities: [
                        { type: "blue_spirit", name: "Forest Spirit", nameVisibility: true, health: 800, count: 10, behavior: "neutral" },
                        { type: "blue_tengu", name: "Dark Wizard", nameVisibility: true, health: 600, count: 5, behavior: "hostile" }
                    ]
                },
                {
                    name: "Sunflower Field",
                    skyTint: "#ffe186ff",
                    rarity: 30,
                    groundColor: "#75b052ff",
                    groundNoiseIntensity: 0.06,
                    structureLegend: { "W": "#443f38ff", "F": "#c7c7a4ff" },
                    structureGenerationType: "scattered",
                    structures: [],
                    objects: [
                        { type: "sunflower", count: 500 },
                        { type: "yellow_flower", count: 60 },
                        { type: "grass_patch", count: 30 },
                        { type: "bush", count: 15 },
                        { type: "small_rock", count: 10 },
                    ],
                    items: [],  
                    entities: [
                        { type: "chicken", name: null, nameVisibility: false, health: 30, count: 7, behavior: "flee" },
                    ]
                },
            ]
        })}]
    },
    //#endregion

    //#region Echoes of a Modern World
    {
        role: "user",
        parts: [{ text: `
            WORLD: "A post-apocalyptic wasteland where nature is taking back the ruins of a lost futuristic civilization."
            STORY: "Survival".
        `}]
    },
    {
        role: "model",
        parts: [{ text: JSON.stringify({
            name: "Echoes of a Modern World",
            description: "A desolate landscape scattered with remnants of high technology and overgrowth.",
            playerModel: "homeless_looking_man",
            skyTint: "#81796bff", 
            biomes: [
                {
                    name: "Rusting Junkyard",
                    skyTint: "#3d4736ff",
                    rarity: 50,
                    groundColor: "#5a4d41",
                    groundNoiseIntensity: 0.15,
                    structureLegend: { "W": "#38332e", "F": "#26221f" },
                    structureGenerationType: "scattered",
                    structures: [
                        { type: "generic_ruins", count: 25, chance: 0.6 },
                        { type: "mini_shack", count: 8, chance: 0.4 }
                    ],
                    objects: [
                        { type: "futuristic_crate", count: 40 },
                        { type: "industrial_vent_unit", count: 30 },
                        { type: "old_light_post", count: 20 },
                        { type: "red_vending_machine", count: 15 },
                        { type: "horizontal_blue_pipe", count: 10},
                        { type: "small_rock", count: 30},
                        { type: "large_rock", count: 10},

                    ],
                    entities: [
                        { type: "green_ninja_robot", name: "Scavenger Bot", nameVisibility: true, health: 300, count: 4, behavior: "hostile" },
                        { type: "smiling_slime", name: "Radioactive Sludge", nameVisibility: true, health: 60, count: 10, behavior: "hostile" }
                    ]
                },
                {
                    name: "Overgrown City",
                    skyTint: "#2b3047ff",
                    rarity: 80,
                    groundColor: "#3a4a3b",
                    groundNoiseIntensity: 0.05,
                    structureLegend: { "W": "#2f3330", "F": "#1e211f" },
                    structureGenerationType: "grid",
                    structures: [
                        { type: "square_house", count: 30, chance: 0.8 },
                        { type: "small_l_shaped_room", count: 20, chance: 0.8 }
                    ],
                    objects: [
                        { type: "broken_stone_pillar", count: 30 },
                        { type: "generic_tree", count: 200 },
                        { type: "bush", count: 100 },
                        { type: "grass_patch", count: 200 },
                        { type: "futuristic_solar_panels_on_pole", count: 50 },
                        { type: "futuristic_antena_pole", count: 20 },
                    ],
                    entities: [
                        { type: "chicken", name: null, nameVisibility: false, health: 10, count: 7, behavior: "flee" },
                        { type: "scarred_bearded_man", name: "Lone Survivor", nameVisibility: true, health: 300, count: 1, behavior: "neutral"},
                        { type: "smiling_slime", name: "Radioactive Sludge", nameVisibility: true, health: 80, count: 30, behavior: "hostile" }
                    ]
                },
                {
                    name: "Scorched Desert",
                    skyTint: "#c8a45cff",
                    rarity: 50,
                    groundColor: "#b3a476ff",
                    groundNoiseIntensity: 0.1,
                    structureLegend: { "W": "#605540ff", "F": "#b4a67cff" },
                    structureGenerationType: "scattered",
                    structures: [
                        { type: "small_square_house", count: 4, chance: 0.3 }
                    ],
                    objects: [
                        { type: "regular_cactus", count: 600 },
                        { type: "large_rock", count: 100 },
                        { type: "small_rock", count: 400 },
                        { type: "flower_rose", count: 40 },
                        { type: "wooden_barrel", count: 10 },
                    ],
                    entities: [
                        { type: "armored_gladiator", name: "Wasteland Raider", nameVisibility: true, health: 180, count: 10, behavior: "hostile" },
                        { type: "golden_knight", name: "Wasteland Raider Leader", nameVisibility: true, health: 300, count: 2, behavior: "hostile" },
                        { type: "smiling_slime", name: "Radioactive Sludge", nameVisibility: true, health: 60, count: 25, behavior: "hostile" }
                    ]
                },
                {
                    name: "Dense Radioactive Forest",
                    skyTint: "#5cb439ff",
                    rarity: 30,
                    groundColor: "#8daf57ff",
                    groundNoiseIntensity: 0.03,
                    structureLegend: { "W": "#34383dff", "F": "#7a9d96ff" },
                    structureGenerationType: "scattered",
                    structures: [],
                    objects: [
                        { type: "generic_tree", count: 1200 },
                        { type: "polished_stone_cube", count: 10 },
                        { type: "yellow_flower", count: 100 },
                        { type: "flower_rose", count: 200 },
                        { type: "grass_patch", count: 200 },
                        { type: "bush", count: 100 },
                    ],
                    entities: [
                        { type: "smiling_slime", name: "Radioactive Sludge", nameVisibility: true, health: 120, count: 40, behavior: "hostile" }
                    ]
                },
                {
                    name: "Safe Haven",
                    skyTint: "#81b6beff",
                    rarity: 1,
                    groundColor: "#5eaa5eff",
                    groundNoiseIntensity: 0.05,
                    structureLegend: { "W": "#885533", "F": "#aa7744ff" },
                    structureGenerationType: "grid",
                    structures: [
                        { type: "small_house", count: 10, chance: 1.0 },
                        { type: "mini_shack", count: 5, chance: 0.9 },
                        { type: "merchant_stall", count: 5, chance: 0.7 },
                        { type: "u_shaped_closed_courtyard", count: 5, chance: 0.8 }
                    ],
                    objects: [
                        { type: "futuristic_food_cart", count: 20 },
                        { type: "wooden_barrel", count: 40 },
                        { type: "wooden_crate", count: 30 },
                        { type: "futuristic_crate", count: 10 },
                        { type: "yellow_flower", count: 60 },
                        { type: "flower_rose", count: 80 },
                        { type: "grass_patch", count: 100 },
                        { type: "bush", count: 70 },
                        { type: "generic_tree", count: 100 },
                    ],
                    entities: [
                        { type: "elder_man", name: null, nameVisibility: false, health: 160, count: 3, behavior: "neutral" },
                        { type: "cute_asian_girl", name: null, nameVisibility: false, health: 200, count: 4, behavior: "neutral" },
                        { type: "shady_man_in_suit", name: null, nameVisibility: false, health: 250, count: 6, behavior: "neutral" },
                        { type: "bald_man", name: null, nameVisibility: false, health: 250, count: 20, behavior: "neutral" },
                        { type: "green_hat_man", name: null, nameVisibility: false, health: 220, count: 15, behavior: "neutral" },
                        { type: "blond_human", name: null, nameVisibility: false, health: 230, count: 10, behavior: "neutral" },
                        { type: "homeless_looking_man", name: null, nameVisibility: false, health: 180, count: 20, behavior: "neutral" },
                    ]
                }
            ]
        })}]
    },
    //#endregion

    //#region Sector 7
    {
        role: "user",
        parts: [{ text: `
            WORLD: "A cyberpunk city sector controlled by rogue AI robots. Neon lights flicker over industrial pipes and trash."
            STORY: "The player first needs to hide, and will eventually have to save the sector.".
        `}]
    },
    {
        role: "model",
        parts: [{ text: JSON.stringify({
            name: "Sector 7",
            description: "An industrial district run by rogue machines, lit by dying neon lights.",
            playerModel: "scarred_bearded_man",
            skyTint: "#13052aff", 
            biomes: [
                {
                    name: "Industrial Zone",
                    skyTint: "#16141bff",
                    rarity: 40,
                    groundColor: "#1a1a1aff",
                    groundNoiseIntensity: 0.05,
                    structureLegend: { "W": "#302e2eff", "F": "#9b948aff" },
                    structureGenerationType: "grid",
                    structures: [
                        { type: "long_horizontal_corridor", count: 15, chance: 0.9 },
                        { type: "small_square_house", count: 10, chance: 0.8 },
                        { type: "square_house", count: 20, chance: 1},
                        { type: "rectangle_house", count: 10, chance: 0.8},
                        { type: "u_shaped_closed_courtyard", count: 15, chance: 0.7},
                    ],
                    objects: [
                        { type: "horizontal_blue_pipe", count: 50 },
                        { type: "vertical_blue_pipe", count: 30 },
                        { type: "industrial_vent_unit", count: 60 },
                        { type: "futuristic_crate", count: 60 },
                        { type: "wooden_barrel", count: 20 },
                        { type: "red_vending_machine", count: 20 },
                        { type: "futuristic_antena_pole", count: 40 },
                        { type: "futuristic_solar_panels_on_pole", count: 60 },
                        { type: "stone_pillar", count: 5 },
                        { type: "broken_stone_pillar", count: 10 },
                        { type: "polished_stone_cube", count: 5 },
                        { type: "small_rock", count: 10 },
                    ],
                    entities: [
                        { type: "green_ninja_robot", name: "Security Bot", nameVisibility: true, health: 350, count: 10, behavior: "hostile" },
                        { type: "shiny_bright_robot", name: "Maintenance Unit", nameVisibility: true, health: 120, count: 30, behavior: "neutral" },
                        { type: "homeless_looking_man", name: "Unpaid Worker", nameVisibility: true, health: 120, count: 10, behavior: "neutral" },
                        { type: "elder_man", name: "Unpaid Worker", nameVisibility: true, health: 100, count: 8, behavior: "neutral" },
                    ]
                },
                {
                    name: "Black Market Alley",
                    skyTint: "#000000ff",
                    rarity: 3,
                    groundColor: "#271a2aff",
                    groundNoiseIntensity: 0.04,
                    structureLegend: { "W": "#100f13ff", "F": "#6f6778ff" },
                    structureGenerationType: "grid",
                    structures: [
                        { type: "merchant_stall", count: 20, chance: 0.9 },
                        { type: "mini_shack", count: 10, chance: 0.9 },
                        { type: "small_l_shaped_room", count: 10, chance: 0.8 },
                        { type: "generic_ruins", count: 5, chance: 0.6 },
                    ],
                    objects: [
                        { type: "futuristic_food_cart", count: 40 },
                        { type: "red_vending_machine", count: 50 },
                        { type: "futuristic_crate", count: 60 },
                        { type: "big_wooden_crate", count: 5 },
                        { type: "wooden_crate", count: 10 },
                        { type: "wooden_barrel", count: 10 },
                        { type: "big_clay_pot", count: 10 },
                        { type: "tall_clay_pot", count: 7 },
                        { type: "broken_stone_pillar", count: 10 },
                        { type: "futuristic_solar_panels_on_pole", count: 20 },
                        { type: "horizontal_blue_pipe", count: 20 },
                        { type: "vertical_blue_pipe", count: 15 },
                        { type: "old_light_post", count: 8 },
                    ],
                    entities: [
                        { type: "shady_man_in_suit", name: null, nameVisibility: false, health: 300, count: 3, behavior: "neutral" },
                        { type: "green_hat_man", name: null, nameVisibility: false, health: 280, count: 7, behavior: "neutral" },
                        { type: "blond_human", name: null, nameVisibility: false, health: 280, count: 4, behavior: "neutral" },
                        { type: "cute_asian_girl", name: null, nameVisibility: false, health: 280, count: 1, behavior: "neutral" },
                        { type: "elder_man", name: null, nameVisibility: false, health: 250, count: 5, behavior: "neutral" },
                        { type: "homeless_looking_man", name: null, nameVisibility: false, health: 250, count: 6, behavior: "neutral" },
                        { type: "orange_shirt_human", name: null, nameVisibility: false, health: 300, count: 4, behavior: "neutral" },
                        { type: "red_hair_woman", name: null, nameVisibility: false, health: 300, count: 3, behavior: "neutral" },
                        { type: "skull_helmet_shaman", name: null, nameVisibility: false, health: 350, count: 1, behavior: "neutral" },
                    ]
                },
                {
                    name: "Old Scrapyard",
                    skyTint: "#191f16ff",
                    rarity: 30,
                    groundColor: "#2b2b2bff",
                    groundNoiseIntensity: 0.2,
                    structureLegend: { "W": "#27222eff", "F": "#696583ff" },
                    structureGenerationType: "scattered",
                    structures: [
                        { type: "mini_shack", count: 10, chance: 0.5 },
                        { type: "generic_ruins", count: 20, chance: 0.8 },
                    ],
                    objects: [
                        { type: "big_clay_pot", count: 15 },
                        { type: "stone_pillar", count: 7 },
                        { type: "broken_stone_pillar", count: 10 },
                        { type: "polished_stone_cube", count: 5 },
                        { type: "direction_wooden_sign", count: 10 },
                        { type: "futuristic_food_cart", count: 5 },
                        { type: "small_rock", count: 100 },
                        { type: "large_rock", count: 30 },
                        { type: "industrial_vent_unit", count: 50 },                        
                    ],
                    items: [
                        {
                            type: "generic_sword",
                            name: "Scrap Blade",
                            itemData: {
                                category: "weapon",
                                weaponDamage: 25,
                                weaponReach: 90,
                                weaponAttackArc: 120,
                                weaponAttackLunge: 5,
                                weaponAttackDuration: 600,
                            },
                            count: 5
                        }
                    ],
                    entities: [
                        { type: "homeless_looking_man", name: "Scavenger", nameVisibility: true, health: 120, count: 1, behavior: "flee" },
                        { type: "green_hat_man", name: "Scavenger", nameVisibility: true, health: 150, count: 1, behavior: "flee" },
                        { type: "green_ninja_robot", name: "Security Bot", nameVisibility: true, health: 280, count: 2, behavior: "hostile" },
                        { type: "shiny_bright_robot", name: "Maintenance Unit", nameVisibility: true, health: 90, count: 8, behavior: "neutral" },
                    ]
                },
                {
                    name: "Housing Zone",
                    skyTint: "#2d2e31ff",
                    rarity: 60,
                    groundColor: "#343437ff",
                    groundNoiseIntensity: 0.1,
                    structureLegend: { "W": "#262435ff", "F": "#4f4f62ff" },
                    structureGenerationType: "grid",
                    structures: [
                        { type: "generic_ruins", count: 25, chance: 0.7 },
                        { type: "small_square_house", count: 20, chance: 1 },
                        { type: "square_house", count: 20, chance: 0.8 },
                        { type: "rectangle_house", count: 20, chance: 0.8 },
                    ],
                    objects: [
                        { type: "broken_stone_pillar", count: 20 },
                        { type: "direction_wooden_sign", count: 5 },
                        { type: "futuristic_antena_pole", count: 10 },
                        { type: "futuristic_crate", count: 10 },
                        { type: "futuristic_food_cart", count: 5 },
                        { type: "futuristic_solar_panels_on_pole", count: 30 },
                        { type: "horizontal_blue_pipe", count: 10 },
                        { type: "industrial_vent_unit", count: 15 },
                        { type: "red_vending_machine", count: 15 },
                        { type: "vertical_blue_pipe", count: 7 },
                    ],
                    entities: [
                        { type: "green_ninja_robot", name: "Security Bot", nameVisibility: true, health: 380, count: 15, behavior: "hostile" },
                        { type: "shiny_bright_robot", name: "Maintenance Unit", nameVisibility: true, health: 150, count: 40, behavior: "neutral" },
                    ]
                },
                {
                    name: "Neon Plaza",
                    skyTint: "#301133ff",
                    rarity: 15,
                    groundColor: "#221122ff",
                    groundNoiseIntensity: 0.03,
                    structureLegend: { "W": "#330033ff", "F": "#aa00aaff" },
                    structureGenerationType: "grid",
                    structures: [
                        { type: "u_shaped_closed_courtyard", count: 10, chance: 0.9 },
                        { type: "square_house", count: 10, chance: 0.8 },
                    ],
                    objects: [
                        { type: "futuristic_antena_pole", count: 50 },
                        { type: "red_vending_machine", count: 100 },
                        { type: "futuristic_solar_panels_on_pole", count: 40 },
                        { type: "polished_stone_cube", count: 20 },
                        { type: "old_light_post", count: 50 },
                    ],
                    items: [
                        {
                            type: "blue_liquid_small_flask",
                            name: "Neon Drink",
                            itemData: {
                                category: "consumable",
                                consumeValue: 15
                            },
                            count: 20
                        }
                    ],
                    entities: [
                        { type: "cute_asian_girl", name: "Citizen", nameVisibility: false, health: 150, count: 10, behavior: "neutral" },
                        { type: "red_hair_woman", name: "Citizen", nameVisibility: false, health: 150, count: 10, behavior: "neutral" },
                        { type: "shady_man_in_suit", name: "Corporate Agent", nameVisibility: true, health: 300, count: 5, behavior: "neutral" },
                        { type: "green_ninja_robot", name: "Police Bot", nameVisibility: true, health: 400, count: 5, behavior: "hostile" }
                    ]
                },
                {
                    name: "Pipeline Sector",
                    skyTint: "#1a1a00ff",
                    rarity: 45,
                    groundColor: "#111100ff",
                    groundNoiseIntensity: 0.02,
                    structureLegend: { "W": "#222200ff", "F": "#444400ff" },
                    structureGenerationType: "scattered",
                    structures: [
                        { type: "long_horizontal_corridor", count: 20, chance: 1.0 }
                    ],
                    objects: [
                        { type: "horizontal_yellow_pipe", count: 300 },
                        { type: "vertical_yellow_pipe", count: 150 },
                        { type: "industrial_vent_unit", count: 100 },
                        { type: "futuristic_crate", count: 50 }
                    ],
                    entities: [
                        { type: "shiny_bright_robot", name: "Pipeline Drone", nameVisibility: true, health: 80, count: 50, behavior: "neutral" },
                        { type: "green_ninja_robot", name: "Patrol Unit", nameVisibility: true, health: 300, count: 5, behavior: "hostile" }
                    ]
                },
                {
                    name: "Forbidden Data Core",
                    skyTint: "#000000ff",
                    rarity: 1,
                    groundColor: "#050505ff",
                    groundNoiseIntensity: 0.04,
                    structureLegend: { "W": "#000000ff", "F": "#111111ff" },
                    structureGenerationType: "grid",
                    structures: [
                        { type: "ancient_pillars", count: 20, chance: 1.0 }
                    ],
                    objects: [
                        { type: "polished_stone_cube", count: 100 },
                        { type: "futuristic_antena_pole", count: 50 },
                        { type: "futuristic_solar_panels_on_pole", count: 50 }
                    ],
                    items: [
                        {
                            type: "long_sword",
                            name: "Plasma Katana",
                            itemData: {
                                category: "weapon",
                                weaponDamage: 65,
                                weaponReach: 120,
                                weaponAttackArc: 160,
                                weaponAttackLunge: 10,
                                weaponAttackDuration: 500,
                                weaponColorAccent: "#00ffff"
                            },
                            count: 2
                        }
                    ],
                    entities: [
                        { type: "black_ninja", name: "Shadow Guard", nameVisibility: true, health: 600, count: 60, behavior: "hostile" },
                        { type: "green_ninja_robot", name: "Elite Sentry", nameVisibility: true, health: 1000, count: 30, behavior: "hostile" }
                    ]
                }
            ]
        })}]
    },
    //#endregion
];


// This is a dataset to teach the AI how to properly create stories.
const DATA_STORY_EXAMPLES = [

    //#region Kingdom of Tretus
    {
        role: "user",
        parts: [{ text: `
            WORLD: "A medieval world with castles and kingdoms"
            STORY: "The king's daughter was captured. You are a loyal knight that will be sent to rescue her before it's too late."
        `}]
    },
    {
        role: "model",
        parts: [{ text: JSON.stringify({
            chapterTitle: "Tragic News",
            chapterContext: "The player is powerful knight from the Tretus Kingdom. The king tasks him to find his missing daughter, the princess of Tretus. The player will have to reach a hermit in the mountains to help identify the princess's whereabouts.",
            futureChapters: [
                "Now that the princess's location has been found, the player needs to gather the resources and form a plan to rescue her.",
                "It's finally time to execute the plan. Infiltrate the enemy camp, retrieve the princess, and evade pursuers.",
                "With the princess back, the Kingdom of Tretus should be safe. However, it doesn't take long before the enemy retaliates and starts launching targeted attacks all over the kingdom, and then prepare a plan to save her.",
                "The enemy invades the kingdom. The player manages to escape with the princess, but the kingdom collapses. Living in hiding, the player and princess start having feelings for each other.",
                "The enemy starts closing in on the player and princess, as their love continues to grow. The player has to choose between making a deal with the enemy to save the kingdom, or stay in hiding with the princess."
            ],
            objectives: [
                { // 1
                    introText: "You are in the forest, hunting for dinner.",
                    description: "Slaughter 2 cows.",
                    type: "kill",
                    target: "cow",
                    targetName: null,
                    count: 2,
                    dialogue: null,
                    spawn: []
                },
                { // 2
                    introText: "As you continue to hunt for food, you notice a messenger appear in the distance.",
                    description: "Approach the messenger.",
                    type: "talk",
                    target: "shady_man_in_suit",
                    targetName: "Messenger",
                    count: 1,
                    dialogue: {
                        speakerName: "Messenger",
                        text: "The king has a task of the highest importance for you. You must return to the kingdom immediately to receive your assignment.",
                        choices: [
                            {
                                text: "I'll pay him a visit now.",
                                resultTag: "continue"
                            },
                            {
                                text: "I'm busy right now, you'll have to find someone else.",
                                resultTag: "change"
                            },
                        ]
                    },
                    spawn: [
                        {
                            category: "entity",
                            type: "shady_man_in_suit",
                            name: "Messenger",
                            behavior: "neutral",
                            count: 1,
                            biome: null,
                            distance: "close"
                        }
                    ]
                },
                { // 3
                    introText: "Reach King Benjamin. Do not keep him waiting.",
                    description: "Pay a visit to King Benjamin",
                    type: "talk",
                    target: "elder_man",
                    targetName: "King Benjamin",
                    count: 1,
                    dialogue: {
                        speakerName: "King Benjamin",
                        text: "I am so glad to see you here! The princess, my beloved daughter, has been taken and we have no clue who is to blame yet. Please, find her and return her to me.",
                        choices: [
                            {
                                text: "Yes my king, where should I begin?",
                                resultTag: "continue"
                            },
                        ]
                    },
                    spawn: [
                        {
                            category: "entity",
                            type: "elder_man",
                            name: "King Benjamin",
                            behavior: "neutral",
                            count: 1,
                            biome: "Tretus Kingdom",
                            distance: "far"
                        }
                    ]
                },
                { // 4
                    introText: "You are instructed to return to the messenger. He will tell you where to start.",
                    description: "Return to the messenger.",
                    type: "talk",
                    target: "shady_man_in_suit",
                    targetName: "Messenger",
                    count: 1,
                    dialogue: {
                        speakerName: "Messenger",
                        text: "A villager saw the kidnapping happen. You should probably start by interrogating them.",
                        choices: [
                            {
                                text: "Good idea, I'll talk to them right away.",
                                resultTag: "continue"
                            },
                            {
                                text: "Do we have any other leads?",
                                resultTag: "change"
                            },
                        ]
                    },
                    spawn: []
                },
                { // 5
                    introText: "Someone saw the kidnapping happen. Talk to them to find out what happened.",
                    description: "Interrogate the witness.",
                    type: "talk",
                    target: "green_hat_man",
                    targetName: "Witness",
                    count: 1,
                    dialogue: {
                        speakerName: "Witness",
                        text: "I saw them do it! The princess was trying really hard to defend herself, but she didn't stand a chance. This was obviously a prepared attack.",
                        choices: [
                            {
                                text: "Did you notice anything else?",
                                resultTag: "continue"
                            },
                        ]
                    },
                    spawn: [
                        {
                            category: "entity",
                            type: "green_hat_man",
                            name: "Witness",
                            behavior: "neutral",
                            count: 1,
                            biome: null,
                            distance: "far"
                        }
                    ]
                },
                { // 6
                    introText: "The witness claims it was a prepared hit. Try to find out more.",
                    description: "Keep the interrogation going.",
                    type: "talk",
                    target: "green_hat_man",
                    targetName: "Witness",
                    count: 1,
                    dialogue: {
                        speakerName: "Witness",
                        text: "Let me think... I did see one of them draw something on a tree stump with a knife. In any way, you should probably visit the crime scene.",
                        choices: [
                            {
                                text: "Thank you for your help, I'll check it out.",
                                resultTag: "continue"
                            },
                        ]
                    },
                    spawn: []
                },
                { // 7
                    introText: "The witnesses inform you that the crime took place in a secluded hut in the forest.",
                    description: "Get to the crime scene.",
                    type: "visit",
                    target: "mini_shack",
                    targetName: "Crime Scene",
                    count: 1,
                    dialogue: null,
                    spawn: [
                        {
                            category: "structure",
                            type: "mini_shack",
                            name: "Crime Scene",
                            behavior: null,
                            count: 1,
                            biome: "Dense Forest",
                            distance: "far"
                        }
                    ]
                },
                { // 8
                    introText: "Arriving at the crime scene, you notice the marking on a tree stump. What does it say?",
                    description: "Approach the tree stump to have a better look at the marking.",
                    type: "talk",
                    target: "tree_stump",
                    targetName: "Marked tree stump",
                    count: 1,
                    dialogue: null,
                    spawn: [
                        {
                            category: "object",
                            type: "tree_stump",
                            name: "Marked tree stump",
                            behavior: null,
                            count: 1,
                            biome: "Dense Forest",
                            distance: "close"
                        }
                    ]
                },
                { // 9
                    introText: "Looking at the stump closer, you notice a familiar icon. You now know who is responsible for the kidnapping. The king's instructions were clear, you must update him on your findings right away.",
                    description: "Inform King Benjamin of your findings.",
                    type: "talk",
                    target: "elder_man",
                    targetName: "King Benjamin",
                    count: 1,
                    dialogue: {
                        speakerName: "King Benjamin",
                        text: "These bandits have no respect. This is an act of war! But before we get to that, find out where my daughter is and bring her back to safety. The bandits have outposts scattered all around the land. You'll need to seek out the Master Tracker. He knows the layout better than anyone, and I trust him.",
                        choices: [
                            {
                                text: "I'll bring her back to you, my king.",
                                resultTag: "continue"
                            },
                            {
                                text: "This is a big task, I'm not sure if I can do this on my own.",
                                resultTag: "change"
                            },
                        ]
                    },
                    spawn: []
                },
                { // 10
                    introText: "The king recognizes the mark as the sign of the Dark Iron Clan. You must reach the Master Tracker, a hermit who knows the layout better than anyone.",
                    description: "Travel to the Rocky Plains to find the Master Tracker.",
                    type: "visit",
                    target: "homeless_looking_man",
                    targetName: "Master Tracker",
                    count: 1,
                    dialogue: null,
                    spawn: [
                        {
                            category: "entity",
                            type: "homeless_looking_man",
                            name: "Master Tracker",
                            nameVisibility: true,
                            behavior: "neutral",
                            count: 1,
                            biome: "Rocky Plains",
                            distance: "very far"
                        }
                    ]
                },
                { // 11
                    introText: "That's him? You locate the tracker, but he is currently cornered by aggressive wildlife. He cannot speak to you until the immediate threat is dealt with.",
                    description: "Slay the animals threatening the tracker.",
                    type: "kill",
                    target: "cow",
                    targetName: "Aggressive Cow",
                    count: 3,
                    dialogue: {
                        speakerName: "Master Tracker",
                        text: "Thank you for the help, that got out of control.",
                        choices: [
                            {
                                text: "The king sends me. His daughter was kidnapped by the Dark Iron Clan. We need your help to find her.",
                                resultTag: "continue"
                            },
                        ]
                    },
                    spawn: [
                        {
                            category: "entity",
                            type: "cow",
                            name: "Aggressive Cow",
                            nameVisibility: true,
                            behavior: "hostile",
                            count: 3,
                            biome: null,
                            distance: "close"
                        }
                    ]
                },
                { // 12
                    introText: "With the beasts dead, the Master Tracker is willing to talk.",
                    description: "Discuss with the Master Tracker.",
                    type: "talk",
                    target: "homeless_looking_man",
                    targetName: "Master Tracker",
                    count: 1,
                    dialogue: {
                        speakerName: "Master Tracker",
                        text: "I saw a group of bandits passing by last night. They seemed to be transporting someone. They must be the ones you are looking for.",
                        choices: [
                            {
                                text: "Show me where they went.",
                                resultTag: "continue"
                            },
                        ]
                    },
                    spawn: []
                },
                { // 13
                    introText: "The Tracker marks the exact location of the Enemy Outpost on your map. You must return to the castle immediately and inform the King so the rescue plan can be finalized.",
                    description: "Return to King Benjamin with the location.",
                    type: "talk",
                    target: "elder_man",
                    targetName: "King Benjamin",
                    count: 1,
                    dialogue: {
                        speakerName: "King Benjamin",
                        text: "I hope she's still breathing... Prepare a plan and save her. You will be rewarded.... if you succeed.",
                        choices: [
                            {
                                text: "Will do.",
                                resultTag: "continue"
                            },
                        ]
                    },
                    spawn: []
                },
            ]
        })}]
    },
    //#endregion

    //#region Echoes of a Modern World
    {
        role: "user",
        parts: [{ text: `
            WORLD: "A post-apocalyptic wasteland where nature is taking back the ruins of a lost futuristic civilization."
            STORY: "Survival"
        `}]
    },
    {
        role: "model",
        parts: [{ text: JSON.stringify({
            chapterTitle: "The Awakening",
            chapterContext: "The player wakes up in a daze within the Rusting Junkyard. The world is hostile and unforgiving. Before worrying about the old world or grand mysteries, the player must first ensure they can survive the next hour.",
            futureChapters: [
                "With basic needs met, the player starts their long journey across the desert to find Bunker 404.",
                "Inside the bunker, coordinates to a 'Safe Haven' are found, but a radioactive storm forces a detour through the dangerous forests.",
                "The player reaches the Safe Haven, but must earn their keep and help resolve internal conflicts to stay."
            ],
            objectives: [
                { // 1
                    introText: "You open your eyes to a gray sky. Your head throbs. You are defenseless. You should find a weapon to defend yourself.",
                    description: "Find a weapon.",
                    type: "collect",
                    target: "generic_sword",
                    targetName: null,
                    count: 1,
                    dialogue: null,
                    spawn: [
                        {
                            category: "item",
                            type: "generic_sword",
                            name: "Sword",
                            itemData: {
                                category: "weapon",
                                weaponDamage: 40,
                                weaponReach: 100,
                                weaponAttackArc: 145,
                                weaponAttackLunge: 7,
                                weaponAttackDuration: 750,
                            },
                            nameVisibility: false,
                            behavior: null,
                            count: 1,
                            biome: "Rusting Junkyard",
                            distance: "medium"
                        }
                    ]
                },
                { // 2
                    introText: "Good, this will have to do. A low growling sound nearby startles you. Something hostile is coming towards you. It's the perfect occasion to test your new weapon.",
                    description: "Defend yourself against the slime.",
                    type: "kill",
                    target: "smiling_slime",
                    targetName: "Radioactive Sludge",
                    count: 1,
                    dialogue: null,
                    spawn: [
                        {
                            category: "entity",
                            type: "smiling_slime",
                            name: "Radioactive Sludge",
                            behavior: "hostile",
                            count: 1,
                            biome: null,
                            distance: "close"
                        }
                    ]
                },
                { // 3
                    introText: "That was close. Your throat feels like sandpaper. You need water, or at least something drinkable.",
                    description: "Search for something to drink.",
                    type: "collect",
                    target: "red_vending_machine",
                    targetName: null,
                    count: 2,
                    dialogue: null,
                    spawn: []
                },
                { // 4
                    introText: "Stale, but enough to hydrate you. Now the hunger sets in. You see some scattered containers nearby.",
                    description: "Scavenge for food rations.",
                    type: "collect",
                    target: "futuristic_crate",
                    targetName: null,
                    count: 4,
                    dialogue: null,
                    spawn: []
                },
                { // 5
                    introText: "Now that you have enough food for the night, you need to find shelter.",
                    description: "Find a safe location.",
                    type: "visit",
                    target: "mini_shack",
                    targetName: "Abandoned Shack",
                    count: 1,
                    dialogue: null,
                    spawn: [
                        {
                            category: "structure",
                            type: "mini_shack",
                            name: "Abandoned Shack",
                            count: 1,
                            biome: "Rusting Junkyard",
                            distance: "far"
                        }
                    ]
                },
                { // 6
                    introText: "This shack offers some protection, but the area is infested. You should clear the immediate perimeter before resting.",
                    description: "Clear the area of threats.",
                    type: "kill",
                    target: "smiling_slime",
                    targetName: "Radioactive Sludge",
                    count: 8,
                    dialogue: null,
                    spawn: [
                        {
                            category: "entity",
                            type: "smiling_slime",
                            name: "Radioactive Sludge",
                            behavior: "hostile",
                            count: 8,
                            biome: "Rusting Junkyard",
                            distance: "medium"
                        }
                    ]
                },
                { // 7
                    introText: "The area is secure for now. Take a short moment to catch your breath.",
                    description: "Catch your breath.",
                    type: "survive",
                    target: null,
                    targetName: null,
                    count: 20,
                    dialogue: null,
                    spawn: []
                },
                { // 8
                    introText: "Looking at the horizon, you notice some larger ruins in the distance.",
                    description: "Scout the nearby Ruins.",
                    type: "visit",
                    target: "generic_ruins",
                    targetName: "Ancient Ruins",
                    count: 1,
                    dialogue: null,
                    spawn: [
                        {
                            category: "structure",
                            type: "generic_ruins",
                            name: "Ancient Ruins",
                            count: 1,
                            biome: "Rusting Junkyard",
                            distance: "far"
                        }
                    ]
                },
                { // 9
                    introText: "As you explore the ruins, a rhythmic static noise catches your attention. It's coming from a still-active piece of old tech.",
                    description: "Investigate the signal source.",
                    type: "talk",
                    target: "futuristic_antena_pole",
                    targetName: "Active Relay",
                    count: 1,
                    dialogue: null,
                    spawn: [
                        {
                            category: "object",
                            type: "futuristic_antena_pole",
                            name: "Active Relay",
                            count: 1,
                            biome: null,
                            distance: "close"
                        }
                    ]
                },
                { // 10
                    introText: "The console lights up, but the text is garbled. It requires a specific decryption module often found on Scavenger Bots.",
                    description: "Retrieve a decryption module from a Scavenger Bot.",
                    type: "kill",
                    target: "green_ninja_robot",
                    targetName: "Scavenger Bot",
                    count: 1,
                    dialogue: null,
                    spawn: []
                },
                { // 11
                    introText: "After dismantling the machine, you grab the decryption module. You can now return to the antena to decipher the text.",
                    description: "Plug the decryption module in the antena.",
                    type: "talk",
                    target: "futuristic_antena_pole",
                    targetName: "Active Relay",
                    count: 1,
                    dialogue: null,
                    spawn: []
                },
                { // 12
                    introText: "You jam the module into the relay. A voice cuts through the static: '...Sanctuary... Desert Bunker 404...'. Is it a trap? Or hope?",
                    description: "Consider your options: Try to reach the bunker, or stay?",
                    type: "survive",
                    target: null,
                    targetName: null,
                    count: 10,
                    dialogue: null,
                    spawn: []
                },
                { // 13
                    introText: "After taking some time to think, its time to make a decision.",
                    description: "Return to the antena to make a decision.",
                    type: "talk",
                    target: "futuristic_antena_pole",
                    targetName: "Active Relay",
                    count: 1,
                    dialogue: {
                        speakerName: "Make a decision",
                        text: "Do you want to try reaching the bunker? Or try to survive in this junkyard?",
                        choices: [
                            {
                                text: "Try for the bunker.",
                                resultTag: "continue"
                            },
                            {
                                text: "Stay",
                                resultTag: "change"
                            },
                        ]
                    },
                    spawn: []
                },
                { // 14
                introText: "You've made your choice. The bunker is far, and the desert is unforgiving: You must stockpile supplies before leaving this area.",
                description: "Gather travel supplies.",
                type: "collect",
                target: "futuristic_crate",
                targetName: null,
                count: 7,
                dialogue: null,
                spawn: []
            }
            ]
        })}]
    },
    //#endregion

    //#region Sector 7
    {
        role: "user",
        parts: [{ text: `
            WORLD: "A cyberpunk city sector controlled by rogue AI robots. Neon lights flicker over industrial pipes and trash."
            STORY: "The player first needs to hide, and will eventually have to save the sector."
        `}]
    },
    {
        role: "model",
        parts: [{ text: JSON.stringify({
            chapterTitle: "System Failure",
            chapterContext: "The rogue AI 'C-Core' has initiated a total purge. Waking up defenseless in the Old Scrapyard, the player must survive the initial sweep and find the resistance contact, Jax. The goal is to secure access codes from the Black Market and upload them at the Housing Zone to breach the lockdown sealing the Pipeline Sector.",
            futureChapters: [
                "With the blast doors open, the player and Jax enter the toxic Pipeline Sector. They must navigate hazardous fumes and automated maintenance systems to reach the city's main Industrial Zone.",
                "In the Industrial Zone, the resistance establishes a foothold, but the entrance to the Core is locked by a biometric scanner. The player must infiltrate the affluent Neon Plaza to steal a high-level corporate ID.",
                "Identity secured, the player returns to the Industrial Zone only to find the resistance under heavy fire. They must push back the robot assault and force their way into the Forbidden Data Core.",
                "Now inside the Forbidden Data Core, the player faces C-Core's elite Shadow Guards and firewall defenses to reach the central mainframe.",
                "The final confrontation. The player uploads the kill-virus, but C-Core attempts to hijack their neural link. A final choice determines the fate of Sector 7: Destruction or Reprogramming."
            ],
            objectives: [
                { // 1
                    introText: "The sirens are blaring. The purge has started. You are hiding in a dumpster in the Scrapyard. You need to get out before they find you.",
                    description: "Wait for the patrol to pass.",
                    type: "survive",
                    target: null,
                    targetName: null,
                    count: 15,
                    dialogue: null,
                    spawn: [
                        {
                            category: "entity",
                            type: "shiny_bright_robot",
                            name: "Patrol Drone",
                            behavior: "hostile",
                            count: 2,
                            biome: null,
                            distance: "medium"
                        }
                    ]
                },
                { // 2
                    introText: "The coast is clear for now, but you are unarmed. You recall seeing a discarded weapon in a pile of junk nearby.",
                    description: "Search the Scrapyard for a weapon.",
                    type: "collect",
                    target: "generic_sword",
                    targetName: "Rusted Blade",
                    count: 1,
                    dialogue: null,
                    spawn: [
                        {
                            category: "item",
                            type: "generic_sword",
                            name: "Rusted Blade",
                            itemData: {
                                category: "weapon",
                                weaponDamage: 20,
                                weaponReach: 85,
                                weaponAttackArc: 100,
                                weaponAttackLunge: 5,
                                weaponAttackDuration: 800
                            },
                            nameVisibility: true,
                            count: 1,
                            biome: "Old Scrapyard",
                            distance: "medium"
                        }
                    ]
                },
                { // 3
                    introText: "You have a weapon. Suddenly, a scout drone spots you! Silence it before it alerts the others.",
                    description: "Destroy the Scout Drone.",
                    type: "kill",
                    target: "shiny_bright_robot",
                    targetName: "Scout Drone",
                    count: 1,
                    dialogue: null,
                    spawn: [
                        {
                            category: "entity",
                            type: "shiny_bright_robot",
                            name: "Scout Drone",
                            behavior: "hostile",
                            count: 1,
                            biome: null,
                            distance: "close"
                        }
                    ]
                },
                { // 4
                    introText: "That was close. You need to reach the Black Market Alley. It's the only place the bots don't patrol heavily. Look for the neon signs.",
                    description: "Travel to the Black Market Alley.",
                    type: "visit",
                    target: "red_vending_machine",
                    targetName: "Neon Vending Machine",
                    count: 1,
                    dialogue: null,
                    spawn: [
                        {
                            category: "object",
                            type: "red_vending_machine",
                            name: "Neon Vending Machine",
                            count: 1,
                            biome: "Black Market Alley",
                            distance: "far"
                        }
                    ]
                },
                { // 5
                    introText: "You made it to the alley. You need to find Jax, a contact who knows about the resistance.",
                    description: "Find and talk to Jax.",
                    type: "talk",
                    target: "shady_man_in_suit",
                    targetName: "Jax",
                    count: 1,
                    dialogue: {
                        speakerName: "Jax",
                        text: "You look like you've seen a ghost. The bots are tearing the place apart. If you want to help, go see the Merchant. He's holding a drive for us.",
                        choices: [
                            {
                                text: "I'm on it.",
                                resultTag: "continue"
                            }
                        ]
                    },
                    spawn: [
                        {
                            category: "entity",
                            type: "shady_man_in_suit",
                            name: "Jax",
                            behavior: "neutral",
                            count: 1,
                            biome: "Black Market Alley",
                            distance: "medium"
                        }
                    ]
                },
                { // 6
                    introText: "Jax points you toward a stall at the end of the alley. The merchant is expecting you.",
                    description: "Go to the Merchant's Stall.",
                    type: "visit",
                    target: "merchant_stall",
                    targetName: "Tech Shop",
                    count: 1,
                    dialogue: null,
                    spawn: [
                        {
                            category: "structure",
                            type: "merchant_stall",
                            name: "Tech Shop",
                            count: 1,
                            biome: "Black Market Alley",
                            distance: "far"
                        }
                    ]
                },
                { // 7
                    introText: "The merchant looks nervous. Speak to him.",
                    description: "Talk to the Merchant.",
                    type: "talk",
                    target: "green_hat_man",
                    targetName: "Merchant",
                    count: 1,
                    dialogue: {
                        speakerName: "Merchant",
                        text: "Jax sent you? Good. I have the drive, but I'm not giving it up for free. I need you to clear out some of those 'Security Bots' that have been harassing my customers.",
                        choices: [
                            {
                                text: "Fine. I'll deal with them.",
                                resultTag: "continue"
                            },
                            {
                                text: "Can't you just give it to me?",
                                resultTag: "change"
                            }
                        ]
                    },
                    spawn: [
                        {
                            category: "entity",
                            type: "green_hat_man",
                            name: "Merchant",
                            behavior: "neutral",
                            count: 1,
                            biome: "Black Market Alley",
                            distance: "close"
                        }
                    ]
                },
                { // 8
                    introText: "The Merchant won't budge. You have to destroy the Security Bots patrolling the alley entrance.",
                    description: "Destroy 3 Security Bots.",
                    type: "kill",
                    target: "green_ninja_robot",
                    targetName: "Security Bot",
                    count: 3,
                    dialogue: null,
                    spawn: [
                        {
                            category: "entity",
                            type: "green_ninja_robot",
                            name: "Security Bot",
                            behavior: "hostile",
                            count: 5,
                            biome: "Black Market Alley",
                            distance: "medium"
                        }
                    ]
                },
                { // 9
                    introText: "The bots are scrap metal now. Return to the Merchant for the drive.",
                    description: "Return to the Merchant.",
                    type: "talk",
                    target: "green_hat_man",
                    targetName: "Merchant",
                    count: 1,
                    dialogue: {
                        speakerName: "Merchant",
                        text: "Nice work. Here's the drive. It contains the coordinate data we need. Don't lose it.",
                        choices: [
                            {
                                text: "Thanks.",
                                resultTag: "continue"
                            }
                        ]
                    },
                    spawn: []
                },
                { // 10
                    introText: "You have the Data Drive. Now you need to bring it back to Jax.",
                    description: "Deliver the Drive to Jax.",
                    type: "talk",
                    target: "shady_man_in_suit",
                    targetName: "Jax",
                    count: 1,
                    dialogue: {
                        speakerName: "Jax",
                        text: "Good work. This confirms it. The Pipeline Sector is locked down. We need a Master Encryption Key to access it. The old Data Center in the Housing Zone should have one.",
                        choices: [
                            {
                                text: "I'll handle it.",
                                resultTag: "continue"
                            }
                        ]
                    },
                    spawn: []
                },
                { // 11
                    introText: "Jax wants you to secure the Data Center in the Housing Zone so we can get the key. Head there now.",
                    description: "Travel to the Housing Zone.",
                    type: "visit",
                    target: "square_house",
                    targetName: "Old Apartment",
                    count: 1,
                    dialogue: null,
                    spawn: [
                        {
                            category: "structure",
                            type: "square_house",
                            name: "Old Apartment",
                            count: 1,
                            biome: "Housing Zone",
                            distance: "far"
                        }
                    ]
                },
                { // 12
                    introText: "You've reached the zone. The Data Center looks like a fortified bunker, disguised as a residential block.",
                    description: "Find the Data Center Entrance.",
                    type: "visit",
                    target: "rectangle_house",
                    targetName: "Data Center",
                    count: 1,
                    dialogue: null,
                    spawn: [
                        {
                            category: "structure",
                            type: "rectangle_house",
                            name: "Data Center",
                            count: 1,
                            biome: "Housing Zone",
                            distance: "medium"
                        }
                    ]
                },
                { // 13
                    introText: "The entrance is heavily guarded by Elite Sentry bots. You must clear them out to secure the perimeter.",
                    description: "Destroy the Elite Sentries.",
                    type: "kill",
                    target: "green_ninja_robot",
                    targetName: "Elite Sentry",
                    count: 5,
                    dialogue: null,
                    spawn: [
                        {
                            category: "entity",
                            type: "green_ninja_robot",
                            name: "Elite Sentry",
                            behavior: "hostile",
                            count: 5,
                            biome: null,
                            distance: "close"
                        }
                    ]
                },
                { // 14
                    introText: "The guards are down. You need to hack the external security terminal to prepare for Jax's arrival.",
                    description: "Hack the Security Terminal.",
                    type: "talk",
                    target: "futuristic_antena_pole",
                    targetName: "Security Terminal",
                    count: 1,
                    dialogue: {
                        speakerName: "System",
                        text: "[SECURITY OVERRIDE INITIATED... PERIMETER SECURE.]",
                        choices: [
                            {
                                text: "Signal Jax.",
                                resultTag: "continue"
                            }
                        ]
                    },
                    spawn: [
                        {
                            category: "object",
                            type: "futuristic_antena_pole",
                            name: "Security Terminal",
                            count: 1,
                            biome: null,
                            distance: "close"
                        }
                    ]
                },
                { // 15
                    introText: "Jax arrives with a team of technicians. The path to the key is open.",
                    description: "Talk to Jax.",
                    type: "talk",
                    target: "shady_man_in_suit",
                    targetName: "Jax",
                    count: 1,
                    dialogue: {
                        speakerName: "Jax",
                        text: "Great job securing the entrance. Now, we go inside and get that key.",
                        choices: [
                            {
                                text: "I'm ready.",
                                resultTag: "continue"
                            }
                        ]
                    },
                    spawn: [
                        {
                            category: "entity",
                            type: "shady_man_in_suit",
                            name: "Jax",
                            behavior: "neutral",
                            count: 1,
                            biome: null,
                            distance: "close"
                        }
                    ]
                }
            ]
        })}]
    },
    //#endregion
    
];