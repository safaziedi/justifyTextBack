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


const secretKey = '7juiBucz3zyn3ZRNGzwwdmOgDvWWgT40';
const wordCounts = {}; // Objet pour suivre le nombre de mots justifiés par token

app.use((req, res, next) => {
    if (req.path === '/api/justify') {
      const token = req.headers.authorization;
      if (token) {
        if (!wordCounts[token]) {
          wordCounts[token] = 0;
        }
        const wordCount = req.body.split(/\s+/).length;
        wordCounts[token] += wordCount;
  
        if (wordCounts[token] > 80000) {
          res.status(402).send('Payment Required');
          return;
        }
      }
      next();
    } else {
      next();
    }
  });
  /**
   * @swagger
   * /api/token:
   *   post:
   *     tags:
   *       - Token
   *     summary: Generate a unique token based on the provided email.
   *     description: Returns a JWT token.
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: email
   *         in: body
   *         description: The email used to generate the token.
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Token generated successfully.
   *         schema:
   *           type: string
   */
  app.post('/api/token', (req, res) => {
    const email = req.body; // Récupérez l'e-mail directement depuis le corps de la requête
    const token = jwt.sign({ email }, secretKey, { expiresIn: '24h' });
    res.json({ token }); // Utilisez res.json() pour renvoyer du JSON
  });
  
  
  
function justifyText(text, wordCount) {
    const words = text.split(/\s+/); // Sépare le texte en mots
  
    let result = '';
    let line = '';
    let lineLength = 0;
  
    for (const word of words) {
      if (lineLength + word.length + (line.length > 0 ? 1 : 0) <= 80) {
        // Ajoute le mot à la ligne actuelle
        line += (line.length > 0 ? ' ' : '') + word;
        lineLength += word.length + (line.length > 0 ? 1 : 0);
      } else {
        // La ligne est pleine, ajoute la ligne au résultat
        result += justifyLine(line) + '\n';
  
        // Réinitialise la ligne
        line = word;
        lineLength = word.length;
      }
    }
  
    // Ajoute la dernière ligne au résultat
    result += justifyLine(line);
  
    // Vérifie le rate limit
    if (wordCount > 80000) {
      throw new Error('402 Payment Required');
    }
  
    return result;
  }
  
function justifyLine(line){
    if (line.length < 80) {
      const words = line.split(' ');
      if (words.length > 1) {
        const spacesToAdd = 80 - line.length;
        const spacesPerGap = Math.floor(spacesToAdd / (words.length - 1));
        const extraSpaces = spacesToAdd % (words.length - 1);
        line = words[0];
        for (let i = 1; i < words.length; i++) {
          const spaces = i <= extraSpaces ? spacesPerGap + 1 : spacesPerGap;
          line += ' '.repeat(spaces) + words[i];
        }
      }
    }
    return line;
  }
  /**
   * @swagger
   * /api/justify:
   *   post:
   *     tags:
   *       - Justify
   *     summary: Justify a text.
   *     description: Justify a text to have lines of 80 characters.
   *     consumes:
   *       - text/plain
   *     produces:
   *       - text/plain
   *     parameters:
   *       - name: Authorization
   *         in: header
   *         description: JWT token to authorize the request.
   *         required: true
   *         type: string
   *         format: JWT
   *       - name: text
   *         in: body
   *         description: The text to justify.
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Text justified successfully.
   *         schema:
   *           type: string
   *       401:
   *         description: Unauthorized. Token is missing or invalid.
   *       402:
   *         description: Payment Required. Rate limit exceeded.
   */
  app.post('/api/justify', (req, res) => {
    const token = req.headers.authorization;
    if (!token) {
      res.status(401).send('Unauthorized');
      return;
    }
  
    const text = req.body;
  
    try {
      const justifiedText = justifyText(text, wordCounts[token]);
      res.send(justifiedText);
    } catch (error) {
      res.status(402).send('Payment Required');
    }
  });
  

app.get('/', (req, res) => {
  res.send('Hello Tictactrip Team');
});

// Port to listen on
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


export default app; 
