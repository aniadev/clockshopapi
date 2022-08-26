const User = require("./user.model")
const Order = require("./order.model")
const OrderDetail = require("./orderDetail.model")
const Cart = require("./cart.model")
const Clock = require("./clock.model")
const ClockType = require("./clockType.model")
const Manufacture = require("./manufacture.model")
const Material = require("./material.model")
const Payment = require("./paymentMethod.model")

const Models = {
  User,
  Order,
  OrderDetail,
  Cart,
  Clock,
  ClockType,
  Manufacture,
  Material,
  Payment,
}

module.exports = Models
