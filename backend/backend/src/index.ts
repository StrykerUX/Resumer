import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import cvRoutes from './routes/cv';
import generateRoutes from './routes/generate';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Prisma
const prisma = new PrismaClient();

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://resumer.novalabss.com',
  process.env.CORS_ORIGIN
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Global Middleware
app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: '1.0.0',
      database: 'connected',
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
    });
  }
});

// API Status Endpoint
app.get('/api/status', async (req, res) => {
  try {
    const dbStatus = await prisma.$queryRaw`SELECT version()`;
    
    res.json({
      api: 'CV Resumer Backend',
      version: '1.0.0',
      status: 'operational',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: {
        status: 'connected',
        version: Array.isArray(dbStatus) ? dbStatus[0] : dbStatus,
      },
      features: {
        auth: 'enabled',
        fileUpload: 'enabled',
        aiGeneration: 'enabled',
        rateLimiting: 'enabled',
      },
    });
  } catch (error) {
    console.error('Status check failed:', error);
    res.status(500).json({
      api: 'CV Resumer Backend',
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
    });
  }
});

// Basic API Routes
app.get('/api', (req, res) => {
  res.json({
    message: 'CV Resumer API',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      health: '/health',
      status: '/api/status',
      auth: '/api/auth/*',
      upload: '/api/upload',
      generate: '/api/generate',
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/cv', cvRoutes);
app.use('/api/generate', generateRoutes);

// Test endpoint for Coolify deployment
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Test endpoint working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database_url_set: !!process.env.DATABASE_URL,
    redis_url_set: !!process.env.REDIS_URL,
    jwt_secret_set: !!process.env.JWT_SECRET,
  });
});

// Serve static files from frontend build
app.use(express.static(path.join(__dirname, '../../../frontend/build')));


// Catch-all handler for React Router (SPA)
app.get('*', (req, res) => {
  // If it's an API route, return 404 JSON
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      error: 'API endpoint not found',
      message: `Route ${req.method} ${req.originalUrl} not found`,
      availableEndpoints: [
        'GET /health',
        'GET /api/status',
        'GET /api',
        'GET /api/test',
        'POST /api/auth/register',
        'POST /api/auth/login',
        'GET /api/auth/me',
        'POST /api/profile/basic-data',
        'GET /api/profile/basic-data',
        'POST /api/cv/upload',
        'GET /api/cv/parsed-data',
        'GET /api/cv/recommendations',
        'GET /api/cv/preview',
        'GET /api/cv/download',
        'POST /api/generate/analyze-job',
        'POST /api/generate/adapt-cv',
        'GET /api/generate',
      ],
    });
  }
  
  // For all other routes, serve the React app
  res.sendFile(path.join(__dirname, '../../../frontend/build/index.html'));
});

// Global Error Handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    timestamp: new Date().toISOString(),
  });
});

// Database Connection Test
async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.log('🔄 Server will continue without database (for testing)');
  }
}

// Graceful Shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 SIGTERM received, shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start Server
async function startServer() {
  try {
    await connectDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 CV Resumer Backend running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`📡 API status: http://localhost:${PORT}/api/status`);
      console.log(`🔗 API docs: http://localhost:${PORT}/api`);
      console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Initialize server
startServer();