const config = require('./config');
const logger = require('./utils/logger');
const app = require('./app');
const { Server } = require('socket.io');

const initWebSockets = require('./sockets/sockets');

const server = app.listen(config.PORT, () => {
    logger.info(`Server running on port ${config.PORT}`);
});

const io = new Server(server, {
    cors: {
        origin: '*', // Frontend URL
        methods: ['GET', 'POST']
    }
});

initWebSockets(io);