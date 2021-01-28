/** 
 *  Modello dati che rappresenta la relazione utente nel database
 *  Il campo visible non ha una corrispondenza diretta con un campo presente nel database,
 *  ma viene creato dinamicamente tramite query
 *  @class
*/
module.exports = class User{
    constructor({id, username, password, telefono, immagineProfilo, descrizione, privacy, visible}){
        this.id = id;
        this.username = username;
        this.password = password;
        this.telefono = telefono;
        this.immagineProfilo = immagineProfilo;
        this.descrizione = descrizione;
        this.privacy = privacy;
        this.visible = visible;
    }
}