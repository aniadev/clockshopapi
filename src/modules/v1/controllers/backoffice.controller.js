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
  Transaction,
} = require("../../../common/models")
const {logger, boServices, isNull} = require("../services")
const {forEach} = require("lodash")

class BoController {
  // [GET] /
  index(req, res, next) {
    res.json({
      statusCode: 200,
      status: "SUCCESS",
      message: "Welcome to API",
    })
  }
  // [POST] /bo/webhook
  async handleWebhook(req, res, next) {
    try {
      const {key} = req.query
      const {event_type, resource} = req.body
      if (key === "clockwoodshop" && event_type === "PAYMENT.SALE.COMPLETED") {
        const paymentHash = resource.parent_payment
        const invoiceNumber = resource.invoice_number

        const orderId = invoiceNumber
        // insert new transactions
        const newTxs = new Transaction({
          paymentHash,
          data: req.body,
        })
        const newTxsData = await newTxs.save()
        // update transaction
        const updatedOrder = await Order.findOneAndUpdate(
          {
            _id: orderId,
            paymentHash,
            status: "PENDING",
          },
          {
            transactionId: newTxsData._id,
            status: "APPROVED",
          },
          {returnDocument: "after"}
        )
        logger.warn(`TRANSACTION: ${updatedOrder._id}`)
        next([200, "WEBHOOK_HANDLER", req.body])
      } else {
        logger.warn(JSON.stringify({key, event_type}))
        next([400, "ACCESS_DENIED"])
      }
    } catch (error) {
      logger.error(error.message)
      next([500])
    }
  }

  // [GET] /bo/statistic?type=[CLOCKTYPE | PROVIDER | MATERIAL]
  async handleStatistic(req, res, next) {
    try {
      const {type} = req.query
      const statisticalType = ["CLOCKTYPE", "PROVIDER", "MATERIAL"]
      if (!statisticalType.includes(type)) next([404, "FILTER_TYPE_INVALID"])

      let statsResult = {
        type,
        stats: [],
      }
      statsResult.stats = await boServices.statisticClockByType(type)
      next([200, "STATISTIC_BY_" + type, statsResult])
    } catch (error) {
      logger.error(error.message)
      next([500])
    }
  }
  // [GET] /bo/revenue-stats
  async handleRevenueStats(req, res, next) {
    try {
      let statsResult = await boServices.getAllOrder()
      next([400, "MAINTAIN", statsResult])
    } catch (error) {
      logger.error(error.message)
      next([500])
    }
  }
  // [GET] /bo/order/all
  async getAllOrder(req, res, next) {
    try {
      let allOrder = await boServices.getAllOrder()
      next([200, "BO_ALL_ORDER", allOrder])
    } catch (error) {
      logger.error(error.message)
      next([500])
    }
  }
  // [POST] /bo/order/cod-approve
  async approveCodOrder(req, res, next) {
    try {
      const {orderId} = req.body
      if (isNull({orderId})) {
        return next([400, "EMPTY_DATA"])
      }
      const orderData = await boServices.getOrderDataById(orderId)
      if (
        orderData.status === "PENDING" &&
        orderData.paymentMethod.type === "COD"
      ) {
        await Order.findByIdAndUpdate(orderId, {status: "APPROVED"})
        orderData._doc.status = "APPROVED"
      } else if (
        orderData.status === "APPROVED" &&
        orderData.paymentMethod.type === "COD"
      ) {
        next([401, "ORDER_ALREADY_APPROVED"])
      } else if (orderData.paymentMethod.type !== "COD") {
        next([401, "ONLY_APPROVE_COD_ORDER"])
      } else {
        logger.warn("ORDER_ACCEPT: " + orderData._id + "/" + orderData.status)
        next([403, "ACCESS_DENIED"])
      }
      next([200, "COD_APPROVE_SUCCESS", orderData])
    } catch (error) {
      next([500, "", error])
    }
  }
}

module.exports = new BoController()
