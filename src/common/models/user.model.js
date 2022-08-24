var mongoose = require("mongoose")
const argon2 = require("argon2")

var UserChema = new mongoose.Schema(
  {
    email: {
      unique: true,
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      unique: true,
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    fullName: {
      required: true,
      type: String,
    },
    address: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
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
          statusCode: 400,
          status: "USER_NOT_FOUND",
          message: "User not found",
        }
        return callback(err)
      }
      argon2
        .verify(user.password, password)
        .then((result) => {
          return callback(null, user)
        })
        .catch((error) => {
          console.log(">>> / file: user.model.js / line 62 / error", error)
          const err = {
            statusCode: 400,
            status: "ERROR_PASSWORD",
            message: "error password",
          }
          return callback(err)
        })
    })
  } catch (error) {
    res.status(401).send({success: false, message: error.message})
  }
}
// hash password before save
UserChema.pre("save", function (next) {
  var user = this
  argon2
    .hash(user.password)
    .then((hashedPassword) => {
      user.password = hashedPassword
      next()
    })
    .catch((err) => {
      return next(err)
    })
})

var User = mongoose.model("users", UserChema)
module.exports = User
