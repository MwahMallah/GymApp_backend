const mongoose = require('mongoose');

const default_photo_url = "https://img.icons8.com/?size=100&id=x0qTmzjcFRhW&format=png&color=000000";

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The unique identifier of the user.
 *         username:
 *           type: string
 *           description: The username of the user, which is unique and has a minimum length of 3 characters.
 *         name:
 *           type: string
 *           description: The full name of the user.
 *         exercises:
 *           type: array
 *           items:
 *             type: string
 *             description: An array of `Exercise` IDs associated with the user.
 *         food:
 *           type: array
 *           items:
 *             type: string
 *             description: An array of `Food` IDs associated with the user.
 *         friends:
 *           type: array
 *           items:
 *             type: string
 *             description: An array of `User` IDs representing the user's friends.
 *         photo_url:
 *           type: string
 *           description: A URL pointing to the user's profile photo. Defaults to a placeholder image.
 *         passwordHash:
 *           type: string
 *           description: The hashed password of the user (not exposed in responses).
 */
const userSchema = new mongoose.Schema({
    username: {type: String, required: true, minLength: 3, unique: true},
    name: {type: String},
    exercises: [{type: mongoose.Schema.Types.ObjectId, ref: "Exercise"}],
    food: [{type: mongoose.Schema.Types.ObjectId, ref: "Food"}],
    friends: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    photo_url: {type: String, default: default_photo_url},
    passwordHash: {type: String},
});

userSchema.set('toJSON', {
    transform: (document, returnValue) => {
        returnValue.id = document._id;
        delete returnValue._id;
        delete returnValue.__v;
        delete returnValue.passwordHash;
    }
})

module.exports = mongoose.model('User', userSchema);