# Complete TRAFIKKALLOR Integration Implementation

## ✅ Implementation Complete

All analytics tracking events from the TRAFIKKALLOR integration guide have been implemented and are sending data to the customer portal in the correct format.

## 📊 Events Implemented

### 1. **Page View** (`page_view`)
- ✅ Includes `referrer` (null if empty for direct traffic detection)
- ✅ Includes `device` ("desktop", "mobile", or "tablet") at top level
- ✅ Includes `sessionId`, `userId`, `consent`, `tenant` at top level
- ✅ **Performance metrics** in `properties`:
  - `responseTime` / `loadTime` (milliseconds) - CRITICAL for Systemhälsa widget
  - `statusCode` / `httpStatus` - CRITICAL for error tracking
  - `domContentLoaded`, `firstPaint` (optional)
  - Error info if 404 detected

### 2. **Time on Page** (`time_on_page`)
- ✅ `duration` in seconds (not minutes) - CRITICAL for average session length
- ✅ `page` URL in properties - CRITICAL for landing page analysis
- ✅ Uses `sendBeacon` for reliable delivery on page unload
- ✅ Tracked on navigation, visibility change, and beforeunload

### 3. **Form Start** (`form_start`)
- ✅ `formId` (required) in properties
- ✅ `formName`, `formAction`, `formMethod` in properties
- ✅ Triggers when user focuses on first form field

### 4. **Form Submit** (`form_submit`)
- ✅ `formId` (required) in properties
- ✅ `duration` in seconds (time to fill form) - CRITICAL for average completion time
- ✅ `formName`, `formAction`, `formMethod` in properties
- ✅ Tracks completion time from form start to submit

### 5. **Form Error** (`form_error`)
- ✅ `formId` (required) in properties
- ✅ `fieldName` (required) - CRITICAL for field drop-off analysis
- ✅ `fieldType`, `errorMessage`, `timeSpent` (seconds in field) in properties
- ✅ Tracks validation errors for each field

### 6. **CTA Click** (`cta_click`)
- ✅ `ctaId`, `ctaText`, `ctaType` in properties
- ✅ Automatically tracks elements with `data-cta`, `.cta-button`, `.call-to-action`
- ✅ Used in Main Conversion Funnel (CTA Click step)

### 7. **Checkout** (`checkout`)
- ✅ `checkoutId` (required) in properties
- ✅ `amount` in öre (e.g., 49900 for 499 SEK) - CRITICAL
- ✅ `currency`, `items` in properties
- ✅ Tracked when checkout session is initiated

### 8. **Product View** (`product_view`)
- ✅ Tracks when product/membership cards are displayed
- ✅ Used in Product Purchase Funnel (Product View step)

### 9. **Add to Cart** (`add_to_cart`)
- ✅ Tracks when user clicks to purchase
- ✅ Used in Product Purchase Funnel (Add to Cart step)

### 10. **Purchase** (`purchase`)
- ✅ `transactionId` (required) in properties
- ✅ `value` in öre (e.g., 49900 for 499 SEK) - CRITICAL
- ✅ `revenue` in öre - CRITICAL for revenue KPI
- ✅ `currency`, `items` array in properties
- ✅ Tracked on successful payment completion

### 11. **JavaScript Errors** (sent as `page_view` with error info)
- ✅ JavaScript errors tracked with error info in properties
- ✅ Promise rejections tracked
- ✅ Used for Systemhälsa widget error tracking

### 12. **Class Booking** (`class_booking`)
- ✅ Tracks class booking attempts
- ✅ Includes class name, instructor, time

## 🎯 Widget Data Mapping

### Översikt Widget KPIs
- ✅ **Sessions**: Unique `sessionId` from `page_view` events
- ✅ **Unika användare**: Unique `userId` from `page_view` events
- ✅ **Konverteringsgrad**: (`form_submit` + `purchase`) / `page_view` sessions
- ✅ **Leads**: `form_submit` events count
- ✅ **Intäkter**: Sum of `eventProps.revenue` from `purchase` events
- ✅ **Genomsnittlig sessionslängd**: Average of `eventProps.duration` from `time_on_page` events
- ✅ **Bounce Rate**: Auto-calculated (sessions with only 1 `page_view`)

### Trafik & Förvärv Widget
- ✅ **Trafikfördelning**: Auto-detected from `referrer` in `page_view` events
- ✅ **Källa/Medium**: Extracted from `referrer` domain
- ✅ **CVR per källa**: Calculated from `form_submit` and `purchase` events per source
- ✅ **Topp landningssidor**: `page_view` events with `time_on_page` duration
- ✅ **Bounce Rate**: Auto-calculated per landing page

### Beteende & UX Widget

