const router = require('express').Router();
const connectEnsureLogin = require('connect-ensure-login');
const fetch = require('node-fetch');
const NYT_KEY = process.env.NYT_KEY;
const GOOGLE_BOOKS_KEY = process.env.GOOGLE_BOOKS_KEY;
const passport = require('passport');
const genPassword = require('../lib/passwordUtils').genPassword;
const connection = require('../config/database');
const User = connection.models.User;
const Favorite = connection.models.Favorite;

// imports for MongoDB
const mongoose = require('mongoose');

router.get('/', connectEnsureLogin.ensureLoggedIn(), (req, res, next) => {
    
    let context = {};
    let user = {};
    user.first_name = req.user.toObject().first_name;
    user.last_name = req.user.toObject().last_name;
    context.user = user;
    context.favorites = req.user.toObject().favorites;
    res.render('favorites', context);
});

router.post('/add', connectEnsureLogin.ensureLoggedIn(), (req, res, next) => {
    // add req.body to favorites using mongoose
    console.log(req.body);

    let favorite = new Favorite({
        title: req.body.title,
        author: req.body.author,
        isbn: req.body.isbn,
        details: req.body.details,
        img: req.body.img,
        amazon_product_url: req.body.amazon_product_url,
    });

    let query = { email_address: req.user.email_address };

    User.updateOne(query, {$addToSet: {favorites: favorite}}).then(doc => {
        console.log(doc);
    }).catch(err => {
        console.log(err);
    });
});

module.exports = router;