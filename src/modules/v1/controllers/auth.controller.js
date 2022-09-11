const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET
const jwt = require("jsonwebtoken")
const Auth = require("../middlewares/auth.middleware")
const {User} = require("../../../common/models")
const {logger, userServices} = require("../services")

class AuthController {
  // [GET] /auth/
  async auth(req, res, next) {
    try {
      const [type, accessToken] = [...req.headers.authorization.split(" ")]
      let jwt_decoded = jwt.verify(accessToken, SECRET_KEY)
      if (type === "Bearer" && jwt_decoded._id) {
        const userData = await userServices.getUserData(jwt_decoded._id)
        if (userData.deactive) next([403, "ACCOUNT_DEACTIVATED"])
        next([200, "AUTHENTICATED_SUCCESSFULL", jwt_decoded])
      } else {
        next([401, "TOKEN_INVALID"])
      }
    } catch (error) {
      next([500, "", error])
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
        next([400, "EMPTY_FIELD"])
      }
      const existUser = await User.findOne({
        $or: [{username}, {email}, {phoneNumber}],
      })
      if (existUser) {
        next([400, "EXISTED_ACCOUNT"])
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
      }
    } catch (error) {
      next([500, "", error])
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
            delete user._doc.password
            const accessToken = userServices.generateAccessToken(user._doc)
            next([
              200,
              "LOGIN_SUCCESSFUL",
              {
                accessToken,
                userData: user,
              },
            ])
          }
        }
      )
    } catch (error) {
      next([500, "", error])
    }
  }
}

module.exports = new AuthController()
