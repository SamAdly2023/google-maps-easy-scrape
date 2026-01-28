import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { body, validationResult } from 'express-validator';
import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import winston from 'winston';
import analytics from './services/analytics.js';
import { metricsMiddleware, errorHandlerMiddleware } from './middleware/metrics.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Winston Logger Configuration
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

// Rate Limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // 5 auth attempts per 15 minutes
    message: 'Too many authentication attempts, please try again later.',
});

// Security & Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://cdn.jsdelivr.net", "https://www.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://*.firebaseio.com", "https://*.googleapis.com"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
        },
    },
}));
app.use(compression()); // Compress responses
app.use(metricsMiddleware); // Track request metrics
app.use(morgan('combined', {
    stream: {
        write: (message) => logger.info(message.trim())
    }
}));
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5000'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Initialize Firebase Admin SDK
const firebaseConfigPath = process.env.FIREBASE_CONFIG_PATH || './firebase-config.json';

if (fs.existsSync(firebaseConfigPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL
    });
    logger.info('✅ Firebase Admin SDK initialized from file');
} else if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    // Initialize from Environment Variables (Render, etc.)
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL
    });
    logger.info('✅ Firebase Admin SDK initialized from Environment Variables');
} else {
    logger.warn('⚠️ Firebase config file not found. Some features may not work.');
}

// Validation Helper
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array()
        });
    }
    next();
};

// Firebase Authentication Middleware
const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
        logger.warn('Authentication attempt without token');
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        logger.info(`User authenticated: ${decodedToken.uid}`);
        next();
    } catch (error) {
        logger.error('Token verification failed:', error);
        res.status(403).json({ error: 'Invalid token', details: error.message });
    }
};

// Routes
// Serve website files
app.use(express.static(path.join(__dirname, 'website')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'website', 'index.html'));
});

app.get('/api/docs', (req, res) => {
    res.json({
        message: 'MapLeads AI Backend - API Server Running',
        version: '1.0.0',
        status: 'healthy',
        endpoints: {
            auth: '/api/auth/*',
            admin: '/api/admin/*',
            client: '/api/client/*',
            docs: '/api/docs',
            health: '/health'
        }
    });
});

// API Documentation
app.get('/api/docs', (req, res) => {
    res.json({
        name: 'MapLeads AI API',
        version: '1.0.0',
        endpoints: [
            {
                path: 'POST /api/auth/verify',
                description: 'Verify Firebase authentication token',
                authentication: 'None',
                body: { token: 'string' },
                response: { success: 'boolean', user: 'object' }
            },
            {
                path: 'GET /api/admin/stats',
                description: 'Get platform statistics (Admin only)',
                authentication: 'Bearer token',
                response: { totalUsers: 'number', totalScrapes: 'number', activeUsers: 'number' }
            },
            {
                path: 'GET /api/admin/users',
                description: 'Get all users (Admin only)',
                authentication: 'Bearer token',
                response: 'Array of user objects'
            },
            {
                path: 'GET /api/client/data',
                description: 'Get user scrapes',
                authentication: 'Bearer token',
                response: 'Array of scrape objects'
            },
            {
                path: 'POST /api/client/scrape',
                description: 'Save new scrape',
                authentication: 'Bearer token',
                body: { query: 'string', results: 'array' },
                response: { success: 'boolean', scrapeId: 'string' }
            },
            {
                path: 'GET /health',
                description: 'Health check endpoint',
                authentication: 'None',
                response: { status: 'string', timestamp: 'string' }
            }
        ]
    });
});

// Auth Routes (with rate limiting)
app.post('/api/auth/verify',
    authLimiter,
    [body('token').notEmpty().withMessage('Token is required')],
    validate,
    async (req, res) => {
        const { token } = req.body;

        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            logger.info(`Token verified for user: ${decodedToken.uid}`);
            res.json({
                success: true,
                user: {
                    uid: decodedToken.uid,
                    email: decodedToken.email,
                    name: decodedToken.name
                }
            });
        } catch (error) {
            logger.error('Token verification failed:', error);
            res.status(401).json({ error: 'Invalid token' });
        }
    }
);

