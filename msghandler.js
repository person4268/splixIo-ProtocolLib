const ids = require("./ids");

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

function intToBytes(data, length) {
    for (var n = [], a = 0; a < length; a++) {
        var i = 255 & data;
        data = (data - (n[length - a - 1] = i)) / 256
    }
    return n
}



/**
 * Handler for when message gets sent by splix client. 
 */
module.exports = function(client, message) {
    c
}