const Panier = require("../models/Panier");

exports.getMy = async (req, res) => {
  res.send({ panier: await Panier.findOne({ "user": req.body.user }).populate("produits user") });
};

exports.addToCart = async (req, res) => {
  const { user, produit } = req.body;

  let panier = await Panier.findOne({ "user": user })

  if (panier) {

    panier = await Panier.findOneAndUpdate(
      { _id: panier._id },
      {
        $push: {
          produits: [produit]
        }
      }
    );

  } else {
    panier = new Panier();

    panier.user = user
    panier.produits = [produit];


    panier.save();
  }

  console.log(panier)


  res.status(201).send({ message: "success", panier: panier });
};

exports.delete = async (req, res) => {
  const panier = await Panier.findById(req.body._id).remove();
  res.status(201).send({ message: "success", panier: panier });
};

exports.deleteAll = async (req, res) => {
  Panier.remove({}, function (err, panier) {
    if (err) {
      return handleError(res, err);
    }
    return res.status(204).send({ message: "Aucun element" });
  });
};
