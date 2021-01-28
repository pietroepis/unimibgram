/**
 * Compone una stringa rappresentante una data, utilizzando il formato GG/MM HH:mm
 * @param {string} date - contiene la data da formattare
 * @returns {string}
 */
var formatMessageDate = function(date){
    let d = new Date(date);
    return  d.getDate() + "/" + (d.getMonth() + 1) + " " + (d.getHours() + 1) + ":" + d.getMinutes();
}

/**
 * Legge dal disco il contenuto di un file e lo ritorna in codifica Base64, passando la stringa risultato al metodo 
 * di callback.
 * @param {string} file - contiene il nome del file da convertire in base64
 * @param {function} callback - funzione di callback
*/
var getBase64 = function(file, callback){
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function(){
        callback(reader.result);
    };
    reader.onerror = function (error) {
        return false;
    };
}