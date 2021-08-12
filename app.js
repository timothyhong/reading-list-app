process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const express = require("express");

// process.env.VARIABLE_NAME
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

require("./startup/routes")(app);

app.listen(port, () => console.log(`Listening on port ${port}...`));

