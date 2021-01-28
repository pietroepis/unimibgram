const user = require("../models/user_model");
const utils = require("../utils/utils");
const User = require("../classes/user");

/** 
 *  Richiede l'esecuzione del metodo login del model. Se i parametri non sono validi, oppure l'autenticazione dell'utente
 *  fallisce, viene ritornato un messaggio di errore
 *  @param {object} req - Oggetto che rappresenta la richiesta
 *  @param {object} res - Oggetto che rappresenta la risposta
 *  @param {object} next - Riferimento a funzione che passa il controllo al middleware successivo
*/
exports.login = function(req, res, next){
    if (!(req.body.username != undefined && req.body.password != undefined))
        res.status(400).json({"message": "Invalid Parameters"});

    let obj = {};
    obj.username = req.body.username;
    obj.password = req.body.password;
    user.login(obj, function(data){
        if (data === false)
            res.status(401).json({"message": "Invalid Username or Password"});
        else
            res.json(data);
    });
}

/** 
 *  Richiede l'esecuzione del metodo create del model. Se i parametri non sono validi, viene ritornato un 
 *  messaggio di errore
 *  @param {object} req - Oggetto che rappresenta la richiesta
 *  @param {object} res - Oggetto che rappresenta la risposta
 *  @param {object} next - Riferimento a funzione che passa il controllo al middleware successivo
*/
exports.create = function(req, res, next){
    if (!(req.body.username != undefined && req.body.password != undefined))
        res.status(400).json({"message": "Invalid Parameters"});

    user.create(new User({
        username: req.body.username,
        password: req.body.password
    }), (data) => res.json({"success": data}));
}

/** 
 *  Richiede l'esecuzione del metodo create del model. 
 *  Non vengono effettuati controlli in quanto i campi non inizializzati vengono ignorati e non aggiornati.
 *  Il campo data ritornato ha valore true se l'esecuzione è andata a buon fine, false altrimenti
 *  @param {object} req - Oggetto che rappresenta la richiesta
 *  @param {object} res - Oggetto che rappresenta la risposta
 *  @param {object} next - Riferimento a funzione che passa il controllo al middleware successivo
*/
exports.update = function(req, res, next){
    user.update(new User({
        id: req.body.userId,
        username: req.body.username,
        password: req.body.password,
        descrizione: req.body.descrizione,
        telefono: req.body.telefono,
        privacy: req.body.privacy,
        immagineProfilo: req.body.immagineProfilo
    }), (data) => res.json({"success": data}));
}

/** 
 *  Richiede l'esecuzione del metodo getUserById del model. 
 *  Se i parametri non sono validi, viene ritornato un messaggio di errore
 *  Se l'utente corrispondente all'id richiesto non viene trovato, viene ritornato un errore con codice 404 (not found)
 *  @param {object} req - Oggetto che rappresenta la richiesta
 *  @param {object} res - Oggetto che rappresenta la risposta
 *  @param {object} next - Riferimento a funzione che passa il controllo al middleware successivo
*/
exports.getUser = function(req, res, next){
    if (req.params.id == undefined)
        res.status(400).json({"message": "Invalid Parameters"});

    user.getUserById(req.body.userId, req.params.id, function(data){
        if (data === false) 
            res.status(404).json({"message": "User not found"});
        else
            res.json(data);
    });
}

/** 
 *  Richiede l'esecuzione del metodo getUserByUsername del model. 
 *  Se i parametri non sono validi, viene ritornato un messaggio di errore
 *  Se non viene trovato nessun utente il cui username corrisponde a quello richiest, viene ritornato
 *  un errore con codice 404 (not found)
 *  @param {object} req - Oggetto che rappresenta la richiesta
 *  @param {object} res - Oggetto che rappresenta la risposta
 *  @param {object} next - Riferimento a funzione che passa il controllo al middleware successivo
*/
exports.getUserByUsername = function(req, res, next){
    if (req.body.username == undefined)
        res.status(400).json({"message": "Invalid Parameters"});

    user.getUserByUsername(req.body.userId, req.body.username, function(data){
        if (data === false) 
            res.status(404).json({"message": "User not found"});
        else
            res.json(data);
    });
}