const router = require('express').Router();
const passport = require('passport');

router.get('/', (req, res, next) => {
    res.render('login', {error: req.flash('error')});
});

router.post('/', passport.authenticate('local', { 
    successRedirect: '/favorites', 
    failureRedirect: '/login', 
    failureFlash: true
}));

module.exports = router;