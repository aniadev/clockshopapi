const express = require("express")
const router = express.Router()

const AccountController = require("../controllers/product.controller")
const Auth = require("../middlewares/auth.middleware")
const AdminRole = require("../middlewares/admin.middleware")

//  => /account/

// /=> get all items
router.get("/", AccountController.getAllData)
router.get("/all", AccountController.getAllData)

// /=> get detail item
router.get("/detail", AccountController.getDataById)

module.exports = router
