const express = require("express");
const app = express();

const logger = require("./startup/logging");
require("./startup/routes")(app);
require("./startup/db")();
require("./startup/config")();

// Start the server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => logger.info(`Listening on Port ${port}...`));

module.exports = server;

// if (process.env.NODE_ENV !== 'test') {
//   const port = process.env.PORT || 3000;
//   app.listen(port);
// }
// module.exports.server = app;
// throw new Error('Uncaught Exception');
// Promise.rejected('Unhandled Rejected Promise').then();