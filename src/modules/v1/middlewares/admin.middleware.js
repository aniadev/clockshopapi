var jwt = require("jsonwebtoken")
require("dotenv").config()

AdminRole = (req, res, next) => {
  // console.log(req.headers.authorization);
  try {
    const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET
    let Authorization = req.headers.authorization
    if (!Authorization) {
      return res.status(401).json({
        success: false,
        message: "No token",
      })
    }
    let accessToken = Authorization.split(" ")[1]
    let tokenType = Authorization.split(" ")[0]
    let jwt_decoded = jwt.verify(accessToken, SECRET_KEY)
    if (
      tokenType === "Bearer" &&
      jwt_decoded._id &&
      jwt_decoded.role === "ADMIN"
    ) {
      req.userId = jwt_decoded._id
      next()
    } else {
      res.status(401).json({
        status: "FAIL",
        message: "Access denied",
      })
    }
  } catch (error) {
    // console.log(error);
    res.status(401).json({
      status: "FAIL",
      message: error.message,
    })
  }
}

module.exports = AdminRole
