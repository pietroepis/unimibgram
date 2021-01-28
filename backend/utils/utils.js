const crypto = require("crypto");

/** 
 *  Genera una stringa casuale di length caratteri
 *  @param {number} length - Lunghezza della stringa casuale da generare
 *  @returns {string} - Stringa generata
*/
exports.genRandomString = function(length){
    return crypto.randomBytes(Math.ceil(length/2))
            .toString("hex") 
            .slice(0, length);
};

/** 
 *  Viene generato il digest della concatenazione di password e salt
 *  Il valore di ritorno è un oggetto contenente l'hash generato e il salt utilizzato
 *  @param {string} password - Password in chiaro
 *  @param {string} salt - Salt casuale
 *  @returns {object} - Oggetto contenente l'hash digest della password generato e il salt utilizzato
*/
exports.sha512 = function(password, salt){
    var hash = crypto.createHmac("sha512", salt); 
    hash.update(password);
    var value = hash.digest("hex");
    return {
        salt:salt,
        passwordHash:value
    };
};

/** 
 *  Estrae il mime type dalla codifica base64 di un media
 *  Gli unici tipi accettati sono file pdf, immagini png e video mp4
 *  @param {string} base64 - Codifica in base64 di un file
 *  @returns {string} - MIME Type estratto
*/
exports.getMIMEType = function(base64){
    var extensions = [];
    console.log(base64.substr(0, 100))
    extensions["JVBERi0"] = "application/pdf";
    extensions["iVBORw0KGgo"] = "image/png";

    var keys = Object.keys(extensions)

    for (var i=0; i<keys.length; i++) 
        if (base64.indexOf(keys[i]) === 0) 
            return extensions[keys[i]];
    
    /**
     * Se il tipo non è nessuno dei precedenti, si tratta sicuramente di un video 
    */    
    return "video/mp4";
}