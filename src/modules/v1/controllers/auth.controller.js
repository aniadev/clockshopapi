const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET
const jwt = require("jsonwebtoken")
const Auth = require("../middlewares/auth.middleware")
const User = require("../../../common/models/user.model")

class AuthController {
  // [GET] /auth/
  async auth(req, res, next) {
    try {
      const [type, accessToken] = [...req.headers.authorization.split(" ")]
      let jwt_decoded = jwt.verify(accessToken, SECRET_KEY)

      if (type === "Bearer" && jwt_decoded) {
        res.json({
          statusCode: 200,
          status: "SUCCESS",
          message: "User authenticated successfully",
          data: jwt_decoded,
        })
      } else {
        throw Error("Invalid access token")
      }
    } catch (error) {
      res.json({
        statusCode: 200,
        status: "FAIL",
        message: "User authenticated failed",
        message: error.message,
      })
    }
  }

  //   POST /auth/register
  async register(req, res, next) {
    try {
      let email = req.body?.email
      let phoneNumber = req.body?.phoneNumber
      let username = req.body?.username
      let password = req.body?.password
      let fullName = req.body?.fullName
      let address = req.body?.address
      if (!email || !password || !phoneNumber || !username || !fullName) {
        throw Error("INVALID_FIELD")
      }
      const existUser = await User.findOne({
        $or: [{username}, {email}, {phoneNumber}],
      })
      if (existUser) {
        throw Error("ACCOUNT_EXISTED")
      } else {
        const newUser = new User({
          username,
          password,
          email,
          fullName,
          phoneNumber,
          address: address || "",
        })
        const newUserRs = await newUser.save()
        let userData = {
          _id: newUserRs._id,
          username,
          email,
          phoneNumber,
          fullName,
        }
        const accessToken = jwt.sign(userData, process.env.ACCESS_TOKEN_SECRET)
        res.json({
          statusCode: 200,
          status: "SUCCESS",
          message: "User registered successfully",
          data: {
            accessToken,
          },
        })
      }
    } catch (error) {
      res.json({
        statusCode: 400,
        status: error.message,
        message: error.message,
      })
    }
  }

  //   POST /auth/login
  async login(req, res, next) {
    try {
      let username = req.body?.username
      let password = req.body?.password
      if (!username || !password) {
        throw Error("username, password are required")
      }
      const result = await User.authenticate(
        username,
        password,
        (err, user) => {
          if (err) {
            let response = {
              statusCode: 401,
              status: err.status,
              message: err.message,
            }
            return res.json(response)
          }
          if (user) {
            let userData = {
              _id: user._id,
              fullName: user.fullName,
              username: user.username,
              phoneNumber: user.phoneNumber,
              address: user.address,
              email: user.email,
              createdAt: user.createdAt,
            }
            const accessToken = jwt.sign(
              userData,
              process.env.ACCESS_TOKEN_SECRET
            )
            res.json({
              statusCode: 200,
              status: "SUCCESS",
              message: "User login successfully",
              data: {
                accessToken,
                userData,
              },
            })
          }
        }
      )
    } catch (error) {
      res.json({
        statusCode: 400,
        status: "FAIL",
        message: error.message,
      })
    }
  }
}

module.exports = new AuthController()
