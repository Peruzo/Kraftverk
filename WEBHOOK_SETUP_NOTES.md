# Contact Form Webhook Setup - Action Required

## Environment Variable Needed

You **must** add the following environment variable to your Render service:

```
WEBHOOK_SECRET_MESSAGES=<secret-value-from-customer-portal-team>
```

## Where to Add

1. Go to your Render dashboard
2. Select your Kraftverk service
3. Go to "Environment" tab
4. Add new environment variable:
   - **Key:** `WEBHOOK_SECRET_MESSAGES`
   - **Value:** (Get from customer portal team via secure channel)

## After Adding

1. **Redeploy** your service (Render will auto-deploy on env var change, or you can manually redeploy)
2. **Test** the contact form on `/om-oss` page
3. Check Render logs to verify HMAC signature is being generated correctly

## What Changed

- ✅ Contact form now uses `/webhooks/messages` endpoint
- ✅ Uses HMAC SHA256 signature instead of CSRF tokens
- ✅ Much simpler code - no CSRF token handling needed
- ✅ Works reliably for server-to-server requests

## Status

⚠️ **Contact form will NOT work until `WEBHOOK_SECRET_MESSAGES` is set**

Contact the customer portal team to get the secret value.

