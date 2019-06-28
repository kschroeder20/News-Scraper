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

router.get('/scrape', (req, res) => {
    axios.get('https://www.usatoday.com/sports/')
        .then(result => {
            const $ = cheerio.load(result.data);
            $('ul.headline-page li[itemtype="https://schema.org/NewsArticle"]').each(function (i, element) {

                let headline = $(element).find('p[itemprop="headline"]').text();
                let link = `https://www.usatoday.com${$(element).find('a[itemprop="url"]').attr('href')}`;
                let summary = $(element).find('span.hgpm-back-listview-text').attr('data-fulltext');
                //let image = $(element).find('img[itemprop="thumbnailUrl"]').attr('src');

                let article = {
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
    Article.find({}).sort({ _id: -1 }).then(function (result) {
        // If all Articles are successfully found, send them back to the client
        var data = { article: result };
        res.render('index', data);
    })
        .catch(function (err) {
            // If an error occurs, send the error back to the client
            res.json(err);
        });
});

// Route for grabbing a specific Article by id, populate it with it's note
router.get("/articles/:id", function (req, res) {
    // TODO
    // ====
    // Finish the route so it finds one article using the req.params.id,
    // and run the populate method with "note",
    // then responds with the article with the note included
    Article.find({ _id: req.params.id })
        .populate("comment")
        .then(function (result) {
            let data = {article: result}
            res.render('article', data);
        }).catch(function (err) {
            // If an error occurs, send it back to the client
            res.json(err);
        });
});

router.post('/comment/:id', function (req, res) {
    let user = req.body.name;
    let content = req.body.comment;
    let articleId = req.params.id;

    console.log(user);
    console.log(req.body);

    let comment = {
        name: user,
        body: content
    }

    let newComment = new Comment(comment);

    newComment.save(function (err, doc) {
        if (err) {
            console.log(err);
        } else {
            console.log(doc._id);
            console.log(articleId);

            Article.findOneAndUpdate({ _id: req.params.id }, { $push: { comment: doc._id } }, { new: true })
                .then(function (dbUser) {
                // If the User was updated successfully, send it back to the client
                    res.redirect(`/articles/${req.params.id}`);
            })
                .catch(function (err) {
                    // If an error occurs, send it back to the client
                    res.json(err);
                });

        }
    })


});

router.get('/clearAll', function (req, res) {
    Article.remove({}, function (err, doc) {
        if (err) {
            console.log(err);
        } else
            console.log("articles removed");
    });
    res.redirect('/articles')
});

module.exports = router;

