/**
 * ID dell'utente con cui si sta attualmente messaggiando 
 * @global
*/
var CURRENT_CHAT_ID;

/** 
 *  initPageChat si occupa di definire tutti gli event listeners relativi alla pagina principale dell'applicazione, 
 *  una volta che questa è stata inclusa
*/
var initPageChat = function(){
    showRubrica();

    /** 
     *  - Viene inviata una richiesta di connessione al socket in ascolto sul gateway
     *  - Si invia un messaggio con label "registration", perché questo utente possa essere aggiunto all'elenco degli utenti 
     *  attivi
     *  - Viene definito un event listener per messaggi in arrivo con label "new-message"
     */
    var socket = io.connect("http://192.168.1.42:2000");
    socket.emit("registration", localStorage.getItem("userId"));
    socket.on("new-message", function(message){
        if(CURRENT_CHAT_ID != undefined) {
            /** 
             *  Quando si riceve un messaggio, se questo è relativo alla chat attualmente selezionata si aggiorna l'elenco 
             *  dei messaggi, si richiede la classificazione dei messaggi della chat come "letti" e infine si aggiorna 
             *  la sezione della rubrica (per l'indicatore di notifica)
             *  Se invece il messaggio è di un'altra chat, si aggiornano solo gli indicatori di notifica (showRubrica)
            */
            if (message.senderId == CURRENT_CHAT_ID) {
                showMessages();
                setRead();
                showRubrica();
            } else {
                showRubrica();
            }
        } else {
            showRubrica();
        }
       
    });

    $(".btn-add-contact").on("click", function(){
        initPopup($("#add-contact-popup"));
        $("#add-contact-popup").modal("show");
    });

    $("#user-btn").on("click", function(){
        getUserStatus();
    });

    $("#btn-save-profile").on("click", function(){
        updateProfile();
    });

    $(".btn-remove-contact").on("click", function(){
        removeFromRubrica(CURRENT_CHAT_ID);
    });

    $("#add-contact-popup input").keyup(function(){
        if ($(this).val() == "") return;
        usersSearch($(this).val());
    });

    $("#logout-btn").on("click", function(){
        //Si elimina il token dal Local Storage, in modo che le sessioni successive, non trovandolo, richiedano il login
        localStorage.removeItem("token");
        window.location.reload();
    });

    $(".btn-send-msg").on("click", function(){
        sendMessage();
    });

    $(".btn-refresh-chat").on("click", function(){
        showMessages();
        setRead();
    });

    $("#txt-message").keyup(function(){
        if ($(this).val() != ""){
            $("#box-chat .btn-send-msg").show();
            $("#box-chat .btn-send-attach").hide();
        } else{
            $("#box-chat .btn-send-msg").hide();
            $("#box-chat .btn-send-attach").show();
        }
    });

    $("#box-chat .btn-send-attach").on("click", function(){
        sendAttach();
    });

    $(".profile-image button").on("click", function(){
        $("#profile-image-input").trigger("click");
        //Evento sollevato quando viene selezionato un file in un input[type=file]
        $("#profile-image-input").off("change").on("change", function(){
            $(".profile-image input[type=text]").val(document.querySelector("#profile-image-input").files[0].name);
        });
    });
}

/**
 * Per fare in modo che un popup non contenga valori utilizzati precedentemente
 * @param {HTMLElement} popup - elemento del DOM che rappresenta un popup
 */
 var initPopup = function(popup){
    popup.find("input").val("");
}

/**
 * Invia un messaggio di testo all'utente definito da CURRENT_CHAT_ID
 */
var sendMessage = function(){
    //Se non è stata selezionata una chat o se si sta provando ad inviare un messaggio vuoto, il metodo termina
    if (CURRENT_CHAT_ID == undefined || $("#txt-message").val().trim() == "") return;

    api.request({
        service: "api/message/send",
        method: "POST",
        postParams: {
            receiverId: CURRENT_CHAT_ID,
            userId: localStorage.getItem("userId"),
            type: 0, //text message
            content: $("#txt-message").val()
            /** 
             *  è stato omesso il parametro relativo al timestamp richiesto nella traccia, in quanto si è ritenuto più  
             *  opportuno utilizzare l'orario del server    
            */
        },
        callback: function(data){
            if (data !== false){
                showMessages();
                $("#txt-message").val("");
                $("#box-chat .btn-send-msg").hide();
                $("#box-chat .btn-send-attach").show();
                showRubrica();
            }
        }
    })
}

