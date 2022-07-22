var mongoose = require("mongoose");
var bcrypt = require("bcrypt");
var UserChema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      default: "Aniuser",
    },
    description: { type: String },
    avatar: { type: String, default: "/img/avatar_default.png" },
  },
  {
    timestamps: true,
  }
);

//authenticate input against database
UserChema.statics.authenticate = async function (email, password, callback) {
  try {
    await User.findOne({ email: email }).exec(function (err, user) {
      if (err) {
        return callback(err);
      } else if (!user) {
        var err = new Error("User not found.");
        err.status = 401;
        return callback(err);
      }
      bcrypt.compare(password, user.password, function (err, result) {
        if (result === true) {
          return callback(null, user);
        } else {
          var err = new Error("Hashing problem.");
          err.status = 401;
          return callback(err);
        }
      });
    });
  } catch (error) {
    res.status(401).send({ success: false, message: error.message });
  }
};
// hash password before save
UserChema.pre("save", function (next) {
  var user = this;
  bcrypt.hash(user.password, 10, function (err, hash) {
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  });
});

var User = mongoose.model("users", UserChema);
module.exports = User;
