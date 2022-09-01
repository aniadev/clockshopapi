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
const {forEach} = require("lodash")
const isNull = (data) => {
  let rs = false
  forEach(data, (value, key) => {
    if (data[key] == undefined) rs = true
    if (typeof value == "object" && value.length == 0) rs = true
  })
  return rs
}
class OrderController {
  // [GET] /
  index(req, res, next) {
    res.json({
      statusCode: 200,
      status: "SUCCESS",
      message: "Welcome to API",
    })
  }

  //
  //
  //  /===========================> ORDER
  // [GET] /account/order/all
  // [GET] /account/order/
  async getAllOrder(req, res, next) {
    try {
      const userId = req.userId
      console.log(">>> / file: order.controller.js / line 33 / userId", userId)
      const allOrderItem = await Order.find({
        user: userId,
      })
        .sort({createdAt: -1})
        .populate("user", ["fullName", "email", "address"])
        .populate("paymentMethod", [
          "type",
          "cardNumber",
          "accountNumber",
          "qrCode",
        ])
      const orderDetailPromise = []
      forEach(allOrderItem, (orderItem) => {
        orderDetailPromise.push(
          OrderDetail.find({orderId: orderItem._id}).populate("clockId", [
            "model",
          ])
        )
      })
      const allOrderDetail = await Promise.all(orderDetailPromise)
      forEach(allOrderItem, (orderItem, index) => {
        allOrderItem[index]._doc.allItem = allOrderDetail[index] || {}
      })
      res.status(200).json({
        status: "SUCCESS",
        message: "ALL_ORDER_ITEMS",
        data: allOrderItem,
      })
    } catch (error) {
      res.status(500).json({
        status: "ERROR",
        message: "EXTERNAL_SERVER_ERROR",
      })
    }
  }
  // [POST] /account/order/create
  async createAnOrder(req, res, next) {
    try {
      const userId = req.userId
      const newOrder_doc = {
        user: userId,
        shipTo: req.body?.shipTo,
        paymentMethod: req.body?.paymentMethod,
        discount: req.body?.discount || 0,
        discountType: req.body?.discountType || "PERCENT",
        items: req.body?.items,
      }
      console.log(
        ">>> / file: order.controller.js / line 88 / newOrder_doc",
        newOrder_doc
      )
      if (isNull(newOrder_doc)) {
        res.status(404).json({
          status: "FAIL",
          message: "EMPTY_DATA",
        })
        return
      }
      res.status(200).json({
        status: "SUCCESS",
        message: "ORDER_CREATED_SUCCESSFUL",
        data: "service on maintain",
      })
    } catch (error) {
      res.status(500).json({
        status: "ERROR",
        message: "EXTERNAL_SERVER_ERROR",
      })
    }
  }
  // [PUT] /account/order/update
  async updateOrder(req, res, next) {
    try {
      const userId = req.userId

      res.status(200).json({
        status: "SUCCESS",
        message: "UPDATED_SUCCESSFUL",
        data: existedCartItem,
      })
    } catch (error) {
      res.status(500).json({
        status: "ERROR",
        message: "EXTERNAL_SERVER_ERROR",
      })
    }
  }
  // [GET] /account/order/all-payment
  async getAllPaymentMethods(req, res, next) {
    try {
      const allPaymentMethods = await Payment.find()

      res.status(200).json({
        status: "SUCCESS",
        message: "UPDATED_SUCCESSFUL",
        data: allPaymentMethods,
      })
    } catch (error) {
      res.status(500).json({
        status: "ERROR",
        message: "EXTERNAL_SERVER_ERROR",
      })
    }
  }

  //
  //
  //  /===========================> CART
  // [GET] /account/cart/all
  // [GET] /account/cart/
  async getAllCartItem(req, res, next) {
    try {
      const userId = req.userId
      console.log(">>> / file: order.controller.js / line 37 / userId", userId)
      const allCartItem = await Cart.find({
        $and: [{userId}, {quantity: {$gte: 1}}],
      })
        .sort({createdAt: -1})
        .populate("clockId")
      res.status(200).json({
        status: "SUCCESS",
        message: "ALL_CART_ITEMS",
        data: allCartItem,
      })
    } catch (error) {
      res.status(500).json({
        status: "ERROR",
        message: "EXTERNAL_SERVER_ERROR",
      })
    }
  }
  // [POST] /account/cart/add
  async addToCart(req, res, next) {
    try {
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
      const existedClock = await Clock.findById(clockId)
      if (!existedClock) {
        res.status(404).json({
          status: "FAIL",
          message: "CLOCK_ID_INVALID",
        })
        return
      }
      const existedCartItem = await Cart.findOne({clockId, userId})
      let newCartItem, newCartItemData
      if (!existedCartItem) {
        newCartItem = new Cart({clockId, quantity, userId})
        newCartItemData = await newCartItem.save()
      } else {
        let newQuantity = quantity + existedCartItem.quantity
        if (newQuantity > existedClock.numOfRemain) {
          res.status(404).json({
            status: "FAIL",
            message: "OUT_OF_STOCK",
          })
          return
        }
        newCartItem = {
          clockId,
          userId,
          quantity: newQuantity,
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
    } catch (error) {
      res.status(500).json({
        status: "ERROR",
        message: "EXTERNAL_SERVER_ERROR",
      })
    }
  }
  // [PUT] /account/cart/update
  async updateCartItem(req, res, next) {
    try {
      const userId = req.userId
      let {clockId, quantity} = req.body
      if (!clockId) {
        res.status(404).json({
          status: "FAIL",
          message: "EMPTY_CLOCK_ID",
        })
        return
      }
      const existedClock = await Clock.findById(clockId)
      if (quantity > existedClock.numOfRemain) {
        res.status(404).json({
          status: "FAIL",
          message: "OUT_OF_STOCK",
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
    } catch (error) {
      res.status(500).json({
        status: "ERROR",
        message: "EXTERNAL_SERVER_ERROR",
      })
    }
  }
}

module.exports = new OrderController()
