var mongoose = require("mongoose")

var OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    shipTo: {
      type: String,
      require: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["READY", "PENDING", "SUCCESS", "ABORTED"],
      default: "READY",
    },
    discount: {
      type: Number,
      default: 0,
    },
    discountType: {
      type: String,
      enum: ["PERCENT", "AMOUNT"],
      default: "PERCENT",
    },
    paymentMethod: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "payment_methods",
    },
    paymentHash: {
      type: String,
      default: "",
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "transaction",
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

var Order = mongoose.model("orders", OrderSchema)
module.exports = Order
