const db = require("../utils/db");
const utils = require("../utils/utils");

/** 
 *  Viene aggiunta un'istanza alla relazione rubrica, che indica la presenza dell'utente2 nella rubrica di utente1
 *  @param {number} user1 - Primo utente della relazione
 *  @param {number} user2 - Secondo utente della relazione
 *  @param {function} callback - Funzione di callback
*/
exports.add = function(user1, user2, callback){
    let query = "INSERT INTO rubrica (utente1, utente2) VALUES (";
    query += user1 + ", " + user2 + ");";

    db.query(query, function(err, result, fields){
        callback(err == null ? true : false);
    })
}

/** 
 *  Viene rimossa un'istanza alla relazione rubrica
 *  @param {number} user1 - Primo utente della relazione
 *  @param {number} user2 - Secondo utente della relazione
 *  @param {function} callback - Funzione di callbacks
*/
exports.remove = function(user1, user2, callback){
    let query = "DELETE FROM rubrica WHERE utente1 = " + user1 + " AND utente2 = " + user2;

    db.query(query, function(err, result, fields){
        callback(err == null ? true : false);
    })
}

/** 
 *  Vengono selezionati tutti gli utenti presenti nella rubrica dell'utente corrente
 *  Si aggiungono inoltre informazioni riguardanti l'ultimo messaggio scambiato (per poter effettuare l'ordinamento
 *  in base al più recente), il numero di messaggi non letti e la visibilità
 *  @param {number} userId - Id dell'utente loggato
 *  @param {function} callback - Funzione di callback
*/
exports.all = function(userId, callback){
    let query = "SELECT utenti.id, username, telefono, immagineProfilo, descrizione, privacy,\
    (SELECT count(*) FROM rubrica WHERE (utente1 = " + userId +" AND utente2 = utenti.id) OR (utente1 = utenti.id AND utente2 = " + userId +")) AS visible,\
    (SELECT count(*) FROM messaggi WHERE (mittente = utenti.id AND destinatario = " + userId + " AND messaggi.stato <> 2)) AS toRead,\
    (SELECT max(dataOra) FROM messaggi WHERE (mittente = utenti.id AND destinatario = " + userId +") OR (mittente = " + userId +" AND destinatario = utenti.id)) AS lastMessage\
    FROM utenti INNER JOIN rubrica AS r ON r.utente2 = utenti.id WHERE r.utente1 =" + userId +"\
    ORDER BY lastMessage DESC;";

    db.query(query, function(err, result, fields){
        callback(result);
    });
}