/*
FORMAT
'W' = Wall
'F' = Floor
' ' = Empty
*/


const STRUCTURE_LIBRARY = {

    //#region BUILDINGS

    'small_house': {
        layout:
            [
                ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', ' '],
                ['W', 'F', 'F', 'F', 'F', 'F', 'F', 'W', 'W'],
                ['W', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'W'],
                ['W', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'W'],
                ['W', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'W'],
                ['W', 'F', 'F', 'F', 'F', 'F', 'F', 'W', 'W'],
                ['W', 'W', 'F', 'W', 'W', 'W', 'W', 'W', ' ']
            ]
    },

    'mini_shack': {
        layout:
            [
                ['W', 'W', 'W'],
                ['W', 'F', 'W'],
                ['W', 'F', 'W']
            ]
    },

    'small_l_shaped_room': {
        layout: [
            ['W', 'W', 'W', 'W', 'W'],
            ['W', 'F', 'F', 'F', 'W'],
            ['W', 'F', 'W', 'W', 'W'],
            ['W', 'F', 'W', ' ', ' '],
            ['W', 'F', 'W', ' ', ' ']
        ]
    },

    'small_square_house': {
        layout: [
            ['W', 'W', 'W', 'W', 'W', 'W'],
            ['W', 'F', 'F', 'F', 'F', 'W'],
            ['W', 'F', 'F', 'F', 'F', 'W'],
            ['W', 'F', 'F', 'F', 'F', 'W'],
            ['W', 'F', 'F', 'F', 'F', 'W'],
            ['W', 'W', 'F', 'F', 'W', 'W'],
        ]
    },

    'square_house': {
        layout: [
            ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W'],
            ['W', 'F', 'F', 'F', 'F', 'F', 'F', 'W'],
            ['W', 'F', 'F', 'F', 'F', 'F', 'F', 'W'],
            ['W', 'F', 'F', 'F', 'F', 'F', 'F', 'W'],
            ['W', 'F', 'F', 'F', 'F', 'F', 'F', 'W'],
            ['W', 'F', 'F', 'F', 'F', 'F', 'F', 'W'],
            ['W', 'F', 'F', 'F', 'F', 'F', 'F', 'W'],
            ['W', 'W', 'W', 'F', 'F', 'W', 'W', 'W']
        ]
    },

    'rectangle_house': {
        layout: [
            ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W'],
            ['W', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'W'],
            ['W', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'W'],
            ['W', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'W'],
            ['W', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'W'],
            ['W', 'W', 'F', 'F', 'W', 'W', 'W', 'W', 'W']
        ]
    },

    //#endregion

    //#region RUINS

    'generic_ruins': {
        layout: [
            [' ', 'W', ' ', 'W', 'W', 'W', 'W', ' '],
            ['W', 'W', ' ', 'F', ' ', ' ', 'W', 'W'],
            ['W', 'F', 'F', ' ', 'F', ' ', 'F', 'W'],
            [' ', ' ', 'F', 'F', ' ', ' ', 'F', 'W'],
            ['W', 'F', ' ', ' ', ' ', 'F', 'F', 'W'],
            ['W', 'F', 'F', 'F', ' ', 'F', 'F', 'W'],
            ['W', 'W', 'F', ' ', 'F', ' ', ' ', 'W'],
            [' ', 'W', ' ', ' ', 'F', 'W', ' ', ' '],
            [' ', 'W', ' ', ' ', 'F', 'W', ' ', ' '],
            [' ', ' ', ' ', ' ', ' ', 'W', ' ', ' '],
        ]
    },

    'ancient_pillars': {
        layout: [
            ['W', 'W', ' ', ' ', 'W', 'W', ' ', ' ', 'W'],
            [' ', 'F', 'F', 'F', ' ', 'F', 'F', 'F', 'W'],
            [' ', 'F', 'F', 'F', ' ', 'F', 'F', 'F', ' '],
            [' ', 'F', 'F', 'F', 'W', 'F', 'F', 'F', ' '],
            ['W', ' ', ' ', 'W', 'W', ' ', ' ', ' ', 'W']
        ]
    },

    //#endregion

    //#region UTILITIES

    'u_shaped_closed_courtyard': {
        layout: [
            ['W', 'W', 'W', 'W', 'W', 'W', 'W'],
            ['W', 'F', 'F', 'F', 'F', 'F', 'W'],
            ['W', 'F', 'F', 'F', 'F', 'F', 'W'],
            ['W', 'F', 'F', 'F', 'F', 'F', 'W'],
            ['W', 'F', 'W', ' ', 'W', 'F', 'W'],
            ['W', 'F', 'W', ' ', 'W', 'F', 'W'],
            ['W', 'W', 'W', ' ', 'W', 'W', 'W']
        ]
    },

    'merchant_stall': {
        layout: [
            ['W', 'W', 'W', 'W', 'W', 'W'],
            ['W', 'F', 'F', 'F', 'F', 'W'],
            ['W', 'F', 'F', 'F', 'F', 'W'],
            ['W', 'W', ' ', ' ', 'W', 'W']
        ]
    },

    'long_horizontal_corridor': {
        layout: [
            ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W'],
            ['F', 'F', 'F', 'F', 'F', 'F', 'F', 'F'],
            ['F', 'F', 'F', 'F', 'F', 'F', 'F', 'F'],
            ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W']
        ]
    },

    //#endregion

    //#region MAZES

    'mini_maze': {
        layout: [
            ['W', 'W', 'W', 'W', 'W', 'W', 'W'],
            ['W', 'F', 'F', 'F', 'W', 'F', 'W'],
            ['W', 'F', 'W', 'F', 'W', 'F', 'W'],
            ['W', 'F', 'W', 'F', 'F', 'F', 'W'],
            ['W', 'F', 'W', 'W', 'W', 'F', 'W'],
            ['W', 'F', 'F', 'F', 'F', 'F', 'W'],
            ['W', 'W', 'W', 'F', 'W', 'W', 'W']
        ]
    },

    //#endregion
};