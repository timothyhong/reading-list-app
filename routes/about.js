const router = require('express').Router();
const createUserContext = require('../lib/helpers').createUserContext;

router.get('/', (req, res, next) => {
    let context = createUserContext(req);
    res.render('about', context);
});

module.exports = router;