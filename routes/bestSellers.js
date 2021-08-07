const router = require('express').Router();
const fetch = require('node-fetch');
const NYT_KEY = process.env.NYT_KEY;
const GOOGLE_BOOKS_KEY = process.env.GOOGLE_BOOKS_KEY;
const createUserContext = require('../lib/helpers').createUserContext;

// returns a dictionary of all categories from the NYT Best Sellers API
// e.g. {list_name_encoded: display_name, ...}
async function getCategories() {

    let categories = {};

    try {
        let response = await fetch(`https://api.nytimes.com/svc/books/v3/lists/names.json?api-key=${NYT_KEY}`, {
              method: 'get',
        });
        let data = await response.json();

        data.results.forEach(result => {
            categories[result.list_name_encoded] = result.display_name;
        });
    } catch(err) {
        console.log("NYT API error fetching best seller categories.");
    }
    return categories;
}

// returns a dictionary of all books from a specific NYT Best Sellers list
// e.g. {0: {title: title1, author: author1, isbn: isbn1, amazon_product_url: amazon_product_url1}, ...}
async function getBooksFromList(category) {

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
        return [];
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
    
    let context = createUserContext(req);
    // set category name for data
    let category = "combined-print-and-e-book-fiction";
    if (req.query.category) {
        category = req.query.category;
    }

    context.categories = await getCategories();
    context.books = await getBooksFromList(category);

    // if user's logged in, check which books are favorited (to add proper button)
    if (req.user && req.user.favorites.length > 0) {
        let userFavIsbns = req.user.favorites.map((book) => {
            return book.isbn;
        });
        context.books.forEach((book) => {
            if (userFavIsbns.includes(book.isbn)) {
                book.favorite = 1;
            }
        });

    }

    try {
        context.selectedCategory = await context.categories[category];        
    } catch(err) {
        context.selectedCategory = "Selected category could not be found.";
    }

    if (context.books.length > 0 && Object.keys(context.categories).length != 0) {
        res.render('bestSellers', context);       
    }
    else if (context.books.length == 0) {
        context = {"error": "Selected category could not be found."};
        res.render("error", context);       
    }
    else {
        context = {"error": "No categories could be found."};
        res.render("error", context);
    }
});

module.exports = router;