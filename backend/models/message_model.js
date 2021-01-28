const db = require("../utils/db");
const utils = require("../utils/utils");
const Message = require("../classes/message");

/** 
 *  Viene effettuato l'invio di un messaggio, che consiste nella creazione di un'istanza della relazione messaggi
 *  @param {object} obj - Oggetto contenente i campi del messaggio
 *  @param {function} callback - Funzione di callback
*/
exports.send = function(obj, callback){
    let query = "INSERT INTO messaggi (mittente, destinatario, tipoContenuto, contenuto, dataOra, stato) VALUES (";
    let date = new Date();
    let dateString = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + (date.getHours() + 1) + ":" + date.getMinutes() + ":" + date.getSeconds();
    query += obj.senderId + ", " + obj.receiverId + ", " + obj.type + ", '" + obj.content + "', '" + dateString + "', 1)";

    db.query(query, function(err, result, fields){
        callback(err == null ? {datetime: dateString, id: result.insertId} : false);
    })
}

/** 
 *  Il path dell'allegato inviato viene aggiornato solo dopo che il file è stato salvato sul server
 *  Questo metodo permette quindi questo aggiornamento
 *  @param {number} msgId - Id del messaggio
 *  @param {string} path - Percorso dell'allegato
 *  @param {function} callback - Funzione di callback
*/
exports.setAttachment = function(msgId, path, callback){
    let query = "UPDATE messaggi SET contenuto = '" + path + "' WHERE id = " + msgId + ";";

    db.query(query, function(err, result, fields){
        callback(err == null ? path : false);
    })
}

/** 
 *  Viene ritornato l'elenco completo dei messaggi ordinati dal più recente
 *  Il campo datetime viene formattato (rimuovendo anche l'anno), mentre dataOra 
 *  viene mantenuto per effettuare l'ordinamento corretto (nel caso di anni diversi)
 *  @param {number} senderId - Id dell'utente che invia il messaggio (quello attualmente loggato)
 *  @param {number} receiverId - Id dell'utente destinatario
 *  @param {function} callback - Funzione di callback
*/
exports.all = function(senderId, receiverId, callback){
    let query = "SELECT id, mittente AS senderId, destinatario AS receiverId, tipoContenuto AS type, contenuto AS content, DATE_FORMAT(dataOra, \"%d/%m %H:%i\") AS datetime, stato AS status, dataOra FROM messaggi \
        WHERE mittente = " + senderId + " AND destinatario = " + receiverId + " \
        UNION \
        SELECT id, mittente AS senderId, destinatario AS receiverId, tipoContenuto AS type, contenuto AS content, DATE_FORMAT(dataOra, \"%d/%m %H:%i\") AS datetime, stato AS status, dataOra FROM messaggi \
        WHERE mittente = " + receiverId + " AND destinatario = " + senderId + " \
        ORDER BY dataOra ASC;";

    db.query(query, function(err, result, fields){
        if (err) throw err;

        let messages = [];

        for(let i=0; i<result.length; i++)
            messages.push(new Message(result[i]));

        callback({
            userId: senderId,
            messages: messages,
        });
    });
}

/** 
 *  Il flag relativo alla visibilità viene modificato in tutti i messaggi nella chat fra senderId e receiverId
 *  @param {number} senderId - Id dell'utente che ha inviato i messaggi (quello attualmente loggato)
 *  @param {number} receiverId - Id dell'utente che ha ricevuto i messaggi
 *  @param {function} callback - Funzione di callback
*/
exports.setRead = function(senderId, receiverId, callback){
    let query = "UPDATE messaggi SET stato = 2 WHERE mittente = " + receiverId + " AND destinatario = " + senderId + ";";

    db.query(query, function(err, result, fields){
        if (err) throw err;
        callback(result);
    });
}