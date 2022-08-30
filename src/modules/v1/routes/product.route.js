const express = require("express")
const router = express.Router()

const ProductController = require("../controllers/product.controller")
const AdminRole = require("../middlewares/admin.middleware")

// /=> get all items
router.get("/", ProductController.getAllData)
// /=> get all items by type
router.get("/all", ProductController.getAllData)

// /=> get detail item
router.get("/detail", ProductController.getDataById)
// /=> get detail item
router.post("/create-clock", AdminRole, ProductController.createNewClock)
router.put("/update-clock", AdminRole, ProductController.updateClock)

//
// /=====================> clockType
// router.get("/all-material", ProductController.getAllMaterial)
router.post(
  "/create-clocktype",
  AdminRole,
  ProductController.createNewClockType
)
// router.put("/update-material", AdminRole, ProductController.updateMaterial)
// router.delete("/delete-material", AdminRole, ProductController.deleteMaterial)

// /=====================> material
// router.get("/all-material", ProductController.getAllMaterial)
router.post("/create-material", AdminRole, ProductController.createMaterial)
router.put("/update-material", AdminRole, ProductController.updateMaterial)
router.delete("/delete-material", AdminRole, ProductController.deleteMaterial)

// /=====================> provider
// router.get("/all-provider", ProductController.getAllProvider)
router.post("/create-provider", AdminRole, ProductController.createProvider)
// router.put("/update-provider", AdminRole, ProductController.updateProvider)
router.delete("/delete-provider", AdminRole, ProductController.deleteProvider)

//
//
// /======================> order

module.exports = router
