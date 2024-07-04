const exp = require("express")
const router = exp.Router();
const userController = require("../Controller/UserController")

router.use("/user/signUp", userController.signUp)
router.use("/user/verifyOtp", userController.verifyOTP)
router.use("/user/login", userController.login)
router.use("/user/forgetPassword", userController.forgetPassword)
router.use("/user/resetPassword", userController.updatePassword)

module.exports = router