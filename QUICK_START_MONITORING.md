# 🚀 Quick Start: Monitoring & Real-Time Features

Get started with MapLeads AI's new enterprise-grade monitoring system in 5 minutes!

---

## ⚡ 30-Second Setup

```bash
# 1. Install new dependency
npm install ws

# 2. Start the server
npm start

# 3. Open in browser
http://localhost:5000/admin/analytics.html
http://localhost:5000/realtime-dashboard.html
```

That's it! ✅ Monitoring is now live.

---

## 📊 What You Get

### Admin Analytics Dashboard
**URL**: http://localhost:5000/admin/analytics.html

Features:
- 📈 Real-time metric charts
- 🎯 Key Performance Indicators
- ⚠️ Error tracking and analysis
- 📊 Performance distribution
- 🔴 System health status
- 📥 Recent errors feed

### Real-Time Client Dashboard
**URL**: http://localhost:5000/realtime-dashboard.html

Features:
- 🔴 Live WebSocket connection indicator
- 📬 Real-time event stream
- 📊 Event statistics
- 🎚️ Manual subscription control
- 🔔 Toast notifications

---

## 🔌 API Endpoints

### Public Endpoints (Rate Limited)
```bash
# Get current metrics
curl http://localhost:5000/api/metrics

# Check system health
curl http://localhost:5000/api/health/status

# Get performance metrics
curl http://localhost:5000/api/metrics/performance
```

### Admin Endpoints (Requires Auth)
```bash
# Get error statistics
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/metrics/errors

# Get recent errors (last 20)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/metrics/errors/recent

# Get comprehensive report
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/metrics/report
```

---

## 💻 Frontend Integration

### Use Real-Time Client
```html
<!-- Include the library -->
<script src="/js/realtime-client.js"></script>

<script>
  // Initialize
  const rtc = new RealtimeClient('user-id-123');

  // Subscribe to scrape events
  rtc.subscribe('scrapes');

  // Listen for events
  rtc.on('scrapes', (data) => {
    console.log('Scrape event:', data);
    // Update UI here
  });

  // Handle connection events
  rtc.on('connected', () => {
    console.log('✅ Connected to server');
  });

  rtc.on('disconnected', () => {
    console.log('❌ Disconnected');
  });
</script>
```

### Event Types
```javascript
// Scrape events
rtc.on('scrapes', (data) => {
  // data: { event: 'started|completed|failed', resultCount, query, ... }
});

// Error events
rtc.on('errors', (data) => {
  // data: { message, type: 'AUTH_ERROR|NETWORK_ERROR|...', severity, ... }
});

// Activity events
rtc.on('activity', (data) => {
  // data: { type: 'login|scrape|export|...', description, ... }
});

// Raw notifications
rtc.on('notification', (data) => {
  // Any type of notification
});
```

---

## 📊 Backend Integration

### Track Scrapes
```javascript
const analytics = require('./services/analytics');

// When scrape starts
analytics.trackScrape('started', userId);

// When scrape completes
analytics.trackScrape('success', userId, results.length);

// When scrape fails
analytics.trackScrape('failed', userId);
```

### Log Errors
```javascript
const analytics = require('./services/analytics');

analytics.logError(error, {
  userId: 'user123',
  endpoint: '/api/client/scrape',
  query: 'restaurants in NYC'
});
```

### Send Notifications
```javascript
const notifications = require('./services/notifications');

// Notify specific user
notifications.notifyScrapeEvent(userId, 'completed', {
  query: 'restaurants in NYC',
  resultCount: 150
});

// Notify all admins
notifications.notifyAdmins('metrics', metrics);
```

### Get Metrics
```javascript
const analytics = require('./services/analytics');

// Current snapshot
const metrics = analytics.getMetrics();

// Error statistics
const errorStats = analytics.getErrorStats();

// Performance data
const perf = analytics.getPerformanceMetrics();

// Health status
const health = analytics.getHealthStatus();

// Full report
const report = analytics.generateReport();
```

