const express = require("express")

const router = express.Router()
const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET
const Auth = require("../middlewares/auth.middleware")

// ./
const SiteController = require("../controllers/site.controller")

router.get("/", SiteController.index)
router.get("/test", SiteController.test)

module.exports = router
