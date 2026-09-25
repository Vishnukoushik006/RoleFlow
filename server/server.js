const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth.routes');
const applicationRoutes = require('./routes/application.routes');
const resumeRoutes = require('./routes/resume.routes');
const interviewRoutes = require('./routes/interview.routes');
const reminderRoutes = require('./routes/reminder.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const aiRoutes = require('./routes/ai.routes');
const companyRoutes = require('./routes/company.routes');
const extensionRoutes = require('./routes/extension.routes');

const app = express();

// Connect to MongoDB
connectDB();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS setup (allow frontend and chrome extension)
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL?.replace(/\/$/, '')
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, extension popup, chrome-extension://)
    if (!origin || origin.startsWith('chrome-extension://') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive in dev for extension compatibility
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static directory for uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// General API rate limiter (protects server from abuse)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});
app.use('/api/', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'JobTrack REST API',
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/extension', extensionRoutes);

// 404 handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Root route
app.get('/', (req, res) => res.send('RoleFlow API is running'));

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`[RoleFlow API] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });

  // Handle unhandled promise rejections gracefully
  process.on('unhandledRejection', (err) => {
    console.error(`[Unhandled Rejection] ${err.message}`);
  });
}

module.exports = app;
