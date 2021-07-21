const router = require('express').Router();
const passport = require('passport');

router.get('/', (req, res, next) => {
    res.render('login', {message: req.flash('error')});
});

router.post('/', passport.authenticate('local', { 
    successRedirect: '/my_lists', 
    failureRedirect: '/login', 
    failureFlash: true
}));

module.exports = router;