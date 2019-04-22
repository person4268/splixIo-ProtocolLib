//Officially from splix.io. sendAction and recieveAction reversed because we're the server. Directions crafted through running fake server, others from reverse enginnering source

//Probably should capitalize my consts but whatever

const colors = {
    GREY: 0,
    RED: 1,
    RED2: 2,
    PINK: 3,
    PINK2: 4,
    PURPLE: 5,
    BLUE: 6,
    BLUE2: 7,
    GREEN: 8,
    GREEN2: 9,
    LEAF: 10,
    YELLOW: 11,
    ORANGE: 12,
    GOLD: 13
};
const sendAction = {
    UPDATE_BLOCKS: 1,
    PLAYER_POS: 2,
    FILL_AREA: 3,
    SET_TRAIL: 4,
    PLAYER_DIE: 5,
    CHUNK_OF_BLOCKS: 6,
    REMOVE_PLAYER: 7,
    PLAYER_NAME: 8,
    MY_SCORE: 9,
    MY_RANK: 10,
    LEADERBOARD: 11,
    MAP_SIZE: 12,
    YOU_DED: 13,
    MINIMAP: 14,
    PLAYER_SKIN: 15,
    EMPTY_TRAIL_WITH_LAST_POS: 16,
    READY: 17,
    PLAYER_HIT_LINE: 18,
    REFRESH_AFTER_DIE: 19,
    PLAYER_HONK: 20,
    PONG: 21,
    UNDO_PLAYER_DIE: 22,
    TEAM_LIFE_COUNT: 23
};
const recieveAction = {
    UPDATE_DIR: 1,
    SET_USERNAME: 2,
    SKIN: 3,
    READY: 4,
    REQUEST_CLOSE: 5,
    HONK: 6,
    PING: 7,
    REQUEST_MY_TRAIL: 8,
    MY_TEAM_URL: 9,
    SET_TEAM_USERNAME: 10,
    VERSION: 11,
    PATREON_CODE: 12
};

const directions = {
    RIGHT: 0,
    DOWN: 1,
    LEFT: 2,
    UP: 3
};
module.exports = {
    directions: directions,
    recieveAction: recieveAction,
    sendAction: sendAction
};