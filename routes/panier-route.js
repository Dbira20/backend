const express = require("express")
const router = express.Router()
const PanierController = require("../controllers/panier-controller")

router.post("/get-my",PanierController.getMy)
router.post("/add-to-cart", PanierController.addToCart)
router.route("/").delete(PanierController.delete)
router.delete("/all", PanierController.deleteAll)

module.exports = router