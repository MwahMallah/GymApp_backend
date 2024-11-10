const exerciseRouter = require('express').Router();
const Exercise = require('../models/exercise');

/**
 * @openapi
 * tags:
 *   - name: Exercise
 *     description: Operations related to Exercises
 */

/**
 * @openapi
 * paths:
 *   /api/exercise:
 *     get:
 *       tags:
 *         - Exercise
 *       summary: Get exercises for the user based on the optional date filter
 *       description: Fetches all exercises for the authenticated user. Optionally, exercises can be filtered by a specific date. If the `date` query parameter is provided, only exercises that occurred on that day will be returned.
 *       operationId: getExercises
 *       parameters:
 *         - name: date
 *           in: query
 *           description: The date to filter exercises by
 *           required: false
 *           schema:
 *             type: string
 *             format: date
 *       responses:
 *         200:
 *           description: A list of exercises for the user
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Exercise'
 *         401:
 *           description: Unauthorized, if the user is not authenticated
 *         500:
 *           description: Internal server error
 * components:
 *   schemas:
 *     Exercise:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The unique identifier of the exercise
 *         user:
 *           type: string
 *           description: The ID of the user associated with the exercise
 *         date:
 *           type: string
 *           format: date-time
 *           description: The date and time when the exercise took place
 *         type:
 *           type: string
 *           description: The type or category of the exercise (e.g., running, cycling)
 *         duration:
 *           type: number
 *           format: float
 *           description: The duration of the exercise in minutes
 *         caloriesBurned:
 *           type: number
 *           format: float
 *           description: The number of calories burned during the exercise
 */
exerciseRouter.get("/", async (req, res) => {
    const { date } = req.query;
    const query = { user: req.user.id };

    if (date) {
        // Set time to midnight (00:00:00) of the given date
        const parsedDate = new Date(date);
        parsedDate.setHours(0, 0, 0, 0); 

        // Get the start of the next day
        const nextDate = new Date(parsedDate);
        nextDate.setDate(nextDate.getDate() + 1);

        // Filter exercises by date: from the start of the given 
        // date to the start of the next day
        query.date = { $gte: parsedDate, $lt: nextDate };
    }

    const exercises = await Exercise.find(query);
    res.json(exercises);
});

/**
 * @openapi
 * paths:
 *   /api/exercise:
 *     post:
 *       tags:
 *         - Exercise
 *       summary: Create a new exercise for the user
 *       description: Adds a new exercise entry for the authenticated user. The body should include exercise details, including the `sets` array (each containing `weight` and `reps`).
 *       operationId: createExercise
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - sets
 *               properties:
 *                 sets:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       weight:
 *                         type: number
 *                         description: The weight used in the exercise set (in kilograms or pounds)
 *                       reps:
 *                         type: number
 *                         description: The number of repetitions performed in the exercise set
 *       responses:
 *         201:
 *           description: Exercise created successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Exercise'
 *         400:
 *           description: Bad request, if the provided sets are invalid (e.g., missing weight or reps)
 *         401:
 *           description: Unauthorized, if the user is not authenticated
 *         500:
 *           description: Internal server error
 */
exerciseRouter.post('/', async (req, res, next) => {
    const user = req.user;
    const {sets} = req.body;

    if (!Array.isArray(sets) || !sets.every(set => 'weight' in set && 'reps' in set)) {
        return res.status(400).json({ error: "Invalid format for sets" });
    }

    const exercise = new Exercise(req.body);
    exercise.user = user.id;
    user.exercises = user.exercises.concat(exercise.id);

    try {
        const savedExercise = await exercise.save();
        await user.save();
        res.status(201).json(savedExercise);
    } catch(e) {
        next(e)
    }
});


/**
 * @openapi
 * paths:
 *   /api/exercise/{id}:
 *     delete:
 *       tags:
 *          - Exercise
 *       summary: Delete a specific exercise for the user
 *       description: Deletes the exercise with the specified ID for the authenticated user. The user must be the owner of the exercise to delete it.
 *       operationId: deleteExercise
 *       parameters:
 *         - name: id
 *           in: path
 *           required: true
 *           description: The ID of the exercise to be deleted
 *           schema:
 *             type: string
 *       responses:
 *         204:
 *           description: Exercise successfully deleted
 *         401:
 *           description: Unauthorized, if the user is not the owner of the exercise
 *         404:
 *           description: Exercise not found, or if the exercise does not belong to the user
 *         500:
 *           description: Internal server error
 */
exerciseRouter.delete('/:id', async (req, res, next) => {
    try {
        const user = req.user;
        const id = req.params.id;
        const exerciseToDelete = await Exercise.findById(id);

        if (!exerciseToDelete) {
            return res.status(404).json({error: "exercise not found"});
        }

        if (exerciseToDelete.user.toString() != user.id.toString()) {
            return res.status(401).json({error: "provided user is not owner of the exercise."});
        }

        const deleted = await Exercise.findByIdAndDelete(id);
        if (deleted) {
            user.exercises = user.exercises.filter(eId => eId.toString() !== id);
            await user.save();    
            res.status(204).end();
        } else {
            res.status(404).end();
        }
    } catch(e) {
        next(e);
    }
});

/**
 * @openapi
 * paths:
 *   /exercise/{id}:
 *     put:
 *       tags:
 *          - Exercise
 *       summary: Update a specific exercise for the user
 *       description: Updates the exercise with the specified ID for the authenticated user. The user must be the owner of the exercise to update it.
 *       operationId: updateExercise
 *       parameters:
 *         - name: id
 *           in: path
 *           required: true
 *           description: The ID of the exercise to be updated
 *           schema:
 *             type: string
 *       requestBody:
 *         description: The exercise object that contains the updated fields. All fields are optional but must match the exercise format.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Exercise'
 *       responses:
 *         200:
 *           description: The updated exercise
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Exercise'
 *         401:
 *           description: Unauthorized, if the user is not the owner of the exercise
 *         404:
 *           description: Exercise not found, or if the exercise does not belong to the user
 *         500:
 *           description: Internal server error
 */
exerciseRouter.put('/:id', async (req, res, next) => {
    try {
        const user = req.user;
        const id = req.params.id;

        const exerciseToUpdate = await Exercise.findById(id);

        if (!exerciseToUpdate) {
            return res.status(404).json({error: "exercise not found"});
        }

        if (exerciseToUpdate.user.toString() != user.id.toString()) {
            return res.status(401).json({error: "provided user is not owner of the exercise."});
        }

        const updated = await Exercise.findByIdAndUpdate(id, req.body, {new: true});

        if (updated) {
            res.status(200).json(updated);
        } else {
            res.status(404).end();
        }
    } catch(e) {
        next(e);
    }
});

module.exports = exerciseRouter;