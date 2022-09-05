const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET
const jwt = require("jsonwebtoken")
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
} = require("../../../common/models")

class AccountController {
  // [GET] /account/all
  async getAllData(req, res, next) {
    try {
      const allProducts = await Clock.find()
        .sort({createdAt: -1})
        .populate("materialId", ["name", "info"])
        .populate("providerId", ["name"])
      res.status(200).json({
        status: "SUCCESS",
        data: allProducts,
      })
    } catch (error) {
      console.log(">>> / file: product.controller.js / line 28 / error", error)
      res.status(500).json({
        status: "ERROR",
        message: "EXTERNAL_SERVER_ERROR",
      })
    }
  }
  // [GET] /account/detail
  async getDataById(req, res, next) {
    try {
      const userId = req.userId
      const accountDetail = await User.findById(userId)
      delete accountDetail._doc.password
      res.status(200).json({
        status: "SUCCESS",
        message: "ACCOUNT_DETAIL",
        data: accountDetail,
      })
    } catch (error) {
      console.log(">>> / file: product.controller.js / line 47 / error", error)
      res.status(500).json({
        status: "ERROR",
        message: "EXTERNAL_SERVER_ERROR",
      })
    }
  }
  // [PUT] /account/info/update
  async updateUserData(req, res, next) {
    try {
      const userId = req.userId
      const {fullName, email, phoneNumber, address} = req.body
      const newUserInfo = {fullName, email, phoneNumber, address}
      const accountDetail = await User.findByIdAndUpdate(userId, newUserInfo, {
        returnDocument: "after",
      })
      delete accountDetail._doc.password
      next([200, "UPDATE_SUCCESSFULL", accountDetail])
    } catch (error) {
      console.log(error)
      next([500])
    }
  }
}

module.exports = new AccountController()
