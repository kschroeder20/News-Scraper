const express = require('express');
const router = express.Router();
const path = require("path");
const mongojs = require("mongojs");

const cheerio = require('cheerio');
const axios = require('axios');

const Comment = require("../models/Comment.js");
const Article = require("../models/Article.js");

router.get('/', function (req, res) {
    res.redirect('/articles');
});

//Scrape USA Today's sports section, and log it to the db
router.get('/scrape', (req, res) => {
    axios.get('https://www.usatoday.com/sports/')
        .then(result => {
            const $ = cheerio.load(result.data);
            $('ul.headline-page li[itemtype="https://schema.org/NewsArticle"]').each((i, element) => {

                const headline = $(element).find('p[itemprop="headline"]').text();
                const link = `https://www.usatoday.com${$(element).find('a[itemprop="url"]').attr('href')}`;
                const summary = $(element).find('span.hgpm-back-listview-text').attr('data-fulltext');
                //let image = $(element).find('img[itemprop="thumbnailUrl"]').attr('src');

                const article = {
                    headline: headline,
                    link: link,
                    summary: summary,
                    //image: image
                };

                // Create a new Article using the `result` object built from scraping
                if (headline !== "Love the Game(s)? This newsletter is for you" || headline !== "Sports, delivered: Get biggest news in your inbox!") {
                    Article.create(article)
                        .then(function (dbArticle) {
                            // View the added result in the console
                            console.log(dbArticle);
                        })
                        .catch(function (err) {
                            // If an error occurred, log it
                            console.log(err);
                        });
                }
            });
            res.redirect('/articles');
        }).catch(error => console.log(error));
});

// Route for getting all Articles from the db
router.get("/articles", function (req, res) {
    Article.find({}).sort({ _id: -1 }).then(result => {
        // If all Articles are successfully found, send them back to the client
        const data = { article: result };
        res.render('index', data);
    })
        .catch(err => {
            // If an error occurs, send the error back to the client
            res.json(err);
        });
});

// Route for grabbing a specific Article by id, populate it with it's comments
router.get("/articles/:id", (req, res) => {
    Article.find({ _id: req.params.id })
        .populate("comment")
        .then(result => {
            const data = {article: result}
            res.render('article', data);
        }).catch( err => {
            // If an error occurs, send it back to the client
            res.json(err);
        });
});

//Save comments to db when someone comments on the specific article
router.post('/comment/:id', function (req, res) {
    const user = req.body.name;
    const content = req.body.comment;
    const articleId = req.params.id;

    console.log(user);
    console.log(req.body);

    const comment = {
        name: user,
        body: content
    };

    const newComment = new Comment(comment);

    newComment.save((err, doc) => {
        if (err) {
            console.log(err);
        } else {
            Article.findOneAndUpdate({ _id: req.params.id }, { $push: { comment: doc._id } }, { new: true })
                .then(dbUser => {
                    // If the User was updated successfully, send it back to the client
                    res.redirect(`/articles/${req.params.id}`);
                })
                .catch(err => {
                    // If an error occurs, send it back to the client
                    res.json(err);
                });
        }
    });
});

//Remove all articles from db
router.get('/clearAll', (req, res) => {
    Article.remove({}, (err, doc) => {
        if (err) {
            console.log(err);
        } else
            console.log("articles removed");
    });
    res.redirect('/articles')
});

module.exports = router;

