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

    try {
        let response = await fetch(`${process.env.ISSUER_BASE_URL}/Users/${context.user.id}/Favorites/AddBooks`, {
            method: 'put',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([req.body]),
        });
        res.sendStatus(response.status);
    } catch(err) {
        console.log("Error adding to favorites", err);
    }
});

router.post('/remove', requiresAuth(), async (req, res, next) => {
    let context = await createUserContext(req);

    try {
        let response = await fetch(`${process.env.ISSUER_BASE_URL}/Users/${context.user.id}/Favorites/RemoveBooks`, {
            method: 'put',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([req.body]),
        });
        res.sendStatus(response.status);
    } catch(err) {
        console.log("Error removing from favorites", err);
    }
});

// route to swap item at originalIndex to finalIndex.
router.post('/swap', requiresAuth(), async (req, res, next) => {

    let context = await createUserContext(req);

    try {
        let response = await fetch(`${process.env.ISSUER_BASE_URL}/Users/${context.user.id}/Favorites/UpdateBooks`, {
            method: 'put',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body),
        });
        res.sendStatus(response.status);
    } catch(err) {
        console.log("Error swapping favorites", err);
    }
})

module.exports = router;