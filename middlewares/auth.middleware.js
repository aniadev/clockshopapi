var jwt = require("jsonwebtoken");
require("dotenv").config();

Auth = (req, res, next) => {
  // console.log(req.headers.authorization);
  try {
    const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET;
    let Authorization = req.headers.authorization;
    if (!Authorization) {
      return res.json({
        success: false,
        message: "No token",
      });
    }
    let accessToken = Authorization.split(" ")[1];
    let tokenType = Authorization.split(" ")[0];
    let jwt_decoded = jwt.verify(accessToken, SECRET_KEY);
    if (tokenType === "Bearer" && jwt_decoded) {
      // console.log(jwt_decoded);
      req.userId = jwt_decoded.userId;
      // console.log(jwt_decoded.userId);
      next();
    } else {
      res.json({
        success: false,
        message: "Error token type",
      });
    }
  } catch (error) {
    // console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = Auth;
