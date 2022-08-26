var mongoose = require("mongoose")

var ClockSchema = new mongoose.Schema(
  {
    model: {
      type: String,
      required: true,
    },
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "materials",
    },
    clockTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "clock_types",
    },
    numOfRemain: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      default: "",
    },
    images: {
      type: [String],
      default: [],
    },
    unitPrice: {
      type: Number,
      required: true,
    },
    manufacturerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "manufacturers",
    },
  },
  {
    timestamps: true,
  }
)

var Clock = mongoose.model("clocks", ClockSchema)
module.exports = Clock