/** 
 *  Per ragioni grafiche si è preferito nascondere l'input[type=file] e simulare il click su di esso
 *  Quando il file viene selezionato, si ottiene la sua codifica in Base64, che viene poi inviata nel campo raw
 *  Il message type non viene passato, in quanto per una questione di maggiore controllo, il servizio 
 *  api/message/send-attachment si occupa di valorizzarlo come messaggio di tipo multimedia.
*/
var sendAttach = function(){
    $("#file-input").trigger("click");
    $("#file-input").off("change").on("change", function(){
        showInfo("Invio in corso...");
        getBase64(document.querySelector("#file-input").files[0], function(base64){
            api.request({
                service: "api/message/send-attachment",
                method: "POST",
                postParams: {
                    receiverId: CURRENT_CHAT_ID,
                    userId: localStorage.getItem("userId"),
                    raw: base64
                },
                callback: function(result){
                    if (result.success){
                        closeInfo();
                        showMessages();
                        showRubrica();
                    } else
                        showInfo("Si è verificato un errore durante l'invio dell'allegato");
                }
            });
        })
    });
}

/** 
 *  Viene inviata al servizio la stringa attualmente inserita dall'utente, includendo poi nella sezione .search-result del 
 *  popup l'elenco di utenti corrispondenti alla ricerca effettuata, ritornati dal servizio (dataType: "html")
 */
var usersSearch = function(username){
    api.request({
        service: "includes/users-search-result",
        method: "POST",
        postParams: {username: username},
        dataType: "html",
        callback: function(results){
            $("#add-contact-popup .search-results").html(results);

            $("#add-contact-popup .search-results .add-btn").on("click", function(){
                addToRubrica($(this).attr("data-id"));
            });
        }
    });
}

/** 
 *  Richiede l'esecuzione del servizio api/rubrica/add, che aggiunge l'utente corrispondente all'id selezionato alla rubrica
 *  Non è necessario passare l'id dell'utente attualmente loggato, in quanto è già incluso nel token JWT
 * @param {number} id - Contiene l'id dell'utente da inserire nella rubrica
 */
var addToRubrica = function(id){
    api.request({
        service: "api/rubrica/add",
        method: "POST",
        postParams: {addUserId: id},
        dataType: "json",
        callback: function(data){
            if (data != false){
                showRubrica();
                $("#add-contact-popup").modal("hide");
            }
        }
    });
}

/** 
 * Richiede l'esecuzione del servizio api/rubrica/remove, che rimuove l'utente corrispondente all'id selezionato dalla rubrica
 * Non è necessario passare l'id dell'utente attualmente loggato, in quanto è già incluso nel token JWT   
 * @param {number} id - Contiene l'id dell'utente da rimuovere dalla rubrica 
 */
var removeFromRubrica = function(id){
    api.request({
        service: "api/rubrica/remove/" + id,
        method: "GET",
        postParams: {removeUserId: id},
        dataType: "json",
        callback: function(data){
            if (data != false){
                showRubrica();
                $("#box-info .box-content").html("");
                $("#box-info .btn-remove-contact").hide();
            }
        }
    });
}

/** 
 * Viene inclusa la sezione della pagina corrispondente alla rubrica
 * Il callback si occupa di aggiungere gli event listener relativi a questa sezione. In particolare quando viene rilevato 
 * un click sulla card di un utente, vengono visualizzate le sue informazioni e la sua chat, azzerato e nascosto 
 * l'indicatore di notifica e visualizzata la barra di scrittura del messaggio.
 * Inoltre si seleziona la card dell'utente con cui si stava messaggiando prima dell'esecuzione di showRubrica.
*/
var showRubrica = function(){
    api.request({
        service: "includes/rubrica",
        method: "GET",
        dataType: "html",
        callback: function(results){
            $("#box-contacts .box-content .wrapper").html(results);

            if(CURRENT_CHAT_ID != undefined) {
                $("#box-contacts .user-card[data-id=" + CURRENT_CHAT_ID + "]").addClass("selected");
            }

            $("#box-contacts .user-card").on("click", function(){
                CURRENT_CHAT_ID = $(this).attr("data-id");
                $("#notification-user-"+CURRENT_CHAT_ID+ " span").text(0);
                $("#notification-user-"+CURRENT_CHAT_ID).hide();
                $("#box-chat .btn-refresh-chat, #box-chat .box-bottom").css("visibility", "visible");
                showUserDetail();
                showMessages();
                setRead();
            });
        }
    });
}

