#!/bin/bash

# Analytics Integration Test Script for Kraftverk
# Tests all analytics endpoints and data formats

set -e

BASE_URL="https://source-database.onrender.com"
TENANT="kraftverk"
# Generate proper ISO 8601 timestamp with milliseconds using Python
TIMESTAMP=$(python3 -c "from datetime import datetime; print(datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.000Z'))")
SESSION_BASE=$(date +%s)

# Helper function to generate ISO timestamp
get_timestamp() {
    python3 -c "from datetime import datetime; print(datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.000Z'))"
}

echo "=========================================="
echo "Kraftverk Analytics Integration Tests"
echo "=========================================="
echo "Timestamp: $TIMESTAMP"
echo "Base URL: $BASE_URL"
echo "Tenant: $TENANT"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to make request and capture response
test_request() {
    local test_name="$1"
    local endpoint="$2"
    local payload="$3"
    
    echo "----------------------------------------"
    echo "Test: $test_name"
    echo "----------------------------------------"
    echo "Endpoint: $endpoint"
    echo "Request Body:"
    echo "$payload" | jq '.' 2>/dev/null || echo "$payload"
    echo ""
    
    response=$(curl -s -w "\n%{http_code}" -X POST "$endpoint" \
        -H "Content-Type: application/json" \
        -H "X-Tenant: $TENANT" \
        -d "$payload")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    echo "Response Status: $http_code"
    echo "Response Body:"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
    echo ""
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✅ Test PASSED${NC}"
    else
        echo -e "${RED}❌ Test FAILED (Status: $http_code)${NC}"
    fi
    echo ""
}

# Test 1: Basic Page View Event
echo "=========================================="
echo "TEST 1: Basic Page View Event"
echo "=========================================="
test_request "Basic Page View" \
    "$BASE_URL/api/ingest/analytics" \
    "{
        \"tenant\": \"$TENANT\",
        \"events\": [{
            \"type\": \"page_view\",
            \"event_type\": \"page_view\",
            \"url\": \"https://kraftverk-test-kund.onrender.com/test-page\",
            \"title\": \"Test Page - Kraftverk\",
            \"referrer\": null,
            \"userAgent\": \"Mozilla/5.0 (Test Browser)\",
            \"timestamp\": \"$(get_timestamp)\",
            \"sessionId\": \"test_session_$SESSION_BASE\",
            \"userId\": \"test_user_1\",
            \"device\": \"desktop\",
            \"tenant\": \"$TENANT\",
            \"consent\": true,
            \"properties\": {
                \"path\": \"/test-page\",
                \"page_title\": \"Test Page\"
            }
        }]
    }"

sleep 1

# Test 2: Device Types - Desktop
echo "=========================================="
echo "TEST 2A: Desktop Device"
echo "=========================================="
test_request "Desktop Device" \
    "$BASE_URL/api/ingest/analytics" \
    "{
        \"tenant\": \"$TENANT\",
        \"events\": [{
            \"type\": \"page_view\",
            \"event_type\": \"page_view\",
            \"url\": \"https://kraftverk-test-kund.onrender.com/\",
            \"tenant\": \"$TENANT\",
            \"sessionId\": \"test_desktop_$(date +%s)\",
            \"userId\": \"test_user_desktop\",
            \"device\": \"desktop\",
            \"timestamp\": \"$(get_timestamp)\",
            \"consent\": true
        }]
    }"

sleep 1

# Test 2: Device Types - Mobile
echo "=========================================="
echo "TEST 2B: Mobile Device"
echo "=========================================="
test_request "Mobile Device" \
    "$BASE_URL/api/ingest/analytics" \
    "{
        \"tenant\": \"$TENANT\",
        \"events\": [{
            \"type\": \"page_view\",
            \"event_type\": \"page_view\",
            \"url\": \"https://kraftverk-test-kund.onrender.com/\",
            \"tenant\": \"$TENANT\",
            \"sessionId\": \"test_mobile_$(date +%s)\",
            \"userId\": \"test_user_mobile\",
            \"device\": \"mobile\",
            \"timestamp\": \"$(get_timestamp)\",
            \"consent\": true
        }]
    }"

sleep 1

