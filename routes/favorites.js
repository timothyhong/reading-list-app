const router = require('express').Router();
const connectEnsureLogin = require('connect-ensure-login');
const connection = require('../config/database');
const createUserContext = require('../lib/helpers').createUserContext;
const User = connection.models.User;
const Favorite = connection.models.Favorite;
const mongoose = require('mongoose');
const passport = require('passport');
const fetch = require('node-fetch');
const { auth, requiresAuth } = require('express-openid-connect');

router.get('/', requiresAuth(), async (req, res, next) => {
    let context = await createUserContext(req);

    try {
        let response = await fetch(`${process.env.ISSUER_BASE_URL}/Users/${context.user.id}/Favorites`, {
              method: 'get',
        });
        let favorites = await response.json();
        context.favorites = favorites;
    } catch(err) {
        console.log("Error getting favorites");
    }
    res.render('favorites', context);
});

router.post('/add', requiresAuth(), async (req, res, next) => {
    let context = await createUserContext(req);

    let favorite = new Favorite({
        title: req.body.title,
        author: req.body.author,
        isbn: req.body.isbn,
        details: req.body.details,
        img: req.body.img,
        amazon_product_url: req.body.amazon_product_url,
    });

    try {
        let response = await fetch(`${process.env.ISSUER_BASE_URL}/Users/${context.user.id}/Favorites/AddBooks`, {
            method: 'put',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(favorite),
        });
        console.log(await response.json());
    } catch(err) {
        console.log("Error adding to favorites");
    }

    // let query = { email_address: req.user.email_address };

    // User.updateOne(query, {$addToSet: {favorites: favorite}}).then((doc) => {
    //     if (doc.nModified == 0) {
    //         res.sendStatus(304);
    //     } else if (doc.nModified == 1) {
    //         res.sendStatus(200);
    //     } else {
    //         res.sendStatus(500);
    //     }
    // }).catch(err => {
    //     console.log(err);
    //     res.sendStatus(500);
    // });
});

router.post('/remove', requiresAuth(), (req, res, next) => {

    let query = { email_address: req.user.email_address };

    User.findOneAndUpdate(query, { $pull: { favorites: { isbn: req.body.isbn }}}, {new: true}).then(() => {
        res.sendStatus(200);
    }).catch(err => {
        console.log(err);
        res.sendStatus(500);
    });
});

// route to swap item at originalIndex to finalIndex.
router.post('/swap', requiresAuth(), (req, res, next) => {

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