const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const connection = require('./database');
const User = connection.models.User;
const validPassword = require('../lib/passwordUtils').validPassword;

const customFields = {
    usernameField: 'email_address',
    passwordField: 'password'
};

const verifyCallback = (username, password, done) => {

    User.findOne({ email_address: username })
        .then((user) => {

            // invalid username
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' }); 
            }
            
            // invalid password
            if (!validPassword(password, user.hash, user.salt)) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            // user found and password matches
            return done(null, user);
        })
        .catch((err) => {
            return done(err);
        });
}

passport.use(new LocalStrategy(customFields, verifyCallback));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((userId, done) => {
    User.findById(userId)
        .then((user) => {
            done(null, user);
        })
        .catch(err => done(err))
});
