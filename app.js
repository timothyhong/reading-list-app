// imports for express & handlebars
const express = require("express");
const handlebars = require('express-handlebars').create({defaultLayout: 'index'});

// imports for user authentication
const session = require('express-session');
const passport = require('passport');
require('./config/passport');
const crypto = require('crypto');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');

// imports for MongoDB
const connection = require('./config/database');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const sessionStore = MongoStore.create({ mongoUrl: process.env.DB_STRING });

// process.env.VARIABLE_NAME
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

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
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require("./startup/routes")(app);

app.listen(port, () => console.log(`Listening on port ${port}...`));

