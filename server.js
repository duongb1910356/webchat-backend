const app = require("./app");
const MongoDB = require("./app/util/mongodb");
const SessionClient = require("./service/sessions");
const MessageClient = require("./service/message");
// const server = http.createServer(app);
const { Server, Socket } = require("socket.io");

const crypto = require("crypto");
const randomId = () => crypto.randomBytes(8).toString("hex");
const config = {
    port: process.env.PORT || 3001,
    db: "mongodb://127.0.0.1:27017/webchat"
}

const models = require("./models/index");
const User = require("./models/user");
const Friend = require("./models/friend")
const Post = require("./models/post");
const user = require("./models/user");
const Message = require("./socket/MessageStore.socket");
const PORT = config.port;

async function startServer() {
    try {
        console.log(config.db);
        await MongoDB.connect(config.db);
        console.log("Connect database success!");
        // const user = await models.User.findOne({where: {email: "tranquocduong1@gmail.com"}})
        // console.log("user>>> ",user);
        app.listen(PORT, () => {
            console.log(`Listen on ${PORT}`);
        })
    } catch (error) {
        console.log("Connect database failed");
        process.exit()
    }
}

startServer()

const io = new Server(app, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        // allowedHeaders: ['my-custom-header'],
        credentials: true
    }
})


class SessionStore {
    constructor() {
        this.sessions = new Map();
    }

    saveSession(id, session) {
        this.sessions.set(id, session);
    }

    findSession(id) {
        return this.sessions.get(id);
    }

    findSessionByEmail(email) {
        for (var [key, value] of this.sessions) {
            if (value.email == email) {
                return key;
            }
        }
        return false;
    }
}

const messageStore = new Message();
const sessionStore = new SessionStore();



io.use(async (socket, next) => {
    const sessionID = socket.handshake.auth.sessionID;
    const service = new SessionClient(MongoDB.client);

    if (sessionID) {
        let session = sessionStore.findSession(sessionID);
        if (!session) {
            session = await service.getSession(sessionID);
            if (!session)
                return next()
        }
        socket.sessionID = sessionID;
        socket.id = session.socketID;
        socket.uid = session.uid;
        socket.email = session.email;
        socket.username = session.username;
        socket.photoURL = session.photoURL;
        return next()
    }

    const email = socket.handshake.auth.email;
    const username = socket.handshake.auth.username;
    const photoURL = socket.handshake.auth.photoURL;
    const uid = socket.handshake.auth.uid;

    socket.id = uid;
    socket.email = email;
    socket.username = username;
    socket.photoURL = photoURL;
    socket.uid = uid;
    socket.sessionID = uid;
    const result = await service.saveSession(socket.uid, socket.username, socket.email, socket.photoURL, socket.id, socket.sessionID)

    const update = await models.User.findOne({
        where: { uid: socket.uid }
    })
    if (update) {
        update.socketID = socket.id;
        update.save()
    }
    next();
});

io.on('connection', async (socket) => {
    const serviceMessage = new MessageClient(MongoDB.client);
    const users = {}
    console.log("A user connect");
    console.log("User is > ", socket.usernmae, ", socketID > ", socket.id)
    sessionStore.saveSession(socket.sessionID, {
        socketID: socket.id,
        uid: socket.uid,
        email: socket.email,
        username: socket.username,
        photoURL: socket.photoURL
    })

    const listmessage = await new Map()
    // await listmessage.set('a',"abc")
    for (const key of messageStore.messages.keys()) {
        console.log("keys ", key)
        const pattern = ".*" + socket.uid + ".*";
        const regx = new RegExp(pattern);
        console.log("regx ", regx)
        const match = regx.test(key);
        if (match) {
            await listmessage.set(key, messageStore.findMessage(key))
        }
        console.log(">>>>> ", listmessage)
    }

    socket.emit("fetch message", {
        listmessage: Array.from(listmessage)
    })

    // console.log("socket.sessionID >>", sessionStore.sessions);
    socket.emit("session", {
        sessionID: socket.sessionID,
        id: socket.id,
    })

    socket.on("agreeMakeFriend", async ({ wanter, self }) => {
        // const userSend = sessionStore.findSession(socket.sessionID);
        // const newfriend = await models.User.findOne({where: {uid: }})
        const result = await models.Friend.create({
            idp1: wanter.uid,
            idp2: socket.id,
        })
        const check = await result.save();
        if (check != false) {
            socket.emit("updateListFriend", {
                newfriend: wanter
            });
            socket.to(wanter.uid).emit("updateListFriend", {
                newfriend: self
            });
        } else {
            console.log("Kết bạn không thành công")
        }
    })

    socket.on("want update friend", () => {
        console.log("want update friend from:", socket.id)
        socket.emit("updateListFriend")
    })

    socket.on('send invite', function (data) {
        const sessionRecive = sessionStore.findSessionByEmail(data.email);

        if (sessionRecive != false) {
            const userRecive = sessionStore.findSession(sessionRecive);
            const userSend = sessionStore.findSession(socket.sessionID);

            // console.log("socketID: >>", socket.id);
            console.log(userRecive);
            socket.to(userRecive.socketID).emit("require add friend", {
                content: userSend,
                from: socket.id,
            });
        }
    })

    socket.on("private message", ({ content, to, date, userSend, userRecieve, type }) => {
        switch (type) {
            case "img":
            case "text":
                const result = userRecieve.uid.localeCompare(userSend.uid);
                const id = (result == 1 ? userRecieve.uid + userSend.uid : userSend.uid + userRecieve.uid);
                messageStore.saveMessage(id, {
                    content,
                    to,
                    date,
                    userSend,
                    userRecieve,
                    type
                })
                serviceMessage.saveMessage(id, content, socket.id, date, userSend, userRecieve, type);
                break;
            default:
                break;

        }
        io.to(userRecieve.uid).emit("private message", {
            content,
            from: socket.id,
            date,
            userSend: userSend,
            userRecieve: userRecieve,
            type: type
        })

        // socket.to(to).emit("private message", {
        //     content,
        //     from: socket.id,
        //     date,
        //     userSend: userSend,
        //     userRecieve: userRecieve,
        //     type: type
        // });
        console.log("send private mess to ", to)

    });

    socket.on("send image", ({ file }) => {
        console.log("file.name ", file)
    })

    socket.on("detectPeerID", ({ idPeer }) => {

    });

    socket.on("joinroom", ({ draf }) => {
        // const result = socket.id.localeCompare(draf);
        // const id = (result == 1 ? socket.id : draf);

        console.log("draf >> ", draf);
        socket.join(draf);
        // io.to('59641567-46e9-4d8e-882a-7d6e7dca0621').emit("private message", "tin nhan tu group");
    });

    socket.on("group message", async ({ content, to, date, userSend, userRecieve, type }) => {
        console.log("gui group mess cho ", userRecieve.uid);
        await serviceMessage.saveMessage(userRecieve.uid, content, socket.id, date, userSend, userRecieve, type);
        io.to(userRecieve.uid).emit("group message", {
            content,
            from: socket.id,
            date,
            userSend: userSend,
            userRecieve: userRecieve,
            type: type
        })
    });

    socket.on("update new group", ({ group, checked }) => {
        console.log("update new group >> ", group)
        console.log("Bien checked >> ", checked)
        checked.map((e) => {
            console.log("to >> ", checked);
            io.to(e).emit("update new group", {
                group,
                idSender: socket.id,
            })
        })
    })

    socket.on("disconnect", () => {
        socket.disconnect();
    })

    socket.on('join-room', room => {
        console.log('User joined room:', room);
        socket.join(room);
    });
})



