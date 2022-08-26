var mongoose = require("mongoose")

var CartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    clockId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "clocks",
    },
  },
  {
    timestamps: true,
  }
)

var Cart = mongoose.model("shopping_cart", CartSchema)
module.exports = Cart
