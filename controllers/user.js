const usersRouter = require('express').Router();
const middleware = require('../utils/middleware');
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
        .populate('food', {user: 0})
        .populate('friends');

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

//add friend
usersRouter.post('/friends/:id', middleware.userExtractor, async (req, res, next) => {
    
    const user = req.user;
    const friendId = req.params.id;

    try {
        // User shouldn't add himself
        if (user.id === friendId) {
            return res.status(400).json({ error: "You can't add yourself as a friend." });
        }

        const friend = await User.findById(friendId);

        if (!friend) {
            return res.status(404).json({ error: "User not found." });
        }

        // Check that friend is not already added
        if (user.friends.includes(friendId)) {
            return res.status(400).json({ error: "Friend already added." });
        }

        // Adding friend
        user.friends.push(friendId);
        friend.friends.push(user.id);
        await user.save();
        await friend.save();

        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

module.exports = usersRouter;