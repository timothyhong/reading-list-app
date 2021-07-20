const router = require('express').Router();
const fetch = require('node-fetch');

router.get('/', async (req, res, next) => {
    res.render('login');
});

module.exports = router;