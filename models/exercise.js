const mongoose = require('mongoose');

/**
 * @openapi
 * components:
 *   schemas:
 *     Exercise:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The unique identifier of the exercise
 *         name:
 *           type: string
 *           description: The name of the exercise (e.g., "Running", "Squats")
 *         sets:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               weight:
 *                 type: number
 *                 description: The weight lifted in kilograms (if applicable)
 *               reps:
 *                 type: number
 *                 description: The number of repetitions performed
 *               isCompleted:
 *                 type: boolean
 *                 description: Indicates whether the set was completed
 *         date:
 *           type: string
 *           format: date-time
 *           description: The date and time when the exercise was performed
 *         user:
 *           type: string
 *           description: The ID of the user associated with the exercise
 */
const exerciseSchema = new mongoose.Schema({
    name: {type: String, required: true},
    sets: [ 
        {
            weight: {type: Number, required: true},
            reps: {type: Number, required: true},
            isCompleted: {type: Boolean, default: false},
        }
    ],
    type: {type: String, enum: ['back', 'legs', 'chest', 'arms'], required: true},    
    date: {type: Date},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

exerciseSchema.set('toJSON', {
    transform: (document, returnValue) => {
        returnValue.id = document._id;
        delete returnValue._id;
        delete returnValue.__v;
    }
});

module.exports = mongoose.model('Exercise', exerciseSchema);