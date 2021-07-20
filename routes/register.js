const router = require('express').Router();
const fetch = require('node-fetch');
const passport = require('passport');
const genPassword = require('../lib/passwordUtils').genPassword;
const connection = require('../config/database');
const User = connection.models.User;
require('../config/passport');

router.get('/', async (req, res, next) => {
    res.render('register');
});

router.post('/', (req, res, next) => {
    const saltHash = genPassword(req.body.password);

    const salt = saltHash.salt;
    const hash = saltHash.hash;

    const newUser = new User({
        email_address: req.body.email_address,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        hash: hash,
        salt: salt
    });

    newUser.save().then((user) => {
        console.log(user);
    });

    res.redirect('/login');
});

module.exports = router;