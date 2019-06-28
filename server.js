const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const cheerio = require('cheerio');
const axios = require('axios');
const bodyParser = require('body-parser');


const PORT = process.env.PORT || 3000;

// Require all models
const database = require("./models");

// Initialize Express
const app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static(`${__dirname}/public`));

// HANDLEBARS
// Set Handlebars as the default templating engine.
const exphbs = require('express-handlebars');
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

//connecting to MongoDB
//mongoose.connect("mongodb://localhost/scraped_news");
// If deployed, use the deployed database. Otherwise use the local scraper database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scraper";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
    console.log("Connected to Mongoose!");
});

//Require routes
const routes = require("./controller/api-routes.js");
app.use("/", routes);


app.listen(PORT, function () {
    console.log("App running on PORT: " + PORT);
});
