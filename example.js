//Used for testing various functions; used only in development, plz ignore

const pl = require("./protocollib.js");
pl.setDebug(true);
const http = require("http");

var server = http.createServer(()=>{});
server.listen(8000);
const thing = new pl.Server(server);