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
      console.log(
        ">>> / file: account.controller.js / line 39 / itemId",
        userId
      )
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
}

module.exports = new AccountController()
