const router = require('express').Router();

router.get('/', (req, res, next) => {
    req.logout();
    res.render('login', {success: "You have successfully logged out!"});
});

module.exports = router;