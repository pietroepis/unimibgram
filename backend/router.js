const userController = require("./controllers/user_controller");
const rubricaController = require("./controllers/rubrica_controller");
const messageController = require("./controllers/message_controller");
const jwt = require("jsonwebtoken");
const env = require("node-env-file");
env("./.env");

const API_BASE = "/api/";

/** 
 *  Viene ricavato, decodificato e verificato il token JWT presente nell'header della richiesta
 *  Se è scaduto viene intercettata l'eccezione dal blocco catch e ritornato al client un messaggio di errore con codice 401
 *  Altrimenti si ricava dal body del token l'id dell'utente corrente, che viene aggiunto a req.body per essere utilizzato 
 *  nel controller
 *  @param {object} req - Oggetto che rappresenta la richiesta
 *  @param {object} res - Oggetto che rappresenta la risposta
 *  @param {object} next - Riferimento a funzione che passa il controllo al middleware successivo
*/
var checkAuth = function(req, res, next){
    try{
        var tokenObj = jwt.verify(
            req.token = req.header("authorization").replace("Bearer ", ""),
            process.env.JWT_KEY
        )
            
        req.body.userId = tokenObj.userId;
        next();
    } catch(err){
        if (err) 
            res.status(401).json({"message": "Token Expired"});
    }
}

/** 
 *  Inizializza il router definendo le route. Quando il metodo checkAuth è incluso nell'elenco dei middleware
 *  significa che la richiesta ha bisogno dell'autenticazione
 *  @param {object} app - Oggetto di ExpressJS
*/
exports.init = function(app){
    //USER
    app.post(API_BASE + "user/login", userController.login);
    app.post(API_BASE + "user/create", userController.create);
    app.post(API_BASE + "user/update", checkAuth, userController.update);
    app.get(API_BASE + "user/:id", checkAuth, userController.getUser);
    app.post(API_BASE + "user/username", checkAuth, userController.getUserByUsername)

    //RUBRICA
    app.post(API_BASE + "rubrica/add", checkAuth, rubricaController.add);
    app.get(API_BASE + "rubrica/remove/:id", checkAuth, rubricaController.remove);
    app.post(API_BASE + "rubrica/contatti", checkAuth, rubricaController.contatti);

    //MESSAGE
    app.post(API_BASE + "message/send", checkAuth, messageController.send);
    app.post(API_BASE + "message/send-attachment", checkAuth, messageController.sendAttachment);
    app.post(API_BASE + "message/set-read", checkAuth, messageController.setRead);
    app.post(API_BASE + "message/all", checkAuth, messageController.all);
}