require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const accidentRoutes = require('./routes/accidentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/vanet_cms';

// --- Middlewares ---
app.use(express.json()); // To parse JSON bodies (OBU payload)

// --- CORS Configuration (Allow the React dashboard to connect) ---
app.use((req, res, next) => {
    // Replace with your frontend development server URL (e.g., VITE default)
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// --- MongoDB Connection ---
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error. Please ensure MongoDB is running:', err.message);
    process.exit(1);
  });

// --- API Routes ---
// The base endpoint for all incident routes
app.use('/api/v1/incidents', accidentRoutes); 

// --- Server Start ---
app.listen(PORT, () => {
  console.log(`CMS API Server is running on port ${PORT}`);
});
