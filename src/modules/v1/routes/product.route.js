const express = require("express")
const router = express.Router()

const ProductController = require("../controllers/product.controller")
const Auth = require("../middlewares/auth.middleware")
const AdminRole = require("../middlewares/admin.middleware")

// /=> get all items
router.get("/", ProductController.getAllData)
router.get("/all", ProductController.getAllData)

// /=> get detail item
router.get("/detail", ProductController.getDataById)

module.exports = router
