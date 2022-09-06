const {forEach} = require("lodash")
const {
  User,
  Cart,
  Clock,
  ClockType,
  Order,
  OrderDetail,
  Payment,
  Material,
  Provider,
  Transaction,
} = require("../../../common/models")

async function getAllClockType(filter) {
  return ClockType.find(filter)
}
async function getAllProvider(filter) {
  return Provider.find(filter)
}
async function getAllMaterial(filter) {
  return Material.find(filter)
}
async function getAllOrder(filter) {
  return Order.find(filter)
}
async function getAllOrderDetail(filter) {
  return OrderDetail.find(filter)
}
async function getAllOrderDetailById(_id) {
  return OrderDetail.findById(_id)
}

async function statisticClockByType(type) {
  let allType, filter
  if (type === "CLOCKTYPE") {
    allType = await getAllClockType()
    filter = "clockTypeId"
  } else if (type === "PROVIDER") {
    allType = await getAllProvider()
    filter = "providerId"
  } else if (type === "MATERIAL") {
    allType = await getAllMaterial()
    filter = "materialId"
  } else return []
  let typeQueries = []
  forEach(allType, (typeId) => {
    typeQueries.push(Clock.find({[filter]: typeId}))
  })
  const rs = await Promise.all(typeQueries)
  forEach(rs, (items, index) => {
    allType[index]._doc.numOfType = items.length
    let totalQuantity = 0
    forEach(items, (item) => (totalQuantity += item.numOfRemain))
    allType[index]._doc.totalQuantity = totalQuantity
  })
  return allType
}

async function getAllOrder() {
  const allOrder = await Order.find({
    $or: [{status: "PENDING"}, {status: "APPROVED"}, {status: "SUCCESS"}],
  })
    .populate("user", ["fullName", "phoneNumber", "email"])
    .populate("paymentMethod", [
      "type",
      "cardNumber",
      "accountNumber",
      "qrCode",
    ])
  let orderDetailQueries = []
  forEach(allOrder, (item) => {
    orderDetailQueries.push(
      OrderDetail.find({orderId: item._id}).populate("clockId", ["model"])
    )
  })
  const allOrderDetails = await Promise.all(orderDetailQueries)
  forEach(allOrder, (item, index) => {
    let allItems = allOrderDetails[index]
    let totalPrice = 0
    forEach(allItems, (o) => (totalPrice += o.unitPrice * o.quantity))
    item._doc.allItems = allItems
    item._doc.totalPrice = totalPrice
  })
  return allOrder
}

async function getAllOrderByUserId(userId) {
  const allOrder = await Order.find({
    $and: [
      {user: userId},
      {$or: [{status: "PENDING"}, {status: "APPROVED"}, {status: "SUCCESS"}]},
    ],
  })
    .populate("user", ["fullName", "phoneNumber", "email"])
    .populate("paymentMethod", [
      "type",
      "cardNumber",
      "accountNumber",
      "qrCode",
    ])
  let orderDetailQueries = []
  forEach(allOrder, (item) => {
    orderDetailQueries.push(
      OrderDetail.find({orderId: item._id}).populate("clockId", ["model"])
    )
  })
  const allOrderDetails = await Promise.all(orderDetailQueries)
  forEach(allOrder, (item, index) => {
    let allItems = allOrderDetails[index]
    let totalPrice = 0
    forEach(allItems, (o) => (totalPrice += o.unitPrice * o.quantity))
    item._doc.allItems = allItems
    item._doc.totalPrice = totalPrice
  })
  return allOrder
}

module.exports = {
  getAllClockType,
  getAllProvider,
  getAllMaterial,
  statisticClockByType,
  //   statisticRevenue,
  getAllOrderByUserId,
  getAllOrder,
}
