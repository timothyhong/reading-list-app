const router = require('express').Router();
const connectEnsureLogin = require('connect-ensure-login');
const connection = require('../config/database');
const createUserContext = require('../lib/helpers').createUserContext;
const User = connection.models.User;
const Favorite = connection.models.Favorite;
const mongoose = require('mongoose');

router.get('/', connectEnsureLogin.ensureLoggedIn(), (req, res, next) => {
    
    let context = createUserContext(req);
    context.favorites = req.user.toObject().favorites;
    res.render('favorites', context);
});

router.post('/add', connectEnsureLogin.ensureLoggedIn(), (req, res, next) => {

    let favorite = new Favorite({
        title: req.body.title,
        author: req.body.author,
        isbn: req.body.isbn,
        details: req.body.details,
        img: req.body.img,
        amazon_product_url: req.body.amazon_product_url,
    });

    let query = { email_address: req.user.email_address };

    User.updateOne(query, {$addToSet: {favorites: favorite}}).then(() => {
        res.sendStatus(200);
    }).catch(err => {
        console.log(err);
        res.sendStatus(500);
    });
});

router.post('/remove', connectEnsureLogin.ensureLoggedIn(), (req, res, next) => {

    let query = { email_address: req.user.email_address };

    User.findOneAndUpdate(query, { $pull: { favorites: { isbn: req.body.isbn }}}, {new: true}).then(() => {
        res.sendStatus(200);
    }).catch(err => {
        console.log(err);
        res.sendStatus(500);
    });
});

module.exports = router;