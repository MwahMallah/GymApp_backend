const exerciseRouter = require('express').Router();
const logger = require('../utils/logger');
const Exercise = require('../models/exercise');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

exerciseRouter.get("/", async (req, res) => {
    const exercises = await Exercise.find({user: req.user.id}).populate('user', {exercises: 0});
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
    const decodedToken = jwt.decode(req.token, process.env.SECRET);

    if (!decodedToken.id) {
        return res.status(401).json({error: "token is invalid"});
    }

    const {id, username, name} = decodedToken;
    const user = await User.findById(id);
    if (!user || user.username != username || user.name != name)
        return res.status(401).json({error: "token is invalid"});

    try {
        const id = req.params.id;
        const blogToDelete = await Blog.findById(id);

        console.log(user);
        if (blogToDelete.user.id.toString() != user.id.toString()) {
            return res.status(401).json({error: "provided user is not owner of the blog."});
        }

        const deleted = await Blog.findByIdAndDelete(id);
        if (deleted) {
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
        const id = req.params.id;
        const updated = await Blog.findByIdAndUpdate(id, req.body, {new: true});

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