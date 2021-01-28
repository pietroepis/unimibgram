const rubrica = require("../models/rubrica_model");
const utils = require("../utils/utils");

/**
 *  Richiede l'esecuzione del metodo add del model. 
 *  Se i parametri non sono validi, viene ritornato un messaggio di errore
 *  @param {object} req - Oggetto che rappresenta la richiesta
 *  @param {object} res - Oggetto che rappresenta la risposta
 *  @param {object} next - Riferimento a funzione che passa il controllo al middleware successivo
*/
exports.add = function(req, res, next){
    if (req.body.addUserId == undefined)
        res.status(400).json({"message": "Invalid Parameters"});

    rubrica.add(req.body.userId, req.body.addUserId, (data) => res.json({"success": data}));
}

/**
 *  Richiede l'esecuzione del metodo remove del model. 
 *  Se i parametri non sono validi, viene ritornato un messaggio di errore
 *  @param {object} req - Oggetto che rappresenta la richiesta
 *  @param {object} res - Oggetto che rappresenta la risposta
 *  @param {object} next - Riferimento a funzione che passa il controllo al middleware successivo
*/
exports.remove = function(req, res, next){
    if (req.params.id == undefined)
        res.status(400).json({"message": "Invalid Parameters"});

    rubrica.remove(req.body.userId, req.params.id, (data) => res.json({"success": data}));
}

/**
 *  Richiede l'esecuzione del metodo all del model. 
 *  data contiene l'elenco degli utenti presenti in rubrica, e sarà uguale a [] se non ce ne sono
 *  @param {object} req - Oggetto che rappresenta la richiesta
 *  @param {object} res - Oggetto che rappresenta la risposta
 *  @param {object} next - Riferimento a funzione che passa il controllo al middleware successivo
*/
exports.contatti = function(req, res, next){
    rubrica.all(req.body.userId, (data) => res.json(data));
}