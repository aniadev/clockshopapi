var mongoose = require("mongoose")

var PaymentSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  cardNumber: {
    type: String,
    default: "",
  },
  accountNumber: {
    type: String,
    required: true,
  },
  qrCode: {
    type: String,
    default: "",
  },
})

var Payment = mongoose.model("payment_methods", PaymentSchema)
module.exports = Payment
