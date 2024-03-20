const express = require('express');
const compression = require('compression');
const cors = require('cors');

const path = require('path');
const { errorHandler } = require('./middleware/errorHandlingMiddleware.js');
const { setAllCaches } = require('./components/startup.js');
const config =  require('./config/index.js');

const router = require('./routes/index.js');

const app = express();

setAllCaches();

app.enable('trust proxy');

app.use(cors());

app.use(compression());

app.use(express.json());

app.use("/", router);

app.use(express.static(path.join(__dirname, config.NODE_ENV === 'development' ? "../client/build" : "/client/build")));

app.use(errorHandler);

app.listen(config.PORT, () => {
    console.log(`Server is running on port ${config.PORT}`);
});
