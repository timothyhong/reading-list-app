const mongoose = require('mongoose');
require('dotenv').config();
const conn = process.env.DB_STRING;

const connection = mongoose.createConnection(conn, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Creates simple schema for a User.  The hash and salt are derived from the user's given password when they register
const UserSchema = new mongoose.Schema({
    email_address: String,
    first_name: String,
    last_name: String,
    lists: [{
        list_name: String,
        list_isbns: [String],
    }],
    hash: String,
    salt: String,
});

const User = connection.model('User', UserSchema);

module.exports = connection;