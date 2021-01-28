const controller = require("./controller");
const env = require("node-env-file");
env("./.env");

const API_BASE = "/api/";

/** 
 *  Il token JWT inserito dal client nell'header della richiesta, deve essere incluso anche 
 *  nell'header della richiesta effettuata dal fontend al backend. 
 *  Viene quindi estratto dall'header della richiesta proveniente dal client perché sia immediatamente
 * disponibile al controller.
 *  @param {object} req - Oggetto che rappresenta la richiesta
 *  @param {object} res - Oggetto che rappresenta la risposta
 *  @param {object} next - Riferimento a funzione che passa il controllo al middleware successivo
*/
var getToken = function(req, res, next){
    try{
        req.token = req.header("authorization");
        next();
    } catch(err){
        res.status(401).json({"message": "Token Expired"});
    }
}

/** 
 * Inizializza il router definendo le route. Quando il metodo getToken è incluso nell'elenco dei middleware
 * significa che la richiesta ha bisogno dell'autenticazione
 * @param {object} - Oggetto di ExpressJS
*/
exports.init = function(app){
    //VIEW
    app.get("/", function(req, res){ res.render("index.ejs"); });
    app.get("/login", function(req, res){ res.render("pages/login.ejs"); });
    app.get("/chat", getToken, controller.appPage);
    app.post("/includes/users-search-result", getToken, controller.usersSearch);
    app.get("/includes/user-detail/:id", getToken, controller.userDetail);
    app.get("/includes/rubrica", getToken, controller.rubrica);
    app.post("/includes/chat", getToken, controller.chat);
}