const escapeStringRegexp = require("escape-string-regexp")
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
const logger = require("../../../common/logs")

const isNull = (data) => {
  let rs = false
  forEach(data, (value, key) => {
    if (data[key] == undefined) rs = true
  })
  return rs
}
const allProductType = ["clock", "clockType", "material", "provider"]
// This function converts the string to lowercase, then perform the conversion
function toLowerCaseNonAccentVietnamese(str) {
  str = str.toLowerCase()
  //     We can also use this instead of from line 11 to line 17
  //     str = str.replace(/\u00E0|\u00E1|\u1EA1|\u1EA3|\u00E3|\u00E2|\u1EA7|\u1EA5|\u1EAD|\u1EA9|\u1EAB|\u0103|\u1EB1|\u1EAF|\u1EB7|\u1EB3|\u1EB5/g, "a");
  //     str = str.replace(/\u00E8|\u00E9|\u1EB9|\u1EBB|\u1EBD|\u00EA|\u1EC1|\u1EBF|\u1EC7|\u1EC3|\u1EC5/g, "e");
  //     str = str.replace(/\u00EC|\u00ED|\u1ECB|\u1EC9|\u0129/g, "i");
  //     str = str.replace(/\u00F2|\u00F3|\u1ECD|\u1ECF|\u00F5|\u00F4|\u1ED3|\u1ED1|\u1ED9|\u1ED5|\u1ED7|\u01A1|\u1EDD|\u1EDB|\u1EE3|\u1EDF|\u1EE1/g, "o");
  //     str = str.replace(/\u00F9|\u00FA|\u1EE5|\u1EE7|\u0169|\u01B0|\u1EEB|\u1EE9|\u1EF1|\u1EED|\u1EEF/g, "u");
  //     str = str.replace(/\u1EF3|\u00FD|\u1EF5|\u1EF7|\u1EF9/g, "y");
  //     str = str.replace(/\u0111/g, "d");
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i")
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
  str = str.replace(/đ/g, "d")
  // Some system encode vietnamese combining accent as individual utf-8 characters
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, "") // Huyền sắc hỏi ngã nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, "") // Â, Ê, Ă, Ơ, Ư
  return str
}

// This function keeps the casing unchanged for str, then perform the conversion
function toNonAccentVietnamese(str) {
  str = str.replace(/A|Á|À|Ã|Ạ|Â|Ấ|Ầ|Ẫ|Ậ|Ă|Ắ|Ằ|Ẵ|Ặ/g, "A")
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
  str = str.replace(/E|É|È|Ẽ|Ẹ|Ê|Ế|Ề|Ễ|Ệ/, "E")
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
  str = str.replace(/I|Í|Ì|Ĩ|Ị/g, "I")
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i")
  str = str.replace(/O|Ó|Ò|Õ|Ọ|Ô|Ố|Ồ|Ỗ|Ộ|Ơ|Ớ|Ờ|Ỡ|Ợ/g, "O")
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
  str = str.replace(/U|Ú|Ù|Ũ|Ụ|Ư|Ứ|Ừ|Ữ|Ự/g, "U")
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
  str = str.replace(/Y|Ý|Ỳ|Ỹ|Ỵ/g, "Y")
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
  str = str.replace(/Đ/g, "D")
  str = str.replace(/đ/g, "d")
  // Some system encode vietnamese combining accent as individual utf-8 characters
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, "") // Huyền sắc hỏi ngã nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, "") // Â, Ê, Ă, Ơ, Ư
  return str
}

function keywordToRegex(str) {
  str = str.replaceAll("a", `(a|à|á|ả|ã|ạ|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ)`)
  str = str.replaceAll("A", `(A|Á|À|Ã|Ạ|Ả|Â|Ấ|Ầ|Ẫ|Ậ|Ẩ|Ă|Ắ|Ằ|Ẵ|Ặ|Ẳ)`)
  str = str.replaceAll("E", `(E|É|È|Ẽ|Ẹ|Ê|Ế|Ề|Ễ|Ệ)`)
  str = str.replaceAll("e", `(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)`)
  str = str.replaceAll("i", `(i|ì|í|ị|ỉ|ĩ)`)
  str = str.replaceAll("I", `(I|Í|Ì|Ĩ|Ị|Ỉ)`)
  str = str.replaceAll("y", `(ỳ|ý|ỵ|ỷ|ỹ|y)`)
  str = str.replaceAll("Y", `(Y|Ý|Ỳ|Ỹ|Ỵ)`)
  str = str.replaceAll("u", `(u|ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)`)
  str = str.replaceAll("U", `(U|Ú|Ù|Ũ|Ụ|Ư|Ứ|Ừ|Ữ|Ự)`)
  str = str.replaceAll("o", `(o|ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)`)
  str = str.replaceAll("O", `(O|Ó|Ò|Õ|Ọ|Ô|Ố|Ồ|Ỗ|Ộ|Ơ|Ớ|Ờ|Ỡ|Ợ)`)
  str = str.replaceAll("D", `(D|Đ)`)
  str = str.replaceAll("d", `(d|đ)`)
  str = str.replaceAll(/\.|\?|\@|\#|\,/g, ``)
  str = str.replaceAll(" ", `.*?`)

  return `${str}`
}

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
