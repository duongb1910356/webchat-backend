const express = require("express");
const users = require("../controllers/user.controller");
const sessions = require("../controllers/session.controller");
const message = require("../controllers/message.controller");
const group = require("../controllers/group.controller");

const router = express.Router();
const auth = require("../middleware/auth");
const user = require("../../models/user");

router.route("/findFriend")
    .get(users.findFriend)

router.route("/register")
    .post(users.register)

router.route("/login")
    .post(users.login)

router.route("/fetchProfile")
    .get(auth, users.fetchProfile)

router.route("/getListFriend")
    .get(users.getListFriend)

router.route("/test")
    .get(users.test)
    .post(sessions.saveSession)

router.route("/session")
    .get(sessions.getSession)
    .post(sessions.saveSession)

router.route("/message")
    .get(auth, message.getMessage)

router.route("/group")
    .post(auth, group.createGroup)

router.route("/listgroup")
    .get(auth, group.getListGroup)

router.route("/deleteContact")
    .delete(users.deleteFriend)

router.route("/updateProfile")
    .put(users.updateProfile)

module.exports = router