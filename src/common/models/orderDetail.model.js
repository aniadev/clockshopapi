var mongoose = require("mongoose")

var OrderDetailSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "orders",
    },
    clockId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "clocks",
    },
    quantity: {
      type: Number,
      required: true,
    },
    unitPrice: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

var OrderDetail = mongoose.model("order_details", OrderDetailSchema)
module.exports = OrderDetail
