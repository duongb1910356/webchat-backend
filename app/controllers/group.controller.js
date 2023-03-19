const uuid = require("uuid");
const models = require("../../models/index");
const Sequelize = require("sequelize");
const { use } = require("../routes/user.route");
const Op = Sequelize.Op;
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.createGroup = async (req, res) => {
    const idgroup = uuid.v4();
    const user = await models.Group.create({
        id: idgroup,
        groupname: req.body.groupname,
        num: Object.keys(req.body.checked).length + 1,
        photoURL: req.body.photoURL
    });

    const checked = req.body.checked;
    Object.keys(checked).forEach(async key => {
        console.log("checked e >> ", checked[key]);
        await models.Join.create({
            uid: checked[key],
            idgroup: idgroup
        })
    })

    await models.Join.create({
        uid: req.body.uid,
        idgroup: idgroup
    })
    
    console.log(idgroup)
    return res.send(user);
}

exports.getListGroup = async (req, res) => {
    const result = await models.User.findOne({
        where: {uid: req.query.uid},
        include: [
            {model: models.Group, as: "depend"}
        ]
    })
    return res.send(result);
}

exports.test = async (req, res) => {
    // console.log("test hoạt động")
    return res.send(req.user)
}