---

## 🔍 Viewing Logs

### Real-Time Console Output
The server logs to console with color-coded severity:
```
✅ INFO: Request to /api/metrics
⚠️ WARN: High error rate detected
❌ ERROR: Failed to fetch from Firebase
```

### Log Files
- **error.log**: Errors only (JSON format)
- **combined.log**: All logs (JSON format)

```bash
# Watch logs in real-time
tail -f error.log
tail -f combined.log

# Search logs
grep "ERROR" error.log
grep "user123" combined.log
```

---

## 🚨 Error Categories

The system automatically categorizes errors:

| Type | Examples | Severity |
|------|----------|----------|
| AUTH_ERROR | Token expired, Invalid credentials | High |
| NETWORK_ERROR | Connection refused, Timeout | High |
| VALIDATION_ERROR | Invalid JSON, Missing fields | Medium |
| RATE_LIMIT_ERROR | Quota exceeded | Medium |
| PARSE_ERROR | JSON parsing failed | Medium |
| UNKNOWN_ERROR | Other errors | Low |

---

## 💚 Health Status

System automatically determines health:

```
🟢 Healthy
  - Error rate < 5%
  - Response time < 1000ms
  - System operational

🟡 Degraded
  - Error rate 5-10%
  - Response time > 1000ms
  - Performance issues

🔴 Unhealthy
  - Error rate > 10%
  - Service unavailable
  - Immediate action needed
```

Check status at: `http://localhost:5000/api/health/status`

---

## 🧪 Testing

### Test Metrics Endpoint
```bash
# Get metrics
curl http://localhost:5000/api/metrics | jq '.'

# Get health
curl http://localhost:5000/api/health/status | jq '.'

# Expected response
{
  "scrapes": {
    "total": 0,
    "successful": 0,
    "failed": 0,
    "inProgress": 0
  },
  "requests": {
    "total": 0,
    "errors": 0,
    "avgResponseTime": 0
  },
  "users": {
    "active": 0
  }
}
```

### Test WebSocket Connection
```javascript
// Open DevTools Console and run:
const rtc = new RealtimeClient('test-user');

// Should see in console:
// ✅ Connected to server
// [WS] Subscribed to scrapes
```

### Simulate Scrape Event
```javascript
// From another terminal/script:
const analytics = require('./services/analytics');
analytics.trackScrape('success', 'test-user', 50);

// Dashboard should update automatically
```

---

## 📈 Metrics Reference

### What Gets Tracked

**Scrapes Metrics**:
- Total scrapes performed
- Successful completions
- Failed scrapes
- Currently in-progress

**Request Metrics**:
- Total API requests
- Error count
- Average response time
- Response time percentiles (p50, p95, p99)

**User Metrics**:
- Currently active users
- Active subscriptions
- User activity tracking

**Error Metrics**:
- Total errors
- Errors by type (AUTH, NETWORK, VALIDATION, etc)
- Errors by severity (critical, high, medium, low)
- Error rate percentage

---

## 🔑 Key Performance Indicators

Monitor these to ensure system health:

| KPI | Ideal | Warning | Critical |
|-----|-------|---------|----------|
| Error Rate | < 0.5% | 0.5-2% | > 2% |
| Avg Response | < 100ms | 100-500ms | > 500ms |
| P95 Response | < 300ms | 300-1000ms | > 1000ms |
| Active Users | Trending up | Stable | Declining |
| Uptime | 99.9% | 99% | < 99% |

---

## 🆘 Troubleshooting

### WebSocket Not Connecting
```javascript
// Check in browser console:
new RealtimeClient('user').rtc.isConnected()

// If false, check:
// 1. Server is running: npm start
// 2. Correct URL: ws://localhost:5000
// 3. No firewall blocking WebSocket
// 4. Check browser console for errors
```

