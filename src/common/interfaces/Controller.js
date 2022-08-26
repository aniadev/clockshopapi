const Models = require("../models")

module.exports = class Controller {
  constructor() {
    this.data = "Hello"
  }
  index(req, res, next) {
    console.log(this.data)
    res.status(200).json({
      success: true,
      data: "data",
    })
  }
}
