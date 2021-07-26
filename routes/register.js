const router = require('express').Router();
const fetch = require('node-fetch');
const passport = require('passport');
const genPassword = require('../lib/passwordUtils').genPassword;
const connection = require('../config/database');
const User = connection.models.User;

router.get('/', async (req, res, next) => {
    let context = {};

    // set first and last name for display
    if (req.user) {
        context.user = {}
        if (req.user.first_name) {
            context.user.first_name = req.user.first_name;            
        }
        if (req.user.last_name) {
            context.user.last_name = req.user.last_name;            
        }
    }
    res.render('register', context);
});

router.post('/', (req, res, next) => {

    // verify user email_address is not already in use
    User.findOne({ email_address: req.body.email_address })
        .then((user) => {

            // invalid username
            if (!user) {
                const saltHash = genPassword(req.body.password);

                const salt = saltHash.salt;
                const hash = saltHash.hash;

                const newUser = new User({
                    email_address: req.body.email_address,
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    favorites: [],
                    hash: hash,
                    salt: salt
                });

                newUser.save().then((user) => {
                    console.log(user);
                });

                res.render('login', {success: "Successfully registered! Please log in."});
            }
            else {
                res.render("register", {error: "User already exists. Please register with another email address or <a href='login'>log in.</a>"});
            }
        })
        .catch((err) => {
            res.render("register", {error: "Unknown error while registering, please try again!"});
        });
});

module.exports = router;