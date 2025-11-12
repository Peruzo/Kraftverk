# Message to Customer Portal Team - Contact Form CSRF Issue

---

**Subject: URGENT - Contact Form Integration Blocked by CSRF Token Requirement**

Hi Customer Portal Team,

We've implemented the contact form integration following your instructions, but we're encountering a critical issue that's preventing messages from being sent.

## **The Problem:**

The `/api/messages` endpoint is rejecting our server-to-server requests with:
```
403 Forbidden - Ogiltig eller saknad CSRF-token
```

**Issue:** The endpoint requires CSRF tokens even for **server-to-server requests** from our Next.js API route. CSRF protection is designed for browser requests, not server-to-server API calls.

## **Our Implementation:**

1. ✅ Contact form is implemented on `/om-oss` page
2. ✅ Client sends to our server-side API route: `POST /api/contact`
3. ✅ Our server route forwards to: `POST https://source-database.onrender.com/api/messages`
4. ❌ **Fails with CSRF error**

**Headers we're sending:**
- `Content-Type: application/json`
- `X-Tenant: kraftverk`

**Payload format:**
```json
{
  "tenant": "kraftverk",
  "name": "Customer Name",
  "email": "customer@example.com",
  "phone": "+46 70 123 45 67",
  "subject": "Kontaktformulär",
  "message": "Customer message..."
}
```

## **Why This Doesn't Work:**

Server-to-server requests don't have:
- Browser cookies
- Session tokens  
- CSRF tokens from meta tags

## **Requested Solution (Option A - Recommended):**

Please create a **webhook-style endpoint** for messages, similar to your existing webhook endpoints:

```
POST https://source-database.onrender.com/webhooks/kraftverk-messages
```

This would:
- ✅ Not require CSRF tokens (like `/webhooks/kraftverk-customer-data`)
- ✅ Accept server-to-server requests
- ✅ Match your existing webhook architecture
- ✅ Work consistently with other integrations

**Same payload format**, just different endpoint.

## **Alternative Solutions:**

If a webhook endpoint isn't possible, please provide:
- **Option B:** API key authentication for server-to-server requests
- **Option C:** An endpoint to get CSRF tokens for server-side use

## **Impact:**

- Contact form is currently **non-functional**
- Users cannot submit messages through the website
- We need this resolved urgently to restore functionality

## **Next Steps:**

Please confirm:
1. Can you create `/webhooks/kraftverk-messages` endpoint?
2. Or provide the preferred authentication method for server-to-server requests?

Thank you for your help!

Best regards,
Kraftverk Development Team

---