// Admin Routes (with rate limiting)
app.get('/api/admin/stats', apiLimiter, verifyToken, async (req, res) => {
    try {
        // Check if user is admin
        const userDoc = await admin.firestore().collection('users').doc(req.user.uid).get();
        const userData = userDoc.data();

        if (userData?.role !== 'admin') {
            logger.warn(`Unauthorized admin access attempt by user: ${req.user.uid}`);
            return res.status(403).json({ error: 'Admin access required' });
        }

        // Get stats
        const usersSnapshot = await admin.firestore().collection('users').get();
        const scrapesSnapshot = await admin.firestore().collection('scrapes').get();

        const stats = {
            totalUsers: usersSnapshot.size,
            totalScrapes: scrapesSnapshot.size,
            activeUsers: usersSnapshot.docs.filter(d => d.data().lastActive > Date.now() - 7 * 24 * 60 * 60 * 1000).length
        };

        logger.info(`Admin stats retrieved by user: ${req.user.uid}`);
        res.json(stats);
    } catch (error) {
        logger.error('Failed to fetch admin stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats', details: error.message });
    }
});

app.get('/api/admin/users', apiLimiter, verifyToken, async (req, res) => {
    try {
        const userDoc = await admin.firestore().collection('users').doc(req.user.uid).get();
        if (userDoc.data()?.role !== 'admin') {
            logger.warn(`Unauthorized admin users access attempt by: ${req.user.uid}`);
            return res.status(403).json({ error: 'Admin access required' });
        }

        const usersSnapshot = await admin.firestore().collection('users').get();
        const users = usersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        logger.info(`Admin users list retrieved by: ${req.user.uid}`);
        res.json(users);
    } catch (error) {
        logger.error('Failed to fetch users:', error);
        res.status(500).json({ error: 'Failed to fetch users', details: error.message });
    }
});

// Client Routes (with rate limiting)
app.get('/api/client/data', apiLimiter, verifyToken, async (req, res) => {
    try {
        const scrapesSnapshot = await admin.firestore()
            .collection('scrapes')
            .where('userId', '==', req.user.uid)
            .get();

        const scrapes = scrapesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        logger.info(`Client data retrieved for user: ${req.user.uid}`);
        res.json(scrapes);
    } catch (error) {
        logger.error('Failed to fetch scrapes:', error);
        res.status(500).json({ error: 'Failed to fetch scrapes', details: error.message });
    }
});

app.post('/api/client/scrape',
    apiLimiter,
    verifyToken,
    [
        body('query').notEmpty().withMessage('Query is required'),
        body('results').isArray().withMessage('Results must be an array')
    ],
    validate,
    async (req, res) => {
        try {
            const { query, results } = req.body;

            const docRef = await admin.firestore().collection('scrapes').add({
                userId: req.user.uid,
                query,
                results,
                createdAt: new Date(),
                status: 'completed'
            });

            logger.info(`Scrape saved for user ${req.user.uid}: ${docRef.id}`);
            res.json({ success: true, scrapeId: docRef.id });
        } catch (error) {
            logger.error('Failed to save scrape:', error);
            res.status(500).json({ error: 'Failed to save scrape', details: error.message });
        }
    }
);

// Serve static files - Admin Dashboard
app.use('/admin', express.static(path.join(__dirname, 'public/admin')));

// Serve static files - Client Dashboard
app.use('/dashboard', express.static(path.join(__dirname, 'public/client')));

// Serve extension files
app.use('/extension', express.static(path.join(__dirname, 'google-maps-easy-scrape')));

// Serve public files (privacy policy, etc)
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ============================================
// 🤖 AI ENRICHMENT ENDPOINTS
// ============================================

const fetchWebsiteContent = async (url) => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        clearTimeout(timeoutId);
        if (!response.ok) return '';
        const text = await response.text();
        return text.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, "")
            .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gm, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .substring(0, 10000); // Increased limit to capture footers
    } catch (error) {
        return '';
    }
};

