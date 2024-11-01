const logger = require('./logger');


function errorHandler(err, req, res, next) {
    logger.error(err);

    if (err.name === 'ValidationError') {
        res.status(400).send({error: err.message});
    } if (err.name === 'CastError') {
        res.status(400).send({error: 'ObjectId must be 24 char length hex value'})
    } if (err.name === 'MongoServerError' && err.message.includes('E11000 duplicate key error')) {
        res.status(401).send({error: 'token invalid'});
    }
}


function tokenExtractor(req, res, next) {
    const header = req.get('authorization');
    if (header && header.startsWith('Bearer ')) {
        req.token = header.replace('Bearer ', '');
    }

    next();
}

module.exports = {errorHandler, tokenExtractor};