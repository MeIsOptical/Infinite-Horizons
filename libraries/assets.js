
const DEFAULT_PATH = 'assets/objects/';
const ITEMS_PATH = 'assets/items/';
const ENTITIES_PATH = 'assets/entities/';
const TILE_SIZE = 100;

const ASSET_LIBRARY = {
    //#region INTERNALS
    'unknown': {
        isInternal: true,
        src: DEFAULT_PATH + 'unknown.png',
        width: TILE_SIZE / 2,
        height: TILE_SIZE / 2,
        minScale: 1,
        maxScale: 1,
        isFlat: false,
        hasCollision: false
    },
    'wall': {
        isInternal: true,
        width: TILE_SIZE,
        height: TILE_SIZE,
        hitboxWidth: TILE_SIZE + 7,
        hitboxHeight: TILE_SIZE - 5,
        minScale: 1,
        maxScale: 1,
        isFlat: false,
        hasCollision: true
    },
    'floor': {
        isInternal: true,
        width: TILE_SIZE,
        height: TILE_SIZE,
        hitboxWidth: TILE_SIZE,
        hitboxHeight: TILE_SIZE,
        minScale: 1,
        maxScale: 1,
        isFlat: true,
        hasCollision: false
    },
    //#endregion

    //#region ITEMS
    'generic_sword': {
        isItem: true,
        src: ITEMS_PATH + 'generic_sword.png',
        width: 35,
        height: 80,
        minScale: 0.9,
        maxScale: 1,
        isFlat: true,
        hasCollision: false,
    },
    'long_sword': {
        isItem: true,
        src: ITEMS_PATH + 'long_sword.png',
        width: 35,
        height: 140,
        minScale: 0.9,
        maxScale: 1,
        isFlat: true,
        hasCollision: false,
    },
    'red_apple': {
        isItem: true,
        src: ITEMS_PATH + 'red_apple.png',
        width: 45,
        height: 55,
        minScale: 0.8,
        maxScale: 1,
        isFlat: true,
        hasCollision: false,
    },
    'green_apple': {
        isItem: true,
        src: ITEMS_PATH + 'green_apple.png',
        width: 45,
        height: 55,
        minScale: 0.8,
        maxScale: 1,
        isFlat: true,
        hasCollision: false,
    },
    'red_liquid_small_flask': {
        isItem: true,
        src: ITEMS_PATH + 'red_liquid_small_flask.png',
        width: 55,
        height: 55,
        minScale: 0.8,
        maxScale: 1,
        isFlat: true,
        hasCollision: false,
    },
    'red_liquid_flask': {
        isItem: true,
        src: ITEMS_PATH + 'red_liquid_flask.png',
        width: 70,
        height: 70,
        minScale: 0.8,
        maxScale: 1,
        isFlat: true,
        hasCollision: false,
    },
    'blue_liquid_small_flask': {
        isItem: true,
        src: ITEMS_PATH + 'blue_liquid_small_flask.png',
        width: 55,
        height: 55,
        minScale: 0.8,
        maxScale: 1,
        isFlat: true,
        hasCollision: false,
    },
    'blue_liquid_big_flask': {
        isItem: true,
        src: ITEMS_PATH + 'blue_liquid_big_flask.png',
        width: 80,
        height: 80,
        minScale: 0.8,
        maxScale: 1,
        isFlat: true,
        hasCollision: false,
    },
    'blue_gem_necklace': {
        isItem: true,
        src: ITEMS_PATH + 'blue_gem_necklace.png',
        width: 80,
        height: 80,
        minScale: 0.8,
        maxScale: 1,
        isFlat: true,
        hasCollision: false,
    },
    'star_necklace': {
        isItem: true,
        src: ITEMS_PATH + 'star_necklace.png',
        width: 80,
        height: 80,
        minScale: 0.8,
        maxScale: 1,
        isFlat: true,
        hasCollision: false,
    },
    'gold_key': {
        isItem: true,
        src: ITEMS_PATH + 'gold_key.png',
        width: 80,
        height: 70,
        minScale: 0.8,
        maxScale: 1,
        isFlat: true,
        hasCollision: false,
    },
    'silver_key': {
        isItem: true,
        src: ITEMS_PATH + 'silver_key.png',
        width: 80,
        height: 70,
        minScale: 0.8,
        maxScale: 1,
        isFlat: true,
        hasCollision: false,
    },
    //#endregion

    //#region ENTITIES
    'smiling_slime': {
        isEntity: true,
        src: ENTITIES_PATH + 'smiling_slime.png',
        width: 85,
        height: 70,
        minScale: 0.9,
        maxScale: 1.1,
        isFlat: false,
        hasCollision: true
    },
    'cow': {
        isEntity: true,
        src: ENTITIES_PATH + 'cow.png',
        width: 165,
        height: 105,
        minScale: 0.9,
        maxScale: 1.1,
        isFlat: false,
        hasCollision: true
    },
    'chicken': {
        isEntity: true,
        src: ENTITIES_PATH + 'chicken.png',
        width: 65,
        height: 60,
        minScale: 0.9,
        maxScale: 1.1,
        isFlat: false,
        hasCollision: true
    },
    'bald_man': {
        isEntity: true,
        src: ENTITIES_PATH + 'bald_man.png',
        width: 70,
        height: 70,
        minScale: 0.9,
        maxScale: 1.1,
        isFlat: false,
        hasCollision: true
    },
    'homeless_looking_man': {
        isEntity: true,
        src: ENTITIES_PATH + 'homeless_looking_man.png',
        width: 80,
        height: 75,
        minScale: 0.9,
        maxScale: 1.1,
        isFlat: false,
        hasCollision: true
    },
    'green_hat_man': {
        isEntity: true,
        src: ENTITIES_PATH + 'green_hat_man.png',
        width: 70,
        height: 80,
        minScale: 0.9,
        maxScale: 1.1,
        isFlat: false,
        hasCollision: true
    },
    'shady_man_in_suit': {
        isEntity: true,
        src: ENTITIES_PATH + 'shady_man_in_suit.png',
        width: 80,
        height: 80,
        minScale: 0.9,
        maxScale: 1.1,
        isFlat: false,
        hasCollision: true
    },
    'elder_man': {
        isEntity: true,
        src: ENTITIES_PATH + 'elder_man.png',
        width: 70,
        height: 70,
        minScale: 0.9,
        maxScale: 1.1,
        isFlat: false,
        hasCollision: true
    },
    'old_sensei_man': {
        isEntity: true,
        src: ENTITIES_PATH + 'old_sensei_man.png',
        width: 80,
        height: 85,
        minScale: 0.9,
        maxScale: 1.1,
        isFlat: false,
        hasCollision: true
    },
    'cute_asian_girl': {
        isEntity: true,
        src: ENTITIES_PATH + 'cute_asian_girl.png',
        width: 80,
        height: 80,
        minScale: 0.9,
        maxScale: 1.1,
        isFlat: false,
        hasCollision: true
    },
    'armored_gladiator': {
        isEntity: true,
        src: ENTITIES_PATH + 'armored_gladiator.png',
        width: 80,
        height: 80,
        minScale: 0.9,
        maxScale: 1.1,
        isFlat: false,
        hasCollision: true
    },
    'red_samurai': {
        isEntity: true,
        src: ENTITIES_PATH + 'red_samurai.png',
        width: 80,
        height: 75,
        minScale: 0.9,
        maxScale: 1.1,
        isFlat: false,
        hasCollision: true
    },
    'blue_samurai': {
        isEntity: true,
        src: ENTITIES_PATH + 'blue_samurai.png',
        width: 80,
        height: 75,
        minScale: 0.9,
        maxScale: 1.1,
        isFlat: false,
        hasCollision: true
    },
    'black_ninja': {
        isEntity: true,
        src: ENTITIES_PATH + 'black_ninja.png',
        width: 70,
        height: 70,
        minScale: 0.9,
        maxScale: 1.1,
        isFlat: false,
        hasCollision: true
    },
    'green_ninja': {
        isEntity: true,
        src: ENTITIES_PATH + 'green_ninja.png',
        width: 70,
        height: 70,
        minScale: 0.9,
        maxScale: 1.1,
        isFlat: false,
        hasCollision: true
    },
    'blue_ninja': {
        isEntity: true,
        src: ENTITIES_PATH + 'blue_ninja.png',
        width: 70,
        height: 70,
        minScale: 0.9,
        maxScale: 1.1,
        isFlat: false,
        hasCollision: true
    },
    'red_ninja': {
        isEntity: true,
        src: ENTITIES_PATH + 'red_ninja.png',
        width: 70,
        height: 70,
        minScale: 0.9,
        maxScale: 1.1,
        isFlat: false,
        hasCollision: true
    },
    'green_ninja_robot': {
        isEntity: true,
        src: ENTITIES_PATH + 'green_ninja_robot.png',
        width: 75,
        height: 75,
        minScale: 0.9,
        maxScale: 1.1,
        isFlat: false,
        hasCollision: true
    },
    'shiny_bright_robot': {
        isEntity: true,
        src: ENTITIES_PATH + 'shiny_bright_robot.png',
        width: 80,
        height: 75,
        minScale: 0.9,
        maxScale: 1.1,
        isFlat: false,
        hasCollision: true
    },
    'skull_helmet_shaman': {
        isEntity: true,
        src: ENTITIES_PATH + 'skull_helmet_shaman.png',
        width: 80,
        height: 90,
        minScale: 0.9,
        maxScale: 1.1,
        isFlat: false,
        hasCollision: true
    },
    'skeleton': {
        isEntity: true,
        src: ENTITIES_PATH + 'skeleton.png',
        width: 75,
        height: 70,
        minScale: 0.9,
        maxScale: 1.1,
        isFlat: false,
        hasCollision: true
    },
    'skeleton_monster': {
        isEntity: true,
        src: ENTITIES_PATH + 'skeleton_monster.png',
        width: 75,
        height: 70,
        minScale: 0.9,
        maxScale: 1.1,
        isFlat: false,
        hasCollision: true
    },
    'red_hair_woman': {
        isEntity: true,
        src: ENTITIES_PATH + 'red_hair_woman.png',
        width: 80,
        height: 80,
        minScale: 0.9,
        maxScale: 1.1,
        isFlat: false,
        hasCollision: true
    },
    'orange_shirt_human': {
        isEntity: true,
        src: ENTITIES_PATH + 'orange_shirt_human.png',
        width: 80,
        height: 80,
        minScale: 0.9,
        maxScale: 1.1,
        isFlat: false,
        hasCollision: true
    },
    'blue_spirit': {
        isEntity: true,
        src: ENTITIES_PATH + 'blue_spirit.png',
        width: 70,
        height: 80,
        minScale: 0.9,
        maxScale: 1.1,
        isFlat: false,
        hasCollision: true
    },
    'tengu': {
        isEntity: true,
        src: ENTITIES_PATH + 'tengu.png',
        width: 80,
        height: 80,
        minScale: 0.9,
        maxScale: 1.1,
        isFlat: false,
        hasCollision: true
    },
    'blue_tengu': {
        isEntity: true,
        src: ENTITIES_PATH + 'blue_tengu.png',
        width: 80,
        height: 80,
        minScale: 0.9,
        maxScale: 1.1,
        isFlat: false,
        hasCollision: true
    },
    'stone_golem': {
        isEntity: true,
        src: ENTITIES_PATH + 'stone_golem.png',
        width: 80,
        height: 80,
        minScale: 0.9,
        maxScale: 1.1,
        isFlat: false,
        hasCollision: true
    },
    'blond_human': {
        isEntity: true,
        src: ENTITIES_PATH + 'blond_human.png',
        width: 70,
        height: 75,
        minScale: 0.9,
        maxScale: 1.1,
        isFlat: false,
        hasCollision: true
    },
    'regular_knight': {
        isEntity: true,
        src: ENTITIES_PATH + 'regular_knight.png',
        width: 70,
        height: 75,
        minScale: 0.9,
        maxScale: 1.1,
        isFlat: false,
        hasCollision: true
    },
    'golden_knight': {
        isEntity: true,
        src: ENTITIES_PATH + 'golden_knight.png',
        width: 80,
        height: 75,
        minScale: 0.9,
        maxScale: 1.1,
        isFlat: false,
        hasCollision: true
    },
    'scarred_bearded_man': {
        isEntity: true,
        src: ENTITIES_PATH + 'scarred_bearded_man.png',
        width: 75,
        height: 80,
        minScale: 0.9,
        maxScale: 1.1,
        isFlat: false,
        hasCollision: true
    },
    'small_green_elf': {
        isEntity: true,
        src: ENTITIES_PATH + 'small_green_elf.png',
        width: 70,
        height: 75,
        minScale: 0.9,
        maxScale: 1.1,
        isFlat: false,
        hasCollision: true
    },
    'cute_humanoid_frog': {
        isEntity: true,
        src: ENTITIES_PATH + 'cute_humanoid_frog.png',
        width: 80,
        height: 65,
        minScale: 0.9,
        maxScale: 1.1,
        isFlat: false,
        hasCollision: true
    },
    'dog_mask_human': {
        isEntity: true,
        src: ENTITIES_PATH + 'dog_mask_human.png',
        width: 75,
        height: 75,
        minScale: 0.9,
        maxScale: 1.1,
        isFlat: false,
        hasCollision: true
    },
    'white_hair_mustached_man': {
        isEntity: true,
        src: ENTITIES_PATH + 'white_hair_mustached_man.png',
        width: 75,
        height: 80,
        minScale: 0.9,
        maxScale: 1.1,
        isFlat: false,
        hasCollision: true
    },
    'mustached_asian_elder': {
        isEntity: true,
        src: ENTITIES_PATH + 'mustached_asian_elder.png',
        width: 75,
        height: 80,
        minScale: 0.9,
        maxScale: 1.1,
        isFlat: false,
        hasCollision: true
    },
    'monk': {
        isEntity: true,
        src: ENTITIES_PATH + 'monk.png',
        width: 80,
        height: 75,
        minScale: 0.9,
        maxScale: 1.1,
        isFlat: false,
        hasCollision: true
    },
    'white_hat_man_with_sunglasses': {
        isEntity: true,
        src: ENTITIES_PATH + 'white_hat_man_with_sunglasses.png',
        width: 80,
        height: 75,
        minScale: 0.9,
        maxScale: 1.1,
        isFlat: false,
        hasCollision: true
    },
    'shadow_wizard': {
        isEntity: true,
        src: ENTITIES_PATH + 'shadow_wizard.png',
        width: 70,
        height: 80,
        minScale: 0.9,
        maxScale: 1.1,
        isFlat: false,
        hasCollision: true
    },
    'boy': {
        isEntity: true,
        src: ENTITIES_PATH + 'boy.png',
        width: 65,
        height: 65,
        minScale: 0.9,
        maxScale: 1.1,
        isFlat: false,
        hasCollision: true
    },
    //#endregion

    //#region OBJECTS
    'small_rock': {
        src: DEFAULT_PATH + 'small_rock.png',
        width: 80,
        height: 40,
        minScale: 0.8,
        maxScale: 1.3,
        isFlat: false,
        hasCollision: true
    },
    'large_rock': {
        src: DEFAULT_PATH + 'large_rock.png',
        width: 230,
        height: 225,
        minScale: 0.8,
        maxScale: 1.5,
        isFlat: false,
        hasCollision: true
    },
    'regular_cactus': {
        src: DEFAULT_PATH + 'regular_cactus.png',
        width: 80,
        height: 125,
        minScale: 1,
        maxScale: 1.4,
        isFlat: false,
        hasCollision: true
    },
    'small_mushroom': {
        src: DEFAULT_PATH + 'small_mushroom.png',
        width: 45,
        height: 60,
        minScale: 0.7,
        maxScale: 1.2,
        isFlat: false,
        hasCollision: false
    },
    'yellow_flower': {
        src: DEFAULT_PATH + 'yellow_flower.png',
        width: 70,
        height: 75,
        minScale: 0.6,
        maxScale: 1.1,
        isFlat: false,
        hasCollision: false
    },
    'flower_rose': {
        src: DEFAULT_PATH + 'flower_rose.png',
        width: 35,
        height: 45,
        isFlat: false,
        hasCollision: false
    },
    'tree_stump': {
        src: DEFAULT_PATH + 'tree_stump.png',
        width: 50,
        height: 50,
        isFlat: false,
        hasCollision: true
    },
    'generic_tree': {
        src: DEFAULT_PATH + 'generic_tree.png',
        width: 70,
        height: 140,
        minScale: 1.2,
        maxScale: 2,
        isFlat: false,
        hasCollision: true
    },
    'bush': {
        src: DEFAULT_PATH + 'bush.png',
        width: 60,
        height: 55,
        minScale: 0.9,
        maxScale: 1.7,
        isFlat: false,
        hasCollision: false
    },
    'grass_patch': {
        src: DEFAULT_PATH + 'grass_patch.png',
        width: 65,
        height: 85,
        minScale: 0.8,
        maxScale: 1.2,
        isFlat: false,
        hasCollision: false
    },
    'old_light_post': {
        src: DEFAULT_PATH + 'old_light_post.png',
        width: 45,
        height: 195,
        minScale: 1,
        maxScale: 1,
        isFlat: false,
        hasCollision: true
    },
    'direction_wooden_sign': {
        src: DEFAULT_PATH + 'direction_wooden_sign.png',
        width: 105,
        height: 125,
        isFlat: false,
        hasCollision: true
    },
    'big_wooden_crate': {
        src: DEFAULT_PATH + 'big_wooden_crate.png',
        width: 160,
        height: 230,
        isFlat: false,
        hasCollision: true
    },
    'wooden_crate': {
        src: DEFAULT_PATH + 'wooden_crate.png',
        width: 110,
        height: 165,
        isFlat: false,
        hasCollision: true
    },
    'wooden_barrel': {
        src: DEFAULT_PATH + 'wooden_barrel.png',
        width: 125,
        height: 160,
        minScale: 0.6,
        maxScale: 1.1,
        isFlat: false,
        hasCollision: true
    },
    'tall_clay_pot': {
        src: DEFAULT_PATH + 'tall_clay_pot.png',
        width: 100,
        height: 160,
        isFlat: false,
        hasCollision: true
    },
    'big_clay_pot': {
        src: DEFAULT_PATH + 'big_clay_pot.png',
        width: 115,
        height: 125,
        isFlat: false,
        hasCollision: true
    },
    'ritual_obelisk': {
        src: DEFAULT_PATH + 'ritual_obelisk.png',
        width: 130,
        height: 260,
        minScale: 0.6,
        maxScale: 1.1,
        isFlat: false,
        hasCollision: true
    },
    'broken_ritual_obelisk': {
        src: DEFAULT_PATH + 'broken_ritual_obelisk.png',
        width: 130,
        height: 190,
        minScale: 0.6,
        maxScale: 1.1,
        isFlat: false,
        hasCollision: true
    },
    'small_tombstone': {
        src: DEFAULT_PATH + 'small_tombstone.png',
        width: 130,
        height: 125,
        isFlat: false,
        hasCollision: true
    },
    'big_tombstone': {
        src: DEFAULT_PATH + 'big_tombstone.png',
        width: 150,
        height: 205,
        isFlat: false,
        hasCollision: true
    },
    'polished_stone_cube': {
        src: DEFAULT_PATH + 'polished_stone_cube.png',
        width: 145,
        height: 210,
        isFlat: false,
        hasCollision: true
    },
    'stone_pillar': {
        src: DEFAULT_PATH + 'stone_pillar.png',
        width: 155,
        height: 375,
        isFlat: false,
        hasCollision: true
    },
    'broken_stone_pillar': {
        src: DEFAULT_PATH + 'broken_stone_pillar.png',
        width: 155,
        height: 275,
        isFlat: false,
        hasCollision: true
    },
    'red_vending_machine': {
        src: DEFAULT_PATH + 'red_vending_machine.png',
        width: 80,
        height: 120,
        minScale: 1.4,
        maxScale: 1.4,
        isFlat: false,
        hasCollision: true
    },
    'futuristic_crate': {
        src: DEFAULT_PATH + 'futuristic_crate.png',
        width: 60,
        height: 70,
        minScale: 1,
        maxScale: 1.6,
        isFlat: false,
        hasCollision: true
    },
    'industrial_vent_unit': {
        src: DEFAULT_PATH + 'industrial_vent_unit.png',
        width: 160,
        height: 75,
        minScale: 1.2,
        maxScale: 2,
        isFlat: false,
        hasCollision: true
    },
    'futuristic_food_cart': {
        src: DEFAULT_PATH + 'futuristic_food_cart.png',
        width: 220,
        height: 130,
        minScale: 1.1,
        maxScale: 1.7,
        isFlat: false,
        hasCollision: true
    },
    'futuristic_antena_pole': {
        src: DEFAULT_PATH + 'futuristic_antena_pole.png',
        width: 65,
        height: 200,
        minScale: 1,
        maxScale: 1.7,
        isFlat: false,
        hasCollision: true
    },
    'futuristic_solar_panels_on_pole': {
        src: DEFAULT_PATH + 'futuristic_solar_panels_on_pole.png',
        width: 45,
        height: 210,
        minScale: 1,
        maxScale: 1.7,
        isFlat: false,
        hasCollision: true
    },
    'egg_in_nest': {
        src: DEFAULT_PATH + 'egg_in_nest.png',
        width: 60,
        height: 45,
        isFlat: false,
        hasCollision: false
    },
    'horizontal_yellow_pipe': {
        src: DEFAULT_PATH + 'horizontal_yellow_pipe.png',
        width: 240,
        height: 60,
        isFlat: false,
        hasCollision: true
    },
    'horizontal_blue_pipe': {
        src: DEFAULT_PATH + 'horizontal_blue_pipe.png',
        width: 240,
        height: 60,
        isFlat: false,
        hasCollision: true
    },
    'horizontal_green_pipe': {
        src: DEFAULT_PATH + 'horizontal_green_pipe.png',
        width: 240,
        height: 60,
        isFlat: false,
        hasCollision: true
    },
    'vertical_yellow_pipe': {
        src: DEFAULT_PATH + 'vertical_yellow_pipe.png',
        width: 80,
        height: 240,
        hitboxHeight: 230,
        minScale: 1,
        maxScale: 1,
        isFlat: false,
        hasCollision: true
    },
    'vertical_blue_pipe': {
        src: DEFAULT_PATH + 'vertical_blue_pipe.png',
        width: 80,
        height: 240,
        hitboxHeight: 230,
        minScale: 1,
        maxScale: 1,
        isFlat: false,
        hasCollision: true
    },
    'vertical_green_pipe': {
        src: DEFAULT_PATH + 'vertical_green_pipe.png',
        width: 80,
        height: 240,
        hitboxHeight: 230,
        minScale: 1,
        maxScale: 1,
        isFlat: false,
        hasCollision: true
    },
    'sandstone_well': {
        src: DEFAULT_PATH + 'sandstone_well.png',
        width: 140,
        height: 145,
        hitboxHeight: 135,
        isFlat: false,
        hasCollision: true
    }
    //#endregion
};




//#region HELPERS
const loadedImages = {};

function loadAssets(callback) {
    let toLoad = 0;
    let loaded = 0;

    // Count how many images we need
    for (let key in ASSET_LIBRARY) {
        if (ASSET_LIBRARY[key].src) toLoad++;
    }

    // Load images
    for (let key in ASSET_LIBRARY) {
        const asset = ASSET_LIBRARY[key];
        if (asset.src) {
            const img = new Image();
            img.src = asset.src;

            img.onload = () => {
                loaded++;
                if (loaded === toLoad) callback();
            };

            img.onerror = () => {
                console.warn(`Failed to load image: ${asset.src}`);
                loaded++;
                if (loaded === toLoad) callback();
            };

            loadedImages[key] = img;
        }
    }
}
//#endregion