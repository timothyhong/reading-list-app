const express = require("express");

// process.env.VARIABLE_NAME
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const { auth } = require('express-openid-connect');
app.use(
  auth({
    issuerBaseURL: process.env.ISSUER_BASE_URL,
    baseURL: process.env.BASE_URL,
    clientID: process.env.CLIENT_ID,
    secret: process.env.SECRET,
    idpLogout: true,
    response_type: "code",
    scope: "openid profile bestSeller.fullaccess IdentityServerApi roles user_data"
  })
);

require("./startup/routes")(app);

app.listen(port, () => console.log(`Listening on port ${port}...`));