/** 
 * Viene inclusa nella pagina la sezione relativa alla chat, ovvero l'elenco di messaggi con l'utente attualmente selezionato.
 * Il callback si occupa di portare lo scroll del box all'ultimo messaggio
*/
var showMessages = function(){
    api.request({
        service: "includes/chat",
        method: "POST",
        postParams: {
            receiverId: CURRENT_CHAT_ID
        },
        dataType: "html",
        callback: function(results){
            $("#msg-list .wrapper").html(results);
            $("#msg-list").scrollTop($("#msg-list .wrapper").innerHeight())
        }
    });
}

/** 
 * Il flag relativo a tutti i messaggi ricevuti dall'utente selezionato (CURRENT_CHAT_ID) viene impostato sullo stato
 * "letto"
*/
var setRead = function(){
    api.request({
        service: "api/message/set-read",
        method: "POST",
        postParams: {
            receiverId: CURRENT_CHAT_ID
        },
        callback: function(data){}
    });
}

/** 
 * Viene inclusa nella pagina la sezione relativa alle informazioni dell'utente con cui si sta messaggiando (username, foto, 
 * telefono, descrizione)
 * Il callback si occupa di cambiare la card dell'utente selezionato e di visualizzare il codice html ritornato dal servizio
*/
var showUserDetail = function(){
    api.request({
        service: "includes/user-detail/" + CURRENT_CHAT_ID,
        method: "GET",
        dataType: "html",
        callback: function(results){
            $("#box-contacts .user-card.selected").removeClass("selected");
            $("#box-contacts .user-card[data-id=" + CURRENT_CHAT_ID + "]").addClass("selected");
            $("#box-info .box-content").html(results);
            $("#box-info .btn-remove-contact").show();
        }
    });
}

/** 
 * Il servizio api/user/status ritorna le informazioni relative all'utente attualmente loggato. Non viene passato l'id, in 
 * quanto già presente nel token JWT. 
 * Le informazioni ottenute vengono utilizzate per inizializzare i campi del popup di aggiornamento dei dati.
*/
var getUserStatus = function(){
    api.request({
        service: "api/user/status",
        method: "GET",
        callback: function(data){
            initPopup($("#user-profile-popup"));
            $("#user-profile-popup").modal("show");
            $("#username").val(data.username);
            $("#descrizione").val(data.descrizione);
            $("#telefono").val(data.telefono);
            $("#privacy").val(data.privacy);
        }
    });
}

/** 
 * Viene effettuato l'aggiornamento dei dati del profilo utente, prelevando i valori dai campi di input del popup
 * Se è stata selezionata un'immagine profilo, si ottiene la corrispondente codifica Base64 e viene aggiunta all'oggetto 
 * inviato al servizio
*/
var updateProfile = function(){
    if ($("#password").val() != $("#passwordConfirm").val()) return;

    let postObj = {
        username: $("#username").val().trim() != "" ? $("#username").val() : undefined,
        password: $("#password").val().trim() != "" ? $("#password").val() : undefined,
        telefono: $("#telefono").val().trim() != "" ? $("#telefono").val() : undefined,
        descrizione: $("#descrizione").val().trim() != "" ? $("#descrizione").val() : undefined,
        privacy: $("#privacy").val()
    };

    showInfo("Salvataggio in corso...");

    if (document.querySelector("#profile-image-input").files[0] != undefined){
        getBase64(document.querySelector("#profile-image-input").files[0], function(base64){
            postObj.immagineProfilo = base64;
            api.request({
                service: "api/user/update",
                method: "POST",
                postParams: postObj,
                callback: function(data){
                    if (data.success){
                        $("#user-profile-popup").modal("hide");
                        showInfo("Profilo aggiornato con successo");
                    } else
                        showInfo("Si è verificato un errore durante il salvataggio");
                }
            });
        });
    } else
        api.request({
            service: "api/user/update",
            method: "POST",
            postParams: postObj,
            callback: function(data){
                if (data.success){
                    $("#user-profile-popup").modal("hide");
                    showInfo("Profilo aggiornato con successo");
                } else
                    showInfo("Si è verificato un errore durante il salvataggio");
            }
        });
}