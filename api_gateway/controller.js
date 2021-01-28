const superagent = require("superagent");
const env = require("node-env-file");
const socket = require("./utils/socket");
env("./.env");

/**  
 *  Il metodo sendRequest, tramite il modulo superagent, effettua una chiamata HTTP al backend,
 *  utilizzando gli stessi valori (metodo, url, parametri del body e Bearer Token ) della richiesta proveniente dal client.
 *  La risposta proveniente dal backend viene poi inviata al client, rendendo la procedura trasparente.
*/
exports.sendRequest = function(req, res, next){  
    switch(req.method){
        case "POST": {
            superagent
                .post(process.env.BACKEND_ADDRESS + req.originalUrl)
                .set("Authorization", (req.token != undefined ? req.token : ""))
                .send(req.body)
                .end(function(err, backendRes){
                    if(req.originalUrl == "/api/message/send" || req.originalUrl == "/api/message/send-attachment") {
                        socket.sendMessage(req.body.receiverId, {
                            senderId: req.body.userId
                        });
                    }
                    res.status(backendRes.status).json(backendRes.body);
                });
        } break;

        case "GET": {
            superagent
                .get(process.env.BACKEND_ADDRESS + req.originalUrl)
                .set("Authorization", (req.token != undefined ? req.token : ""))
                .end(function(err, backendRes){ 
                    res.status(backendRes.status).json(backendRes.body);
                });
        } break;
    }
    
}