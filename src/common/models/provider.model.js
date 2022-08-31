var mongoose = require("mongoose")

var ProviderSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  address: {
    type: String,
    required: false,
    default: "",
  },
  phoneNumber: {
    type: String,
    required: false,
    default: "",
  },
})

var Provider = mongoose.model("providers", ProviderSchema)
module.exports = Provider
