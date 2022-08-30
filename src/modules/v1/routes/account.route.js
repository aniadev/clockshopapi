const express = require("express")
const router = express.Router()

const AccountController = require("../controllers/product.controller")
const OrderController = require("../controllers/order.controller")
const Auth = require("../middlewares/auth.middleware")
const AdminRole = require("../middlewares/admin.middleware")

//  => /account/

// /=> get all items
router.get("/", AccountController.getAllData)
router.get("/all", AccountController.getAllData)

// /=> get detail item
router.get("/detail", AccountController.getDataById)

// /=> get all order of account
router.get("/order", Auth, OrderController.getAllOrder)

// /=> get all order of account
router.get("/cart/all", Auth, OrderController.getAllCartItem)
router.post("/cart/add", Auth, OrderController.addToCart)
router.put("/cart/update", Auth, OrderController.updateCartItem)
router.get("/cart", Auth, OrderController.getAllCartItem)

module.exports = router
