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

    User.updateOne(query, {$addToSet: {favorites: favorite}}).then((doc) => {
        if (doc.nModified == 0) {
            res.sendStatus(304);
        } else if (doc.nModified == 1) {
            res.sendStatus(200);
        } else {
            res.sendStatus(500);
        }
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

// route to swap item at originalIndex to finalIndex.
router.post('/swap', connectEnsureLogin.ensureLoggedIn(), (req, res, next) => {

    let query = { email_address: req.user.email_address };
    let originalIndex = req.body.originalIndex;
    let finalIndex = req.body.finalIndex;

    User.findOne(query, { favorites: 1 }).then((fav) => {
        let originalNode = fav.favorites[originalIndex];
        if (originalIndex > finalIndex) {
            fav.favorites.splice(finalIndex, 0, originalNode);
            fav.favorites.splice(originalIndex + 1, 1);
        } else {
            fav.favorites.splice(finalIndex + 1, 0, originalNode);
            fav.favorites.splice(originalIndex, 1);
        }
        return fav.favorites
    }).then((res) => User.findOneAndUpdate(query, { $set: { favorites: res }}, { overwrite: true }))
    .then(() => {
        res.sendStatus(200);            
    }).catch(err => {
        console.log(err);
        res.sendStatus(500);
    });
})

module.exports = router;