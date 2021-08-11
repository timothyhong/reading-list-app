// prevent default for inputs with onclick events
Array.prototype.forEach.call(document.querySelectorAll("input[onclick]"), input => {
    input.addEventListener('click', e => {
        event.preventDefault();
    })
});

// open navbar
function openNav() {
    document.getElementById("sidenav-menu").style.width = "250px";
    // get all elements to push
    let push = document.getElementsByClassName("push");
    Array.prototype.forEach.call(push, element => element.style.marginLeft = "250px");
    // hide menu
    document.getElementById("sidenav-open").style.display = "none";
}

// clsoe navbar
function closeNav() {
    document.getElementById("sidenav-menu").style.width = "0";
    // get all elements to push
    let push = document.getElementsByClassName("push");
    Array.prototype.forEach.call(push, element => element.style.marginLeft = "0");
    // show menu
    document.getElementById("sidenav-open").style.display = "block";
}

// redirect with the category parameter
function categoryRedirect(category) {
    window.location = `/best_sellers?category=${category}`;
}

function loginRedirect() {
    window.location = `/login`;
}

// change button from unfavorite -> favorite
function buttonToFavorite(row) {
    let input = row.lastElementChild.firstElementChild;
    input.value = "Favorite";
    input.setAttribute("onclick", "favorite(this.parentElement.parentElement)");
    input.setAttribute("class", "favorite");
}

// change button from favorite -> unfavorite
function buttonToUnfavorite(row) {
    let input = row.lastElementChild.firstElementChild;
    input.value = "Unfavorite";
    input.setAttribute("onclick", "unfavorite(this.parentElement.parentElement)");
    input.setAttribute("class", "unfavorite");
}

// extract book info from a row
function getBookFromRow(row) {

    let data = {};
    const cells = row.querySelectorAll("[headers]");

    Array.prototype.forEach.call(cells, cell => {
        // extract book cover info
        if (cell.getAttribute("headers") == "cover") {
            let amazon_product_url = cell.firstChild.getAttribute("href");
            let img = cell.firstChild.firstChild.getAttribute("src");

            data.amazon_product_url = amazon_product_url;
            data.img = img;
        }
        // extract all other info excluding rank
        else if (cell.getAttribute("headers") != "rank") {
            data[cell.getAttribute("headers")] = cell.innerHTML;
        }
    });
    return data;
}

// favorite a book
async function favorite(row) {

    let data = getBookFromRow(row);

    try {
        let response = await fetch('/favorites/add', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        });

        if (response.status == 200) {
            buttonToUnfavorite(row);
        } else if (response.status == 304) {
            window.alert("That's already on your favorites list!");
        }
    } catch (err) {
        window.alert("Error adding to favorites!");
    }
}

// unfavorite a book by isbn. if removeBool is set, row will also be removed
async function unfavorite(row, removeBool) {
    let data = {};
    let isbn = row.querySelector("[headers='isbn']").innerHTML;
    data.isbn = isbn;

    try {
        let response = await fetch('/favorites/remove', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        });

        if (response.status == 200) {
            if (removeBool) {
                let nextrow = row.nextElementSibling;
                // update indices
                while (nextrow != null) {
                    nextrow.firstElementChild.innerHTML = parseInt(nextrow.firstElementChild.innerHTML) - 1;
                    nextrow = nextrow.nextElementSibling;
                }
                // remove row
                row.parentNode.removeChild(row);
            } else {
                buttonToFavorite(row);
            }
        }
    } catch (err) {
        window.alert("Error removing from favorites!");
    }
}