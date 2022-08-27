const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET
const Auth = require("../middlewares/auth.middleware")
const {
  User,
  Cart,
  Clock,
  ClockType,
  Order,
  OrderDetail,
  Payment,
  Material,
  Manufacture,
} = require("../../../common/models")

class SiteController {
  // [GET] /
  index(req, res, next) {
    res.json({
      statusCode: 200,
      status: "success",
      message: "Welcome to API",
    })
  }

  // [GET] /test
  async test(req, res, next) {
    res.json({
      statusCode: 200,
      status: "success",
      message: "test",
    })
  }

  // [GET] /generate
  async generate(req, res, next) {
    // const newManufacture = new Manufacture({
    //   name: "SAMSUNG",
    // })
    // await newManufacture.save()

    // const newMaterial = new Material({
    //   name: "Gỗ lim",
    //   info: "Gỗ lim",
    // })
    // await newMaterial.save()

    // const newClockType = new ClockType({
    //   name: "Treo tường",
    //   description: "670mm x 350mm",
    // })
    // await newClockType.save()

    // ==============
    // const newClock = new Clock({
    //   model: "C-01",
    //   description: "C-01",
    //   images: [
    //     "https://i.ibb.co/L0SZNSD/anifastbook-IMAGE-Sat-Aug272022-101132.jpg",
    //   ],
    //   numOfRemain: 30,
    //   unitPrice: 540000,
    //   clockTypeId: "630989f47854793d33352b95",
    //   manufacturerId: "630989f37854793d33352b91",
    //   materialId: "630989f37854793d33352b93",
    // })
    // let newClockData = await newClock.save()
    // console.log(
    //   ">>> / file: site.controller.js / line 67 / newClockData",
    //   newClockData
    // )
    // const newCart = new Cart({
    //   user: "630666f3ffd133e42e2bcb0c",
    //   clockId: newClockData._id,
    // })
    // const newCartData = await newCart.save()
    // console.log(
    //   ">>> / file: site.controller.js / line 76 / newCartData",
    //   newCartData
    // )
    // ====
    // const newPayment = new Payment({
    //   type: "BANK",
    //   accountNumber: "0909123321123",
    //   cardNumber: "123456",
    //   qrCode: "http://www.example.com/qrcode",
    // })
    // const newPaymentData = await newPayment.save()
    // console.log(
    //   ">>> / file: site.controller.js / line 88 / newPaymentData",
    //   newPaymentData
    // )
    // ====
    const newOrder = new Order({
      user: "630666f3ffd133e42e2bcb0c",
      status: "READY",
      discount: 10,
      discountType: "PERCENT",
      paymentMethod: "630993dacbbc646022d40628",
    })
    const newOrderData = await newOrder.save()

    res.json({
      statusCode: 200,
      status: "success",
      message: "generated successfully",
    })
  }

  // [GET] /findById?id=[id]
  async findById(req, res, next) {
    try {
      const {id} = req.query
      const result = await User.findById(id)
      console.log(">>> / file: site.controller.js / line 28 / result", result)
      if (result) {
        res.json({
          statusCode: 200,
          status: "SUCCESS",
          message: "findById",
          data: result,
        })
      } else {
        res.json({
          statusCode: 400,
          status: "FAIL",
          message: "not found",
        })
      }
    } catch (error) {
      res.json({
        statusCode: 400,
        status: "FAIL",
        message: "not found",
      })
    }
  }
}

module.exports = new SiteController()
