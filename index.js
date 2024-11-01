const config = require('./config');
const logger = require('./utils/logger');
const app = require('./app');

app.listen(config.PORT, () => {
    logger.info(`Server running on port ${config.PORT}`);
});