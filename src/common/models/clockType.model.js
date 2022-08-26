var mongoose = require("mongoose")

var ClockTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
)

var ClockType = mongoose.model("clock_types", ClockTypeSchema)
module.exports = ClockType
