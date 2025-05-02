const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const UserModel = require('./models/User');
require('dotenv').config();

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const mongoUri = process.env.MONGODB_URI;

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});

const app = express();
app.use(express.json());
app.use(cors());

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Weather Application API',
      version: '1.0.0',
      description: 'API documentation for the Weather Application backend',
    },
    servers: [
      {
        url: 'http://localhost:3002',
      },
    ],
  },
  apis: ['./index.js'], // This file
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /addUser:
 *   post:
 *     summary: Add a new user (Sign Up)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: User saved successfully
 *       400:
 *         description: User already exists or missing fields
 */
app.post('/addUser', async (req, res) => {
  const { name, password, location } = req.body;

  if (!name || !password || !location) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const existingUser = await UserModel.findOne({ name });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const newUser = new UserModel({ name, password, location });
    const savedUser = await newUser.save();

    res.status(201).json({
      message: 'User saved successfully!',
      user: {
        name: savedUser.name,
        location: savedUser.location,
      },
    });
  } catch (err) {
    console.error('❌ Error saving user:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       404:
 *         description: User not found
 */
app.post('/login', async (req, res) => {
  const { name, password } = req.body;

  try {
    const user = await UserModel.findOne({ name, password });

    if (user) {
      res.status(200).json({
        message: 'Login successful',
        user: { name: user.name, location: user.location },
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error('❌ Error during login:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /getUser:
 *   get:
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: List of all users
 */
app.get('/getUser', async (req, res) => {
  try {
    const users = await UserModel.find({});
    res.json(users);
  } catch (err) {
    console.error('❌ Error fetching users:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(3002, () => {
  console.log('🚀 Server is running on port 3002');
  console.log('📄 Swagger docs available at http://localhost:3002/api-docs');
});
