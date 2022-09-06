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
        next([400, "ERROR_PRODUCT_TYPE"])
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
      next([
        200,
        "PRODUCT_DETAIL",
        {
          type: dataType,
          data: responseData,
        },
      ])
    } catch (error) {
      next([500, "", error])
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
        next([404, "CLOCK_NOT_FOUND"])
      }
      next([200, "CLOCK_DATA", itemData])
    } catch (error) {
      next([500, "", error])
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
      next([500, "", error])
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
        next([400, "EMPTY_DATA"])
      }
      const existedClock = await Clock.findOne({model: newClock.model})
      if (existedClock) {
        next([400, "CLOCK_MODEL_EXISTED"])
      }
      const newClock_doc = new Clock(newClock)
      const newClockData = await newClock_doc.save()
      next([200, "CREATED_SUCCESSFUL", newClockData])
    } catch (error) {
      next([500, "", error])
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
        next([404, "NOT_FOUND"])
      }
      next([200, "UPDATED_SUCCESSFUL", existedClock])
    } catch (error) {
      next([500, "", error])
    }
  }
  // [DELETE] /product/delete-clock
  async deleteClock(req, res, next) {
    try {
      const clockId = req.body?.clockId
      if (!clockId) next([400, "EMPTY_CLOCK_ID"])
      const deletedClock = await Clock.findByIdAndDelete(clockId, {
        returnDocument: "after",
      })
      if (!deletedClock) {
        next([404, "NOT_FOUND"])
      }
      next([200, "DELETED_SUCCESSFUL", deletedClock])
    } catch (error) {
      next([500, "", error])
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
        next([400, "EMPTY_DATA"])
      }
      const existClockType = await ClockType.findOne({name: newClockType.name})
      if (existClockType) {
        next([400, "CLOCK_TYPE_EXISTED"])
      }
      const newDoc = new ClockType(newClockType)
      const doc = await newDoc.save()
      next([200, "CREATED_SUCCESSFUL", doc])
    } catch (error) {
      next([500, "", error])
    }
  }

  // [GET] /product/all-material
  async getAllMaterial(req, res, next) {
    try {
      const allMaterial = await Material.find()
      next([200, "CREATED_SUCCESSFUL", allMaterial])
    } catch (error) {
      next([500, "", error])
    }
  }
  // [POST] /product/create-material
  async createMaterial(req, res, next) {
    try {
      const {name, info} = req.body
      if (!name) {
        next([400, "EMPTY_DATA"])
      }
      const existMaterial = await Material.findOne({name})
      if (existMaterial) {
        next([400, "MATERIAL_EXISTED"])
      }
      const newMaterial = new Material({name, info})
      const newMaterialData = await newMaterial.save()
      next([200, "CREATED_SUCCESSFUL", newMaterialData])
    } catch (error) {
      next([500, "", error])
    }
  }
  // [POST] /product/update-material
  async updateMaterial(req, res, next) {
    try {
      const {name, info} = req.body
      if (!name) {
        next([400, "EMPTY_DATA"])
      }
      const updatedMaterial = await Material.findOneAndUpdate({name}, {info})
      if (!updatedMaterial) {
        next([404, "NOT_FOUND"])
      }
      next([200, "UPDATED_SUCCESSFUL", updatedMaterial])
    } catch (error) {
      next([500, "", error])
    }
  }
  // [PUT] /product/delete-material
  async deleteMaterial(req, res, next) {
    try {
      const {materialId} = req.body
      if (!materialId) {
        next([400, "EMPTY_MATERIAL_ID"])
      }
      const rs = await Material.findByIdAndDelete(materialId, {
        returnOriginal: true,
      })
      next([200, "DELETE_SUCCESSFUL", {_id: materialId}])
    } catch (error) {
      next([500, "", error])
    }
  }

  //  PROVIDER
  // [GET] /product/all-provider
  async getAllProvider(req, res, next) {
    try {
      const allProvider = await Provider.find()
      next([200, "CREATED_SUCCESSFUL", allProvider])
    } catch (error) {
      next([500, "", error])
    }
  }
  // [POST] /product/create-provider
  async createProvider(req, res, next) {
    try {
      const {name, address, phoneNumber} = req.body
      if (!name) {
        next([400, "EMPTY_DATA"])
      }
      const existProvider = await Provider.findOne({name})
      if (existProvider) {
        next([400, "PROVIDER_EXISTED"])
      }
      const newProvider = new Provider({name, address, phoneNumber})
      const newProviderData = await newProvider.save()
      next([200, "CREATED_SUCCESSFUL", newProviderData])
    } catch (error) {
      next([500, "", error])
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
        next([400, "EMPTY_PROVIDER_ID"])
      }
      const rs = await Provider.findByIdAndDelete(providerId, {
        returnOriginal: true,
      })
      next([200, "DELETE_SUCCESSFUL", {_id: providerId}])
    } catch (error) {
      next([500, "", error])
    }
  }
}

module.exports = new ProductController()
