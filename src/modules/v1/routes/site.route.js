const express = require("express")
const router = express.Router()

const SiteController = require("../controllers/site.controller")
const TestController = require("../controllers/test.controller")

// ./

router.get("/", SiteController.index)
router.get("/test", TestController.index)
router.get("/findById", SiteController.findById)

module.exports = router