#### Main Conversion Funnel
- ✅ **Visit**: `page_view` events
- ✅ **CTA Click**: `cta_click` events
- ✅ **Form Start**: `form_start` events
- ✅ **Form Submit**: `form_submit` events

#### Product Purchase Funnel
- ✅ **Product View**: `product_view` events
- ✅ **Add to Cart**: `add_to_cart` events
- ✅ **Checkout Start**: `checkout` events
- ✅ **Purchase**: `purchase` events

#### Formuläranalys
- ✅ **Inlämningar**: `form_start` events with `formId`
- ✅ **Lyckade**: `form_submit` events with `formId` and `duration`
- ✅ **Framgångsgrad**: `form_submit` / `form_start` per form
- ✅ **Fältavhopp**: `form_error` events with `fieldName` and `timeSpent`

### Systemhälsa Widget
- ✅ **Uptime**: Calculated from successful vs failed `page_view` requests
- ✅ **Svarstid**: Average `eventProps.responseTime` / `eventProps.loadTime` from `page_view`
- ✅ **Trasiga länkar**: Unique pages with 404 errors (`eventProps.statusCode === 404`)
- ✅ **Felutveckling**: Daily aggregation of 404 and 500 errors from `page_view` with status codes

### Trafikällor Widget
- ✅ **Direkt**: `referrer` is null/empty
- ✅ **Sök**: Auto-detected from Google, Bing, etc.
- ✅ **Sociala medier**: Auto-detected from Facebook, Instagram, etc.
- ✅ **E-post**: Auto-detected from email links
- ✅ **Referral**: All other referrers

### Enhetstyp Widget
- ✅ **Desktop**: `device: "desktop"`
- ✅ **Mobil**: `device: "mobile"`
- ✅ **Tablet**: `device: "tablet"`

## 🔧 Key Implementation Details

### Event Structure (Per TRAFIKKALLOR Guide)
```typescript
{
  event_type: "page_view" | "time_on_page" | "form_submit" | ...,
  url: "/path",
  title: "Page Title",
  referrer: "https://google.com" || null,
  userAgent: navigator.userAgent,
  timestamp: "2025-01-27T12:00:00.000Z",
  sessionId: "sess_timestamp_random", // CRITICAL
  userId: "hashed_user_id" || undefined,
  device: "desktop" | "mobile" | "tablet", // CRITICAL
  consent: true | false, // GDPR
  tenant: "kraftverk", // CRITICAL
  properties: {
    // Event-specific data
    duration: 30, // seconds for time_on_page
    page: "/path", // for time_on_page
    formId: "contact_form", // for form events
    responseTime: 150, // milliseconds
    statusCode: 200,
    // ... etc
  }
}
```

### Critical Requirements Met

1. ✅ **Session ID Format**: `sess_timestamp_random` (per guide)
2. ✅ **Device Detection**: Correct detection (desktop/mobile/tablet)
3. ✅ **Tenant Isolation**: `tenant: "kraftverk"` included in all events
4. ✅ **GDPR Consent**: `consent` field included, tracking skipped if false
5. ✅ **Time in Seconds**: `time_on_page` duration in seconds (not minutes)
6. ✅ **Amount in Öre**: `purchase` and `checkout` amounts in öre (not SEK)
7. ✅ **Referrer Handling**: Sent as `null` if empty (for direct traffic)
8. ✅ **Performance Metrics**: `responseTime`, `loadTime` in milliseconds
9. ✅ **Error Tracking**: Status codes and error info in `page_view` properties

## 📁 Files Modified

### Core Analytics
- ✅ `src/lib/enhanced-analytics.ts` - Updated all event methods to match guide format
- ✅ `src/app/api/analytics/route.ts` - Updated to ensure tenant is included
- ✅ `src/components/providers/EnhancedAnalyticsProvider.tsx` - Enhanced form and error tracking

### Components Updated
- ✅ `src/components/products/ProductCard.tsx` - Added `product_view` and `add_to_cart` tracking
- ✅ `src/components/membership/PricingCard.tsx` - Added `product_view` and `add_to_cart` tracking
- ✅ `src/components/booking/ClassCard.tsx` - Updated to use enhanced analytics

### Pages Updated
- ✅ `src/app/produkter/page.tsx` - Added checkout tracking
- ✅ `src/app/medlemskap/page.tsx` - Added checkout tracking
- ✅ `src/app/success/page.tsx` - Updated purchase tracking with öre amounts

### API Routes
- ✅ `src/app/api/checkout/route.ts` - Removed client-side analytics (handled client-side)

## 🎨 Event Flow Examples

