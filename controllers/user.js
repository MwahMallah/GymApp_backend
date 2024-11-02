const usersRouter = require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcrypt')

usersRouter.get('/', async (req, res) => {
    const query = {};
    const startsWith = req.query.username;

    console.log(startsWith)
    //filter by name
    if (startsWith) {
        query.username = {$regex: `^${startsWith}`, $options: 'i'};
        console.log(query);
    }

    const users = await User.find(query).select('-exercises -food');
    res.json(users);
});

usersRouter.get('/:id', async (req, res) => {
    const id = req.params.id;
    const users = await User.findById(id)
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