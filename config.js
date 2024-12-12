require('dotenv').config();

const PORT = process.env.PORT;
const DB_CONN_URL = process.env.DB_CONN_URI;
const FOOD_API_KEY = process.env.FOOD_API_KEY;

module.exports = {PORT, DB_CONN_URL, FOOD_API_KEY};