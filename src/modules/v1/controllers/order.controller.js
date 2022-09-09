const {forEach, map, find, isEqual} = require("lodash")
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
const {
  hasNullInArray,
  isDuplicateArr,
  isNull,
  logger,
  boServices,
} = require("../services")

class OrderController {
  //
  //
  //  /===========================> ORDER
  // [GET] /account/order/all
  // [GET] /account/order/
  async getAllOrder(req, res, next) {
    try {
      const userId = req.userId
      const allOrderItem = await boServices.getAllOrderByUserId(userId)
      next([200, "ALL_ORDER_ITEMS", allOrderItem])
    } catch (error) {
      next([500, "", error])
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
      next([500, "", error])
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
          paymentMethod: paymentMethod,
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
      forEach(allOrderItems, async (item) => {
        let clockData = await Clock.findById(item.clockId._id)
        let newRemain = clockData.numOfRemain - item.quantity
        if (newRemain < 0)
          next([
            400,
            "OUT_OF_STOCK",
            {quantity: item.quantity, numOfRemain: clockData.numOfRemain},
          ])
        await Clock.findByIdAndUpdate(item.clockId._id, {
          numOfRemain: clockData.numOfRemain - item.quantity,
        })
        await Cart.findOneAndDelete({
          userId,
          clockId: item.clockId._id.toString(),
        })
      })
      next([200, "ORDER_APPROVED_SUCCESSFUL", updatedOrderData])
    } catch (error) {
      next([500, "", error])
    }
  }
  // [POST] /account/order/customer-accept
  //   {
  //     "orderId": "6312e6970fb72be64dece7c6",
  //     "paymentMethod": "630d88bc15caa4f8904ea7ec",
  //     "paymentHash": "paymentHash"
  //  }
  async completeOrderById(req, res, next) {
    try {
      const userId = req.userId
      console.log(">>> / file: order.controller.js / line 192 / userId", userId)
      const {orderId} = req.body
      if (isNull({orderId})) {
        return next([400, "EMPTY_DATA"])
      }
      const orderData = await boServices.getOrderDataById(orderId)
      if (
        userId === orderData.user._id.toString() &&
        orderData.status === "APPROVED"
      ) {
        await Order.findByIdAndUpdate(orderId, {status: "SUCCESS"})
        orderData._doc.status = "SUCCESS"
      } else if (
        userId === orderData.user._id &&
        orderData.status === "SUCCESS"
      ) {
        next([401, "ORDER_ALREADY_SUCCESS"])
      } else {
        next([403, "ACCESS_DENIED"])
      }
      next([200, "ORDER_COMPLETED", orderData])
    } catch (error) {
      next([500, "", error])
    }
  }
  // [PUT] /account/order/update
  async updateOrder(req, res, next) {
    try {
      const userId = req.userId
      next([404, "API_MAINTAIN"])
    } catch (error) {
      next([500, "", error])
    }
  }
  // [GET] /account/order/all-payment
  async getAllPaymentMethods(req, res, next) {
    try {
      const allPaymentMethods = await Payment.find()
      next([200, "ALL_PAYMENT_METHODS", allPaymentMethods])
    } catch (error) {
      next([500, "", error])
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
      next([200, "ALL_CART_ITEMS", allCartItem])
    } catch (error) {
      next([500, "", error])
    }
  }
  // [POST] /account/cart/add
  async addToCart(req, res, next) {
    try {
      const userId = req.userId
      let {clockId, quantity} = req.body
      quantity = quantity || 1
      if (!clockId) {
        next([400, "EMPTY_CLOCK_ID"])
      }
      const existedClock = await Clock.findById(clockId)
      if (!existedClock) {
        next([400, "CLOCK_ID_INVALID"])
      }
      const existedCartItem = await Cart.findOne({clockId, userId})
      let newCartItem, newCartItemData
      if (!existedCartItem) {
        newCartItem = new Cart({clockId, quantity, userId})
        newCartItemData = await newCartItem.save()
      } else {
        let newQuantity = quantity + existedCartItem.quantity
        if (newQuantity > existedClock.numOfRemain) {
          next([400, "OUT_OF_STOCK"])
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
      next([200, "ADD_TO_CART_SUCCESSFUL", newCartItemData])
    } catch (error) {
      next([500, "", error])
    }
  }
  // [PUT] /account/cart/update
  async updateCartItem(req, res, next) {
    try {
      const userId = req.userId
      let {clockId, quantity} = req.body
      if (!clockId) {
        next([400, "EMPTY_CLOCK_ID"])
      }
      const existedClock = await Clock.findById(clockId)
      if (quantity > existedClock.numOfRemain) {
        next([400, "OUT_OF_STOCK"])
      }
      const existedCartItem = await Cart.findOneAndUpdate(
        {clockId, userId},
        {quantity},
        {returnDocument: "after"}
      )
      if (!existedCartItem) {
        next([404, "ITEM_NOT_FOUND"])
      }
      next([200, "UPDATED_SUCCESSFUL", existedCartItem])
    } catch (error) {
      next([500, "", error])
    }
  }
}

module.exports = new OrderController()
