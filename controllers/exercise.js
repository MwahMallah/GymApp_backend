const exerciseRouter = require('express').Router();
const Exercise = require('../models/exercise');

exerciseRouter.get("/", async (req, res) => {
    const exercises = await Exercise.find({user: req.user.id});
    res.json(exercises);
});

exerciseRouter.post('/', async (req, res, next) => {
    const user = req.user;
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