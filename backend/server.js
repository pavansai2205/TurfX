import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'dotenv/config';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import turfRoutes from './routes/turfRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import prisma from './config/db.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Security and Logging Middleware
app.use(helmet());
app.use(cors({
  origin: '*', // Allow all origins for seamless development and cross-deployment testing
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connectivity Check
prisma.$connect()
  .then(() => console.log('✅ PostgreSQL Database connected successfully via Prisma Client.'))
  .catch((err) => console.error('❌ Database connection failure:', err.message));

// Health Check API
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});

// Primary Endpoint Wiring
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/turfs', turfRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

/**
 * ====================================================
 * FUTURE AI SCALABLE INTEGRATION STUBS
 * ====================================================
 * These routes establish the structured API interface for upcoming AI engines.
 * This ensures the frontend and backend can be expanded easily in the future.
 */
app.post('/api/ai/chatbot', (req, res) => {
  const { message, userId } = req.body;
  // Placeholder stub returning smart cricket turf information
  res.json({
    reply: "Welcome to TurfX Support! I can assist in recommending cricket grounds or looking up your booking list. How can I help you play today?",
    isAiResponse: true,
  });
});

app.get('/api/ai/recommendations', (req, res) => {
  const { userId } = req.query;
  // Placeholder stub returning personalized turf listing ranks based on past search histories
  res.json({
    suggestions: [],
    note: "Recommended turfs based on past bookings and slot preferences will appear here.",
  });
});

app.get('/api/ai/peak-prediction', (req, res) => {
  const { turfId, date } = req.query;
  // Predicts high-traffic slot timings using machine learning distributions
  res.json({
    peakHours: ["17:00-18:00", "18:00-19:00", "19:00-20:00"],
    predictedOccupancy: "92%",
    pricingMultiplier: 1.2, // Sugggested peak hour increase
  });
});

// Static files mapping (for deployed packages)
app.get('/', (req, res) => {
  res.send('🏟️ Smart Turf Cricket Booking & Management API Server is running...');
});

// Centralized Unhandled Routes
app.use((req, res, next) => {
  res.status(404);
  const error = new Error(`Endpoint Not Found - ${req.originalUrl}`);
  next(error);
});

// Global Central Error Boundary
app.use(errorHandler);

// Start listening
app.listen(PORT, () => {
  console.log(`🏟️ Smart Turf API Server active on: http://localhost:${PORT}`);
});
