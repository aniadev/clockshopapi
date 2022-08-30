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
        message: "External server error",
      })
    }
  }
  // [GET] /account/detail?_id=1234
  async getDataById(req, res, next) {
    try {
      const itemId = req.query._id
      const itemData = await Clock.findById(itemId)
        .sort({createdAt: -1})
        .populate("materialId", ["name", "info"])
        .populate("providerId", ["name"])
      res.status(200).json({
        status: "SUCCESS",
        data: itemData,
      })
    } catch (error) {
      console.log(">>> / file: product.controller.js / line 47 / error", error)
      res.status(500).json({
        status: "ERROR",
        message: "External server error",
      })
    }
  }
}

module.exports = new AccountController()
