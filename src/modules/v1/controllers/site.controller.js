const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET
const Auth = require("../middlewares/auth.middleware")
const {
  User,
  Cart,
  Clock,
  Order,
  OrderDetail,
} = require("../../../common/models")

class SiteController {
  // [GET] /
  index(req, res, next) {
    res.json({
      statusCode: 200,
      status: "success",
      message: "Welcome to API",
    })
  }

  // [GET] /test
  async test(req, res, next) {
    await Cart.find()
    await User.find()
    await Clock.find()
    await Order.find()
    await OrderDetail.find()
    res.json({
      statusCode: 200,
      status: "success",
      message: "test",
    })
  }

  // [GET] /findById?id=[id]
  async findById(req, res, next) {
    try {
      const {id} = req.query
      const result = await User.findById(id)
      console.log(">>> / file: site.controller.js / line 28 / result", result)
      if (result) {
        res.json({
          statusCode: 200,
          status: "SUCCESS",
          message: "findById",
          data: result,
        })
      } else {
        res.json({
          statusCode: 400,
          status: "FAIL",
          message: "not found",
        })
      }
    } catch (error) {
      res.json({
        statusCode: 400,
        status: "FAIL",
        message: "not found",
      })
    }
  }
}

module.exports = new SiteController()
