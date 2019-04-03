const ids = require("./ids");
var players = [];

/**
 * Only logs if debug is set
 */
function debugLog() {
    if(module.exports.debug) {
        debugLog(arguments);
    }
} 


//Adapted from splix because i hate working with bits
//And I can't understand whats its doing becuase it's minified

/**
 * Converts given bytes to an integer
 * Example: [0x00, 0x01] would return 1, converted from 16 bits. 
 */
function bytesToInt() {
    for (var e = 0, t = 0, n = arguments.length - 1; 0 <= n; n--) {
        e = (e | (255 & arguments[n]) << t >>> 0) >>> 0,
            t += 8
    }
    return e
}
/**
 * Converts an integer to bytes. 
 * For example, giving 1, 2 would give you [0x00, 0x01] as you want 2 bytes and the number 1
 * @param {Number} data 
 * @param {Number} length 
 */
function intToBytes(data, length) {
    for (var n = [], a = 0; a < length; a++) {
        var i = 255 & data;
        data = (data - (n[length - a - 1] = i)) / 256
    }
    return n
}


/**
 * Gets a key by its value in any given object
 * @param {Object} object 
 * @param {*} value 
 */
function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

class Player { 
    constructor(Client) {
        this.client = Client;
        this.username = "";
        this.usernameRaw = [];
        this.version = 0;
        this.connection = this.client.connection; 
    }
    send(command, data = []) {
        debugLog(`SEND ${getKeyByValue(ids.sendAction, command)} ${data.toString().split(",").join(" ".substr(1, data.length-1))}`); //Need to format data better. Doesn't seem to work correctly
        let commandBuf = Buffer.alloc(1, command);
        let dataBuf = Buffer.from(data);
        let sendBuf = Buffer.concat([commandBuf, dataBuf]);
        this.connection.sendBytes(sendBuf);

    }
    decodeSkin(data) {
        this.skin = {skin: data[0], pattern: data[1]}; //Mirrors splix.io format. 
        debugLog(`Set ${this.username}'s skin to ${this.skin}`);
    }

}

/**
 * Creates an internal representation of a player. Seperate from the connection. 
 * @param {} client 
 */
function createPlayer(client) {
    players[client] = new Player(client);
}

/**
 * Handler for when message gets sent by splix client. 
 */
module.exports = function(client, message) {
    const msgData = message.binaryData;
    const command = message.binaryData[0]; //First byte is always the command
    const commandStr = getKeyByValue(ids.recieveAction, command);
    const data = msgData.slice(1); // Data for said command comes after. 

    if(!players[client]) {
        console.log("Creating a player...")
        createPlayer(client); //Create player if there isn't one
    }
    var player = players[client];

    const inspected = require("util").inspect(data);
    const inspected_cropped = inspected.substring(8, inspected.length-1);
    debugLog(`RECV ${commandStr} ${inspected_cropped}`);

    switch(commandStr) {
        case "VERSION": //Version. Just an int of 3 bytes. 
            debugLog("Client version is", bytesToInt(...data));
            player.version = bytesToInt(...data);
            break;
        case "PING": //Just send pong. Idk why it's used, but we need it. 
            player.send(ids.sendAction.PONG);
            break;
        case "SKIN":
            player.skin = data;
            break;
        case "SET_USERNAME": 
            player.username = require("utf8").decode(String(data)); //No idea why username is converted to string but i guess it needs to be formatted like this
            player.usernameRaw = data;
            player.id = Buffer.from(intToBytes(0, 2)); //Temporaily, all players have an id of 0
            console.log(`Set [${player.id[0]},${player.id[1]}]'s username to ${player.username}`);
            break;
        case "READY":
            player.send(ids.sendAction.READY); //Tells client to load map. 
            break;
        default: 
            debugLog("Unsupported command", commandStr);
    }
    
}
module.exports.debug = false;
