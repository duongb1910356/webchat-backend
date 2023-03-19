class Message {
    constructor(){
        this.messages = new Map()
    }

    saveMessage(id, messages){
        const previous = this.messages.get(id);
        if(previous){
            this.messages.set(id, [...previous, messages]);
        }else{
            this.messages.set(id, [messages]);
        }
        console.log(this.messages)
    }

    findMessage(id){
        return this.messages.get(id);
    }
}

module.exports = Message