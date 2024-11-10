const loginRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');

/**
 * @openapi
 * tags:
 *   - name: Login
 *     description: Operations related to Login
 */


/**
 * @openapi
 * tags:
 *   - name: Login
 *     description: Operations related to user login
 * /api/login:
 *   post:
 *     tags:
 *       - Login
 *     summary: User login
 *     description: Authenticates a user by checking the provided username and password. If the credentials are correct, a JSON Web Token (JWT) is issued.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the user trying to log in
 *               password:
 *                 type: string
 *                 description: The password of the user trying to log in
 *     responses:
 *       200:
 *         description: Successful login and token issuance
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: The JWT token that can be used for subsequent authenticated requests
 *                 username:
 *                   type: string
 *                   description: The username of the logged-in user
 *                 name:
 *                   type: string
 *                   description: The full name of the logged-in user
 *                 id:
 *                   type: string
 *                   description: The unique ID of the logged-in user
 *       401:
 *         description: Invalid username or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message when authentication fails
 */
loginRouter.post('/', async (req, res) => {
    let {username, password} = req.body;
    password = String(password);

    const user = await User.findOne({username});

    const passwordCorrect = user === null 
        ? false 
        : await bcrypt.compare(password, user.passwordHash);

    if (!passwordCorrect) {
        return res.status(401).json({error: "invalid username or password"});
    }

    const userForToken = {
        username: user.username,
        id: user._id
    };

    const token = jwt.sign(userForToken, process.env.SECRET);

    res.status(200).send({token, username: user.username, name: user.name, id: user.id})
});


module.exports = loginRouter;