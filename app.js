const express = require("express");
const cors = require("cors");
const http = require('http')

const app = express()
app.use(cors())
app.use(express.json())
const userRouter = require("./app/routes/user.route");

app.use("/api/users", userRouter)

app.use(cors())

const server = http.createServer(app);

module.exports = server;