const router = require('express').Router();
const passport = require('passport');
const createUserContext = require('../lib/helpers').createUserContext;

// login page
router.get('/', (req, res, next) => {
    let context = createUserContext(req);
    context.error = req.flash('error');
    res.render('login', context);
});

router.post('/', passport.authenticate('local', { 
    successRedirect: '/favorites', 
    failureRedirect: '/login', 
    failureFlash: true
}));

module.exports = router;