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
const {logger, boServives} = require("../services")

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

  // [POST] /bo/statistic?type=[clockType | provider | Material]
  async handleStatistic(req, res, next) {
    try {
      const {type} = req.query
      const statisticType = ["CLOCKTYPE", "PROVIDER", "MATERIAL"]
      if (!statisticType.includes(type)) next([404, "FILTER_TYPE_INVALID"])
      console.log(boServives)
      // await boServives.filterClockByType(type)
    } catch (error) {
      logger.error(error.message)
      next([500])
    }
  }
}

module.exports = new BoController()
