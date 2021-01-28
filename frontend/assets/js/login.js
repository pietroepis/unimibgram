/** 
 * initPageLogin si occupa di definire tutti gli event listeners relativi alla pagina di login, una volta che questa 
 * è stata inclusa
*/
var initPageLogin = function(){
    //Gestione dello switch tra campi di login e campi di registrazione
    $("#switch > div").on("click", function(){
        if ($(this).hasClass("current")) return;
        $("#switch > div").toggleClass("current");
        $(".login-panel [id$=section]").toggle();
    });

    /** 
     * Viene effettuato il login. Se username e password sono stringhe vuote non si effettua nemmeno la chiamata al backend,
     * altrimenti si chiama il servizio api/user/login con i parametri inseriti dall'utente.
     * Se non si verifica nessun errore, vengono salvati l'id dell'utente e il token JWT nel Local Storage, per poi passare 
     * alla pagina chat
    */
    $("#btnAccedi").on("click", function(){
        if (!$("#txtLoginUsername").val() || !$("#txtLoginPassword").val())
            return;

        api.request({
            service: "api/user/login",
            method: "post",
            auth: false,
            postParams: {
                username: $("#txtLoginUsername").val().trim(),
                password: $("#txtLoginPassword").val().trim()
            },
            callback: function(data){
                if (data != false){
                    localStorage.setItem("userId", data.userId);
                    localStorage.setItem("token", data.token);
                    loadPage("chat", initPageChat);
                }
            }
        })
    });

    /** 
     * Viene effettuata la registrazione. Se username e password sono stringhe vuote, oppure se la password e la conferma 
     * della password non corrispondono, non si effettua nemmeno la chiamata al backend, altrimenti si chiama il servizio 
     * api/user/create con i parametri inseriti dall'utente.
     * Se non si verifica nessun errore, viene mostrata la sezione di login
    */
    $("#btnSignup").on("click", function(){
        if (!$("#txtSignupUsername").val() || !$("#txtSignupPassword").val() || $("#txtSignupPassword").val() != $("#txtSignupPasswordConfirm").val())
            return;

        api.request({
            service: "api/user/create",
            method: "post",
            auth: false,
            postParams: {
                username: $("#txtSignupUsername").val().trim(),
                password: $("#txtSignupPassword").val().trim()
            },
            callback: function(data){
                if (!data.success)
                    showInfo("Si è verificato un errore");
                else
                    showInfo("Registrazione effettuata con successo", function(){
                       setTimeout(function(){
                            $("#switch div:first").trigger("click");
                            closeInfo();
                       }, 2000);
                    })
            }
        })
    });
}