const logger = require('./logger');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

function errorHandler(err, req, res, next) {
    logger.error(err);

    if (err.name === 'ValidationError') {
        res.status(400).send({error: err.message});
    } if (err.name === 'CastError') {
        res.status(400).send({error: 'ObjectId must be 24 char length hex value'})
    } if (err.name === 'MongoServerError' && err.message.includes('E11000 duplicate key error')) {
        res.status(400).send({error: 'Expected `username` to be unique'});
    }
}


function tokenExtractor(req, res, next) {
    const header = req.get('authorization');
    if (header && header.startsWith('Bearer ')) {
        req.token = header.replace('Bearer ', '');
    }

    next();
}

async function userExtractor(req, res, next) {
    try {
        const decodedToken = jwt.verify(req.token, process.env.SECRET);
    
        if (!decodedToken.id) {
            return res.status(401).json({error: "token is invalid"});
        }
    
        const {id, username, name} = decodedToken;
        const user = await User.findById(id);
        if (!user || user.username != username || (name && user.name != name))
            return res.status(401).json({error: "token is invalid"});
    
        req.user = user;
        next();
    } catch(e) {
        next(e);
    }
}

module.exports = {errorHandler, tokenExtractor, userExtractor};