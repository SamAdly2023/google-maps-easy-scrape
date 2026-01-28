/**
 * Analytics Service
 * Tracks real-time metrics, errors, and performance data
 */

class AnalyticsService {
    constructor() {
        this.metrics = {
            scrapes: {
                total: 0,
                successful: 0,
                failed: 0,
                inProgress: 0
            },
            requests: {
                total: 0,
                errors: 0,
                avgResponseTime: 0,
                responseTimes: []
            },
            users: {
                active: new Set(),
                total: 0
            },
            errors: []
        };

        this.maxErrorsStored = 100;
        this.maxResponseTimesStored = 1000;
    }

    /**
     * Track a scrape event
     */
    trackScrape(status, userId, resultCount = 0) {
        this.metrics.scrapes.total++;

        if (status === 'started') {
            this.metrics.scrapes.inProgress++;
        } else if (status === 'success') {
            this.metrics.scrapes.successful++;
            this.metrics.scrapes.inProgress--;
        } else if (status === 'failed') {
            this.metrics.scrapes.failed++;
            this.metrics.scrapes.inProgress--;
        }

        if (userId) {
            this.metrics.users.active.add(userId);
        }

        return {
            timestamp: new Date().toISOString(),
            status,
            userId,
            resultCount
        };
    }

    /**
     * Track API request metrics
     */
    trackRequest(responseTime, error = null) {
        this.metrics.requests.total++;

        if (error) {
            this.metrics.requests.errors++;
        }

        // Store response time
        this.metrics.requests.responseTimes.push(responseTime);

        // Keep only recent response times
        if (this.metrics.requests.responseTimes.length > this.maxResponseTimesStored) {
            this.metrics.requests.responseTimes.shift();
        }

        // Calculate average
        const sum = this.metrics.requests.responseTimes.reduce((a, b) => a + b, 0);
        this.metrics.requests.avgResponseTime =
            Math.round(sum / this.metrics.requests.responseTimes.length);
    }

    /**
     * Log an error with context
     */
    logError(error, context = {}) {
        const errorEntry = {
            timestamp: new Date().toISOString(),
            message: error.message || error,
            stack: error.stack,
            type: this.categorizeError(error),
            context,
            severity: this.getErrorSeverity(error)
        };

        this.metrics.errors.unshift(errorEntry);

        // Keep only recent errors
        if (this.metrics.errors.length > this.maxErrorsStored) {
            this.metrics.errors.pop();
        }

        return errorEntry;
    }

    /**
     * Categorize error type
     */
    categorizeError(error) {
        const message = error.message || error.toString();

        if (message.includes('auth') || message.includes('token')) {
            return 'AUTH_ERROR';
        }
        if (message.includes('network') || message.includes('ECONNREFUSED')) {
            return 'NETWORK_ERROR';
        }
        if (message.includes('validation') || message.includes('invalid')) {
            return 'VALIDATION_ERROR';
        }
        if (message.includes('rate limit')) {
            return 'RATE_LIMIT_ERROR';
        }
        if (message.includes('parse') || message.includes('JSON')) {
            return 'PARSE_ERROR';
        }

        return 'UNKNOWN_ERROR';
    }

    /**
     * Determine error severity
     */
    getErrorSeverity(error) {
        const message = error.message || error.toString();

        if (message.includes('critical') || message.includes('fatal')) {
            return 'critical';
        }
        if (message.includes('auth') || message.includes('database')) {
            return 'high';
        }
        if (message.includes('validation') || message.includes('rate limit')) {
            return 'medium';
        }

        return 'low';
    }

    /**
     * Get current metrics snapshot
     */
    getMetrics() {
        return {
            ...this.metrics,
            users: {
                ...this.metrics.users,
                active: this.metrics.users.active.size
            },
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage()
        };
    }

    /**
     * Get recent errors
     */
    getRecentErrors(limit = 20) {
        return this.metrics.errors.slice(0, limit);
    }

    /**
     * Get error statistics
     */
    getErrorStats() {
        const errorTypes = {};
        const errorSeverities = { critical: 0, high: 0, medium: 0, low: 0 };

        this.metrics.errors.forEach(error => {
            // Count by type
            errorTypes[error.type] = (errorTypes[error.type] || 0) + 1;

            // Count by severity
            errorSeverities[error.severity]++;
        });

        return {
            total: this.metrics.errors.length,
            byType: errorTypes,
            bySeverity: errorSeverities,
            errorRate: this.metrics.requests.total > 0
                ? (this.metrics.requests.errors / this.metrics.requests.total * 100).toFixed(2) + '%'
                : '0%'
        };
    }

    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
        const times = this.metrics.requests.responseTimes;

        if (times.length === 0) {
            return {
                avg: 0,
                min: 0,
                max: 0,
                p50: 0,
                p95: 0,
                p99: 0
            };
        }

        const sorted = [...times].sort((a, b) => a - b);

        return {
            avg: this.metrics.requests.avgResponseTime,
            min: sorted[0],
            max: sorted[sorted.length - 1],
            p50: sorted[Math.floor(sorted.length * 0.5)],
            p95: sorted[Math.floor(sorted.length * 0.95)],
            p99: sorted[Math.floor(sorted.length * 0.99)]
        };
    }

    /**
     * Get health status
     */
    getHealthStatus() {
        const errorRate = this.metrics.requests.total > 0
            ? (this.metrics.requests.errors / this.metrics.requests.total)
            : 0;

        const avgResponseTime = this.metrics.requests.avgResponseTime;

        let status = 'healthy';
        const issues = [];

        if (errorRate > 0.05) {
            status = 'degraded';
            issues.push(`High error rate: ${(errorRate * 100).toFixed(2)}%`);
        }

        if (avgResponseTime > 1000) {
            status = 'degraded';
            issues.push(`Slow response time: ${avgResponseTime}ms`);
        }

        if (errorRate > 0.10) {
            status = 'unhealthy';
        }

        return {
            status,
            issues,
            checks: {
                errorRate: errorRate <= 0.05,
                responseTime: avgResponseTime <= 1000,
                activeUsers: this.metrics.users.active.size >= 0
            }
        };
    }

    /**
     * Reset metrics (for testing)
     */
    reset() {
        this.metrics = {
            scrapes: {
                total: 0,
                successful: 0,
                failed: 0,
                inProgress: 0
            },
            requests: {
                total: 0,
                errors: 0,
                avgResponseTime: 0,
                responseTimes: []
            },
            users: {
                active: new Set(),
                total: 0
            },
            errors: []
        };
    }

    /**
     * Generate report
     */
    generateReport() {
        return {
            summary: {
                uptime: `${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m`,
                totalScrapes: this.metrics.scrapes.total,
                successRate: this.metrics.scrapes.total > 0
                    ? `${((this.metrics.scrapes.successful / this.metrics.scrapes.total) * 100).toFixed(2)}%`
                    : '0%',
                activeUsers: this.metrics.users.active.size,
                totalRequests: this.metrics.requests.total
            },
            performance: this.getPerformanceMetrics(),
            errors: this.getErrorStats(),
            health: this.getHealthStatus()
        };
    }
}

// Singleton instance
const analytics = new AnalyticsService();

export default analytics;
