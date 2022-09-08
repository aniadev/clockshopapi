const express = require("express")
const router = express.Router()

const AccountController = require("../controllers/account.controller")
const OrderController = require("../controllers/order.controller")
const Auth = require("../middlewares/auth.middleware")
const AdminRole = require("../middlewares/admin.middleware")

//  => /account/

// /=> get detail account
router.get("/detail", Auth, AccountController.getDataById)
router.put("/info/update", Auth, AccountController.updateUserData)

// /=> get all order of account
router.get("/order/all", Auth, OrderController.getAllOrder)
router.post("/order/create", Auth, OrderController.createAnOrder)
router.post("/order/approve", Auth, OrderController.approveOrderById)
router.post("/order/customer-accept", Auth, OrderController.completeOrderById)
router.get("/order/all-payment", OrderController.getAllPaymentMethods)
router.get("/order", Auth, OrderController.getAllOrder)

// /=> get all order of account
router.get("/cart/all", Auth, OrderController.getAllCartItem)
router.post("/cart/add", Auth, OrderController.addToCart)
router.put("/cart/update", Auth, OrderController.updateCartItem)
router.get("/cart", Auth, OrderController.getAllCartItem)

module.exports = router
