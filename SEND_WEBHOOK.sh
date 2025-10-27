#!/bin/bash
# Script to send the webhook for the current campaign

curl -X POST https://kraftverk-test-kund.onrender.com/api/campaigns/webhook \
  -H "Authorization: Bearer $SOURCE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "price.updated",
    "priceUpdate": {
      "stripePriceId": "price_1SMucNP6vvUUervCS0tr7AeI",
      "originalProductId": "test-kund",
      "campaignId": "tester_oktober_2024",
      "campaignName": "Tester för oktober"
    }
  }'

echo ""
echo "Webhook sent! Check Render logs for confirmation."

