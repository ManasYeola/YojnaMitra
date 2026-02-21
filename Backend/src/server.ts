import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import connectDB from './config/database';

// Import routes
import authRoutes from './routes/auth.routes';
import schemeRoutes from './routes/scheme.routes';
import applicationRoutes from './routes/application.routes';
import documentRoutes from './routes/document.routes';
import whatsappRoutes from './routes/whatsapp.routes';

// Load environment variables
dotenv.config();

// Debug: Check NODE_ENV
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
console.log('📧 EMAIL_USER:', process.env.EMAIL_USER ? '✓ Configured' : '✗ Not configured');

// Create Express app
const app: Application = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/whatsapp', whatsappRoutes);

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'YojnaMitra API Server',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      schemes: '/api/schemes',
      applications: '/api/applications',
      documents: '/api/documents',
    },
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: any) => {
  console.error('Error:', err);

  // Multer file size error
  if (err.message.includes('File too large')) {
    res.status(413).json({
      success: false,
      message: 'File size exceeds the maximum limit',
    });
    return;
  }

  // Multer file type error
  if (err.message.includes('Invalid file type')) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Default error
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Server is running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`\n📚 API Endpoints:`);
  console.log(`   - Auth: http://localhost:${PORT}/api/auth`);
  console.log(`   - Schemes: http://localhost:${PORT}/api/schemes`);
  console.log(`   - Applications: http://localhost:${PORT}/api/applications`);
  console.log(`   - Documents: http://localhost:${PORT}/api/documents`);
  console.log(`\n✨ Ready to serve requests!\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

export default app;