# Test 2: Device Types - Tablet
echo "=========================================="
echo "TEST 2C: Tablet Device"
echo "=========================================="
test_request "Tablet Device" \
    "$BASE_URL/api/ingest/analytics" \
    "{
        \"tenant\": \"$TENANT\",
        \"events\": [{
            \"type\": \"page_view\",
            \"event_type\": \"page_view\",
            \"url\": \"https://kraftverk-test-kund.onrender.com/\",
            \"tenant\": \"$TENANT\",
            \"sessionId\": \"test_tablet_$(date +%s)\",
            \"userId\": \"test_user_tablet\",
            \"device\": \"tablet\",
            \"timestamp\": \"$(get_timestamp)\",
            \"consent\": true
        }]
    }"

sleep 1

# Test 3: Traffic Sources - Direct
echo "=========================================="
echo "TEST 3A: Direct Traffic (No Referrer)"
echo "=========================================="
test_request "Direct Traffic" \
    "$BASE_URL/api/ingest/analytics" \
    "{
        \"tenant\": \"$TENANT\",
        \"events\": [{
            \"type\": \"page_view\",
            \"event_type\": \"page_view\",
            \"url\": \"https://kraftverk-test-kund.onrender.com/\",
            \"tenant\": \"$TENANT\",
            \"sessionId\": \"test_direct_$(date +%s)\",
            \"device\": \"desktop\",
            \"referrer\": null,
            \"timestamp\": \"$(get_timestamp)\",
            \"consent\": true
        }]
    }"

sleep 1

# Test 3: Traffic Sources - Organic (Google)
echo "=========================================="
echo "TEST 3B: Organic Search Traffic (Google)"
echo "=========================================="
test_request "Organic Search" \
    "$BASE_URL/api/ingest/analytics" \
    "{
        \"tenant\": \"$TENANT\",
        \"events\": [{
            \"type\": \"page_view\",
            \"event_type\": \"page_view\",
            \"url\": \"https://kraftverk-test-kund.onrender.com/\",
            \"tenant\": \"$TENANT\",
            \"sessionId\": \"test_organic_$(date +%s)\",
            \"device\": \"desktop\",
            \"referrer\": \"https://www.google.com/search?q=kraftverk\",
            \"timestamp\": \"$(get_timestamp)\",
            \"consent\": true
        }]
    }"

sleep 1

# Test 3: Traffic Sources - Social (Facebook)
echo "=========================================="
echo "TEST 3C: Social Media Traffic (Facebook)"
echo "=========================================="
test_request "Social Media" \
    "$BASE_URL/api/ingest/analytics" \
    "{
        \"tenant\": \"$TENANT\",
        \"events\": [{
            \"type\": \"page_view\",
            \"event_type\": \"page_view\",
            \"url\": \"https://kraftverk-test-kund.onrender.com/\",
            \"tenant\": \"$TENANT\",
            \"sessionId\": \"test_social_$(date +%s)\",
            \"device\": \"desktop\",
            \"referrer\": \"https://www.facebook.com\",
            \"timestamp\": \"$(get_timestamp)\",
            \"consent\": true
        }]
    }"

sleep 1

# Test 3: Traffic Sources - Email
echo "=========================================="
echo "TEST 3D: Email Traffic"
echo "=========================================="
test_request "Email Traffic" \
    "$BASE_URL/api/ingest/analytics" \
    "{
        \"tenant\": \"$TENANT\",
        \"events\": [{
            \"type\": \"page_view\",
            \"event_type\": \"page_view\",
            \"url\": \"https://kraftverk-test-kund.onrender.com/\",
            \"tenant\": \"$TENANT\",
            \"sessionId\": \"test_email_$(date +%s)\",
            \"device\": \"desktop\",
            \"referrer\": \"https://mail.google.com\",
            \"timestamp\": \"$(get_timestamp)\",
            \"consent\": true
        }]
    }"

sleep 1

