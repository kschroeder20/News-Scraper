const mongoose = require("mongoose");

// Save a reference to the Schema constructor
const Schema = mongoose.Schema;

// Using the Schema constructor, create a new UserSchema object
// This is similar to a Sequelize model
const ArticleSchema = new Schema({
    // `headline` must be unique and of type String
    headline: {
        type: String,
        unique: true
    },
    link: {
        type: String,
        unique: true
    },
    summary: {
        type: String,
        unique: true
    },
    // `comment` is an array that stores ObjectIds
    // The ref property links these ObjectIds to the Comment model
    // This allows us to populate the Article with any associated Comment
    comment: [
        {
            // Store ObjectIds in the array
            type: Schema.Types.ObjectId,
            // The ObjectIds will refer to the ids in the Comment model
            ref: "Comment"
        }
    ]
});

// This creates our model from the above schema, using mongoose's model method
const Article = mongoose.model("Article", ArticleSchema);

// Export the User model
module.exports = Article;