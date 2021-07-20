const router = require('express').Router();
const fetch = require('node-fetch');
const keys = require('../config/keys');
const NYT_KEY = keys.api_keys.NYT_KEY;
const GOOGLE_BOOKS_KEY = keys.api_keys.GOOGLE_BOOKS_KEY;

/*
const passport = require('passport');
const genPassword = require('../lib/passwordUtils').genPassword;
const connection = require('../config/database');
const User = connection.models.User;
const isAuth = require('./authMiddleware').isAuth;
const isAdmin = require('./authMiddleware').isAdmin;
*/

// returns a dictionary of all categories from the NYT Best Sellers API
// e.g. {list_name_encoded: display_name, ...}
async function getCategories() {

    let categories = {};

    try {
        let response = await fetch(`https://api.nytimes.com/svc/books/v3/lists/names.json?api-key=${NYT_KEY}`, {
              method: 'get',
        });
        let data = await response.json();

        try {
            data.results.forEach(result => {
            categories[result.list_name_encoded] = result.display_name;
            });
        } catch(err) {
            console.log("Empty result set in best seller categories.");
        }
        return categories;
    } catch(err) {
        console.log("NYT API error fetching best seller categories.");
    }
}

// returns a dictionary of all books from a specific NYT Best Sellers list
// e.g. {0: {title: title1, author: author1, isbn: isbn1, amazon_product_url: amazon_product_url1}, ...}
async function getBooksFromList(category) {

    let books = {}

    try {
        let response = await fetch(`https://api.nytimes.com/svc/books/v3/lists.json?list=${category}&api-key=${NYT_KEY}`, {
            method: 'get',
        });
        let data = await response.json();

        let books = await Promise.all(
            data.results.map(async result => {
                
                let book = {
                    "rank": result.rank,
                    "title": result.book_details[0].title,
                    "author": result.book_details[0].author,
                    "isbn": result.book_details[0].primary_isbn13,
                    "details": result.book_details[0].description,
                    "amazon_product_url": result.amazon_product_url
                };

                
                let img = await getBookCover(result.book_details[0].primary_isbn13);

                book.img = img;

                return book;
            })
        );
        return books;
    } catch(err) {
        console.log("NYT API error fetching best sellers.");
    }
}

// returns the corresponding book cover given an isbn (Google Books API)
async function getBookCover(isbn) {

    let img = "/img/genericBookCover.jpg";
    try {
        let response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${GOOGLE_BOOKS_KEY}`, {
            method: 'get',
        });
        let data = await response.json();

        img = await data.items[0].volumeInfo.imageLinks.thumbnail;
    } catch(err) {
        console.log("Google Books API error fetching book cover, trying Open Libary Covers API.");
        try {
            let response = await fetch(`http://covers.openlibrary.org/b/isbn/${isbn}-M.jpg?default=false`, {
                method: 'get',
            });
            if (response.status == 200) {
                img = response.url;
            }
            else {
                console.log("Open Library Covers API error fetching book cover, using default image.")
            }
        } catch(err) {
            console.log("Error fetching book cover.");
        }    
    }
    return img;
}

router.get('/', async (req, res, next) => {
    
    let context = {};

    // set username if user is logged in
    try {
        context.username = req.user.first_name + " " + req.user.last_name;
    } catch(err) {
        context.username = "Guest";
    }

    // set category name for data
    let category = "combined-print-and-e-book-fiction";
    if (req.query.category) {
        category = req.query.category;
    }

    context.categories = await getCategories();
    context.books = await getBooksFromList(category);
    context.selectedCategory = await context.categories[category];
    if (context.books.length > 0 && Object.keys(context.categories).length != 0) {
        res.render('bestSellers', context);       
    }
    else if (context.books.length == 0) {
        context = {"error": "That category could not be located."};
        res.render("error", context);       
    }
    else {
        context = {"error": "No categories could be found."};
        res.render("error", context);
    }
});

router.use((err, req, res, next) => {
    context = {"error": "Something went wrong."};
    res.render("error", context);
});

/*

 router.post('/login', passport.authenticate('local', { failureRedirect: '/login-failure', successRedirect: 'login-success' }));

 router.post('/register', (req, res, next) => {
    const saltHash = genPassword(req.body.pw);
    
    const salt = saltHash.salt;
    const hash = saltHash.hash;

    const newUser = new User({
        username: req.body.uname,
        hash: hash,
        salt: salt,
        admin: true
    });

    newUser.save()
        .then((user) => {
            console.log(user);
        });

    res.redirect('/login');
 });


router.get('/', (req, res, next) => {
    res.send('<h1>Home</h1><p>Please <a href="/register">register</a></p>');
});

// When you visit http://localhost:3000/login, you will see "Login Page"
router.get('/login', (req, res, next) => {
   
    const form = '<h1>Login Page</h1><form method="POST" action="/login">\
    Enter Username:<br><input type="text" name="uname">\
    <br>Enter Password:<br><input type="password" name="pw">\
    <br><br><input type="submit" value="Submit"></form>';

    res.send(form);

});

// When you visit http://localhost:3000/register, you will see "Register Page"
router.get('/register', (req, res, next) => {

    const form = '<h1>Register Page</h1><form method="post" action="register">\
                    Enter Username:<br><input type="text" name="uname">\
                    <br>Enter Password:<br><input type="password" name="pw">\
                    <br><br><input type="submit" value="Submit"></form>';

    res.send(form);
    
});


 * Lookup how to authenticate users on routes with Local Strategy
 * Google Search: "How to use Express Passport Local Strategy"
 * 
 * Also, look up what behaviour express session has without a maxage set

router.get('/protected-route', isAuth, (req, res, next) => {
    res.send('You made it to the route.');
});

router.get('/admin-route', isAdmin, (req, res, next) => {
    res.send('You made it to the admin route.');
});

// Visiting this route logs the user out
router.get('/logout', (req, res, next) => {
    req.logout();
    res.redirect('/protected-route');
});

router.get('/login-success', (req, res, next) => {
    res.send('<p>You successfully logged in. --> <a href="/protected-route">Go to protected route</a></p>');
});

router.get('/login-failure', (req, res, next) => {
    res.send('You entered the wrong password.');
});

*/

module.exports = router;