const express = require("express");
const app = express();
const http = require("http").createServer(app);
const bodyParser = require("body-parser");
const router = require("./router");
const cors = require("cors");
const env = require("node-env-file");
const socket = require("./utils/socket");
env("./.env");

app.set("port", 2000);
/** 
 *  Il modulo body-parser permette la conversione automatica del body di tutte le richieste di tipo POST in
 *  un oggetto, reso disponibile con la proprietà req.body
*/
app.use(bodyParser.json());
/** 
 *  Il parametro limit imposta la dimensione massima del body di una richiesta, di conseguenza anche il limite di
 *  dimensione dei media che vengono trasmessi
*/
app.use(bodyParser.urlencoded({extended: true, limit: "50mb"}));

/** 
 *  Il modulo cors si occupa di aggiungere alla risposta gli header relativi al Cross-Origin Resource Sharing
 *  Questo permette di informare il browser che il dominio corrente è autorizzato ad accedere a risorse provenienti da
 *  un altro dominio.
*/
app.use(cors())

//Router initialization
router.init(app);

//Socket initialization
socket.init(http);

//Server initialization
http.listen(app.get("port"), function(){
    console.log("Server started on port " + app.get("port"));
});