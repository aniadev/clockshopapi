var jwt = require("jsonwebtoken")
require("dotenv").config()
const {logger} = require("../services")

Auth = (req, res, next) => {
  // console.log(req.headers.authorization);
  try {
    const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET
    let Authorization = req.headers.authorization
    if (!Authorization) {
      return res.status(401).json({
        status: "FAIL",
        message: "NO_TOKEN",
      })
    }
    let accessToken = Authorization.split(" ")[1]
    let tokenType = Authorization.split(" ")[0]
    let jwt_decoded = jwt.verify(accessToken, SECRET_KEY)
    if (tokenType === "Bearer" && jwt_decoded._id) {
      req.userId = jwt_decoded._id
      // console.log(jwt_decoded.userId);
      next()
    } else {
      res.status(401).json({
        status: "FAIL",
        message: "TOKEN_INVALID",
      })
    }
  } catch (error) {
    // console.log(error);
    logger.error(error.message)
    res.status(500).json({
      status: "FAIL",
      message: "EXTERNALL_SERVER_ERROR",
    })
  }
}

module.exports = Auth
