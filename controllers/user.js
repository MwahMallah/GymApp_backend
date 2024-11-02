const usersRouter = require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcrypt')

usersRouter.get('/', async (req, res) => {
    const users = await User.find({})
        .populate('exercises', {user: 0})
        .populate('food', {user: 0});
        
    res.json(users);
});

usersRouter.post('/', async (req, res, next) => {
    let {username, password, name} = req.body;
    password = String(password);

    if (!password || password.length < 3)
        return res.status(400).end();

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    try {
        const user = new User(
            {username, passwordHash, name}
        );
    
        const savedUser = await user.save();
        res.status(201).json(savedUser);
    } catch(e) {

        next(e);
    }
});

module.exports = usersRouter;