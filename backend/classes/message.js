/** 
 *  Modello dati che rappresenta la relazione messaggio nel database
 *  @class
*/
module.exports = class Message{
    constructor({id, senderId, receiverId, type, content, datetime, status}){
        this.id = id;
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.type = type;
        this.content = content;
        this.datetime = datetime;
        this.status = status;
    }
}