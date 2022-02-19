const express = require("express")
const router = express.Router()
const PanierController = require("../controllers/produit-controller")
const upload = require('../middlewares/storage');

router.route("/")
    .get(PanierController.getAll)
    .post(upload.single('image'), PanierController.add)
    .put(upload.single('image'), PanierController.edit)
    .delete(PanierController.delete)

router.delete("/all", PanierController.deleteAll)

module.exports = router