# Test 4: Form Submit Event
echo "=========================================="
echo "TEST 4: Form Submit (Leads)"
echo "=========================================="
test_request "Form Submit" \
    "$BASE_URL/api/ingest/analytics" \
    "{
        \"tenant\": \"$TENANT\",
        \"events\": [{
            \"type\": \"form_submit\",
            \"event_type\": \"form_submit\",
            \"url\": \"https://kraftverk-test-kund.onrender.com/contact\",
            \"tenant\": \"$TENANT\",
            \"sessionId\": \"test_form_session_$(date +%s)\",
            \"userId\": \"test_user_form\",
            \"device\": \"desktop\",
            \"timestamp\": \"$(get_timestamp)\",
            \"consent\": true,
            \"properties\": {
                \"formId\": \"contact-form\",
                \"formName\": \"Contact Form\",
                \"formFields\": [\"name\", \"email\", \"message\"]
            }
        }]
    }"

sleep 1

# Test 5: Time on Page Event
echo "=========================================="
echo "TEST 5: Time on Page (Session Duration)"
echo "=========================================="
SESSION_ID="test_duration_session_$(date +%s)"
USER_ID="test_user_duration"

# First page view
echo "Sending initial page view..."
test_request "Page View (Initial)" \
    "$BASE_URL/api/ingest/analytics" \
    "{
        \"tenant\": \"$TENANT\",
        \"events\": [{
            \"type\": \"page_view\",
            \"event_type\": \"page_view\",
            \"url\": \"https://kraftverk-test-kund.onrender.com/\",
            \"tenant\": \"$TENANT\",
            \"sessionId\": \"$SESSION_ID\",
            \"userId\": \"$USER_ID\",
            \"device\": \"desktop\",
            \"timestamp\": \"$(get_timestamp)\",
            \"consent\": true
        }]
    }"

sleep 2

# Time on page
echo "Sending time_on_page event..."
test_request "Time on Page (45 seconds)" \
    "$BASE_URL/api/ingest/analytics" \
    "{
        \"tenant\": \"$TENANT\",
        \"events\": [{
            \"type\": \"time_on_page\",
            \"event_type\": \"time_on_page\",
            \"url\": \"https://kraftverk-test-kund.onrender.com/\",
            \"tenant\": \"$TENANT\",
            \"sessionId\": \"$SESSION_ID\",
            \"userId\": \"$USER_ID\",
            \"device\": \"desktop\",
            \"timestamp\": \"$(get_timestamp)\",
            \"consent\": true,
            \"properties\": {
                \"duration\": 45,
                \"page\": \"/\"
            }
        }]
    }"

sleep 1

# Test 6: Batch Events (Multiple events at once)
echo "=========================================="
echo "TEST 6: Batch Events (Multiple Events)"
echo "=========================================="
BATCH_SESSION="batch_test_$(date +%s)"
BATCH_USER="batch_user_1"
test_request "Batch Events" \
    "$BASE_URL/api/ingest/analytics" \
    "{
        \"tenant\": \"$TENANT\",
        \"events\": [
            {
                \"type\": \"page_view\",
                \"event_type\": \"page_view\",
                \"url\": \"https://kraftverk-test-kund.onrender.com/\",
                \"sessionId\": \"$BATCH_SESSION\",
                \"userId\": \"$BATCH_USER\",
                \"device\": \"desktop\",
                \"timestamp\": \"$(get_timestamp)\",
                \"consent\": true
            },
            {
                \"type\": \"page_view\",
                \"event_type\": \"page_view\",
                \"url\": \"https://kraftverk-test-kund.onrender.com/about\",
                \"sessionId\": \"$BATCH_SESSION\",
                \"userId\": \"$BATCH_USER\",
                \"device\": \"desktop\",
                \"timestamp\": \"$(get_timestamp)\",
                \"consent\": true
            },
            {
                \"type\": \"form_submit\",
                \"event_type\": \"form_submit\",
                \"url\": \"https://kraftverk-test-kund.onrender.com/contact\",
                \"sessionId\": \"$BATCH_SESSION\",
                \"userId\": \"$BATCH_USER\",
                \"device\": \"desktop\",
                \"timestamp\": \"$(get_timestamp)\",
                \"consent\": true,
                \"properties\": {
                    \"formId\": \"contact-form\"
                }
            }
        ]
    }"

echo "=========================================="
echo "All Tests Completed!"
echo "=========================================="
echo ""
echo -e "${GREEN}✅ Please review all responses above${NC}"
echo "Collect all HTTP status codes and response bodies"
echo "Send them to the Source.database team for verification"
echo ""

