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
const logger = require("../../../common/logs")

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
    const {key} = req.query
    const {event_type, resource} = req.body
    if (key === "clockwoodshop" && event_type === "PAYMENT.SALE.COMPLETED") {
      const paymentHash = resource.parent_payment
      const invoiceNumber = resource.invoice_number
      const orderId = invoiceNumber
      const orderData = await Order.findById(orderId)
      logger.info(orderData)
      next([200, "WEBHOOK_HANDLER", req.body])
    } else {
      logger.warn(JSON.stringify({key, event_type}))
      next([400, "ACCESS_DENIED"])
    }
  }
}

module.exports = new BoController()
