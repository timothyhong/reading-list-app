const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const connection = require('./database');
const User = connection.models.User;
const validPassword = require('../lib/passwordUtils').validPassword;
const OAuth2Strategy = require("passport-oauth2").Strategy;

// tells passport what fields to get the username/password from
const customFields = {
    usernameField: 'email_address',
    passwordField: 'password'
};

const verifyCallback = (username, password, done) => {

    User.findOne({ email_address: username })
        .then((user) => {

            // invalid username
            if (!user) {
                return done(null, false, { message: `${username} is not a valid user.` }); 
            }
            
            // invalid password
            if (!validPassword(password, user.hash, user.salt)) {
                return done(null, false, { message: 'Invalid password.' });
            }
            // user found and password matches
            return done(null, user, { message: 'Login successful.'});
        })
        .catch((err) => {
            return done(err);
        });
}

passport.use(
  new OAuth2Strategy(
    {
      authorizationURL:
        "https://bestsellerauthentication.azurewebsites.net/connect/authorize",
      tokenURL:
        "https://bestsellerauthentication.azurewebsites.net/connect/token",
      clientID: "frontend",
      clientSecret: "this-is-the-secret",
      callbackURL: "http://localhost:9184/",
      scope:
        "openid profile bestSeller.fullaccess IdentityServerApi roles user_data",
      pkce: true,
      state: true,
    },
     function(accessToken, refreshToken, profile, cb) {
        console.log(accessToken);
        User.findOrCreate({ exampleId: profile.id }, function (err, user) {
          return cb(err, user);
        });
    }
));

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
