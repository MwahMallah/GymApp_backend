const usersRouter = require('express').Router();
const middleware = require('../utils/middleware');
const User = require('../models/user');
const bcrypt = require('bcrypt');

/**
 * @openapi
 * tags:
 *   - name: Users
 *     description: Operations related to users
 */

/**
 * @openapi
 * /api/user:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get a list of users with optional name filtering
 *     description: Returns a list of users. Supports filtering by username to find users whose names start with a specified string.
 *     parameters:
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         description: Filter users by username starting with this string
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     $ref: '#/components/schemas/User'
 */
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


/**
 * @openapi
 * /api/user/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get a user by ID
 *     description: Returns a specific user by their unique identifier.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user's unique identifier
 *     responses:
 *       200:
 *         description: The user object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
usersRouter.get('/:id', async (req, res) => {
    const id = req.params.id;
    const users = await User.findById(id)
        .populate('exercises', {user: 0})
        .populate('food', {user: 0})
        .populate('friends');

    res.json(users);
});

/**
 * @openapi
 * /api/user:
 *   post:
 *     tags:
 *       - Users
 *     summary: Create a new user
 *     description: Creates a new user with the provided username, password, and name. Password must be at least 3 characters long.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username for the new user
 *               password:
 *                 type: string
 *                 description: The password for the new user (must be at least 3 characters long)
 *               name:
 *                 type: string
 *                 description: The full name of the user
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request, likely due to invalid input (password too short or missing fields)
 */
usersRouter.post('/', async (req, res, next) => {
    let {username, password, name } = req.body;
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

usersRouter.put('/', middleware.userExtractor,  async (req, res, next) => {
    const user = req.user;

    try {
        const {name, username, photo_url} = req.body;

        if (name) user.name = name;
        if (username) user.username = username;
        if (photo_url) user.photo_url = photo_url;
        // Update user
        await user.save();

        const updatedUser = await User.findById(user.id)
            .populate('exercises', {user: 0})
            .populate('food', {user: 0})
            .populate('friends');
        
        res.status(200).json(updatedUser);
    } catch (error) {
        next(error);
    }
});

/**
 * @openapi
 * /api/user/friends/{id}:
 *   post:
 *     tags:
 *       - Users
 *     summary: Add a friend to the current user's friend list
 *     description: Adds a friend to the current user's friend list by specifying the friend's ID. The user cannot add themselves, and they cannot add a friend that's already in their list.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user's unique identifier (the friend to be added)
 *     requestBody:
 *       required: false
 *     responses:
 *       200:
 *         description: Friend added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request (user trying to add themselves or add a duplicate friend)
 *       404:
 *         description: Friend not found (invalid user ID)
 */
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

        const updatedUser = await User.findById(user.id)
            .populate('exercises', {user: 0})
            .populate('food', {user: 0})
            .populate('friends');
        
        res.status(200).json(updatedUser);
    } catch (error) {
        next(error);
    }
});


/**
 * @openapi
 * /api/user/friends/{id}:
 *   delete:
 *     tags:
 *       - Users
 *     summary: Delete a friend from the current user's friend list
 *     description: Deletes a friend from the current user's friend list by specifying the friend's ID. The user cannot delete themselves, and they cannot delete a friend that's not in their list.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user's unique identifier (the friend to be added)
 *     requestBody:
 *       required: false
 *     responses:
 *       200:
 *         description: Friend deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request (user trying to add themselves or add a duplicate friend)
 *       404:
 *         description: Friend not found (invalid user ID)
 */
usersRouter.delete('/friends/:id', middleware.userExtractor, async (req, res, next) => {
    const user = req.user;
    const friendId = req.params.id;

    try {
        // User shouldn't delete himself
        if (user.id === friendId) {
            return res.status(400).json({ error: "You can't delete yourself as a friend." });
        }

        const friend = await User.findById(friendId);

        if (!friend) {
            return res.status(404).json({ error: "User not found." });
        }

        // Check that friend is not already added
        if (!user.friends.includes(friendId)) {
            return res.status(400).json({ error: "Friend is not added." });
        }

        // Adding friend
        user.friends.pull(friendId);
        friend.friends.pull(user.id);
        await user.save();
        await friend.save();

        const updatedUser = await User.findById(user.id)
            .populate('exercises', {user: 0})
            .populate('food', {user: 0})
            .populate('friends');
        
        res.status(200).json(updatedUser);
    } catch (error) {
        next(error);
    }
});


module.exports = usersRouter;