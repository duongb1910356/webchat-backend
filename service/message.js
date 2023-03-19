class MessageClient {
    constructor(client) {
        this.Message = client.db().collection("messages")
    }

    async saveMessage(id, content, from, date, userSend, userRecieve, type) {
        const result = await this.Message.findOneAndUpdate(
            {
                "_id": id,
            },
            {

                $push: {
                    "messages": {
                        "content": content,
                        "from": from,
                        "date": date,
                        "userSend": userSend,
                        "userRecieve": userRecieve,
                        "type": type
                    }
                }

            },
            { returnDocument: "after", upsert: true },
        )

        return result.value;
    }

    async getMessage(id) {
        const result = await this.Message.findOne(
            {
                "_id": id,
            }
        )
        // console.log("get message ", result)
        return result;
    }

}

module.exports = MessageClient