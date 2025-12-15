# NotiBoost JavaScript SDK (Browser)

Official browser JavaScript/TypeScript SDK for NotiBoost - Notification Orchestration Platform.

## Installation

### npm

```bash
npm install @notiboost/browser-sdk
```

### CDN

```html
<script src="https://unpkg.com/@notiboost/browser-sdk@latest/dist/browser.js"></script>
```

### ES Modules

```javascript
import { NotiBoost } from '@notiboost/browser-sdk';
```

## Requirements

- Modern browser with Fetch API support
- Or Node.js 18+ with fetch support

## Quick Start

```javascript
import { NotiBoost } from '@notiboost/browser-sdk';

const client = new NotiBoost({
  apiKey: 'YOUR_API_KEY'
});

// Send an event
const result = await client.events.ingest({
  event_name: 'order_created',
  event_id: 'evt_001',
  occurred_at: new Date().toISOString(),
  user_id: 'u_123',
  properties: {
    order_id: 'A001',
    amount: 350000
  }
});

console.log('Trace ID:', result.trace_id);
```

## Browser Usage

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://unpkg.com/@notiboost/browser-sdk@latest/dist/browser.js"></script>
</head>
<body>
    <script>
        const client = new NotiBoost({
            apiKey: 'YOUR_API_KEY'
        });

        client.events.ingest({
            event_name: 'page_viewed',
            event_id: 'evt_' + Date.now(),
            occurred_at: new Date().toISOString(),
            user_id: 'u_123',
            properties: {
                page: window.location.pathname
            }
        }).then(result => {
            console.log('Event sent:', result.trace_id);
        });
    </script>
</body>
</html>
```

## API Reference

### Constructor

```javascript
new NotiBoost(options)
```

**Options:**
- `apiKey` (string, required) - Your NotiBoost API key
- `baseURL` (string, optional) - Custom API base URL (default: `https://api.notiboost.com`)
- `timeout` (number, optional) - Request timeout in milliseconds (default: `30000`)
- `retries` (number, optional) - Number of retry attempts (default: `3`)

### Events

#### `events.ingest(event)`

Ingest a single event.

```javascript
const result = await client.events.ingest({
  event_name: 'order_created',
  event_id: 'evt_001',
  occurred_at: new Date().toISOString(),
  user_id: 'u_123',
  properties: {
    order_id: 'A001',
    amount: 350000
  }
});
```

**Returns:**
```javascript
{
  success: true,
  trace_id: 'trc_abc123',
  event_id: 'evt_001',
  message: 'Event ingested successfully'
}
```

#### `events.ingestBatch(events)`

Ingest multiple events in a single request.

```javascript
const result = await client.events.ingestBatch([
  {
    event_name: 'order_created',
    event_id: 'evt_001',
    user_id: 'u_123',
    properties: { order_id: 'A001' }
  },
  {
    event_name: 'payment_success',
    event_id: 'evt_002',
    user_id: 'u_123',
    properties: { order_id: 'A001' }
  }
]);
```

### Users

#### `users.create(user)`

Create a new user.

```javascript
await client.users.create({
  user_id: 'u_123',
  name: 'Nguyễn Văn A',
  email: 'user@example.com',
  phone: '+84901234567',
  properties: {
    segment: 'vip',
    preferred_channel: 'zns'
  }
});
```

#### `users.get(userId)`

Get user by ID.

```javascript
const user = await client.users.get('u_123');
```

#### `users.update(userId, data)`

Update user.

```javascript
await client.users.update('u_123', {
  name: 'Nguyễn Văn B'
});
```

#### `users.setChannelData(userId, channelData)`

Set channel data for user.

```javascript
await client.users.setChannelData('u_123', {
  email: 'user@example.com',
  phone: '+84901234567',
  push_token: 'fcm_token_abc123',
  push_platform: 'android',
  zns_oa_id: '123456789'
});
```

#### `users.setPreferences(userId, preferences)`

Set user notification preferences.

```javascript
await client.users.setPreferences('u_123', {
  channels: {
    zns: { enabled: true },
    email: { enabled: true },
    sms: { enabled: true },
    push: { enabled: true }
  },
  categories: {
    order: { enabled: true },
    marketing: { enabled: false }
  }
});
```

## Error Handling

```javascript
try {
  await client.events.ingest(event);
} catch (error) {
  if (error.statusCode === 429) {
    // Rate limit exceeded
    console.log('Rate limit exceeded, retrying...');
  } else if (error.statusCode === 401) {
    // Invalid API key
    console.error('Invalid API key');
  } else {
    console.error('Error:', error.message);
  }
}
```

## Idempotency

Use `Idempotency-Key` header for idempotent requests:

```javascript
await client.events.ingest(event, {
  headers: {
    'Idempotency-Key': 'unique-key-12345'
  }
});
```

## TypeScript Support

Full TypeScript definitions are included:

```typescript
import { NotiBoost, Event, User, NotiBoostError } from '@notiboost/browser-sdk';

const client = new NotiBoost({
  apiKey: 'YOUR_API_KEY'
});

const event: Event = {
  event_name: 'order_created',
  event_id: 'evt_001',
  occurred_at: new Date().toISOString(),
  user_id: 'u_123',
  properties: {
    order_id: 'A001',
    amount: 350000
  }
};

try {
  const result = await client.events.ingest(event);
  console.log(result.trace_id);
} catch (error) {
  if (error instanceof NotiBoostError) {
    console.error('NotiBoost error:', error.statusCode, error.message);
  }
}
```

## Best Practices

1. **Never expose API keys in frontend code** - Use a backend proxy
2. Use environment variables for configuration
3. Handle errors gracefully
4. Use idempotency keys for critical operations
5. Consider rate limiting on the client side

## Security Note

⚠️ **Important**: For production applications, never use your main API key directly in browser code. Instead:

1. Create a separate API key with limited permissions
2. Use a backend proxy to forward requests
3. Implement CORS properly
4. Use environment variables for configuration

