//Used for testing various functions; used only in development, plz ignore

const pl = require("./protocollib.js");
const ids = require("./ids.js");
pl.setDebug(true);
const http = require("http");

var server = http.createServer(()=>{});
server.listen(8000);
const thing = new pl.Server(server);
thing.on("READY", 
/**
 * 
 * @param {pl.Player} player 
 * @param {Uint8Array} data 
 * @param {pl.Client} client 
 */
function(player, data, client) {
    console.log(`${player.username} is ready!`);
    let startVars = pl.getStartingVars();
    player.setPlayerPos(startVars.x, startVars.y, startVars.direction);
    player.setTrail(startVars.x, startVars.y);
});
