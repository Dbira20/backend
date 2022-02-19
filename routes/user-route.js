const express = require("express")
const router = express.Router()
const UserController = require("../controllers/user-controller")
const upload = require('../middlewares/storage');

router.get("/all", UserController.getAll)
router.post("/get-by-token", UserController.getUserByToken)
router.post("/register", UserController.register)
router.post("/login", UserController.login)
router.post("/login-with-social", UserController.loginWithSocial)
router.post("/send-confirmation-email", UserController.sendConfirmationEmail)
router.post("/confirmation", UserController.confirmation)
router.post("/forgot-password", UserController.forgotPassword)
router.put("/edit-profile", UserController.editProfile)
router.put("/edit-profile-picture", upload.single('image'), UserController.editProfilePicture)

router.delete("/one", UserController.delete)
router.delete("/all", UserController.deleteAll)

module.exports = router