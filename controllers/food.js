const foodRouter = require('express').Router();
const Food = require('../models/food');
const {FOOD_API_KEY} = require('../config');
const axios = require('axios');

/**
 * @openapi
 * tags:
 *   - name: Food
 *     description: Operations related to Food
 */


/**
 * @openapi
 * tags:
 *   - name: Food
 *     description: Operations related to Food
 * /api/food:
 *   get:
 *     tags:
 *       - Food
 *     summary: Get a list of food entries for the authenticated user
 *     description: Fetches the list of food entries for the authenticated user, optionally filtered by date.
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter food entries by date. If provided, it will fetch food entries for the given date.
 *     responses:
 *       200:
 *         description: List of food entries for the authenticated user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Unique food entry identifier
 *                   user:
 *                     type: string
 *                     description: The user who added the food entry
 *                   date:
 *                     type: string
 *                     format: date
 *                     description: The date the food was consumed
 *                   foodName:
 *                     type: string
 *                     description: The name of the food
 *                   calories:
 *                     type: number
 *                     description: The calorie count of the food
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       500:
 *         description: Internal server error
 */
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


/**
 * @openapi
 * /api/food:
 *   post:
 *     tags:
 *       - Food
 *     summary: Add a new food entry for the authenticated user
 *     description: Creates a new food entry for the authenticated user and saves it to the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               foodName:
 *                 type: string
 *                 description: The name of the food
 *               calories:
 *                 type: number
 *                 description: The calorie count of the food
 *               date:
 *                 type: string
 *                 format: date
 *                 description: The date the food was consumed
 *     responses:
 *       201:
 *         description: Successfully created food entry
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The unique ID of the food entry
 *                 user:
 *                   type: string
 *                   description: The user who added the food entry
 *                 foodName:
 *                   type: string
 *                   description: The name of the food
 *                 calories:
 *                   type: number
 *                   description: The calorie count of the food
 *                 date:
 *                   type: string
 *                   format: date
 *                   description: The date the food was consumed
 *       400:
 *         description: Bad request, validation errors
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       500:
 *         description: Internal server error
 */
foodRouter.post('/', async (req, res, next) => {
    const user = req.user;

    const size = req.body.size;
    const foundFood = await searchFood(req.body.name);

    if (foundFood === null) {
        return res.status(404).end();
    }

    const {foodNutrients: nutrients, servingSize} = await getFoodNutrients(foundFood.fdcId);

    //adjust to weight, that user took
    const ratio = size / servingSize;
    const proteinsId = 1003;
    const fatsId = 1004;
    const carbsId = 1005;
    const energyId = 1008;

    const proteins = nutrients.find(n => n.nutrient.id === proteinsId)?.amount * ratio || 0;
    const fats = nutrients.find(n => n.nutrient.id === fatsId)?.amount * ratio || 0;
    const carbs = nutrients.find(n => n.nutrient.id === carbsId)?.amount * ratio || 0;
    const calories = nutrients.find(n => n.nutrient.id === energyId)?.amount * ratio || 0;

    const food = new Food({...req.body, carbs, fats, calories, proteins});
    food.user = user.id;
    
    try {
        user.food = user.food.concat(food.id);

        const savedFood = await food.save();
        await user.save();
        res.status(201).json(savedFood);
    } catch(e) {
        next(e)
    }
});

//finds food by name
async function searchFood(name) {
    const url = 'https://api.nal.usda.gov/fdc/v1/foods/search';

    try {
        const response = await axios.get(url, {
            params: {
                query: name,
                api_key: FOOD_API_KEY,
                pageSize: 1
            }
        });

        return response.data.foods[0]; // Take first result
    } catch (error) {
        console.error('Error fetching food data:', error.message);
        return null;
    }
}

//finds food nutrients by food id
async function getFoodNutrients(fdcId) {
    const url = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}`;

    try {
        const response = await axios.get(url, {
            params: { api_key: FOOD_API_KEY }
        });

        return response.data; 
    } catch (error) {
        console.error('Error fetching nutrient data:', error.message);
        return null;
    }
}

/**
 * @openapi
 * /api/food/{id}:
 *   delete:
 *     tags:
 *       - Food
 *     summary: Delete a food entry
 *     description: Deletes a specific food entry for the authenticated user.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the food entry to delete
 *     responses:
 *       204:
 *         description: Successfully deleted the food entry
 *       401:
 *         description: Unauthorized - User is not authenticated or does not own the food entry
 *       404:
 *         description: Food entry not found
 *       500:
 *         description: Internal server error
 */
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


/**
 * @openapi
 * /api/food/{id}:
 *   put:
 *     tags:
 *       - Food
 *     summary: Update a food entry
 *     description: Updates a specific food entry for the authenticated user.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the food entry to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               foodName:
 *                 type: string
 *                 description: The updated name of the food
 *               calories:
 *                 type: number
 *                 description: The updated calorie count of the food
 *               date:
 *                 type: string
 *                 format: date
 *                 description: The updated date when the food was consumed
 *     responses:
 *       200:
 *         description: Successfully updated the food entry
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The unique ID of the updated food entry
 *                 foodName:
 *                   type: string
 *                   description: The updated name of the food
 *                 calories:
 *                   type: number
 *                   description: The updated calorie count of the food
 *                 date:
 *                   type: string
 *                   format: date
 *                   description: The updated date when the food was consumed
 *       401:
 *         description: Unauthorized - User is not authenticated or does not own the food entry
 *       404:
 *         description: Food entry not found
 *       500:
 *         description: Internal server error
 */
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

        const foundFood = await searchFood(req.body.name);

        if (foundFood === null) {
            return res.status(404).end();
        }

        const size = req.body.size;
        const {foodNutrients: nutrients, servingSize} = await getFoodNutrients(foundFood.fdcId);

        //adjust to weight, that user took
        const ratio = size / servingSize;
        const proteinsId = 1003;
        const fatsId = 1004;
        const carbsId = 1005;
        const energyId = 1008;

        const proteins = nutrients.find(n => n.nutrient.id === proteinsId)?.amount * ratio || 0;
        const fats = nutrients.find(n => n.nutrient.id === fatsId)?.amount * ratio || 0;
        const carbs = nutrients.find(n => n.nutrient.id === carbsId)?.amount * ratio || 0;
        const calories = nutrients.find(n => n.nutrient.id === energyId)?.amount * ratio || 0;

        const updated = await Food.findByIdAndUpdate(id, {...req.body, proteins, carbs, fats, calories}, {new: true});

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