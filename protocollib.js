const WebSocketServer = require('websocket');

class Client { //Class just incase for the future
    constructor(Connection) {
        this.connection = Connection;
    }
}

class Server {
    constructor(Http) {
        this.http = http;
        this.clients = [];
        this.socketServer = new WebSocketServer({httpServer: this.http}); //Handle websocket connections


        this.socketServer.on("request", (request)=>{
            let connection = request.accept(null, request.origin); //I did it like this and I don't know if it works without request.origin so here it is
            let client = new Client(connection);
            this.clients.push(client);

            connection.on("message", (message)=>{
                if(message.type === "binary") {
                    //Process message
                }
            });
        });
    }
}


module.exports = {
    Server: Server
}