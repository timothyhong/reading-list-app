const router = require('express').Router();
const passport = require('passport');
const createUserContext = require('../lib/helpers').createUserContext;

// login page
router.get('/', async (req, res, next) => {
    let context = await createUserContext(req);
    context.error = req.flash('error');
    res.render('login', context);
});

router.post('/', passport.authenticate('oauth2', { 
    successRedirect: '/favorites', 
    failureRedirect: '/login', 
    failureFlash: true
}));

module.exports = router;