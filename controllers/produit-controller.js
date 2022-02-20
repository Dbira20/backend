const Produit = require("../models/Produit");

exports.getAll = async (req, res) => {
  res.send({ produits: await Produit.find() });
};

exports.add = async (req, res) => {
  const { name, price, marge, information } = req.body;

  const newProduit = new Produit();
  
  newProduit.name = name
  newProduit.imagePath = req.file.filename
  newProduit.price = price
  newProduit.marge = marge
  newProduit.information = information

  newProduit.save();

  res.status(201).send({ message: "success", produit: newProduit });
};

exports.edit = async (req, res) => {
  const { _id, price, marge, name, information } = req.body;

  let produit = await Produit.findOneAndUpdate(
    { _id: _id },
    {
      $set: {
        name: name,
        imagePath: req.file.filename,
        price: price,
        marge: marge,
        information: information,
      },
    }
  );
  res.status(201).send({ message: "success", produit: produit });
};

exports.delete = async (req, res) => {
  const produit = await Produit.findById(req.body._id).remove();
  res.status(201).send({ message: "success", produit: produit });
};

exports.deleteAll = async (req, res) => {
  Produit.remove({}, function (err, produit) {
    if (err) {
      return handleError(res, err);
    }
    return res.status(204).send({ message: "Aucun element" });
  });
};