### No Metrics Data
```bash
# Ensure analytics is initialized:
curl http://localhost:5000/api/metrics

# If empty, make a test request:
curl http://localhost:5000/api/auth/verify

# Then check metrics again
```

### High Error Rate
```bash
# Check error details:
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/metrics/errors/recent

# Check logs:
grep "ERROR" error.log | tail -20
```

### Dashboard Not Loading
```bash
# Check that Express is serving the file:
curl http://localhost:5000/admin/analytics.html

# If 404, ensure file exists:
ls public/admin/analytics.html

# Check console for JavaScript errors
# Press F12 in browser, go to Console tab
```

---

## 🚀 Next Steps

1. **Monitor**: Open dashboards and watch real-time updates
2. **Integrate**: Add real-time features to your UI
3. **Configure**: Set up alerts for important events
4. **Optimize**: Use metrics to identify bottlenecks
5. **Scale**: Deploy to production with monitoring

---

## 📚 Full Documentation

For detailed information, see:
- `MONITORING_GUIDE.md` - Complete monitoring reference
- `PHASE_4_COMPLETE.md` - What's new in Phase 4
- `ENHANCEMENT_PLAN.md` - Future roadmap

---

## 🎯 Common Tasks

### Add Real-Time Scrape Tracking
```javascript
// In your scrape endpoint
const analytics = require('./services/analytics');
const notifications = require('./services/notifications');

app.post('/api/client/scrape', async (req, res) => {
  const { userId, query } = req.body;
  
  // Track start
  analytics.trackScrape('started', userId);
  
  try {
    const results = await performScrape(query);
    
    // Track success
    analytics.trackScrape('success', userId, results.length);
    
    // Notify user
    notifications.notifyScrapeEvent(userId, 'completed', {
      query,
      resultCount: results.length
    });
    
    res.json({ success: true, results });
  } catch (error) {
    // Track failure
    analytics.trackScrape('failed', userId);
    
    // Notify user
    notifications.notifyError(userId, error, { query });
    
    res.status(500).json({ error: error.message });
  }
});
```

### Display Real-Time Metrics in Dashboard
```javascript
// In your dashboard HTML
<script src="/js/realtime-client.js"></script>
<script>
  const rtc = new RealtimeClient(userId);
  
  // Fetch metrics
  async function updateMetrics() {
    const response = await fetch('/api/metrics');
    const data = await response.json();
    
    // Update UI
    document.getElementById('totalScrapes').textContent = data.scrapes.total;
    document.getElementById('activeUsers').textContent = data.users.active;
    document.getElementById('avgResponse').textContent = data.requests.avgResponseTime + 'ms';
  }
  
  // Initial load
  updateMetrics();
  
  // Refresh every 10 seconds
  setInterval(updateMetrics, 10000);
</script>
```

---

## 💡 Pro Tips

1. **Check Health First**: Always check `/api/health/status` to see system state
2. **Use Browser DevTools**: Open console (F12) to see WebSocket connection logs
3. **Real-time is Live**: Dashboards update in real-time, no page refresh needed
4. **Errors are Categorized**: Check error type to troubleshoot issues faster
5. **Performance Matters**: Track p95 and p99 to catch slow requests

---

## ✅ Quick Checklist

- [ ] `npm install ws` completed
- [ ] Server started with `npm start`
- [ ] Admin Analytics Dashboard accessible
- [ ] Real-Time Client Dashboard shows connection
- [ ] WebSocket events appearing in real-time
- [ ] Metrics endpoint returns data
- [ ] Health check shows system status
- [ ] Error logs are being written
- [ ] No errors in browser console

---

## 🎉 You're All Set!

Your monitoring system is now live:

✅ Real-time analytics  
✅ Live dashboards  
✅ WebSocket streaming  
✅ Error tracking  
✅ Health monitoring  
✅ Performance metrics  

Start monitoring your MapLeads AI deployment! 🚀

---

**Need help?** Check the error logs or console for detailed error messages.  
**Questions?** See the full documentation files for comprehensive reference.

