const router = require('express').Router();
const fetch = require('node-fetch');
const connectEnsureLogin = require('connect-ensure-login')

router.get('/',connectEnsureLogin.ensureLoggedIn(), (req, res, next) => {
    res.render('myLists', {
        username: req.user.first_name + " " + req.user.last_name
    });
});

module.exports = router;