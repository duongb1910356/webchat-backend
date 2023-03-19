const uuid = require("uuid");
const User = require("../../models/user");
const models = require("../../models/index");
const Sequelize = require("sequelize");
const { use } = require("../routes/user.route");
const Op = Sequelize.Op;
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.register = async (req, res) => {
    const user = await models.User.create({
        uid: req.body.uid,
        username: req.body.username,
        email: req.body.email,
        pass: req.body.pass,
        photoURL: req.body.photoURL,
        socketID: "no"
    })
    console.log(req.body)
    return res.send("create duoc goi")
}

exports.login = async (req, res) => {
    try {
        const { email, pass } = req.body;
        const user = await models.User.findOne({ where: { email: email } });
        if (user && user.pass == pass) {
            const token = jwt.sign(
                { user_id: user.uid, email },
                process.env.TOKEN_KEY,
                {
                    expiresIn: "2h",
                }
            );
            res.cookie('token', token, { httpOnly: false });
            const result = { uid: user.uid, email: user.email, username: user.username, photoURL: user.photoURL, token: token, socketID: user.socketID };
            // console.log(result)
            return res.status(200).send(result)
        }
        return res.status(403).send("Email hoặc mật khẩu bị sai, vui lòng xem lại")
    } catch (error) {
        console.log(error, "Lỗi đăng nhập")
        return res.status(500).send("Server đang bị gián đoạn")
    }
    return res.send(user)
}

exports.fetchProfile = async (req, res) => {
    try {
        const { email } = req.user;
        const user = await models.User.findOne({ where: { email: email }, attributes: ['uid', 'username', 'email', 'photoURL', 'dob', 'phone', 'gender'] })
        if (user) {
            return res.send(user)
        }
    } catch (error) {
        console.log(error, "Lỗi fetchProfile người dùng");
        return res.status(404).send("Lỗi fetchProfile người dùng")
    }

}

exports.updateProfile = async (req, res) => {
    const { uid } = req.body.user;
    const user = await models.User.findOne({ where: { uid: uid }, attributes: ['uid', 'username', 'email', 'photoURL', 'dob', 'phone', 'gender'] });
    if (user) {
        user.phone = req.body.values.phone;
        user.username = req.body.values.name;
        user.dob = req.body.values.birthday;
        user.gender = req.body.values.gender;
        user.photoURL = req.body.urlImg ?? user.photoURL;
        user.save();
    }

    res.send(req.body.values.phone)
}

// exports.checkPermiss = async (req, res) => {

// }

exports.getListFriend = async (req, res) => {
    // console.log(req.query.uid)
    // return res.send("req.params.uid")
    const user = await models.User.findOne({
        where: { uid: req.query.uid },
        include: [
            { model: models.User, attributes: ['uid', 'username', 'email', 'photoURL', 'socketID', 'phone', 'dob', 'gender'], as: "friend1" },
            { model: models.User, attributes: ['uid', 'username', 'email', 'photoURL', 'socketID', 'phone', 'dob', 'gender'], as: "friend2" }],
    })
    // console.log(user.friend1[0].dataValues)
    const listFriend = [];
    await listFriend.push([...user.friend1, ...user.friend2])
    console.log("listFriend", listFriend[0].dataValues)
    return res.send(listFriend)
}

exports.findFriend = async (req, res) => {
    const result = await models.User.findAll({
        where: { sodienthoai: { [Op.like]: `%${req.query.sodienthoai}%` } }
    })
    return res.send(result)
}

exports.deleteFriend = async (req, res) => {
    let result;
    result = await models.Friend.destroy(
        {
            where: {
                [Op.or]: [
                    {
                        [Op.and]: [
                            { idp1: req.query.uidSend },
                            { idp2: req.query.uidRecieve }
                        ]
                    },
                    {
                        [Op.and]: [
                            { idp2: req.query.uidSend },
                            { idp1: req.query.uidRecieve }
                        ]
                    }
                ]
            }
        }
    )

    if (result == 0) {
        // console.log('xoa group ', uidSend, uidRecieve)
        result = await models.Join.destroy(
            {
                where: {
                    [Op.or]: [
                        {
                            [Op.and]: [
                                { uid: req.query.uidSend },
                                { idgroup: req.query.uidRecieve }
                            ]
                        },
                        {
                            [Op.and]: [
                                { idgroup: req.query.uidSend },
                                { uid: req.query.uidRecieve }
                            ]
                        }
                    ]
                }
            }
        )
    }

    console.log("Result xoa >> ", result);
    res.send("deleteSuccess");
    // res.send("xoa " + req.query.uidSend)
}

exports.test = async (req, res) => {
    // console.log("test hoạt động")
    return res.send(req.user)
}