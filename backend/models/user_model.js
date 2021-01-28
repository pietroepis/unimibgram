const db = require("../utils/db");
const utils = require("../utils/utils");
const jwt = require("jsonwebtoken");
const env = require("node-env-file");
const fs = require("fs");
const User = require("../classes/user");
env("./.env");

/** 
 *  Verifica la corrispondenza di username e password inseriti
 *  In caso positivo viene generato il token, altrimenti viene ritornato false
*/
exports.login = function(obj, callback){
    let query = "SELECT * FROM utenti WHERE username = '" + obj.username + "';";

    db.query(query, function(err, result, fields){
        if (err) throw err;

        /**
         * Se lo username non esiste si interrompe l'esecuzione del metodo 
        */
        if (result.length == 0){
            callback(false);
            return;
        }

        /** 
         *  Nel campo password del database viene memorizzata la stringa password:salt
         *  Si ottiene quindi il salt per poter calcolare il digest con la password inserita dall'utente e
         *  confrontarlo con quello memorizzato
        */
        let password = result[0].password.split(":")[0];
        let salt = result[0].password.split(":")[1];

        if (utils.sha512(obj.password, salt).passwordHash != password)
            callback(false);
        else{
            callback({
                userId: result[0].id,
                token: jwt.sign({
                    userId: result[0].id,
                    exp: Math.floor(Date.now() / 1000) + (60 * 60)  //Il token ha una validità di 60 minuti
                }, process.env.JWT_KEY) //Il token contiene una firma digitale generata usando una stringa segreta, per garantire l'integrità
            });
        }
    })
}

/** 
 *  Viene aggiunta al database l'istanza relativa all'utente creato
 *  @param {obj} obj - Oggetto contenente i campi username e password
 *  @param {function} callback - Funzione di callback
*/
exports.create = function(obj, callback){
    let query = "INSERT INTO utenti(username, password) VALUES (";
    query += "'" + obj.username + "', ";

    /** 
        La generazione di un salt permette di fare in modo che due password uguali siano memorizzate in modo diverso,
        garantendo maggiore resistenza ad eventuali attacchi
    */
    let password = utils.sha512(obj.password, utils.genRandomString(16));
    query += "'" + password.passwordHash + ":" + password.salt + "')";

    /** 
        Viene ritornato false in caso di errore o di username duplicate (il campo username è UNIQUE)
    */
    db.query(query, function(err, result){
        callback(err == null ? true : false);
    });
}

/** 
 *  Vengono aggiornati i dati di un utente, identificato da obj.id
 *  @param {obj} obj - Oggetto contenente i campi da aggiornare
 *  @param {function} callback - Funzione di callback
*/
exports.update = function(obj, callback){
    let query = "UPDATE utenti SET ";
    let keys = Object.keys(obj);
    let nFields = 0;

    for(let i=0; i<keys.length; i++){
        //Tutti i campi che non siano undefined, l'immagine del profilo o l'id utente vengono aggiunti alla query per la modifica
        if (obj[keys[i]] != undefined && keys[i] != "immagineProfilo" && keys[i] != "password" && keys[i] != "id"){
            if (nFields != 0) 
                query += ","
            query += keys[i] + " = '" + obj[keys[i]] + "'";
            nFields++;
        }
    }

    if (obj["password"] != undefined){
        if (nFields != 0)
            query += ", ";

        let password = utils.sha512(obj["password"], utils.genRandomString(16));
        query += "password = '" + password.passwordHash + ":" + password.salt + "'";

        nFields++;
    }

    /** 
     *  Se l'utente vuole modificare l'immagine profilo, il campo viene aggiunto alla query
     *  Le immagini di un utente vengono rinominate come user_idUtente
    */
    if (obj["immagineProfilo"] != undefined){
        if (nFields != 0)
            query += ", ";
        
        query += "immagineProfilo = 'user_" + obj.id + ".png'";
    }

    query += " WHERE id = " + obj.id;

    db.query(query, function(err, result, fields){
        if (err) throw err;

        if (obj.immagineProfilo != undefined){
            //Viene rimossa l'intestazione relativa al formato dalla codifica base64
            var base64Data = obj.immagineProfilo.replace(/^data:image\/png;base64,/, "");

            //Se l'immagine non esiste viene creata, altrimenti sovrascritta
            fs.writeFile("users_imgs/user_" + obj.id + ".png", base64Data, "base64", function(fileErr) {
                callback((fileErr == null && err == null) ? true : false);
            });
        } else
            callback(err == null ? true : false);
    });
}

/** 
 *  Viene selezionato un utente in base all'id, gestendo la visibilità delle informazioni in base all'utente che
 *  ha effettuato la richiesta e al campo privacy
 *  @param {number} userId - Id dell'utente loggato
 *  @param {number} receiverId - Id dell'utente destinatario cercato
 *  @param {function} callback - Funzione di callback
*/
exports.getUserById = function(userId, receiverId, callback){
    /** 
        Nel caso in cui avvenga il match della route user/:id con l'url user/status vengono semplicemente ritornati
        i dati dell'utente corrente
    */
    if(receiverId == "status") {
        let query = "SELECT id, username, descrizione, telefono, privacy FROM utenti\
        WHERE id = " + userId;
        db.query(query, function(err, result, fields){
            if (err) throw err;
            result.length != 0 ? callback(new User(result[0])) : callback(false);
        });
    } else {
        let query = "SELECT id, username, telefono, immagineProfilo, descrizione, privacy FROM utenti WHERE id = " + receiverId + ";";

        db.query(query, function(err, result, fields){
            if (err) throw err;

            /** 
             *  privacy = 1 significa che la visione delle informazioni di un utente è consentita solo ai suoi contatti
             *  Per contatto è stata assunta la relazione reciproca
            */
            if (result[0].privacy == 1){
                let queryCheck = "(SELECT * FROM rubrica WHERE utente1 = " + userId + " AND utente2 = " + receiverId + ") \
                    UNION \
                    (SELECT * FROM rubrica WHERE utente1 = " + receiverId + " AND utente2 = " + userId + ")";

                db.query(queryCheck, function(err, resultCheck, fields){
                    if (err) throw err;
                    
                    result[0].visible = (resultCheck.length == 2 ? true : false);

                    callback(new User(result[0]));
                });
            } else{
                /** 
                 *  privacy = 0 significa che nessuno può visualizzare le informazioni
                 *  privacy = 2 significa che tutti possono visualizzare le informazioni
                */
                result[0].visible = (result[0].privacy == 0 ? false : true);
                result.length != 0 ? callback(new User(result[0])) : callback(false);
            }
        })
    }
}

/** 
 *  Viene selezionato l'utente in base al suo username o un sottosequenza dei caratteri di esso
 *  @param {number} currentUser - Id dell'utente loggato
 *  @param {string} username - Sottosequenza da cercare fra gli username
 *  @param {function} callback - Funzione di callback
*/
exports.getUserByUsername = function(currentUser, username, callback){
    let query = "(SELECT id, username, telefono, immagineProfilo, descrizione, privacy FROM utenti\
        WHERE username LIKE '%" + username + "%' AND id <> " + currentUser + ")\
        EXCEPT \
        (SELECT utenti.id, username, telefono, immagineProfilo, descrizione, privacy FROM utenti INNER JOIN rubrica \
        ON rubrica.utente2 = utenti.id WHERE utente1 = " + currentUser + ");";

    db.query(query, function(err, result, fields){
        if (err) throw err;

        let users = [];
        for(let i=0; i<result.length; i++)
            users.push(new User(result[i]));

        result.length != 0 ? callback(users) : callback(false);
    })
}
