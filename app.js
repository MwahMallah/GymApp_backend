const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config');
const logger = require('./utils/logger');
const swaggerSpec = require('./utils/swagger');
const swaggerUi = require('swagger-ui-express');
const userRouter = require('./controllers/user');
const loginRouter = require('./controllers/login');
const exerciseRouter = require('./controllers/exercise');
const foodRouter = require('./controllers/food');
const middleware = require('./utils/middleware');

mongoose.set('strictQuery', false);

mongoose.connect(config.DB_CONN_URL)
    .then(_ => {
        logger.info("Connected to MongoDb");
    })
    .catch(e => {
        logger.error('error connecting to MongoDB:', e.message);
    });

const app = express();

app.use(cors());
app.use(express.json());
app.use(middleware.tokenExtractor);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/user', userRouter)
app.use('/api/login', loginRouter);
app.use('/api/exercise', middleware.userExtractor, exerciseRouter);
app.use('/api/food', middleware.userExtractor, foodRouter);

app.use(middleware.errorHandler);

module.exports = app;