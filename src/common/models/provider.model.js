var mongoose = require("mongoose")

var ProviderSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
})

var Provider = mongoose.model("providers", ProviderSchema)
module.exports = Provider
