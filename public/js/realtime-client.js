/**
 * Real-Time Client - WebSocket integration for frontend
 * Usage: const rtc = new RealtimeClient(userId);
 */

class RealtimeClient {
    constructor(userId, options = {}) {
        this.userId = userId;
        this.url = options.url || `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`;
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
        this.reconnectDelay = options.reconnectDelay || 3000;
        this.listeners = new Map();
        this.connected = false;

        this.connect();
    }

    /**
     * Connect to WebSocket server
     */
    connect() {
        try {
            this.ws = new WebSocket(this.url);

            this.ws.onopen = () => {
                console.log('[RT] Connected to server');
                this.connected = true;
                this.reconnectAttempts = 0;
                this.emit('connected');
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('[RT] Failed to parse message:', error);
                }
            };

            this.ws.onerror = (error) => {
                console.error('[RT] WebSocket error:', error);
                this.emit('error', error);
            };

            this.ws.onclose = () => {
                console.log('[RT] Disconnected from server');
                this.connected = false;
                this.emit('disconnected');
                this.attemptReconnect();
            };
        } catch (error) {
            console.error('[RT] Failed to create WebSocket:', error);
            this.attemptReconnect();
        }
    }

    /**
     * Handle incoming messages
     */
    handleMessage(data) {
        const { type, topic, action } = data;

        // Route to specific listeners
        this.emit(type, data);

        if (topic) {
            this.emit(`${topic}:${type}`, data);
            this.emit(topic, data);
        }

        if (action) {
            this.emit(action, data);
        }
    }

    /**
     * Attempt to reconnect
     */
    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`[RT] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

            setTimeout(() => this.connect(), this.reconnectDelay);
        } else {
            console.error('[RT] Max reconnection attempts reached');
            this.emit('reconnection_failed');
        }
    }

    /**
     * Subscribe to topic
     */
    subscribe(topic) {
        if (!this.connected) {
            console.warn('[RT] Not connected, unable to subscribe');
            return;
        }

        this.send({
            action: 'subscribe',
            userId: this.userId,
            topic
        });

        console.log(`[RT] Subscribed to ${topic}`);
    }

    /**
     * Unsubscribe from topic
     */
    unsubscribe(topic) {
        if (!this.connected) {
            console.warn('[RT] Not connected, unable to unsubscribe');
            return;
        }

        this.send({
            action: 'unsubscribe',
            userId: this.userId,
            topic
        });

        console.log(`[RT] Unsubscribed from ${topic}`);
    }

    /**
     * Send message to server
     */
    send(data) {
        if (!this.connected) {
            console.warn('[RT] Not connected, unable to send');
            return;
        }

        try {
            this.ws.send(JSON.stringify(data));
        } catch (error) {
            console.error('[RT] Failed to send message:', error);
        }
    }

    /**
     * Listen for events
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);

        // Return unsubscribe function
        return () => this.off(event, callback);
    }

    /**
     * Remove event listener
     */
    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * Emit event to listeners
     */
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`[RT] Error in listener for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Close connection
     */
    close() {
        this.maxReconnectAttempts = 0; // Prevent reconnection
        if (this.ws) {
            this.ws.close();
        }
    }

    /**
     * Check connection status
     */
    isConnected() {
        return this.connected;
    }
}

// Export for use in browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RealtimeClient;
}
