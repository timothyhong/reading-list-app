const mongoose = require('mongoose');
require('dotenv').config();
const conn = process.env.DB_STRING;

const connection = mongoose.createConnection(conn, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Schema for storing favorite books
const FavoriteSchema = new mongoose.Schema({
    title: String,
    author: String,
    isbn: String,
    details: String,
    img: String,
    amazon_product_url: String,
});

// Schema for storing user info. The hash and salt are derived from the user's given password when they register
const UserSchema = new mongoose.Schema({
    email_address: String,
    first_name: String,
    last_name: String,
    favorites: [FavoriteSchema],
    hash: String,
    salt: String,
});

const User = connection.model('User', UserSchema);
const Favorite = connection.model('Favorite', FavoriteSchema);

module.exports = connection;