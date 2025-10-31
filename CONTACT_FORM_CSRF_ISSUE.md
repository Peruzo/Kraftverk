# Contact Form CSRF Token Issue

## Problem
The `/api/messages` endpoint requires a CSRF token, but we're making server-to-server requests from our Next.js API route. We don't have access to browser cookies or session tokens.

## Current Implementation
- Contact form sends data to our server-side API route: `/api/contact`
- Our API route forwards the request to: `https://source-database.onrender.com/api/messages`
- Error: `403 Forbidden - Ogiltig eller saknad CSRF-token`

## What We've Tried
1. Adding `X-Tenant: kraftverk` header
2. Server-side API route (avoiding client-side CSRF issues)
3. Attempting to fetch CSRF token via GET request (not working)

## Questions for Customer Portal Team
1. How should server-side applications handle CSRF tokens for `/api/messages`?
2. Is there an alternative endpoint for server-to-server message submissions?
3. Can we get a CSRF token via an API call, or is there an API key we should use instead?
4. Should we use a webhook-style endpoint similar to `/webhooks/kraftverk-customer-data`?

## Requested Solution
Please provide either:
- **Option A**: A way to get CSRF tokens for server-side requests
- **Option B**: An alternative endpoint that doesn't require CSRF tokens (webhook-style)
- **Option C**: API key authentication for server-to-server requests

