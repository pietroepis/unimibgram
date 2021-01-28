const express = require("express");
const app = express();
const http = require("http").createServer(app);
const bodyParser = require("body-parser");
const path = require("path");
const router = require("./router");

app.set("port", 2001);
/** 
 *   Vengono definite le directory le cui risorse devono essere restituite in modo statico, senza essere processate
*/
app.use("/attachments", express.static(path.join(__dirname, "attachments")));
app.use("/users_imgs", express.static(path.join(__dirname, "users_imgs")));

/** 
 *  Il modulo body-parser permette la conversione automatica del body di tutte le richieste di tipo POST in
 *  un oggetto, reso disponibile con la proprietà req.body
*/
app.use(bodyParser.json({limit: '50mb'}));
/** 
 *  Il parametro limit imposta la dimensione massima del body di una richiesta, di conseguenza anche il limite di
 *  dimensione dei media che vengono trasmessi
*/
app.use(bodyParser.urlencoded({extended: true, limit: "50mb"}));

//Router initialization
router.init(app);

//Server initialization
http.listen(app.get("port"), function(){
    console.log("Server started on port " + app.get("port"));
});