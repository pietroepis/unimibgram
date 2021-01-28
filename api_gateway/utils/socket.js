/* 
    onlineUsers tiene traccia degli utenti attualmente connessi, memorizzando id del socket e id dell'utente
*/

let onlineUsers = {};
var io;

/** 
 *  Il socket viene messo in attesa di richieste da parte dei client
*/
exports.init = function(http){
    io = require("socket.io").listen(http);

    io.on("connection", (socket) => {
        /** 
         *  Quando un client si connette, viene aggiunto un listener relativo all'evento "registration", 
         *  gestito aggiungendo l'utente a onlineUsers
        */
        socket.on("registration", (userId) => {
            console.log("REGISTRATION: " + userId);
            onlineUsers[userId] = {
                socketId: socket.id
            };
            console.log(onlineUsers);
        });
    });
}

/** 
 *  Tramite userId è possibile accedere a onlineUsers come array associativo per ottenere l'id del socket corrispondente
 *  ed inviare il messaggio tramite il metodo emit
*/
exports.sendMessage = function(userId, content){
    console.log(onlineUsers);
    if (onlineUsers[userId]){
        io.sockets.connected[onlineUsers[userId].socketId].emit("new-message", content);
    } else {
        console.log("User is not online"); 
    }
}