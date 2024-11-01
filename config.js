require('dotenv').config();

const PORT = process.env.PORT;
const DB_CONN_URL = process.env.DB_CONN_URI;

module.exports = {PORT, DB_CONN_URL};