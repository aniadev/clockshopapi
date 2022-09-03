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
const {forEach, map, find, isEqual} = require("lodash")
const isNull = (data) => {
  let rs = false
  forEach(data, (value, key) => {
    if (data[key] == undefined) rs = true
    if (typeof value == "object" && value.length == 0) rs = true
  })
  return rs
}
const hasNullInArray = (arr) => {
  let rs = false
  forEach(arr, (value, key) => {
    if (value == undefined) rs = true
  })
  return rs
}
var isDuplicateArr = (arr) => {
  let rs = false
  map(arr, function (o, i) {
    let eq = find(arr, function (e, ind) {
      if (i > ind) {
        return isEqual(e, o)
      }
    })
    console.log(eq)
    if (eq) rs = true
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
        $and: [
          {userId},
          {
            $or: [
              {status: "PENDING"},
              {status: "APPROVED"},
              {status: "SUCCESS"},
            ],
          },
        ],
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
      console.log(error)
      next([500])
    }
  }

  // [POST] /account/order/create
  async createAnOrder(req, res, next) {
    try {
      const userId = req.userId
      const newOrder_doc = {
        user: userId,
        shipTo: req.body?.shipTo,
        // paymentMethod: req.body?.paymentMethod,
        discount: req.body?.discount || 0,
        discountType: req.body?.discountType || "PERCENT",
      }
      const cartItemIds = req.body?.cartItemIds
      if (!cartItemIds) next([404, "EMPTY_DATA"])
      if (isDuplicateArr(cartItemIds)) next([404, "DUPLICATE_ITEMS"])
      // check cart items
      let allCartItemQueries = []
      forEach(cartItemIds, (cartItemId) => {
        allCartItemQueries.push(Cart.findOne({_id: cartItemId, userId: userId}))
      })
      const orderItems = await Promise.all(allCartItemQueries)
      const userData = await User.findById(userId)
      if (isNull(newOrder_doc)) {
        next([404, "EMPTY_DATA"])
      }
      // check items:
      let itemInvalid = false
      let itemQueries = []
      let existedClocks = []
      forEach(orderItems, (item) => {
        if (!item.clockId || !item.quantity) {
          itemInvalid = true
          return
        }
        itemQueries.push(Clock.findById(item.clockId))
      })
      if (itemInvalid) {
        next([404, "INVALID_ITEM_DATA"])
      } else {
        existedClocks = await Promise.all(itemQueries)
        if (hasNullInArray(existedClocks)) {
          next([404, "INVALID_CLOCK"])
        }
      }
      orderItems.map((item, index) => {
        return {...item}
      })
      // const paymentData = await Payment.findById(newOrder_doc.paymentMethod)
      // if (!paymentData) {
      //   next([404, "INVALID_PAYMENT_METHOD", paymentData])
      // }
      // create new order
      const newOrder = new Order(newOrder_doc)
      const newOrderData = await newOrder.save()
      // insert clock to orderDetail
      let orderDetailQueries = []
      forEach(existedClocks, (clock, index) => {
        let newOrderDetail = new OrderDetail({
          orderId: newOrderData._id,
          clockId: clock._id,
          unitPrice: clock.unitPrice,
          quantity: orderItems[index].quantity,
        })
        orderDetailQueries.push(newOrderDetail.save())
      })
      await Promise.all(orderDetailQueries) //save order details
      const allOrderDetailData = await OrderDetail.find({
        orderId: newOrderData._id,
      }).populate("clockId", ["model"])
      let orderTotalPrice = 0
      forEach(
        allOrderDetailData,
        (detailItem) =>
          (orderTotalPrice += detailItem.unitPrice * detailItem.quantity)
      )

      const newOrderDataResponse = {
        ...newOrderData._doc,
        user: {
          _id: userData._id,
          fullName: userData.fullName,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          address: userData.address,
        },
        totalPrice: orderTotalPrice,
        allItems: allOrderDetailData,
      }

      next([200, "ORDER_CREATED_SUCCESSFUL", newOrderDataResponse])
    } catch (error) {
      console.log(error)
      next([500])
    }
  }

  // [POST] /account/order/approve
  //   {
  //     "orderId": "6312e6970fb72be64dece7c6",
  //     "paymentMethod": "630d88bc15caa4f8904ea7ec",
  //     "paymentHash": "paymentHash"
  //  }
  async approveOrderById(req, res, next) {
    try {
      const userId = req.userId
      const {orderId, paymentMethod, paymentHash} = req.body
      if (isNull({orderId, paymentMethod, paymentHash})) {
        return next([400, "EMPTY_DATA"])
      }
      if (!paymentHash) next([400, "EMPTY_PAYMENT_HASH"])
      const paymentData = await Payment.findById(paymentMethod)
      const orderData = await Order.findById(orderId)
      // if (orderData.paymentMethod.toString() !== paymentMethod) {
      //   return next([404, "INVALID_PAYMENT_METHOD"])
      // }
      // if (orderData.status !== "READY") next([400, "ONLY_APPROVE_READY_ORDER"])
      // update order to pending
      const updatedOrderData = await Order.findByIdAndUpdate(
        orderId,
        {
          status: "PENDING",
          paymentHash: paymentHash,
        },
        {
          returnDocument: "after",
        }
      ).populate("user", ["fullName", "email", "phoneNumber"])
      const allOrderItems = await OrderDetail.find({orderId}).populate(
        "clockId",
        ["model"]
      )
      updatedOrderData._doc.allItems = allOrderItems

      // delete item in cart
      let deleteQueries = []
      forEach(allOrderItems, (item) => {
        deleteQueries.push(
          Cart.findOneAndDelete({userId, clockId: item.clockId._id.toString()})
        )
      })
      await Promise.all(deleteQueries)

      next([200, "ORDER_APPROVED_SUCCESSFUL", updatedOrderData])
    } catch (error) {
      console.log(error)
      next([500])
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
      next([500])
    }
  }
  // [GET] /account/order/all-payment
  async getAllPaymentMethods(req, res, next) {
    try {
      const allPaymentMethods = await Payment.find()
      next([200, "ALL_PAYMENT_METHODS", allPaymentMethods])
    } catch (error) {
      next([500])
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
      console.log(">>> / file: order.controller.js / line 276 / userId", userId)
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
      next([500])
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
      next([500])
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
      next([500])
    }
  }
}

module.exports = new OrderController()
