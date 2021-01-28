const mysql = require("mysql");
const env = require("node-env-file");
env("./.env");

/** 
 *  Viene creata una pool di connessioni pronte per essere assegnate ad un thread ed utilizzate contemporaneamente,
 *  stabilendo il limite a 10 connessioni
*/
module.exports = mysql.createPool({
  connectionLimit: 10,
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB
});