const router = require('express').Router();
const fetch = require('node-fetch');
const passport = require('passport');
const connection = require('../config/database');
const User = connection.models.User;
require('../config/passport');

router.get('/', async (req, res, next) => {
    req.logout();
    res.redirect('/login');
});

module.exports = router;