const express = require("express");
const cookieParser = require('cookie-parser');
const handlebars = require('express-handlebars').create({defaultLayout: 'index'});

// imports for user authentication
const { auth, requiresAuth } = require('express-openid-connect');
const session = require('express-session');
const passport = require('passport');
require('../config/passport');
const crypto = require('crypto');
const flash = require('connect-flash');

// imports for MongoDB
const connection = require('../config/database');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const sessionStore = MongoStore.create({ mongoUrl: process.env.DB_STRING });

// increments index to display numbering for favorites list
handlebars.handlebars.registerHelper("inc", (value) => {
    return parseInt(value) + 1;
});

// process.env.VARIABLE_NAME
require('dotenv').config();

module.exports = app => {
    app.use(express.json());
    app.use(express.urlencoded({extended: true}));
    app.use(cookieParser());

    app.use(session({
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: true,
        store: sessionStore,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 // 1 Day
        }
    }));

    app.engine("handlebars", handlebars.engine);
    app.set("view engine", "handlebars");
    app.use(express.static('public'));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());

    app.use(
      auth({
        issuerBaseURL: process.env.ISSUER_BASE_URL,
        baseURL: process.env.BASE_URL,
        clientID: process.env.CLIENT_ID,
        secret: process.env.SECRET,
        idpLogout: true,
        clientSecret: process.env.CLIENT_SECRET,
        authRequired: false,
        authorizationParams: {
          response_type: 'code',
          scope: 'openid profile bestSeller.fullaccess IdentityServerApi roles user_data',
        },
      })
    );

    app.use("/", require("../routes/index"));
    app.use("/best_sellers", require("../routes/bestSellers"));
    app.use("/register", require("../routes/register"));
    app.use("/login", require("../routes/login"));
    app.use("/favorites", require("../routes/favorites"));
    app.use("/about", require("../routes/about"));
    app.use("/logout", require("../routes/logout"));

    app.use((err, req, res, next) => {
      context = {"error": "Sorry, page not found."};
      console.log(err);
      res.status(404).render("error", context);
    });
};