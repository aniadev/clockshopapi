const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET
const Auth = require("../middlewares/auth.middleware")
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

class OrderController {
  // [GET] /
  index(req, res, next) {
    res.json({
      statusCode: 200,
      status: "SUCCESS",
      message: "Welcome to API",
    })
  }

  // [GET] /account/order
  async getAllOrder(req, res, next) {
    res.json({
      statusCode: 200,
      status: "SUCCESS",
      message: "test",
    })
  }

  //
  //
  //  /===========================> CART
  // [GET] /account/cart/all
  // [GET] /account/cart/
  async getAllCartItem(req, res, next) {
    const userId = req.userId
    console.log(">>> / file: order.controller.js / line 37 / userId", userId)
    const allCartItem = await Cart.find({
      $and: [{userId}, {quantity: {$gte: 1}}],
    }).sort({createdAt: -1})
    res.status(200).json({
      status: "SUCCESS",
      message: "ALL_CART_ITEMS",
      data: allCartItem,
    })
  }
  // [POST] /account/cart/add
  async addToCart(req, res, next) {
    const userId = req.userId
    let {clockId, quantity} = req.body
    quantity = quantity || 1
    if (!clockId) {
      res.status(404).json({
        status: "FAIL",
        message: "EMPTY_CLOCK_ID",
      })
      return
    }
    const existedCartItem = await Cart.findOne({clockId, userId})

    let newCartItem, newCartItemData
    if (!existedCartItem) {
      newCartItem = new Cart({clockId, quantity})
      newCartItemData = await newCartItem.save()
    } else {
      newCartItem = {
        clockId,
        quantity: quantity + existedCartItem.quantity,
      }
      newCartItemData = await Cart.findOneAndUpdate(
        {clockId, userId},
        newCartItem,
        {returnDocument: "after"}
      )
    }
    res.status(200).json({
      status: "SUCCESS",
      message: "ADD_TO_CART_SUCCESSFUL",
      data: newCartItemData,
    })
  }
  // [PUT] /account/cart/update
  async updateCartItem(req, res, next) {
    const userId = req.userId
    let {clockId, quantity} = req.body
    if (!clockId) {
      res.status(404).json({
        status: "FAIL",
        message: "EMPTY_CLOCK_ID",
      })
      return
    }

    const existedCartItem = await Cart.findOneAndUpdate(
      {clockId, userId},
      {quantity},
      {returnDocument: "after"}
    )
    if (!existedCartItem) {
      res.status(404).json({
        status: "FAIL",
        message: "ITEM_NOT_FOUND",
      })
      return
    }
    res.status(200).json({
      status: "SUCCESS",
      message: "UPDATED_SUCCESSFUL",
      data: existedCartItem,
    })
  }
}

module.exports = new OrderController()
