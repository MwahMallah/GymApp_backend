const swaggerJsDoc = require('swagger-jsdoc');

const swaggerSpecs = swaggerJsDoc({
    swaggerDefinition: {
        openapi: '3.0.0', 
        info: {
          title: 'GymApp API',
          version: '1.0.0',
          description: 'API documentation for GymApp',
        },
        servers: [
          {
            url: 'http://localhost:3005', 
          },
        ],
      },
      apis: ['./controllers/*.js'], 
});


module.exports = swaggerSpecs;