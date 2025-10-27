#!/bin/bash
# Send webhook for the latest campaign price update
# Price ID: price_1SMwbbP6vvUUervCjaCiPEkT

curl -X POST https://kraftverk-test-kund.onrender.com/api/campaigns/webhook \
  -H "Authorization: Bearer $SOURCE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "price.updated",
    "priceUpdate": {
      "stripePriceId": "price_1SMwbbP6vvUUervCjaCiPEkT",
      "originalProductId": "test-kund",
      "campaignId": "latest_campaign_2024",
      "campaignName": "Latest Campaign"
    }
  }'

echo ""
echo "Webhook sent! Check Render logs to verify."

