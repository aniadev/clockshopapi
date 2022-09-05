const {forEach, includes} = require("lodash")
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
const allProductType = ["clock", "clockType", "material", "provider"]
const {keywordToRegex, isNull, logger} = require("../services")

class ProductController {
  // [GET] /product/all?type=<dataType>
  async getAllData(req, res, next) {
    try {
      const dataType = req.query.type || "clock"
      let responseData
      if (!includes(allProductType, dataType)) {
        res.status(200).json({
          status: "FALSE",
          message: "ERROR_PRODUCT_TYPE",
        })
        return
      }
      if (dataType === "clock") {
        responseData = await Clock.find()
          .populate("clockTypeId", ["name", "description"])
          .populate("materialId", ["name", "info"])
          .populate("providerId", ["name", "address", "phoneNumber"])
          .sort({createdAt: -1})
      } else if (dataType === "clockType") {
        responseData = await ClockType.find()
      } else if (dataType === "material") {
        responseData = await Material.find()
      } else if (dataType === "provider") {
        responseData = await Provider.find()
      }
      res.status(200).json({
        status: "SUCCESS",
        data: {
          type: dataType,
          data: responseData,
        },
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
        .populate("clockTypeId", ["name", "description"])
        .populate("materialId", ["name", "info"])
        .populate("providerId")
      if (!itemData) {
        res.status(404).json({
          status: "FAIL",
          message: "NOT_FOUND",
        })
        return
      }
      res.status(200).json({
        status: "SUCCESS",
        data: itemData,
      })
    } catch (error) {
      console.log(error)
      res.status(500).json({
        status: "ERROR",
        message: "External server error",
      })
    }
  }
  // [GET] /product/search?keyword=1234
  async searchProduct(req, res, next) {
    try {
      const {keyword} = req.query
      const $regex = keywordToRegex(keyword)
      // console.log(keywordToRegex($regex))
      const searchRs = await Clock.find({
        model: {$regex, $options: "gmi"},
      })
        .populate("clockTypeId", ["name", "description"])
        .populate("materialId", ["name", "info"])
        .populate("providerId")
        .sort({unitPrice: 1})

      next([200, "SEARCH", {keyword, result: searchRs}])
    } catch (error) {
      logger.error(error.message)
      next([500])
    }
  }
  // [POST] /product/create-clock
  async createNewClock(req, res, next) {
    try {
      const newClock = {
        model: req.body?.model,
        materialId: req.body?.materialId,
        clockTypeId: req.body?.clockTypeId,
        providerId: req.body?.providerId,
        description: req.body?.description,
        images: req.body?.images,
        unitPrice: req.body?.unitPrice,
        numOfRemain: req.body?.numOfRemain,
      }
      if (isNull(newClock)) {
        res.status(404).json({
          status: "FAIL",
          message: "EMPTY_DATA",
        })
        return
      }
      const existedClock = await Clock.findOne({model: newClock.model})
      if (existedClock) {
        res.status(404).json({
          status: "FAIL",
          message: "EXISTED",
        })
        return
      }
      const newClock_doc = new Clock(newClock)
      const newClockData = await newClock_doc.save()

      res.status(200).json({
        status: "SUCCESS",
        message: "CREATED_SUCCESSFUL",
        data: newClockData,
      })
    } catch (error) {
      console.log(error)
      res.status(500).json({
        status: "ERROR",
        message: "External server error",
      })
    }
  }
  // [PUT] /product/update-clock
  async updateClock(req, res, next) {
    try {
      const clockId = req.query?._id
      const newClock = {
        model: req.body?.model,
        materialId: req.body?.materialId,
        clockTypeId: req.body?.clockTypeId,
        providerId: req.body?.providerId,
        description: req.body?.description,
        images: req.body?.images,
        unitPrice: req.body?.unitPrice,
        numOfRemain: req.body?.numOfRemain,
      }
      const existedClock = await Clock.findByIdAndUpdate(clockId, newClock, {
        returnDocument: "after",
      })
      if (!existedClock) {
        res.status(404).json({
          status: "FAIL",
          message: "NOT_FOUND",
        })
        return
      }
      res.status(200).json({
        status: "SUCCESS",
        message: "UPDATED_SUCCESSFUL",
        data: existedClock,
      })
    } catch (error) {
      console.log(error)
      res.status(500).json({
        status: "ERROR",
        message: "External server error",
      })
    }
  }

  //  CLOCKTYPE
  // [POST] /product/create-clocktype
  async createNewClockType(req, res, next) {
    try {
      const newClockType = {
        name: req.body?.name,
        description: req.body?.description,
      }
      if (isNull(newClockType)) {
        res.status(404).json({
          status: "FAIL",
          message: "EMPTY_DATA",
        })
        return
      }
      const existClockType = await ClockType.findOne({name: newClockType.name})
      if (existClockType) {
        res.status(404).json({
          status: "FAIL",
          message: "EXISTED",
        })
        return
      }
      const newDoc = new ClockType(newClockType)
      const doc = await newDoc.save()
      res.status(200).json({
        status: "SUCCESS",
        data: doc,
      })
    } catch (error) {
      console.log(error)
      res.status(500).json({
        status: "ERROR",
        message: "External server error",
      })
    }
  }

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
      console.log(error)
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
      console.log(error)
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
      console.log(error)
      res.status(500).json({
        status: "ERROR",
        message: "EXTERNAL_SERVER_ERROR",
      })
    }
  }
  // [PUT] /product/delete-material
  async deleteMaterial(req, res, next) {
    try {
      const {materialId} = req.body
      if (!materialId) {
        res.status(404).json({
          status: "FAIL",
          message: "NO_MATERIAL_ID",
        })
        return
      }
      const rs = await Material.findByIdAndDelete(materialId, {
        returnOriginal: true,
      })
      res.status(200).json({
        status: "SUCCESS",
        message: "DELETE_SUCCESSFUL",
        data: {
          _id: materialId,
        },
      })
    } catch (error) {
      console.log(error)
      res.status(500).json({
        status: "ERROR",
        message: "EXTERNAL_SERVER_ERROR",
      })
    }
  }