app.post('/api/enrich', apiLimiter, async (req, res) => {
    try {
        let { businessName, category, websiteUrl, websiteText } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        // Fallback: If client didn't send website text, try to fetch it server-side
        if (!websiteText && websiteUrl && websiteUrl !== "No Website") {
            try {
                logger.info(`Fetching website content server-side for: ${websiteUrl}`);
                websiteText = await fetchWebsiteContent(websiteUrl);

                // Pre-extract emails to ensure AI sees them
                const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
                const foundEmails = websiteText.match(emailRegex) || [];
                if (foundEmails.length > 0) {
                    websiteText = `[EXTRACTED_EMAILS: ${foundEmails.join(', ')}] \n\n ${websiteText}`;
                }
            } catch (err) {
                logger.warn(`Server-side fetch failed for ${websiteUrl}`);
            }
        }

        if (!apiKey) {
            logger.error('GEMINI_API_KEY is not set in environment variables');
            // ... (keep existing error response)
            return res.json({
                seo_health: 0,
                missing_features: "API Key Config Missing",
                outreach_message: "Please configure GEMINI_API_KEY in Render Environment Variables to enable AI enrichment.",
                email: null,
                phone: null,
                contact_person: "Admin"
            });
        }

        const promptText = `
        You are a lead generation expert. Analyze this business:
        Business Name: ${businessName}
        Category: ${category}
        Website: ${websiteUrl}
        Website Content Snippet: ${websiteText || 'No content available'}

        Task: Extract contact details and analyze the business quality.
        Target Output:
        1. "email": Look for email addresses in the snippet. Any valid email found (prioritize info@, contact@, hello@ or specific names). If multiple, pick the best one. Return null if none.
        2. "phone": Look for a phone number in the snippet. Return null if none.
        3. "contact_person": key decision maker name if found, else "Owner/Manager".
        4. "seo_health": 1-10 score.
        5. "missing_features": List 2-3 critical missing things (e.g. "No SSL", "Slow Load").
        6. "website": The confirmed website URL.

        Return ONLY raw JSON with these exact keys.
    `;


        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{
                parts: [{
                    text: promptText
                }]
            }]
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Gemini API Error: ${response.status} - ${errorBody}`);
        }

        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) throw new Error('No content generated by Gemini.');

        let jsonString = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonResult = JSON.parse(jsonString);

        // Remove null values to prevent overwriting existing client-side data
        Object.keys(jsonResult).forEach(key => {
            if (jsonResult[key] === null) {
                delete jsonResult[key];
            }
        });

        res.json(jsonResult);

    } catch (error) {
        logger.error('Enrichment error:', error);
        // Returns success=false equivalent structure so UI doesn't crash but shows error
        res.json({
            seo_health: 0,
            missing_features: "Analysis Failed",
            outreach_message: "Error: " + error.message,
            email: null,
            phone: null,
            contact_person: null
        });
    }
});

// ============================================
// 📊 MONITORING & ANALYTICS ENDPOINTS
// ============================================

// Get current metrics
app.get('/api/metrics', apiLimiter, (req, res) => {
    try {
        const metrics = analytics.getMetrics();
        res.json(metrics);
    } catch (error) {
        logger.error('Failed to fetch metrics:', error);
        res.status(500).json({ error: 'Failed to fetch metrics' });
    }
});

// Get health status
app.get('/api/health/status', (req, res) => {
    try {
        const health = analytics.getHealthStatus();
        const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 503 : 500;
        res.status(statusCode).json(health);
    } catch (error) {
        logger.error('Failed to fetch health status:', error);
        res.status(500).json({ error: 'Failed to fetch health status' });
    }
});

// Get performance metrics
app.get('/api/metrics/performance', apiLimiter, (req, res) => {
    try {
        const performance = analytics.getPerformanceMetrics();
        res.json(performance);
    } catch (error) {
        logger.error('Failed to fetch performance metrics:', error);
        res.status(500).json({ error: 'Failed to fetch performance metrics' });
    }
});

// Get error statistics
app.get('/api/metrics/errors', apiLimiter, verifyToken, (req, res) => {
    try {
        // Only admins can view error stats
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        const errorStats = analytics.getErrorStats();
        res.json(errorStats);
    } catch (error) {
        logger.error('Failed to fetch error statistics:', error);
        res.status(500).json({ error: 'Failed to fetch error statistics' });
    }
});

// Get recent errors
app.get('/api/metrics/errors/recent', apiLimiter, verifyToken, (req, res) => {
    try {
        // Only admins can view errors
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        const limit = parseInt(req.query.limit) || 20;
        const errors = analytics.getRecentErrors(limit);
        res.json({ errors, total: errors.length });
    } catch (error) {
        logger.error('Failed to fetch recent errors:', error);
        res.status(500).json({ error: 'Failed to fetch recent errors' });
    }
});

// Get comprehensive report
app.get('/api/metrics/report', apiLimiter, verifyToken, (req, res) => {
    try {
        // Only admins can view reports
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        const report = analytics.generateReport();
        res.json(report);
    } catch (error) {
        logger.error('Failed to generate report:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Error handler (with analytics tracking)
app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
    console.log(`🚀 MapLeads AI Server running on http://localhost:${PORT}`);
    console.log(`📊 Admin Dashboard: http://localhost:${PORT}/admin`);
    console.log(`👤 Client Dashboard: http://localhost:${PORT}/dashboard`);
    console.log(`📈 Metrics: http://localhost:${PORT}/api/metrics`);
    console.log(`💚 Health Check: http://localhost:${PORT}/health`);
    console.log(`📊 Reports: http://localhost:${PORT}/api/metrics/report`);
});

export default app;