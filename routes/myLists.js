const router = require('express').Router();
const fetch = require('node-fetch');

router.get('/', async (req, res, next) => {
    let context = {};
    res.render('myLists');
});

module.exports = router;