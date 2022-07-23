var jwt = require("jsonwebtoken")
require("dotenv").config()

const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET

tokenParser = (socket) => {
  try {
    let accessToken = socket.handshake.auth.accessToken
    let jwt_decoded = jwt.verify(accessToken, SECRET_KEY)
    socket.userData = jwt_decoded
    return accessToken
  } catch (error) {
    return Error(error.message)
  }
}

module.exports = tokenParser
