var mongoose = require("mongoose")

var ManufactureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
})

var Manufacture = mongoose.model("manufacturers", ManufactureSchema)
module.exports = Manufacture
