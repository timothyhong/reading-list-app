const router = require('express').Router();
const fetch = require('node-fetch');
const passport = require('passport');
const genPassword = require('../lib/passwordUtils').genPassword;
const connection = require('../config/database');
const User = connection.models.User;

router.get('/', async (req, res, next) => {
    res.render('register');
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
                    lists: [
                    {
                        "list_name": "test_list_1",
                        "list_isbns": ["9124535322", "1243532342"]
                    }, 
                    {
                        "list_name": "test_list_2",
                        "list_isbns": ["1233253543"]
                    }],
                    hash: hash,
                    salt: salt
                });

                newUser.save().then((user) => {
                    console.log(user);
                });

                res.redirect('/login');
            }
            else {
                res.render("register", {message: "User already exists. Please register with another email address or <a href='login'>log in.</a>"});
            }
        })
        .catch((err) => {
            res.render("register", {message: "Unknown error while registering, please try again!"});
        });
});

module.exports = router;