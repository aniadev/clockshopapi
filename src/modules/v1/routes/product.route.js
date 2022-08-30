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

// /=> material
router.get("/all-material", ProductController.getAllMaterial)
router.post("/create-material", AdminRole, ProductController.createMaterial)
router.put("/update-material", AdminRole, ProductController.updateMaterial)
router.delete("/delete-material", AdminRole, ProductController.deleteMaterial)

module.exports = router
