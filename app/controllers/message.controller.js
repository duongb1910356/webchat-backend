const MongoDB = require("../util/mongodb");
const SessionClient = require("../../service/sessions");
const MessageClient = require("../../service/message");

exports.getMessage = async (req, res) => {
    try {
        const messageService = new MessageClient(MongoDB.client);
        const result = await messageService.getMessage(req.query.id);
        if(result != false){
            return res.send(result);
        }
        return res.send(req.query.id)
        // console.log("sdgdsg")
    } catch (error) {
        return res.send(error)
        console.log(error);
    }
}