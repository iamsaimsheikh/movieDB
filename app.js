// library imports
const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const { engine } = require("express-handlebars");
const auth0Config = require("./config/auth0");
const { auth } = require("express-openid-connect");

// Configs

require("dotenv").config();
const app = express();
const router = express.Router();

// MongoDb Connection

const mongoDbConnection = require("./config/connection");
mongoDbConnection();

// Setting up View Engine - Handlebars

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

// Use Middlewares

app.use(express.json());
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(fileUpload({ useTempFiles: true }));
app.use(express.static(__dirname));
app.use(auth(auth0Config));

//routes

const userRoutes = require("./routes/userRoutes");
app.use("/user", userRoutes);

const actorRoutes = require("./routes/actorRoutes");
app.use("/actor", actorRoutes);

const movieRoutes = require("./routes/movieRoutes");
app.use("/movie", movieRoutes);

app.get("/", (req, res) => {
  if (req.oidc.isAuthenticated()) {
    res.render("dashboard", { user: req.oidc.user });
    // res.redirect("/movie/all/1/5");
  } else {
    res.render("home");
  }
});

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  console.log(`listening at http://localhost:${process.env.PORT}`);
});

module.exports = server;
