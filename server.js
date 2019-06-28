const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const cheerio = require('cheerio');
const axios = require('axios');
const bodyParser = require('body-parser');


var PORT = 3000;

// Require all models
var db = require("./models");

// Initialize Express
var app = express();

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
const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://localhost/scraper";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
    console.log("Connected to Mongoose!");
});


var routes = require("./controller/api-routes.js");
app.use("/", routes);


// app.get('/scrape', (req, res) => {
//     axios.get('https://www.usatoday.com/sports/')
//         .then(result => {
//             const $ = cheerio.load(result.data);
//             $('ul.headline-page li[itemtype="https://schema.org/NewsArticle"]').each(function (i, element) {

//                 let headline = $(element).find('p[itemprop="headline"]').text();
//                 let link = `https://www.usatoday.com${$(element).find('a[itemprop="url"]').attr('href')}`;
//                 let summary = $(element).find('span.hgpm-back-listview-text').attr('data-fulltext');
//                 //let image = $(element).find('img[itemprop="thumbnailUrl"]').attr('src');

//                 let article = {
//                     headline: headline,
//                     link: link,
//                     summary: summary,
//                     //image: image
//                 };

//                 // Create a new Article using the `result` object built from scraping
//                 if (headline !== "Love the Game(s)? This newsletter is for you" || headline !== "Sports, delivered: Get biggest news in your inbox!") {
//                     db.Article.create(article)
//                         .then(function (dbArticle) {
//                             // View the added result in the console
//                             console.log(dbArticle);
//                         })
//                         .catch(function (err) {
//                             // If an error occurred, log it
//                             console.log(err);
//                         });
//                 }
//                 });
//             res.send('Scrape complete');
//         }).catch(error => console.log(error));
// });

// // Route for getting all Articles from the db
// app.get("/articles", function (req, res) {
//     db.Article.find({}).then(function (result) {
//         // If all Notes are successfully found, send them back to the client
//         var data = { article: result };
//         res.render('index', data);
//     })
//         .catch(function (err) {
//             // If an error occurs, send the error back to the client
//             res.json(err);
//         });
// });

// // Route for grabbing a specific Article by id, populate it with it's note
// app.get("/articles/:id", function (req, res) {
//     // TODO
//     // ====
//     // Finish the route so it finds one article using the req.params.id,
//     // and run the populate method with "note",
//     // then responds with the article with the note included
//     db.Article.find({ _id: mongojs.ObjectId(req.params.id) })
//         .populate("Comment")
//         .then(function (result) {
//             res.json(result);
//         }).catch(function (err) {
//             // If an error occurs, send it back to the client
//             res.json(err);
//         });
// });

// // Route for saving/updating an Article's associated Note
// app.post("/articles/:id", function (req, res) {
//     // TODO
//     // ====
//     // save the new note that gets posted to the Notes collection
//     // then find an article from the req.params.id
//     // and update it's "note" property with the _id of the new note
// });


app.listen(PORT, function () {
    console.log("App running on PORT: " + PORT);
});
