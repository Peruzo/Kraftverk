# Contact Customer Portal Team - Webhook 500 Error

---

**Subject: URGENT - /webhooks/messages Returning 500 Error**

Hi Customer Portal Team,

We've implemented the contact form webhook integration following your instructions, but we're receiving a 500 Internal Server Error from your `/webhooks/messages` endpoint.

## **Our Implementation Status:**

✅ Contact form is fully implemented  
✅ HMAC SHA256 signature generation working  
✅ Payload format matches your documentation  
✅ `WEBHOOK_SECRET_MESSAGES` environment variable is set (64 characters)  
✅ Request headers include `Content-Type` and `X-Signature`  
❌ **Receiving 500 error from your endpoint**

## **Exact Request Being Sent:**

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

**HMAC Signature Calculation:**
```javascript
const payloadString = JSON.stringify(payload);
const signature = crypto
  .createHmac("sha256", webhookSecret)
  .update(payloadString, "utf8")
  .digest("hex");
```

- Algorithm: SHA256
- Input: Exact JSON stringified payload (221 bytes)
- Output: Hex format (64 characters)
- Secret: Configured from `WEBHOOK_SECRET_MESSAGES` env var

## **Response from Your Server:**

```json
{
  "success": false,
  "message": "Serverfel. Försök igen senare."
}
```

**HTTP Status:** 500 Internal Server Error

## **What We've Verified:**

1. ✅ Secret is correctly configured (64 characters, matches your specification)
2. ✅ HMAC signature is being generated correctly (SHA256, hex format)
3. ✅ Payload format matches your documentation
4. ✅ Required fields included: `tenant`, `email`, `message`
5. ✅ Optional fields: `name` included when provided
6. ✅ Headers are correct: `Content-Type` and `X-Signature`

## **Possible Issues:**

1. **Secret Mismatch:** The secret value in our Render environment might not match what you have configured
2. **Signature Validation Bug:** Your server might be validating the signature incorrectly
3. **Payload Format:** There might be a subtle difference in payload format we're not seeing
4. **Server Error:** The webhook endpoint might have a bug or configuration issue

## **Questions:**

1. Can you verify the `WEBHOOK_SECRET_MESSAGES` value we're using matches your configuration?
2. Can you check your server logs for the `/webhooks/messages` endpoint to see what's causing the 500 error?
3. Is the endpoint fully deployed and operational?
4. Are there any additional requirements or headers we're missing?

## **What We Need:**

Please check your webhook endpoint logs and let us know:
- What error is occurring on your server
- If the HMAC signature is being validated correctly
- If there are any server-side issues preventing message processing

## **Our Code (for reference):**

```typescript
// Generate HMAC signature
const payloadString = JSON.stringify(payload);
const signature = crypto
  .createHmac("sha256", webhookSecret)
  .update(payloadString, "utf8")
  .digest("hex");

// Send request
const response = await fetch(
  "https://source-database.onrender.com/webhooks/messages",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Signature": signature,
    },
    body: payloadString,
  }
);
```

Our implementation appears to be correct based on your documentation. The 500 error suggests a server-side issue on your end.

Please investigate and let us know what's causing the error so we can resolve this quickly.

Thank you!

Best regards,  
Kraftverk Development Team

