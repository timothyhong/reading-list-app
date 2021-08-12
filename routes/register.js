const router = require('express').Router();
const genPassword = require('../lib/passwordUtils').genPassword;
const connection = require('../config/database');
const User = connection.models.User;
const createUserContext = require('../lib/helpers').createUserContext;

router.get('/', async (req, res, next) => {
    let context = createUserContext(req);
    res.render('register', context);
});

router.post('/', async (req, res, next) => {

    let context = await createUserContext(req);
    // verify user email_address is not already in use
    User.findOne({ email_address: req.body.email_address })
        .then((user) => {

            // user doesn't exist -> create account
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

                newUser.save();

                context.success = "Successfully registered! Please log in.";

                res.render('login', context);
            }
            else {
                context.error = "User already exists. Please register with another email address or <a href='login'>log in.</a>";
                res.render("register", context);
            }
        })
        .catch((err) => {
            context.error = "Unknown error while registering, please try again!";
            res.render("register", context);
        });
});

module.exports = router;