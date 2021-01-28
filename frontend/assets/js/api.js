/** 
 * Wrapper che permette di gestire comodamente tutte le chiamate HTTP remote. I parametri hanno il seguente significato:
 * @param {object} service - URI del servizio richiesto (viene concatenato con l'url base)
 * @param {boolean} auth - indica se la chiamata deve essere autenticata, ovvero se il token JWT deve essere incluso nell'header della richiesta
 * @param {string} method - indica se la chiamata è tipo GET, POST, DELETE, ecc.
 * @param {object} postParams - nel caso in cui il metodo sia POST, i parametri da inserire nel body della richiesta
 * @param {boolean} async - se true, il risultato della chiamata (effettuata in modo asincrono), viene restituio al chiamante sotto forma di 
 *          parametro della funzione di callback. Altrimenti la chiamata viene effettuata in modo sincrono e il risultato
 *          restituito come valore di ritorno della funzione request.
 * @param {string} dataType - tipologia di dati di ritorno attesi, il default è json, nel caso di include di contenuto html invece verrà 
 *          passato dataType = "html"
 * @param {function} callback - metodo eseguito passando come parametro la risposta del servizio, se la chiamata va a buon fine, false in caso 
 *          contrario
*/
var api = {
    BASE_URL_GATEWAY: "http://192.168.1.42:2000/",
    BASE_URL_VIEWS: "http://192.168.1.42:2002/",

    request: async function({service, auth = true, method = "GET", async = true, postParams = {}, dataType = "json", callback = (data)=>{}}){
        if (service.trim() == "" || (method.toUpperCase() != "GET" && method.toUpperCase() != "POST"))
            return false;

        var result;
        var bearerFunc = auth ? function (xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
        } : ()=>{};

        var url = (dataType == "html" ? this.BASE_URL_VIEWS + service : this.BASE_URL_GATEWAY + service);

        $.ajax({
            type: method.toUpperCase(),
            url: url,
            data: method.toUpperCase() == "POST" ? postParams : "",
            dataType: dataType,
            async: async,
            beforeSend: bearerFunc,
            success: function(data){
                result = data;
                callback(data);
            },
            error: function(err){
                if (err.status == 401){
                    console.log(err)
                    let message;
                    if (err.responseJSON != undefined)
                        message = err.responseJSON.message;
                    else
                        if (err.responseText != undefined)
                            message = JSON.parse(err.responseText).message;

                    if (message != undefined && message == "Token Expired")
                        loadPage("login", function(){
                            initPageLogin();
                            localStorage.removeItem("token");
                            showInfo("Sessione scaduta");
                        });
                    else if (message != undefined && message == "Invalid Username or Password")
                        showInfo("Credenziali non valide");
                }

                callback(false);
            }
        });

        if (!async)
            return result;
    }
}