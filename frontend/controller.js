const superagent = require("superagent");
const env = require("node-env-file");
env("./.env");

/** 
 * Il metodo sendRequest, tramite il modulo superagent, effettua una chiamata HTTP all'api_gateway, che a sua volta la inoltra 
 * al backend, utilizzando gli stessi valori (metodo, url, parametri del body e Bearer Token ) della richiesta proveniente dal 
 * client.
 * La risposta proveniente dall'api_gateway viene poi inviata al client, rendendo la procedura trasparente.
 * @param {string} url - indirizzo della chiamata da effettuare
 * @param {string} method - metodo della richiesta
 * @param {object} postParams - oggetto che contiene i parametri di una richiesta di tipo POST, impostato di default a {}
 * @param {string} token - stringa che permette l'autenticazione
 * @param {function} callback - funzione di callback 
*/
var sendRequest = function({url, method, postParams = {}, token, callback}){
    switch(method){
        case "POST": {
            superagent
                .post(process.env.GATEWAY_ADDRESS + url)
                .set("Authorization", token)
                .send(postParams)
                .end(function(err, backendRes){
                    if (err != null && err.status == 401)
                        callback(null);
                    else
                        callback(backendRes.body);
                });
        } break;

        case "GET": {
            superagent
                .get(process.env.GATEWAY_ADDRESS + url)
                .set("Authorization", token)
                .end(function(err, backendRes){
                    if (err != null && err.status == 401)
                        callback(null);
                    else
                        callback(backendRes.body);
                });
        } break;
    }
}

/** 
 *  Tutti i metodi seguenti includono un controllo relativo al valore di null. Il motivo è che il metodo sendRequest
 *  passa al metodo di callback parametro null nel caso in cui il backend ritorni il codice HTTP uguale a 401, ovvero
 *  "Unauthorized". In questo caso viene inviato al client un messaggio di errore, altrimenti viene visualizzata la pagina
 *  richiesta.
*/

/** 
 * Chiama il servizio api/user/status del backend, per ottenere i dati dell'utente che ha effettuato il login,
 * e visualizza la pagina principale dell'applicazione
 *  @param {object} req - Oggetto che rappresenta la richiesta
 *  @param {object} res - Oggetto che rappresenta la risposta
 *  @param {object} next - Riferimento a funzione che passa il controllo al middleware successivo
*/
exports.appPage = function(req, res, next){
    sendRequest({
        url: "/api/user/status",
        method: req.method,
        postParams: req.body,
        token: (req.token != undefined ? req.token : ""),
        callback: function(data){
            if (data != null)
                res.render("pages/chat", {user: data});
            else
                res.status(401).json({
                    "message": "Token Expired"
                });
        }
    });
}

/** 
 *  Gestisce l'inclusione della parte di pagina relativa al risultato di una ricerca. Il backend ritorna l'elenco di utenti,
 *  che vengono visualizzati tramite ejs.
 *  Viene passato al template anche l'attributo BACKEND_ADDRESS, necessario per identificare il percorso completo delle 
 *  immagini profilo degli utenti (dato che nel database viene salvato solo il nome del file)
 *  @param {object} req - Oggetto che rappresenta la richiesta
 *  @param {object} res - Oggetto che rappresenta la risposta
 *  @param {object} next - Riferimento a funzione che passa il controllo al middleware successivo
*/
exports.usersSearch = function(req, res, next){
    sendRequest({
        url: "/api/user/username",
        method: req.method,
        postParams: req.body,
        token: (req.token != undefined ? req.token : ""),
        callback: function(data){
            if (data != null)
                res.render("includes/users_search_results", {baseUrl: process.env.BACKEND_ADDRESS, users: data});
            else
                res.status(401).json({
                    "message": "Token Expired"
                });
        }
    });
}

/** 
 *  Gestisce l'inclusione della parte di pagina relativa al dettaglio di un utente. Il backend ritorna le informazioni relative
 *  all'utente richiesto, che viene visualizzato tramite ejs.
 *  Viene passato al template anche l'attributo BACKEND_ADDRESS, necessario per identificare il percorso completo dell'immagine 
 *  profilo dell'utente (dato che nel database viene salvato solo il nome del file)
 *  @param {object} req - Oggetto che rappresenta la richiesta
 *  @param {object} res - Oggetto che rappresenta la risposta
 *  @param {object} next - Riferimento a funzione che passa il controllo al middleware successivo
 */
exports.userDetail = function(req, res, next){
    sendRequest({
        url: "/api/user/" + req.params.id,
        method: req.method,
        postParams: req.body,
        token: (req.token != undefined ? req.token : ""),
        callback: function(data){
            if (data != null)
                res.render("includes/user_detail", {baseUrl: process.env.BACKEND_ADDRESS, info: data});
            else
                res.status(401).json({
                    "message": "Token Expired"
                });
        }
    });
}

/** 
 *  Gestisce l'inclusione della parte di pagina relativa alla rubrica. Il backend ritorna l'elenco di utenti,
 *  che vengono visualizzati tramite ejs.
 *  Viene passato al template anche l'attributo BACKEND_ADDRESS, necessario per identificare il percorso completo delle 
 *  immagini profilo degli utenti (dato che nel database viene salvato solo il nome del file)
 *  @param {object} req - Oggetto che rappresenta la richiesta
 *  @param {object} res - Oggetto che rappresenta la risposta
 *  @param {object} next - Riferimento a funzione che passa il controllo al middleware successivo
 */
exports.rubrica = function(req, res, next){
    sendRequest({
        url: "/api/rubrica/contatti",
        method: "POST",
        postParams: req.body,
        token: (req.token != undefined ? req.token : ""),
        callback: function(data){
            if (data != null)
                res.render("includes/rubrica", {baseUrl: process.env.BACKEND_ADDRESS, contacts: data});
            else
                res.status(401).json({
                    "message": "Token Expired"
                });
        }
    });
}

/** 
 *  Gestisce l'inclusione della parte di pagina relativa all'elenco dei messaggi scambiati tra due utenti. Il backend 
 *  ritorna l'elenco dei messaggi, che vengono visualizzati tramite ejs.
 *  Viene passato al template anche l'attributo BACKEND_ADDRESS, necessario per identificare il percorso completo degli allegati 
 *  (dato che nel database viene salvato solo il nome del file)
 *  @param {object} req - Oggetto che rappresenta la richiesta
 *  @param {object} res - Oggetto che rappresenta la risposta
 *  @param {object} next - Riferimento a funzione che passa il controllo al middleware successivo
*/
exports.chat = function(req, res, next){
    sendRequest({
        url: "/api/message/all",
        method: req.method,
        postParams: req.body,
        token: (req.token != undefined ? req.token : ""),
        callback: function(data){
            if (data != null)
                res.render("includes/messages", {baseUrl: process.env.BACKEND_ADDRESS, messages: data.messages, userId: data.userId});
            else
                res.status(401).json({
                    "message": "Token Expired"
                });
        }
    });
}