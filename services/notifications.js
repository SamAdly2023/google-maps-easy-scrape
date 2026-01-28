/**
 * Real-Time Notification Service
 * WebSocket-based real-time updates for dashboards and admins
 */

const WebSocket = require('ws');

class NotificationService {
    constructor() {
        this.wss = null;
        this.clients = new Set();
        this.subscriptions = new Map(); // userId -> Set of subscriptions
    }

    /**
     * Initialize WebSocket server
     */
    initialize(server) {
        this.wss = new WebSocket.Server({ server });

        this.wss.on('connection', (ws) => {
            console.log('[WS] New client connected');
            this.clients.add(ws);

            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message);
                    this.handleMessage(ws, data);
                } catch (error) {
                    console.error('[WS] Failed to parse message:', error);
                }
            });

            ws.on('close', () => {
                console.log('[WS] Client disconnected');
                this.clients.delete(ws);

                // Clean up subscriptions
                for (const [userId, clients] of this.subscriptions) {
                    clients.delete(ws);
                    if (clients.size === 0) {
                        this.subscriptions.delete(userId);
                    }
                }
            });

            ws.on('error', (error) => {
                console.error('[WS] WebSocket error:', error);
            });
        });

        console.log('[WS] WebSocket server initialized');
    }

    /**
     * Handle incoming WebSocket messages
     */
    handleMessage(ws, data) {
        const { type, action, userId, topic } = data;

        switch (action) {
            case 'subscribe':
                this.subscribe(ws, userId, topic);
                break;

            case 'unsubscribe':
                this.unsubscribe(ws, userId, topic);
                break;

            case 'ping':
                ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
                break;

            default:
                console.warn('[WS] Unknown action:', action);
        }
    }

    /**
     * Subscribe client to topic
     */
    subscribe(ws, userId, topic) {
        const key = `${userId}:${topic}`;

        if (!this.subscriptions.has(key)) {
            this.subscriptions.set(key, new Set());
        }

        this.subscriptions.get(key).add(ws);

        // Send confirmation
        ws.send(JSON.stringify({
            type: 'subscribed',
            topic,
            message: `Subscribed to ${topic}`
        }));

        console.log(`[WS] Client subscribed to ${key}`);
    }

    /**
     * Unsubscribe client from topic
     */
    unsubscribe(ws, userId, topic) {
        const key = `${userId}:${topic}`;

        if (this.subscriptions.has(key)) {
            this.subscriptions.get(key).delete(ws);
            if (this.subscriptions.get(key).size === 0) {
                this.subscriptions.delete(key);
            }
        }

        ws.send(JSON.stringify({
            type: 'unsubscribed',
            topic,
            message: `Unsubscribed from ${topic}`
        }));

        console.log(`[WS] Client unsubscribed from ${key}`);
    }

    /**
     * Broadcast notification to specific subscribers
     */
    notifySubscribers(userId, topic, data) {
        const key = `${userId}:${topic}`;

        if (this.subscriptions.has(key)) {
            const message = JSON.stringify({
                type: 'notification',
                topic,
                timestamp: Date.now(),
                data
            });

            this.subscriptions.get(key).forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        }
    }

    /**
     * Broadcast to all admins
     */
    notifyAdmins(topic, data) {
        const message = JSON.stringify({
            type: 'admin_notification',
            topic,
            timestamp: Date.now(),
            data
        });

        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                // In a real system, check if client is admin
                client.send(message);
            }
        });
    }

    /**
     * Notify scrape event
     */
    notifyScrapeEvent(userId, event, details) {
        this.notifySubscribers(userId, 'scrapes', {
            event, // 'started', 'completed', 'failed'
            ...details,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Notify error
     */
    notifyError(userId, error, context = {}) {
        this.notifySubscribers(userId, 'errors', {
            message: error.message || error,
            type: error.type || 'UNKNOWN_ERROR',
            severity: error.severity || 'medium',
            ...context,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Notify metrics update
     */
    notifyMetricsUpdate(metrics) {
        this.notifyAdmins('metrics', metrics);
    }

    /**
     * Notify user activity
     */
    notifyUserActivity(userId, activity) {
        this.notifySubscribers(userId, 'activity', {
            type: activity.type, // 'login', 'scrape', 'export', etc
            description: activity.description,
            ...activity,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Get connection stats
     */
    getStats() {
        return {
            connectedClients: this.clients.size,
            activeSubscriptions: this.subscriptions.size,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Close all connections
     */
    closeAll() {
        this.clients.forEach(client => {
            client.close();
        });
        this.clients.clear();
        this.subscriptions.clear();
    }
}

// Export singleton
module.exports = new NotificationService();
