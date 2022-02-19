const mongoose = require("mongoose");

const ProduitSchema = new mongoose.Schema(
  {
    name: { type: String },
    imagePath: { type: String },
    price: { type: Number },
    marge: { type: String },
    information: { type: String }
  },
  {
    timestamps: { currentTime: () => Date.now() },
  }
);
module.exports = mongoose.model("Produit", ProduitSchema);
