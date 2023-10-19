const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
app.use(bodyParser.text());

// Swagger configuration
const swaggerDefinition = {
  info: {
    title: 'Justify API',
    version: '1.0.0',
    description: 'API for text justification',
  },
  basePath: '/',
};

const options = {
  swaggerDefinition,
  apis: ['app.ts'],
};

const swaggerSpec = swaggerJsdoc(options);
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Port to listen on
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
