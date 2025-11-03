# Debug Logging Implementation for Render Logs

## ✅ Complete Debug Logging Added

Comprehensive server-side logging has been added to all customer portal endpoints to ensure visibility in Render logs.

## 📊 Logging Coverage

### 1. **Analytics API Route** (`/api/analytics`)
- ✅ Unique request ID for each request (`req_timestamp_random`)
- ✅ Logs incoming request structure
- ✅ Logs event type, tenant, sessionId, device, consent
- ✅ Logs full event payload (truncated to 1000 chars)
- ✅ Logs customer portal response (status, headers, body)
- ✅ Logs success/failure with full error details

**Log Format:**
```
📊 [ANALYTICS req_1234567890_abc123] Received analytics request
📊 [ANALYTICS req_1234567890_abc123] Request body: {...}
📤 [ANALYTICS req_1234567890_abc123] Sending to customer portal: {...}
📤 [ANALYTICS req_1234567890_abc123] Full event payload (truncated): {...}
📥 [ANALYTICS req_1234567890_abc123] Customer portal response: {...}
✅ [ANALYTICS req_1234567890_abc123] Successfully sent analytics event
```

### 2. **Contact Form API Route** (`/api/contact`)
- ✅ Unique request ID for each request (`contact_timestamp_random`)
- ✅ Logs form data (name, email, phone, message length)
- ✅ Logs HMAC signature generation
- ✅ Logs full payload being sent
- ✅ Logs customer portal response
- ✅ Logs success/failure with error details

**Log Format:**
```
📧 [CONTACT contact_1234567890_abc123] Received contact form submission
📧 [CONTACT contact_1234567890_abc123] Form data: {...}
📤 [CONTACT contact_1234567890_abc123] Sending contact form message to webhook endpoint...
📋 [CONTACT contact_1234567890_abc123] Payload being sent: {...}
🔐 [CONTACT contact_1234567890_abc123] HMAC signature generated: ...
📥 [CONTACT contact_1234567890_abc123] Customer portal response: {...}
✅ [CONTACT contact_1234567890_abc123] Contact form message sent successfully
```

### 3. **Stripe Payments Webhook** (`/webhooks/stripe-payments`)
- ✅ Unique request ID for each payment (`payment_timestamp_random`)
- ✅ Logs customer data being sent (email, name, amount in öre and SEK)
- ✅ Logs full customer data payload
- ✅ Logs customer portal response for both customer data and payment webhook
- ✅ Logs success/failure with full error details

**Log Format:**
```
📤 [PAYMENT payment_1234567890_abc123] Sending customer data to portal: {...}
📤 [PAYMENT payment_1234567890_abc123] Full customer data payload: {...}
📥 [PAYMENT payment_1234567890_abc123] Customer portal response: {...}
✅ [PAYMENT payment_1234567890_abc123] Customer data sent to portal successfully
📤 [PAYMENT payment_1234567890_abc123] Sending payment webhook payload: {...}
📥 [PAYMENT payment_1234567890_abc123] Payment webhook response: {...}
✅ [PAYMENT payment_1234567890_abc123] Payment data sent to customer portal webhook successfully
```

## 🔍 What Gets Logged

### Analytics Events
- **Incoming Data:**
  - Event type or full event object
  - Properties structure
  - Event keys (for full events)
- **Outgoing Data:**
  - Event type (`event_type`)
  - Tenant ID
  - Session ID
  - Device type
  - Consent status
  - URL
  - Properties keys
  - Full payload (truncated to 1000 chars)
- **Response:**
  - HTTP status
  - Response headers
  - Response body (truncated to 500 chars)
  - Parsed result

### Contact Form
- **Incoming Data:**
  - Form fields presence (name, email, phone, message)
  - Email domain
  - Message length
- **Outgoing Data:**
  - Full payload JSON
  - HMAC signature (first 20 chars + full)
  - Secret configuration status
  - Request details (URL, method, headers, body length)
- **Response:**
  - HTTP status
  - Response headers
  - Response body (truncated to 500 chars)
  - Parsed result

### Payment Data
- **Customer Data:**
  - Customer email, name
  - Amount (in öre and SEK)
  - Product type, name
  - Price ID, product ID
  - Quantity, inventory action
  - Session ID, payment intent ID
  - Full payload JSON
- **Payment Webhook:**
  - Same as customer data
  - Already converted to SEK
- **Response:**
  - HTTP status for both requests
  - Response bodies (truncated to 500 chars)
  - Parsed results

## 📋 Request ID Format

Each request gets a unique ID for easy tracking:
- Analytics: `req_${timestamp}_${random}`
- Contact: `contact_${timestamp}_${random}`
- Payment: `payment_${timestamp}_${random}`

