# Webhook 500 Error - Contact Form Integration

## Issue
The `/webhooks/messages` endpoint is returning a 500 Internal Server Error when we send contact form data.

## Our Implementation
✅ HMAC signature generation is working correctly  
✅ Payload format matches your examples  
✅ Secret is configured (64 characters)  
✅ Request headers are correct  

## Request Details

**Endpoint:** `POST https://source-database.onrender.com/webhooks/messages`

**Headers:**
```
Content-Type: application/json
X-Signature: 8a5d73bcfbcb1fd5b93dc5adf796df7aa6c24646af3f4d63d52d578074989648
```

**Payload:**
```json
{
  "tenant": "kraftverk",
  "email": "soffsov@gmail.com",
  "subject": "Kontaktformulär",
  "message": "Telefon: +46733221212\n\nHej jag vill boka en yoga klass privat utanför era event",
  "name": "Valentin Korpela"
}
```

**HMAC Signature:**
- Algorithm: SHA256
- Format: Hex
- Length: 64 characters (correct for SHA256)
- Calculated on: The exact JSON stringified payload

## Response
```
Status: 500 Internal Server Error
Body: { "success": false, "message": "Serverfel. Försök igen senare." }
```

## What We've Verified

1. ✅ **Secret is configured** - `WEBHOOK_SECRET_MESSAGES` is set in Render (64 chars)
2. ✅ **HMAC generation** - Using Node.js crypto.createHmac('sha256', secret)
3. ✅ **Payload format** - Matches your documentation
4. ✅ **Headers** - Content-Type and X-Signature included
5. ✅ **Signature calculation** - Based on exact JSON string of payload

## Questions

1. Is the webhook endpoint `/webhooks/messages` fully deployed and working?
2. Can you verify the secret value matches what we're using?
3. Are there any additional headers or payload format requirements?
4. Can you check your server logs for what's causing the 500 error?

## Next Steps

Please check your webhook endpoint logs to see what's causing the 500 error. Our implementation appears to be correct based on your documentation, so this seems like a server-side issue.

Thank you!

