/** 
 * Quando la pagina di ingresso dell'applicazione (index.ejs) termina il suo caricamento, si controlla se il token è 
 * presente nel localStorage. Se il controllo è positivo, si prova a mandare direttamente l'utente alla pagina della chat 
 * (se poi il token fosse scaduto ci sarebbe comunque un redirect al login), altrimenti si carica la pagina del login 
 * da subito.
*/
$(document).ready(function(){
    if (localStorage.getItem("token") != null && localStorage.getItem("token") != undefined)
        loadPage("chat", initPageChat);
    else
        loadPage("login", initPageLogin);
});

/** 
 * L'applicazione è stata gestita come SPA (Single Page Application) e l'unica pagina è index.ejs. Il contenuto della pagina 
 * viene poi gestito dal metodo loadPage, che si occupa di richiedere contenuto html ed includerlo nel corpo di index.ejs.
 * @param {string} page - contiene l'url del servizio
 * @param {function} callback - funzione di callback
 */
var loadPage = function(page, callback){
    api.request({
        service: page,
        dataType: "html",
        callback: function(content){
            $("body").html(content);
            
            if (callback != undefined && content != false)
                callback();
        }
    });
}

/** 
 * Inizializza un popup con il messaggio msg, lo visualizza e infine esegue il metodo di callback (se definito)
 * @param {string} msg - contiene il messaggio da visualizzare nel popup
 * @param {function} callback - funzione di callback
 */
var showInfo = function(msg, callback){
    $("#info-popup #info").html(msg);
    $("#info-popup").modal("show");

    if (callback != undefined)
        callback();
}

/** 
 * Chiude il popup
*/
var closeInfo = function(){
    $("#info-popup").modal("hide");
}