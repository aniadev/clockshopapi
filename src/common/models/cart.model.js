var mongoose = require("mongoose")

var CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    clockId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "clocks",
    },
    quantity: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
)

var Cart = mongoose.model("shopping_cart", CartSchema)
module.exports = Cart
