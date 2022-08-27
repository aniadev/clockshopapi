var mongoose = require("mongoose")

var MaterialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  info: {
    type: String,
    default: "",
  },
})

var Material = mongoose.model("materials", MaterialSchema)
module.exports = Material
