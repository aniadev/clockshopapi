const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET
const jwt = require("jsonwebtoken")
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
} = require("../../../common/models")

class ProductController {
  // [GET] /product/all
  async getAllData(req, res, next) {
    try {
      const allProducts = await Clock.find()
        .sort({createdAt: -1})
        .populate("materialId", ["name", "info"])
        .populate("providerId", ["name"])
      res.status(200).json({
        status: "SUCCESS",
        data: allProducts,
      })
    } catch (error) {
      console.log(">>> / file: product.controller.js / line 28 / error", error)
      res.status(500).json({
        status: "ERROR",
        message: "External server error",
      })
    }
  }
  // [GET] /product/detail?_id=1234
  async getDataById(req, res, next) {
    try {
      const itemId = req.query._id
      const itemData = await Clock.findById(itemId)
        .sort({createdAt: -1})
        .populate("materialId", ["name", "info"])
        .populate("providerId", ["name"])
      res.status(200).json({
        status: "SUCCESS",
        data: itemData,
      })
    } catch (error) {
      console.log(">>> / file: product.controller.js / line 47 / error", error)
      res.status(500).json({
        status: "ERROR",
        message: "External server error",
      })
    }
  }

  //  MATERIAL
  // [GET] /product/all-material
  async getAllMaterial(req, res, next) {
    try {
      const allMaterial = await Material.find()
      res.status(200).json({
        status: "SUCCESS",
        message: "CREATED_SUCCESSFUL",
        data: allMaterial,
      })
    } catch (error) {
      console.log(">>> / file: product.controller.js / line 47 / error", error)
      res.status(500).json({
        status: "ERROR",
        message: "EXTERNAL_SERVER_ERROR",
      })
    }
  }
  // [POST] /product/create-material
  async createMaterial(req, res, next) {
    try {
      const {name, info} = req.body
      if (!name) {
        res.status(404).json({
          status: "FAIL",
          message: "EMPTY_DATA",
        })
        return
      }
      const existMaterial = await Material.findOne({name})
      if (existMaterial) {
        res.status(404).json({
          status: "FAIL",
          message: "EXISTED",
        })
        return
      }
      const newMaterial = new Material({name, info})
      const newMaterialData = await newMaterial.save()
      res.status(200).json({
        status: "SUCCESS",
        message: "CREATED_SUCCESSFUL",
        data: newMaterialData,
      })
    } catch (error) {
      console.log(">>> / file: product.controller.js / line 47 / error", error)
      res.status(500).json({
        status: "ERROR",
        message: "EXTERNAL_SERVER_ERROR",
      })
    }
  }
  // [POST] /product/update-material
  async updateMaterial(req, res, next) {
    try {
      const {name, info} = req.body
      if (!name) {
        res.status(404).json({
          status: "FAIL",
          message: "EMPTY_DATA",
        })
        return
      }
      const updatedMaterial = await Material.findOneAndUpdate({name}, {info})
      if (!updatedMaterial) {
        res.status(404).json({
          status: "FAIL",
          message: "NOT_FOUND",
        })
        return
      }
      res.status(200).json({
        status: "SUCCESS",
        message: "UPDATED_SUCCESSFUL",
        data: updatedMaterial,
      })
    } catch (error) {
      console.log(">>> / file: product.controller.js / line 47 / error", error)
      res.status(500).json({
        status: "ERROR",
        message: "EXTERNAL_SERVER_ERROR",
      })
    }
  }
  // [PUT] /product/delete-material
  async deleteMaterial(req, res, next) {
    try {
      const itemId = req.query._id
      const itemData = await Clock.findById(itemId)
        .sort({createdAt: -1})
        .populate("materialId", ["name", "info"])
        .populate("providerId", ["name"])
      res.status(200).json({
        status: "SUCCESS",
        data: itemData,
      })
    } catch (error) {
      console.log(">>> / file: product.controller.js / line 47 / error", error)
      res.status(500).json({
        status: "ERROR",
        message: "External server error",
      })
    }
  }
}

module.exports = new ProductController()
