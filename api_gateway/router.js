/** 
 *  Il modulo router definisce le route disponibili, definendo il metodo del controller 
 *  incaricato alla gestione della richiesta
*/

const controller = require("./controller");
const API_BASE = "/api/";

/** 
 *  Il token JWT inserito dal client nell'header della richiesta, deve essere incluso anche 
 *  nell'header della richiesta effettuata dall'api_gateway al backend. 
 *  Viene quindi estratto dall'header della richiesta proveniente dal client perché sia immediatamente
 *  disponibile al controller.
*/
var getToken = function(req, res, next){
    req.token = req.header("authorization");
    next();
}

/** 
 *  Inizializza il router definendo le route. Quando il metodo getToken è incluso nell'elenco dei middleware
 *  significa che la richiesta ha bisogno dell'autenticazione
*/
exports.init = function(app){
    //USER
    app.post(API_BASE + "user/login", controller.sendRequest);
    app.post(API_BASE + "user/create", controller.sendRequest);
    app.post(API_BASE + "user/update", getToken, controller.sendRequest);
    app.get(API_BASE + "user/:id", getToken, controller.sendRequest);
    app.post(API_BASE + "user/username", getToken, controller.sendRequest);

    //RUBRICA
    app.post(API_BASE + "rubrica/add", getToken, controller.sendRequest);
    app.get(API_BASE + "rubrica/remove/:id", getToken, controller.sendRequest);
    app.post(API_BASE + "rubrica/contatti", getToken, controller.sendRequest);

    //MESSAGE
    app.post(API_BASE + "message/send", getToken, controller.sendRequest);
    app.post(API_BASE + "message/send-attachment", getToken, controller.sendRequest);
    app.post(API_BASE + "message/set-read", getToken, controller.sendRequest);
    app.post(API_BASE + "message/all", getToken, controller.sendRequest);
}