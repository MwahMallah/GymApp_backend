const foodRouter = require('express').Router();
const Food = require('../models/food');

foodRouter.get("/", async (req, res) => {
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

    const food = await Food.find(query);
    res.json(food);
});

foodRouter.post('/', async (req, res, next) => {
    const user = req.user;
    const food = new Food(req.body);
    food.user = user.id;
    user.food = user.food.concat(food.id);

    try {
        const savedFood = await food.save();
        await user.save();
        res.status(201).json(savedFood);
    } catch(e) {
        next(e)
    }
});

foodRouter.delete('/:id', async (req, res, next) => {
    try {
        const user = req.user;
        const id = req.params.id;
        const foodToDelete = await Food.findById(id);

        if (!foodToDelete) {
            return res.status(404).json({error: "food not found"});
        }

        if (foodToDelete.user.toString() != user.id.toString()) {
            return res.status(401).json({error: "provided user is not owner of the food."});
        }

        const deleted = await Food.findByIdAndDelete(id);
        if (deleted) {
            user.food = user.food.filter(fId => fId.toString() !== id);
            await user.save();    
            res.status(204).end();
        } else {
            res.status(404).end();
        }
    } catch(e) {
        next(e);
    }
});

foodRouter.put('/:id', async (req, res, next) => {
    try {
        const user = req.user;
        const id = req.params.id;

        const foodToUpdate = await Food.findById(id);

        if (!foodToUpdate) {
            return res.status(404).json({error: "food not found"});
        }

        if (foodToUpdate.user.toString() != user.id.toString()) {
            return res.status(401).json({error: "provided user is not owner of the food."});
        }

        const updated = await Food.findByIdAndUpdate(id, req.body, {new: true});

        if (updated) {
            res.status(200).json(updated);
        } else {
            res.status(404).end();
        }
    } catch(e) {
        next(e);
    }
});

module.exports = foodRouter;