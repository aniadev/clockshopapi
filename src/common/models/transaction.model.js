var mongoose = require("mongoose")

var TransactionSchema = new mongoose.Schema(
  {
    paymentHash: {
      type: String,
      required: true,
      unique: true,
    },
    data: {
      type: Object,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

var Transaction = mongoose.model("transactions", TransactionSchema)
module.exports = Transaction
