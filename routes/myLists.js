const router = require('express').Router();
const connectEnsureLogin = require('connect-ensure-login');
const fetch = require('node-fetch');
const NYT_KEY = process.env.NYT_KEY;
const GOOGLE_BOOKS_KEY = process.env.GOOGLE_BOOKS_KEY;
const passport = require('passport');
const genPassword = require('../lib/passwordUtils').genPassword;
const connection = require('../config/database');
const User = connection.models.User;

router.get('/', connectEnsureLogin.ensureLoggedIn(), (req, res, next) => {
    let list_names = [];

    req.user.lists.forEach(list => {
        list_names.push(list.list_name);
    });

    res.render('myLists', {
        "user": {
            "first_name": req.user.first_name,
            "last_name": req.user.last_name
        },
        "list_names": list_names
    });
});

module.exports = router;