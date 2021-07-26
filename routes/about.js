const router = require('express').Router();

router.get('/', (req, res, next) => {
    
    let context = {};

    // set first and last name for display
    if (req.user) {
        context.user = {}
        if (req.user.first_name) {
            context.user.first_name = req.user.first_name;            
        }
        if (req.user.last_name) {
            context.user.last_name = req.user.last_name;            
        }
    }

    res.render('about', context);
});

module.exports = router;