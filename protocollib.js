const WebSocketServer = require('websocket').server;
const EventEmitter = require("events").EventEmitter;
const ids = require("./ids");
var players = {};
var debug = false;

function setDebug(doIt) {
    debug = Boolean(doIt);
}

/**
 * Only logs if debug is set
 */
function debugLog() {
    if(debug) {
        console.log(...arguments); //Passthrough arguments
    }
} 


class Client { //Class just incase for the future
    constructor(Connection) {
        this.connection = Connection;
    }
}

class Server extends EventEmitter {
    constructor(Http) {
        super();
        this.http = Http;
        this.clients = [];
        this.socketServer = new WebSocketServer({httpServer: this.http}); //Handle websocket connections


        this.socketServer.on("request", (request)=>{
            let connection = request.accept(null, request.origin); //I did it like this and I don't know if it works without request.origin so here it is
            let client = new Client(connection);
            this.clients.push(client);

            connection.on("message", (message)=>{
                if(message.type === "binary") { //Idk why I check this
                    //Process message
                    msgHandler(this,client, message);
                }
            });
        });
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
        this.direction = ids.directions.UP;
        this.version = 0;
        this.connection = this.client.connection; 
        this.trail = [];
    }
    send(command, data = Buffer.from([])) {
        let inspected = require("util").inspect(data);
        let inspected_cropped = inspected.substring(7+(data.length), inspected.length-1);
        debugLog(`SEND ${this.username} ${getKeyByValue(ids.sendAction, command)} ${inspected_cropped}`);
        inspected = undefined, inspected_cropped = undefined;
        
        let commandBuf = Buffer.alloc(1, command);
        let dataBuf = Buffer.from(data);
        let sendBuf = Buffer.concat([commandBuf, dataBuf]);
        this.connection.sendBytes(sendBuf);

    }
    decodeSkin(data) {
        this.skin = {skin: data[0], pattern: data[1]}; //Mirrors splix.io format. 
        debugLog(`Set ${this.username}'s skin to ${this.skin}`);
    }

    /**
     * Set a player's (starting point of a) trail. 
     * @param {Number} x 
     * @param {Number} y 
     */
    setTrail(x, y) {
        this.trail = [x,y];
        var fixedX = intToBytes(x, 2);
        var fixedY = intToBytes(y, 2);
    
        var xBuf = Buffer.from(fixedX);
        var yBuf = Buffer.from(fixedY);
    
        this.send(ids.sendAction.SET_TRAIL, Buffer.concat([this.id, xBuf, yBuf]));
    
    
    }
    
    /**
     * Set a player's position. 

     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} direction 
     */
    setPlayerPos(x, y, direction) {
        this.position = [x, y];
    
        var fixedX = intToBytes(x, 2);
        var fixedY = intToBytes(y, 2);
    
        //Easiest way to make messages like this are to convert them into buffers then concat them
        var xBuf = Buffer.from(fixedX);
        var yBuf = Buffer.from(fixedY);
        var dirBuf = Buffer.from([direction]);
    
        sendAll(ids.sendAction.PLAYER_POS, Buffer.concat([xBuf, yBuf, this.id, dirBuf]))
    
    }
    

}
/**
 * Generate random directions and positions to spawn a player. 
 * TODO: Randomly generate these(person4268)
 */
function getStartingVars() {
    return {x: 100, y: 100, direction: ids.directions.UP}; //Static for temporary reasons
}
/**
 * Creates an internal representation of a player. Seperate from the connection. 
 * @param {Client} client 
 */
function createPlayer(client) {
    players[client] = new Player(client);
}
/**
 * Sends a message to all connected clients
 * @param {Number} command The command to send
 * @param {Array} data The data to pass. 
 */
function sendAll(command, data=[]) {
    let inspected = require("util").inspect(data);
    let inspected_cropped = inspected.substring(7+(data.length), inspected.length-1);
    debugLog(`SENDALL ${getKeyByValue(ids.sendAction, command)} ${inspected_cropped}`);
    inspected = undefined, inspected_cropped = undefined; //Dont need them anymore. 

    let commandBuf = Buffer.alloc(1, command);
    let dataBuf = Buffer.from(data);
    let sendBuf = Buffer.concat([commandBuf, dataBuf]);

    Object.keys(players).forEach((p)=>{
        players[p].connection.sendBytes(sendBuf);
    })

}

/**
 * Handler for when message gets sent by splix client. 
 * @param {Server} server
 * @param {Client} client
 * @param {Uint8Array} message
 */
function msgHandler(server, client, message) {
    const msgData = message.binaryData;
    const command = message.binaryData[0]; //First byte is always the command
    const commandStr = getKeyByValue(ids.recieveAction, command);
    const data = msgData.slice(1); // Data for said command comes after. 

    if(!players[client]) {
        debugLog("Creating a player...")
        createPlayer(client); //Create player if there isn't one
    }
    var player = players[client];

    let inspected = require("util").inspect(data);
    let inspected_cropped = inspected.substring(7+(data.length), inspected.length-1);
    debugLog(`RECV ${commandStr} ${inspected_cropped}`);
    inspected = undefined, inspected_cropped = undefined; //Don't need them anymore. 

    server.emit(commandStr, player, data, client);
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
            debugLog(`Set [${player.id[0]},${player.id[1]}]'s username to ${player.username}`);
            break;
        case "UPDATE_DIR":
            player.setPlayerPos(player.position[0], player.position[1], data[0]);
            break;
        case "REQUEST_MY_TRAIL":
            var fixedX = intToBytes(player.trail[0], 2);
            var fixedY = intToBytes(player.trail[1], 2);
    
            var xBuf = Buffer.from(fixedX);
            var yBuf = Buffer.from(fixedY);
    
            player.send(ids.sendAction.SET_TRAIL, Buffer.concat([player.id, xBuf, yBuf]));

        case "READY":
            player.send(ids.sendAction.READY); //Tells client to load map. 
            break;
        default: 
            debugLog("Unsupported command", commandStr);
    }
    
}

//Notetaking lol
//Leaderboard
//1,2: Amount of players in server


module.exports = {
    Server: Server,
    setDebug: setDebug,
    getStartingVars: getStartingVars,
    Player: Player,
    Client: Client
}