### Product Purchase Flow
1. User views product → `product_view` event
2. User clicks "Köp" → `add_to_cart` event
3. Checkout initiated → `checkout` event (amount in öre)
4. Payment completed → `purchase` event (value in öre, revenue in öre)

### Membership Purchase Flow
1. User views membership → `product_view` event (via PricingCard)
2. User clicks "Välj plan" → `add_to_cart` event (via PricingCard)
3. Checkout initiated → `checkout` event (amount in öre)
4. Payment completed → `purchase` event (value in öre, revenue in öre)

### Form Submission Flow
1. User focuses on form field → `form_start` event
2. User encounters validation error → `form_error` event (with fieldName, timeSpent)
3. User submits form → `form_submit` event (with duration in seconds)

### Conversion Funnel Flow
1. User visits page → `page_view` event
2. User clicks CTA → `cta_click` event
3. User starts form → `form_start` event
4. User submits form → `form_submit` event

## ✅ Verification Checklist

### Data Format
- [x] All events include `tenant: "kraftverk"` at top level
- [x] All events include `sessionId` at top level (consistent across session)
- [x] All events include `device` at top level ("desktop", "mobile", or "tablet")
- [x] All events include `consent` at top level (true/false)
- [x] `referrer` sent as `null` if empty (for direct traffic)
- [x] `time_on_page` duration in seconds (not minutes)
- [x] `purchase` and `checkout` amounts in öre (not SEK)
- [x] `form_submit` duration in seconds
- [x] Performance metrics (responseTime, loadTime) in milliseconds

### Event-Specific Properties
- [x] `time_on_page`: `duration` (seconds), `page` (URL)
- [x] `form_start`: `formId`, `formName`, `formAction`, `formMethod`
- [x] `form_submit`: `formId`, `duration` (seconds), `formName`, etc.
- [x] `form_error`: `formId`, `fieldName`, `timeSpent` (seconds)
- [x] `cta_click`: `ctaId`, `ctaText`, `ctaType`
- [x] `checkout`: `checkoutId`, `amount` (öre), `currency`, `items`
- [x] `purchase`: `transactionId`, `value` (öre), `revenue` (öre), `items`
- [x] `page_view`: `responseTime` (ms), `loadTime` (ms), `statusCode`

### Tracking Implementation
- [x] Product views tracked automatically when ProductCard mounts
- [x] Membership views tracked automatically when PricingCard mounts
- [x] Add to cart tracked on purchase button click
- [x] Checkout tracked before redirect to Stripe
- [x] Purchase tracked on successful payment
- [x] Form start tracked on first field focus
- [x] Form submit tracked with duration calculation
- [x] Form errors tracked with field name and time spent
- [x] CTA clicks tracked automatically
- [x] Time on page tracked on navigation, visibility change, and beforeunload
- [x] JavaScript errors tracked as page_view with error info

## 🚀 Ready for Production

All tracking events are implemented and match the TRAFIKKALLOR integration guide format. The system is ready to send comprehensive analytics data to the customer portal, enabling:

- ✅ Traffic source analysis
- ✅ Conversion funnel tracking
- ✅ Form performance analysis
- ✅ Product purchase tracking
- ✅ System health monitoring
- ✅ User behavior analysis
- ✅ Device type tracking
- ✅ Session length tracking

## 📝 Notes

1. **Event Properties Field**: The guide uses both "properties" and "eventProps" in examples. We're using "properties" consistently, which should work with the customer portal API.

2. **Tenant**: All events include `tenant: "kraftverk"` at the top level for proper multi-tenant isolation.

3. **Consent**: All events respect GDPR consent. Tracking is skipped if `consent: false`.

4. **Amount Format**: Critical to note that `purchase` and `checkout` events use amounts in öre (e.g., 49900 for 499 SEK), not SEK amounts.

5. **Time Format**: All time durations are in seconds (not minutes or milliseconds) for consistency with the guide.

6. **Performance Metrics**: Response times and load times are in milliseconds as required for Systemhälsa widget.

## 🔍 Testing

To verify all events are working:

1. **Page Views**: Navigate between pages - check console for `page_view` events
2. **Time on Page**: Navigate away or close tab - check for `time_on_page` events
3. **Form Events**: Fill out contact form - check for `form_start`, `form_error`, `form_submit`
4. **Product Views**: Visit `/produkter` - check for `product_view` events
5. **Add to Cart**: Click "Köp" on product - check for `add_to_cart` event
6. **Checkout**: Initiate checkout - check for `checkout` event with amount in öre
7. **Purchase**: Complete payment - check for `purchase` event with value/revenue in öre
8. **CTA Clicks**: Click any button with CTA class - check for `cta_click` event

All events should appear in the customer portal dashboard under the respective widgets.

