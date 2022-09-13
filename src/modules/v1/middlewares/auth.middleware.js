var jwt = require("jsonwebtoken")
require("dotenv").config()
const {logger, userServices} = require("../services")

Auth = async (req, res, next) => {
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
    if (!jwt_decoded.expiredAt || jwt_decoded.expiredAt < Date.now()) {
      res.status(403).json({
        status: "FAIL",
        message: "TOKEN_EXPIRED",
      })
      return
    }
    if (tokenType === "Bearer" && jwt_decoded._id) {
      const userData = await userServices.getUserData(jwt_decoded._id)
      if (userData.deactive) {
        res.status(403).json({
          status: "FAIL",
          message: "ACCOUNT_DEACTIVATED",
        })
        return
      }
      if (!userData) {
        res.status(401).json({
          status: "FAIL",
          message: "TOKEN_INVALID",
        })
        return
      }
      req.userId = userData._id
      req.userData = userData
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
