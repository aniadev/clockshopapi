const User = require("./user.model")
const Order = require("./order.model")
const OrderDetail = require("./orderDetail.model")
const Cart = require("./cart.model")
const Clock = require("./clock.model")
const ClockType = require("./clockType.model")
const Provider = require("./provider.model")
const Material = require("./material.model")
const Payment = require("./paymentMethod.model")

const Models = {
  User,
  Order,
  OrderDetail,
  Cart,
  Clock,
  ClockType,
  Provider,
  Material,
  Payment,
}

module.exports = Models
