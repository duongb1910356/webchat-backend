const config = process.env;
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const token = req.headers["auth-token"] || req.headers.authorization;
    if(!token){
        console.log("Thiếu token")
        return res.status(403).send("Thiếu token");
    }

    try {
        // console.log("Token hợp lệ")
        const decoded = jwt.verify(token, config.TOKEN_KEY);
        req.user = decoded
    } catch (error) {
        console.log("Token không hợp lệ")
        return res.send("Token không hợp lệ")
    }

    return next()
}

module.exports = verifyToken;