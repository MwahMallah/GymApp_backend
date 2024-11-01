const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config');
const logger = require('./utils/logger');
const userRouter = require('./controllers/user');
const loginRouter = require('./controllers/login');
const middleware = require('./utils/middleware');

mongoose.set('strictQuery', false);

mongoose.connect(config.DB_CONN_URL)
    .then(_ => {
        logger.info("Connected to MongoDb");
    })
    .catch(e => {
        logger.error('error connecting to MongoDB:', error.message);
    });

const app = express();

app.use(cors());
app.use(express.json());
app.use(middleware.tokenExtractor);

app.use('/api/users', userRouter)
app.use('/api/login', loginRouter);

app.use(middleware.errorHandler);

module.exports = app;