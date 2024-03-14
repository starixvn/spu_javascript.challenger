const express = require('express');
const compression = require('compression');
const cors = require('cors');

const path = require('path');
const apiRouter = require("./routes/api");
const { errorHandler } = require('./middleware/errorHandlingMiddleware.js');
const { setAllCache } = require('./startup.js');
const config =  require('./config/index.js');

const app = express();

setAllCache();

app.enable('trust proxy');

app.use(cors());

app.use(compression());

app.use(express.json());

app.use("/api", apiRouter);

app.use(express.static(path.join(__dirname, config.NODE_ENV === 'development' ? "../client/build" : "/client/build")));

app.use(errorHandler)

module.exports = app;
