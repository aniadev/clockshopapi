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
      let username = req.body?.username
      let password = req.body?.password
      let email = req.body?.email
      let name = req.body?.name
      if (!username || !password || !name) {
        throw Error("username, password, name are required")
      }
      const existUser = await User.findOne({username})
      if (existUser) {
        throw Error("username already exists")
      } else {
        const newUser = new User({username, password, email, name})
        await newUser.save()
        let userData = {username, email, name}
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
        status: "FAIL",
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
              id: user._id,
              name: user.name,
              username: user.username,
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
