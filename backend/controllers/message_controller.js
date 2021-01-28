const utils = require("../utils/utils");
const message = require("../models/message_model");
const fs = require("fs");
const Message = require("../classes/message");

/** 
 *  Richiede l'esecuzione del metodo send del model. 
 *  Se i parametri non sono validi, viene ritornato un messaggio di errore
 *  @param {object} req - Oggetto che rappresenta la richiesta
 *  @param {object} res - Oggetto che rappresenta la risposta
 *  @param {object} next - Riferimento a funzione che passa il controllo al middleware successivo
*/
exports.send = function(req, res, next){
    if (!(req.body.receiverId != undefined && req.body.content != undefined))
        res.status(400).json({"message": "Invalid Parameters"});

    message.send(new Message({
        senderId: req.body.userId,
        receiverId: req.body.receiverId,
        type: 0,
        content: req.body.content
    }), function(data){
        if (data !== false){
            res.json({
                "success": true
            });
        }
        else
            res.json({"success": false});
    });
}

/** 
 *  Gestisce l'invio di un allegato.
 *  Il campo body.raw contiene la codifica in base64 del file
 *  @param {object} req - Oggetto che rappresenta la richiesta
 *  @param {object} res - Oggetto che rappresenta la risposta
 *  @param {object} next - Riferimento a funzione che passa il controllo al middleware successivo
*/
exports.sendAttachment = function(req, res, next){
    if (!(req.body.receiverId != undefined && req.body.raw != undefined))
        res.status(400).json({"message": "Invalid Parameters"});

    //Viene rimossa l'intestazione relativa al formato dalla codifica base64
    var base64Data = req.body.raw.replace(/^data:image\/png;base64,/, "")
        .replace(/^data:application\/pdf;base64,/, "")
        .replace(/^data:video\/mp4;base64,/, "")
        .replace(/^data:application\/mp4;base64,/, "");

    let mimeType = utils.getMIMEType(base64Data);
    mimeType = mimeType.substr(mimeType.indexOf("/") + 1);

    /**
     *  Vengono prima inserite nel database tutte le informazioni di un comune messaggio, ad eccezione del contenuto,
     *  impostando la tipologia di messaggio ad 1 (multimedia)
    */
    message.send(new Message({
        senderId: req.body.userId,
        receiverId: req.body.receiverId,
        type: 1,
        content: ""
    }), function(data){
        if (data !== false){
            /** 
             *  Se il messaggio è stato inserito correttamente nel database, viene salvato il file ricevuto nella cartella 
             *  attachments, rinominato secondo la convenzione attachment_idMessaggio
            */
            fs.writeFile("attachments/attachment_" + data.id + "." + mimeType, base64Data, "base64", function(err) {
                if (err) res.json({"success": false});
                /**
                 *  Se il salvataggio su disco va a buon fine, viene aggiornato il campo del messaggio relativo al contenuto
                 *  con il nome del file creato
                */
                message.setAttachment(data.id, "attachment_" + data.id + "." + mimeType, function(data){
                    if (data !== false)
                        res.json({
                            "success": true,
                            "content": data.content
                        });
                    else
                        res.json({"success": false});
                });
            });
        }
        else
            res.json({"success": false});
    });
}

/** 
 *  Richiede l'esecuzione del metodo setRead del model. 
 *  Se i parametri non sono validi, viene ritornato un messaggio di errore 
 *  @param {object} req - Oggetto che rappresenta la richiesta
 *  @param {object} res - Oggetto che rappresenta la risposta
 *  @param {object} next - Riferimento a funzione che passa il controllo al middleware successivo  
*/
exports.setRead = function(req, res, next){
    if (req.body.receiverId == undefined)
        res.status(400).json({"message": "Invalid Parameters"});

    message.setRead(req.body.userId, req.body.receiverId, (data) => res.json({"success": data}));
}

/** 
 *  Richiede l'esecuzione del metodo all del model. 
 *  data contiene l'elenco degli utenti presenti in rubrica, e sarà uguale a [] se non ce ne sono 
 *  @param {object} req - Oggetto che rappresenta la richiesta
 *  @param {object} res - Oggetto che rappresenta la risposta
 *  @param {object} next - Riferimento a funzione che passa il controllo al middleware successivo
*/
exports.all = function(req, res, next){
    message.all(req.body.userId, req.body.receiverId, (data) => res.json(data));
}