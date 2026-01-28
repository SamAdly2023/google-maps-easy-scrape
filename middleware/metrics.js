/**
 * Metrics Middleware
 * Tracks request/response times and errors
 */

import analytics from '../services/analytics.js';

/**
 * Middleware to track request metrics
 */
const metricsMiddleware = (req, res, next) => {
    const startTime = Date.now();

    // Override res.json to capture response
    const originalJson = res.json.bind(res);
    res.json = function (data) {
        const responseTime = Date.now() - startTime;
        const hasError = res.statusCode >= 400;

        // Track metrics
        analytics.trackRequest(responseTime, hasError ? new Error(`HTTP ${res.statusCode}`) : null);

        return originalJson(data);
    };

    // Track errors
    res.on('finish', () => {
        if (res.statusCode >= 500) {
            analytics.logError(new Error(`Server error: ${res.statusCode}`), {
                method: req.method,
                path: req.path,
                statusCode: res.statusCode,
                ip: req.ip
            });
        }
    });

    next();
};

/**
 * Error handler middleware
 */
const errorHandlerMiddleware = (err, req, res, next) => {
    // Log error to analytics
    analytics.logError(err, {
        method: req.method,
        path: req.path,
        body: req.body,
        query: req.query,
        user: req.user?.uid
    });

    // Send error response
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        error: {
            message,
            type: analytics.categorizeError(err),
            timestamp: new Date().toISOString()
        }
    });
};

export {
    metricsMiddleware,
    errorHandlerMiddleware
};
