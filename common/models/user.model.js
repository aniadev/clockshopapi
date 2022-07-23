var mongoose = require("mongoose")
var bcrypt = require("bcrypt")

var UserChema = new mongoose.Schema(
  {
    username: {
      unique: true,
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      optional: true,
    },
    name: {
      type: String,
      default: "Aniuser",
    },
    avatar: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

//authenticate input against database
UserChema.statics.authenticate = async function (username, password, callback) {
  try {
    await User.findOne({username: username}).exec(function (err, user) {
      if (err) {
        return callback(err)
      } else if (!user) {
        const err = {
          statusCode: 401,
          status: "USER_NOT_FOUND",
          message: "User not found",
        }
        return callback(err)
      }
      bcrypt.compare(password, user.password, function (err, result) {
        if (result === true) {
          return callback(null, user)
        } else {
          const err = {
            statusCode: 401,
            status: "ERROR_PASSWORD",
            message: "error password",
          }
          return callback(err)
        }
      })
    })
  } catch (error) {
    res.status(401).send({success: false, message: error.message})
  }
}
// hash password before save
UserChema.pre("save", function (next) {
  var user = this
  bcrypt.hash(user.password, 10, function (err, hash) {
    if (err) {
      return next(err)
    }
    user.password = hash
    next()
  })
})

var User = mongoose.model("users", UserChema)
module.exports = User
