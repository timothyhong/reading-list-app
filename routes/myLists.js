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
    
    let context = {};
    let user = {};
    user.first_name = req.user.first_name;
    user.last_name = req.user.last_name;
    context.user = user;
    context.list_names = [];

    let numLists = req.user.lists.length;

    // if list_index was passed as param and is valid
    let list_index, list_name, list_isbns;
    if (req.query.list_index && req.query.list_index >= 0 && req.query.list_index < numLists) {
        context.list_name = req.user.lists[list_index].list_name;
        context.list_isbns = req.user.lists[list_index].list_isbns;
    }
    // otherwise display first list if it exists
    else if (numLists > 0) {
        context.list_name = req.user.lists[0].list_name;
        context.list_isbns = req.user.lists[0].list_isbns;
    }


    req.user.lists.forEach(list => {
        context.list_names.push(list.list_name);
    });

    console.log(context);

    res.render('myLists', context);
});

module.exports = router;