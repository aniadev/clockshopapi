const express = require("express")
const router = express.Router()

const SiteController = require("../controllers/site.controller")

// ./

router.get("/", SiteController.index)
router.get("/test", SiteController.test)
router.get("/findById", SiteController.findById)

module.exports = router
