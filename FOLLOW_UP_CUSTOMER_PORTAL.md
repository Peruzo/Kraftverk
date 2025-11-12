# Follow-Up Message to Customer Portal Team - Still Getting 500 Error

---

**Subject: Re: 500 Error Still Occurring - Please Check Your Server Logs**

Hi Customer Portal Team,

We've tested the contact form again after your error handling improvements, but we're still receiving a 500 Internal Server Error from `/webhooks/messages`.

## **Current Status:**

- ✅ Your enhanced error handling has been deployed
- ✅ We're still sending requests correctly (HMAC signature, payload format)
- ❌ Still receiving 500 errors with "Serverfel. Försök igen senare."

## **Our Latest Test:**

We submitted the contact form and received the same 500 error. Here are the request details:

**Request:**
- Endpoint: `POST https://source-database.onrender.com/webhooks/messages`
- HMAC Signature: `71a2a69e9b388441571b56c7327ca8a9f06e18b66f1f1eb3a589f7039caae842`
- Payload length: 179 bytes

**Response:**
```json
{
  "success": false,
  "message": "Serverfel. Försök igen senare."
}
```

## **What We Need from You:**

Since you mentioned enhanced logging, could you please check **your Render server logs** for requests to `/webhooks/messages`? The logs should now show:

- `📨 Webhook received:` - Initial request details
- `🔐 HMAC verification:` - Whether signature validation passed/failed
- `❌ Message webhook error details:` - Specific error if it fails

**We can't see these logs from our side** - they're in your Render service logs. Could you:

1. Check your Render.com logs for the `/webhooks/messages` endpoint
2. Look for the request with HMAC signature starting with `71a2a69e9b388441571b...`
3. Share what the detailed error logs show:
   - Did HMAC verification pass?
   - Which step is failing (JSON parse, validation, database)?
   - What's the specific error message?

## **Questions:**

1. Are you seeing the requests in your logs?
2. Is HMAC signature verification passing or failing?
3. What specific error is occurring on your server?
4. Is the `WEBHOOK_SECRET_MESSAGES` secret correctly configured on your end?

## **Technical Details (for your investigation):**

- **HMAC Algorithm:** SHA256
- **Signature Format:** Hex (64 characters)
- **Secret Length:** 64 characters (confirmed in our env var)
- **Payload Format:** JSON with required fields (tenant, email, message) and optional fields (name, subject)

The enhanced logging you added should show exactly where the failure is occurring. Please check your logs and share the error details so we can resolve this quickly.

Thank you!

Best regards,  
Kraftverk Development Team

---

