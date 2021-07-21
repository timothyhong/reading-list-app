const router = require('express').Router();
const connectEnsureLogin = require('connect-ensure-login')

router.get('/', connectEnsureLogin.ensureLoggedIn(), (req, res, next) => {
    res.render('myLists', {user: {
        first_name: req.user.first_name,
        last_name: req.user.last_name
        }
    });
});

module.exports = router;