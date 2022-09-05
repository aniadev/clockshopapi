const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET
const jwt = require("jsonwebtoken")
const Auth = require("../middlewares/auth.middleware")
const {User} = require("../../../common/models")
const logger = require("../../../common/logs")

class AuthController {
  // [GET] /auth/
  async auth(req, res, next) {
    try {
      const [type, accessToken] = [...req.headers.authorization.split(" ")]
      let jwt_decoded = jwt.verify(accessToken, SECRET_KEY)

      if (type === "Bearer" && jwt_decoded) {
        next([200, "AUTHENTICATED_SUCCESSFULL", jwt_decoded])
      } else {
        next([401, "TOKEN_INVALID"])
      }
    } catch (error) {
      logger.error(error.message)
      next([500])
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

        next([200, "REGISTERED_SUCCESSFULL", {accessToken}])
        // res.status(200).json({
        //   statusCode: 200,
        //   status: "SUCCESS",
        //   message: "User registered successfully",
        //   data: {
        //     accessToken,
        //   },
        // })
      }
    } catch (error) {
      logger.error(error.message)
      next([500])
    }
  }

  //   POST /auth/login
  async login(req, res, next) {
    try {
      let username = req.body?.username
      let password = req.body?.password
      if (!username || !password) {
        next([400, "WRONG_USERNAME_OR_PASSWORD"])
      }
      const result = await User.authenticate(
        username,
        password,
        (err, user) => {
          if (err) {
            next([404, "WRONG_USERNAME_OR_PASSWORD"])
          }
          if (user) {
            let userData = {
              _id: user._id,
              fullName: user.fullName,
              username: user.username,
              phoneNumber: user.phoneNumber,
              address: user.address,
              email: user.email,
              role: user.role,
              createdAt: user.createdAt,
            }
            const accessToken = jwt.sign(
              userData,
              process.env.ACCESS_TOKEN_SECRET
            )
            next([
              200,
              "LOGIN_SUCCESSFUL",
              {
                accessToken,
                userData,
              },
            ])
          }
        }
      )
    } catch (error) {
      logger.error(error.message)
      next([500])
    }
  }
}

module.exports = new AuthController()
