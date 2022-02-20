const User = require("../models/User");
const jwt = require("jsonwebtoken");
const config = require("../config.json");
const bcypt = require("bcrypt");
const nodemailer = require("nodemailer");
const fs = require("fs");

///// LINKS ---------------------------------------------------------

exports.getAll = async (req, res) => {
  res.status(200).send({ users: await User.find(), message: "success" });
};

exports.getUserByToken = async (req, res) => {
  let token = req.body.token;

  try {
    token = jwt.verify(token, config.token_secret);
  } catch (e) {
    return res.sendStatus(404);
  }

  res.send({ token, user: await User.findOne({ email: token.email }) });
};

exports.register = async (req, res) => {
  const {
    firstName,
    lastName,
    cin,
    email,
    address,
    password,
    phoneNumber,
    profilePicture,
    role,
  } = req.body;

  if (await User.findOne({ email })) {
    res.status(403).send({ message: "User existe deja !" });
  } else {
    const nouveauUser = new User();

    nouveauUser.firstName = firstName;
    nouveauUser.lastName = lastName;
    nouveauUser.cin = cin;
    nouveauUser.email = email;
    nouveauUser.address = address;
    nouveauUser.password = await bcypt.hash(password, 10);
    nouveauUser.phoneNumber = phoneNumber;
    nouveauUser.profilePicture = profilePicture;
    nouveauUser.isVerified = true;
    nouveauUser.role = role;

    nouveauUser.save();

    const token = jwt.sign({ email: email }, config.token_secret, {
      expiresIn: "36000000",
    });

    doSendConfirmationEmail(email, token);

    res.status(201).send({
      message: "success",
      user: nouveauUser,
      token: jwt.verify(token, config.token_secret),
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await bcypt.compare(password, user.password))) {
    const token = jwt.sign({ email: email }, config.token_secret, {
      expiresIn: "36000000",
    });

    if (user.isVerified) {
      res.status(200).send({ token, user, message: "Success" });
    } else {
      res.status(200).send({ user, message: "Email not verified" });
    }
  } else {
    res.status(403).send({ message: "Password or email incorrect" });
  }
};

exports.loginWithSocial = async (req, res) => {
  const { email, firstName, lastName } = req.body;

  if (email === "") {
    res.status(403).send({ message: "Error please provide an email" });
  } else {
    var user = await User.findOne({ email });
    if (user) {
      console.log("user exists, loging in");
    } else {
      console.log("user does not exists, creating an account");

      user = new User();

      user.email = email;
      user.firstName = firstName;
      user.lastName = lastName;
      user.role = "Client";
      user.isVerified = true;

      user.save();
    }

    // token creation
    const token = jwt.sign({ email: email }, config.token_secret, {
      expiresIn: "360000000",
    });

    res.status(201).send({ message: "success", user, token: token });
  }
};

exports.sendConfirmationEmail = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (user) {
    // token creation
    token = makeTokenForUser(user._id, email._id);

    doSendConfirmationEmail(req.body.email, token);

    res.status(200).send({
      message: "L'email de confirmation a été envoyé a " + user.email,
    });
  } else {
    res.status(404).send({ message: "User innexistant" });
  }
};

exports.confirmation = async (req, res) => {
  let token;

  try {
    token = jwt.verify(req.params.token, config.token_secret);
  } catch (e) {
    return res.status(400).send({
      message:
        "Le lien verification a peut être expireé, Veuillez revérifier votre email.",
    });
  }

  User.findById(token._id, function (err, user) {
    if (!user) {
      return res
        .status(401)
        .send({ message: "Aucun user, Veuillez proceder a l'inscription." });
    } else if (user.isVerified) {
      return res.status(200).send({
        message: "Cet user a deja été verifié, Veuillez vous connecter",
      });
    } else {
      user.isVerified = true;
      user.save(function (err) {
        if (err) {
          return res.status(500).send({ message: err.message });
        } else {
          return res
            .status(200)
            .send({ message: "Votre compte a été verifié" });
        }
      });
    }
  });
};

exports.forgotPassword = async (req, res) => {
  const codeDeReinit = req.body.codeDeReinit;
  const user = await User.findOne({ email: req.body.email });

  if (user) {
    // token creation
    const token = jwt.sign(
      { _id: user._id, email: user.email },
      config.token_secret,
      {
        expiresIn: "3600000", // in Milliseconds (3600000 = 1 hour)
      }
    );

    envoyerEmailReinitialisation(req.body.email, codeDeReinit);

    res.status(200).send({
      message: "L'email de reinitialisation a été envoyé a " + user.email,
    });
  } else {
    res.status(404).send({ message: "User innexistant" });
  }
};

exports.editProfile = async (req, res) => {
  const { firstName, lastName, cin, email, address, phoneNumber } = req.body;

  let user = await User.findOneAndUpdate(
    { email: email },
    {
      $set: {
        firstName: firstName,
        lastName: lastName,
        cin: cin,
        email: email,
        address: address,
        phoneNumber: phoneNumber,
      },
    }
  );

  res.send({ user });
};

exports.editProfilePicture = async (req, res, next) => {
  let user = await User.findOneAndUpdate(
    { email: req.body.email },
    {
      $set: {
        profilePicture: req.file.filename,
      },
    }
  );

  res.send({ user });
};

exports.delete = async (req, res) => {
  console.log(req.body);

  const user = await User.findById(req.body._id).remove();

  res.send({ user });
};

exports.deleteAll = async (req, res) => {
  User.remove({}, function (err, user) {
    if (err) {
      return handleError(res, err);
    }
    return res.status(204).send({ message: "Aucun element" });
  });
};

///// FUNCTIONS ---------------------------------------------------------

async function makeTokenForUser(_id, email) {
  return jwt.sign({ _id: _id, email: email }, config.token_secret, {
    expiresIn: "100000000", // in Milliseconds (3600000 = 1 hour)
  });
}

async function doSendResetEmail(email, codeDeReinit) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "esprit.peddler.app@gmail.com",
      pass: "peddler-cred",
    },
  });

  transporter.verify(function (error, success) {
    if (error) {
      console.log(error);
      console.log("Server not ready");
    } else {
      console.log("Server is ready to take our messages");
    }
  });

  const mailOptions = {
    from: "esprit.peddler.app@gmail.com",
    to: email,
    subject: "Reinitialisation de votre mot de passe - Chicky",
    html:
      "<h3>Vous avez envoyé une requete de reinitialisation de mot de passe </h3><p>Entrez ce code dans l'application pour proceder : <b style='color : blue'>" +
      codeDeReinit +
      "</b></p>",
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent : " + info.response);
    }
  });
}

async function doSendConfirmationEmail(email, token) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "esprit.peddler.app@gmail.com",
      pass: "peddler-cred",
    },
  });

  transporter.verify(function (error, success) {
    if (error) {
      console.log(error);
      console.log("Server not ready");
    } else {
      console.log("Server is ready to take our messages");
    }
  });

  const urlDeConfirmation =
    "http://localhost:3000/api/user/confirmation/" + token;

  const mailOptions = {
    from: "esprit.peddler.app@gmail.com",
    to: email,
    subject: "Confirma your email",
    html:
      "<h3>Please confirm your email using this link : </h3><a href='" +
      urlDeConfirmation +
      "'>Confirmation</a>",
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent : " + info.response);
    }
  });
}
