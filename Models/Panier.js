const mongoose = require("mongoose");

const PanierSchema = new mongoose.Schema(
  {
    produits: [{ type: mongoose.Types.ObjectId, ref : "Produit"}],
    user : { type: mongoose.Types.ObjectId, ref : "User"}
  },
  {
    timestamps: { currentTime: () => Date.now() },
  }
);
module.exports = mongoose.model("Panier", PanierSchema);