This allows you to trace a single request through all logs.

## 🔎 Example Log Output

### Analytics Request
```
📊 [ANALYTICS req_1737984123456_a7k3m2] Received analytics request
📊 [ANALYTICS req_1737984123456_a7k3m2] Request body: {
  hasEventType: false,
  hasEvent: true,
  eventType: null,
  eventKeys: ['event_type', 'url', 'title', 'referrer', 'userAgent', 'timestamp', 'sessionId', 'device', 'tenant', 'consent', 'properties']
}
📊 [ANALYTICS req_1737984123456_a7k3m2] Using full event object
📤 [ANALYTICS req_1737984123456_a7k3m2] Sending to customer portal: {
  endpoint: 'https://source-database.onrender.com/api/ingest/analytics',
  event_type: 'page_view',
  tenant: 'kraftverk',
  sessionId: 'sess_1737984123456_abc123',
  device: 'desktop',
  consent: true,
  url: '/',
  hasProperties: true,
  propertiesKeys: ['duration', 'page', 'responseTime', 'loadTime', 'statusCode']
}
📥 [ANALYTICS req_1737984123456_a7k3m2] Customer portal response: {
  status: 200,
  statusText: 'OK',
  ok: true,
  responseBody: '{"success":true}',
  parsedResult: { success: true }
}
✅ [ANALYTICS req_1737984123456_a7k3m2] Successfully sent analytics event to customer portal
```

### Contact Form
```
📧 [CONTACT contact_1737984123456_b8n4p3] Received contact form submission
📧 [CONTACT contact_1737984123456_b8n4p3] Form data: {
  hasName: true,
  hasEmail: true,
  hasPhone: true,
  hasMessage: true,
  emailDomain: 'example.com',
  messageLength: 150
}
📤 [CONTACT contact_1737984123456_b8n4p3] Sending contact form message to webhook endpoint...
📋 [CONTACT contact_1737984123456_b8n4p3] Payload being sent: {
  "tenant": "kraftverk",
  "email": "user@example.com",
  "name": "John Doe",
  "subject": "Kontaktformulär",
  "message": "Telefon: +46123456789\n\nHello world..."
}
🔐 [CONTACT contact_1737984123456_b8n4p3] HMAC signature generated (first 20 chars): a1b2c3d4e5f6g7h8i9j0...
📥 [CONTACT contact_1737984123456_b8n4p3] Customer portal response: {
  status: 200,
  statusText: 'OK',
  ok: true,
  responseBody: '{"success":true,"id":"msg_123"}',
  parsedResult: { success: true, id: 'msg_123' }
}
✅ [CONTACT contact_1737984123456_b8n4p3] Contact form message sent successfully: msg_123
```

### Payment Data
```
📤 [PAYMENT payment_1737984123456_c9o5q4] Sending customer data to portal: {
  customerEmail: 'user@example.com',
  customerName: 'John Doe',
  amount: 39900,
  amountSEK: 399,
  currency: 'SEK',
  productType: 'base_membership',
  productName: 'Base Membership',
  priceId: 'price_1SKhYSP6vvUUervCTpvpt0QO',
  productId: 'base-membership',
  quantity: 1,
  inventoryAction: 'purchase',
  sessionId: 'cs_test_abc123',
  paymentIntentId: 'pi_test_xyz789'
}
📥 [PAYMENT payment_1737984123456_c9o5q4] Customer portal response: {
  status: 200,
  statusText: 'OK',
  ok: true,
  responseBody: '{"success":true}',
  parsedResult: { success: true }
}
✅ [PAYMENT payment_1737984123456_c9o5q4] Customer data sent to portal successfully
```

## 🎯 Benefits

1. **Full Visibility**: See exactly what data is being sent to customer portal
2. **Request Tracking**: Unique IDs allow tracing requests through logs
3. **Error Debugging**: Complete error context with request/response details
4. **Data Verification**: Verify correct format (amounts in öre vs SEK, tenant included, etc.)
5. **Performance Monitoring**: See response times and status codes

## 🔧 Truncation Limits

To prevent log overflow:
- Full payloads: Truncated to 1000 chars for analytics, full JSON for others
- Response bodies: Truncated to 500 chars
- HMAC signatures: First 20 chars shown in truncated view, full in separate log

## 📝 Notes

- All logs use emoji prefixes for easy visual scanning (📊 📧 📤 📥 ✅ ❌)
- Request IDs make it easy to grep for a specific request
- Sensitive data (HMAC secrets) are not logged, only their presence and length
- Response bodies are truncated to prevent log bloat while keeping useful info

