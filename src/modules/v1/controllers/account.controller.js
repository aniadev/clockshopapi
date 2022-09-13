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
const {isNull} = require("../services")

class AccountController {
  // [GET] /account/all
  async getAllData(req, res, next) {
    try {
      // const allProducts = await Clock.find()
      //   .sort({createdAt: -1})
      //   .populate("materialId", ["name", "info"])
      //   .populate("providerId", ["name"])
      // res.status(200).json({
      //   status: "SUCCESS",
      //   data: allProducts,
      // })
      next([200, "GET_ALL_DATA"])
    } catch (error) {
      next([500, "", error])
    }
  }
  // [GET] /account/detail
  async getDataById(req, res, next) {
    try {
      const accountDetail = req.userData
      delete accountDetail._doc.password
      next([200, "ACCOUNT_DETAIL", accountDetail])
      // res.status(200).json({
      //   status: "SUCCESS",
      //   message: "ACCOUNT_DETAIL",
      //   data: accountDetail,
      // })
    } catch (error) {
      next([500, "", error])
    }
  }
  // [PUT] /account/info/update
  async updateUserData(req, res, next) {
    try {
      const userId = req.userId
      const {fullName, email, phoneNumber, address} = req.body
      const newUserInfo = {fullName, email, phoneNumber, address}
      if ((!fullName, !email, !phoneNumber, !address)) next([400, "EMPTY_DATA"])
      const accountDetail = await User.findByIdAndUpdate(userId, newUserInfo, {
        returnDocument: "after",
      })
      delete accountDetail._doc.password
      next([200, "UPDATED_INFO_SUCCESSFULL", accountDetail])
    } catch (error) {
      if (error.codeName === "DuplicateKey") {
        next([400, "DUPLICATE_VALUE", error.keyValue])
      }
      next([500, "", error])
    }
  }
  // [POST] /account/info/deactive
  async deactiveAccount(req, res, next) {
    try {
      const userId = req.userId
      const id = req.query?.userId
      if (!id || !userId || id !== userId) next([403, "ACCESS_DENIED"])
      const accountDetail = await User.findByIdAndUpdate(
        userId,
        {deactive: true},
        {
          returnDocument: "after",
        }
      )
      delete accountDetail._doc.password
      next([200, "ACCOUNT_DEACTIVATED", accountDetail])
    } catch (error) {
      next([500, "", error])
    }
  }
}

module.exports = new AccountController()
