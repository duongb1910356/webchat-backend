class SessionClient {
    constructor(client) {
        this.Client = client.db().collection("sessions")
    }

    // async saveSession(req){
    //     console.log(">>", this.Client)
    //     const result = await this.Client.findOneAndUpdate(
    //         req.body,
    //         {$set: {}},
    //         {returnDocument: "after", upsert: true}
    //     )
    //     return result.value;
    // }

    async saveSession(uid, username, email, photoURL, socketID, sessionID) {
        const result = await this.Client.findOneAndUpdate(
            {
                "_id": uid,
            },
            {
                $set: {
                    "_id": uid,
                    "uid": uid,
                    "username": username,
                    "email": email,
                    "photoURL": photoURL,
                    "socketID": socketID,
                    "sessionID": sessionID

                }
            },
            { returnDocument: "after", upsert: true },
        )

        return result.value;
    }

    async getSession(sessionID) {
        const result = await this.Client.findOne(
            { "sessionID": sessionID }
        )
        console.log(result)
        if (result) {
            return result
        }
        return false;
    }
}

module.exports = SessionClient