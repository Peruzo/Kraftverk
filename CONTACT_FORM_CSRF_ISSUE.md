# Contact Form CSRF Token Issue - URGENT

## Problem
The `/api/messages` endpoint requires CSRF tokens **even for server-to-server requests**. This is preventing the contact form from working.

**Error:** `403 Forbidden - Ogiltig eller saknad CSRF-token`

## Current Implementation
- ✅ Contact form is implemented and working on frontend
- ✅ Server-side API route `/api/contact` is created
- ❌ Customer portal `/api/messages` endpoint rejects server-to-server requests due to CSRF requirement

## Technical Details
- **Our endpoint:** `POST /api/contact` (Next.js server-side route)
- **Target endpoint:** `POST https://source-database.onrender.com/api/messages`
- **Headers sent:** `Content-Type: application/json`, `X-Tenant: kraftverk`
- **Payload:** `{ tenant: "kraftverk", email, name, phone, subject, message }`

## Why CSRF is a Problem
CSRF (Cross-Site Request Forgery) protection is designed for **browser requests**, not server-to-server API calls. Server-to-server requests don't have:
- Browser cookies
- Session tokens
- CSRF tokens from meta tags

## Solution Options Needed from Customer Portal Team

### **Option A: Webhook Endpoint (RECOMMENDED)**
Create a webhook-style endpoint similar to `/webhooks/kraftverk-customer-data`:
```
POST https://source-database.onrender.com/webhooks/kraftverk-messages
```
This would:
- ✅ Not require CSRF tokens
- ✅ Accept server-to-server requests
- ✅ Work consistently with other webhook endpoints
- ✅ Match the pattern already established

### **Option B: API Key Authentication**
Provide an API key we can use in headers:
```
X-API-Key: [api-key-for-kraftverk]
```

### **Option C: CSRF Token Endpoint**
Provide an endpoint to get CSRF tokens for server-side requests:
```
GET https://source-database.onrender.com/api/csrf-token
Response: { csrfToken: "..." }
```

## Impact
- **Current status:** Contact form is non-functional
- **User experience:** Users see error message and cannot contact us through the website
- **Workaround:** Users must contact us directly via email/phone

## Request
Please provide **Option A (webhook endpoint)** as it's the cleanest solution and matches your existing webhook architecture.

