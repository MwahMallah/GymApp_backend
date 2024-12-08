const mongoose = require('mongoose');

/**
 * @openapi
 * components:
 *   schemas:
 *     Food:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The unique identifier of the food item.
 *         name:
 *           type: string
 *           description: The name of the food item (e.g., "Apple", "Banana").
 *         calories:
 *           type: number
 *           format: float
 *           description: The number of calories in the food item.
 *         date:
 *           type: string
 *           format: date-time
 *           description: The date and time when the food item was logged.
 *         user:
 *           type: string
 *           description: The ID of the user associated with the food item.
 */
const foodScheme = new mongoose.Schema({
    name: {type: String, required: true},
    calories: {type: Number},
    date: {type: Date},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

foodScheme.set('toJSON', {
    transform: (document, returnValue) => {
        returnValue.id = document._id;
        delete returnValue._id;
        delete returnValue.__v;
    }
});

module.exports = mongoose.model('Food', foodScheme);