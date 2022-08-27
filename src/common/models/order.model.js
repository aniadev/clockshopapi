var mongoose = require("mongoose")

var OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    status: {
      type: String,
      enum: ["READY", "PENDING", "SUCCESS"],
      default: "READY",
    },
    discount: {
      type: Number,
      default: 0,
    },
    discountType: {
      type: String,
      enum: ["PERCENT", "AMOUNT"],
    },
    paymentMethod: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "payment_methods",
    },
  },
  {
    timestamps: true,
  }
)

var Order = mongoose.model("orders", OrderSchema)
module.exports = Order
