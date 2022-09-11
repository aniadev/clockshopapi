const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET
const jwt = require("jsonwebtoken")
const services = require("./index")

const {forEach} = require("lodash")
const {
  User,
  Cart,
  Clock,
  ClockType,
  Order,
  OrderDetail,
  Payment,
  Material,
  Provider,
  Transaction,
} = require("../../../common/models")

async function getUserData(_id) {
  const userData = await User.findById(_id)
  delete userData._doc.password
  return userData
}
function generateAccessToken(userData) {
  try {
    const accessToken = jwt.sign(userData, process.env.ACCESS_TOKEN_SECRET)
    return accessToken
  } catch (error) {
    services.logger.error(error.message)
  }
}

module.exports = {
  getUserData,
  generateAccessToken,
}
