const MongoDB = require("../util/mongodb");
const SessionClient = require("../../service/sessions");

exports.saveSession = async (req, res) => {
    try {
        const sessionService = new SessionClient(MongoDB.client);
        const result = await sessionService.saveSession(req)
        return res.send(result);
    } catch (error) {
        return res.send(error)
        console.log(error);
    }
}

exports.getSession = async (req, res) => {
    try {
        const sessionService = new SessionClient(MongoDB.client);
        const result = await sessionService.getSession(req.query.sessionID);
        if(result != false){
            return res.send(result);
        }
        return res.send("Not found")
        // console.log("sdgdsg")
    } catch (error) {
        return res.send(error)
        console.log(error);
    }
}