  //  PROVIDER
  // [GET] /product/all-provider
  async getAllProvider(req, res, next) {
    try {
      const allProvider = await Provider.find()
      res.status(200).json({
        status: "SUCCESS",
        message: "CREATED_SUCCESSFUL",
        data: allProvider,
      })
    } catch (error) {
      console.log(error)
      res.status(500).json({
        status: "ERROR",
        message: "EXTERNAL_SERVER_ERROR",
      })
    }
  }
  // [POST] /product/create-provider
  async createProvider(req, res, next) {
    try {
      const {name, address, phoneNumber} = req.body
      if (!name) {
        res.status(404).json({
          status: "FAIL",
          message: "EMPTY_DATA",
        })
        return
      }
      const existProvider = await Provider.findOne({name})
      if (existProvider) {
        res.status(404).json({
          status: "FAIL",
          message: "EXISTED",
        })
        return
      }
      const newProvider = new Provider({name, address, phoneNumber})
      const newProviderData = await newProvider.save()
      res.status(200).json({
        status: "SUCCESS",
        message: "CREATED_SUCCESSFUL",
        data: newProviderData,
      })
    } catch (error) {
      console.log(error)
      res.status(500).json({
        status: "ERROR",
        message: "EXTERNAL_SERVER_ERROR",
      })
    }
  }
  // [POST] /product/update-material
  // async updateProvider(req, res, next) {
  //   try {
  //     const {name} = req.body
  //     if (!name) {
  //       res.status(404).json({
  //         status: "FAIL",
  //         message: "EMPTY_DATA",
  //       })
  //       return
  //     }
  //     const updatedProvider = await Provider.findOneAndUpdate({name})
  //     if (!updatedProvider) {
  //       res.status(404).json({
  //         status: "FAIL",
  //         message: "NOT_FOUND",
  //       })
  //       return
  //     }
  //     res.status(200).json({
  //       status: "SUCCESS",
  //       message: "UPDATED_SUCCESSFUL",
  //       data: updatedProvider,
  //     })
  //   } catch (error) {
  //     console.log(error)
  //     res.status(500).json({
  //       status: "ERROR",
  //       message: "EXTERNAL_SERVER_ERROR",
  //     })
  //   }
  // }

  // [DELETE] /product/delete-provider
  async deleteProvider(req, res, next) {
    try {
      const {providerId} = req.body
      if (!providerId) {
        res.status(404).json({
          status: "FAIL",
          message: "NO_PROVIDER_ID",
        })
        return
      }
      const rs = await Provider.findByIdAndDelete(providerId, {
        returnOriginal: true,
      })
      res.status(200).json({
        status: "SUCCESS",
        message: "DELETE_SUCCESSFUL",
        data: {
          _id: providerId,
        },
      })
    } catch (error) {
      console.log(error)
      res.status(500).json({
        status: "ERROR",
        message: "EXTERNAL_SERVER_ERROR",
      })
    }
  }
}

module.exports = new ProductController()
