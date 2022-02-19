const express = require("express")
const app = express()

const mongoose = require("mongoose")
const port = process.env.PORT || 5000
const config = require("./config.json")
const bodyParser = require("body-parser")
const path = require("path");
const morgan = require("morgan")

app.use(morgan('combined'))

app.use(express.static('public'));  
app.use('/img', express.static('uploads/images'));

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use("/api/produit", require("./routes/produit-route"))
app.use("/api/panier", require("./routes/panier-route"))
app.use("/api/user", require("./routes/user-route"))

mongoose.Promise = global.Promise
mongoose.connect(config.database, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(
    () => {
      console.log("Connecté a la base de données")
    },
    (err) => {
      console.log("Connexion a la base de données echouée", err)
    }
  )

if (process.env.NODE_ENV === "produition") {
  console.log("app in produition mode")
  app.use(express.static("client/build"))
  app.get("/*", function (req, res) {
    res.sendFile(
      path.join(__dirname, "client", "build", "index.html"),
      function (err) {
        if (err) res.status(500).send(err)
      }
    )
  })
}

app.listen(port, () => console.log(`Server up and running on port ${port} !`))
