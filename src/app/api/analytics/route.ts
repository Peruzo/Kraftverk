import { NextRequest, NextResponse } from "next/server";

const ANALYTICS_ENDPOINT = 'https://source-database.onrender.com/api/ingest/analytics';
const TENANT_ID = 'kraftverk';

export async function POST(request: NextRequest) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    console.log(`📊 [ANALYTICS ${requestId}] Received analytics request`);
    const body = await request.json();
    const { eventType, event, properties } = body;

    console.log(`📊 [ANALYTICS ${requestId}] Request body:`, {
      hasEventType: !!eventType,
      hasEvent: !!event,
      hasProperties: !!properties,
      eventType: eventType,
      eventKeys: event ? Object.keys(event) : null,
      propertiesKeys: properties ? Object.keys(properties) : null,
    });

    if (!eventType && !event) {
      console.error(`❌ [ANALYTICS ${requestId}] Missing eventType and event`);
      return NextResponse.json(
        { success: false, message: "Event type or event object is required" },
        { status: 400 }
      );
    }

    // If full event object is provided (new TRAFIKKALLOR format), use it directly
    // Otherwise, build event from eventType and properties (backward compatibility)
    let analyticsEvent;
    
    if (event) {
      // Use the event object directly (matches TRAFIKKALLOR guide format)
      console.log(`📊 [ANALYTICS ${requestId}] Using full event object`);
      analyticsEvent = event;
      
      // Ensure tenant is included (CRITICAL for multi-tenant isolation)
      if (!analyticsEvent.tenant) {
        console.log(`📊 [ANALYTICS ${requestId}] Adding tenant: ${TENANT_ID}`);
        analyticsEvent.tenant = TENANT_ID;
      }
    } else {
      console.log(`📊 [ANALYTICS ${requestId}] Building event from eventType and properties`);
      // Build event from eventType and properties (backward compatibility)
      analyticsEvent = {
        event_type: eventType,
        url: properties?.url || properties?.path || "",
        title: properties?.title || "",
        referrer: properties?.referrer || null,
        userAgent: properties?.userAgent || "",
        timestamp: new Date().toISOString(),
        sessionId: properties?.sessionId || "",
        userId: properties?.userId || undefined,
        device: properties?.device || "desktop",
        consent: properties?.consent !== undefined ? properties.consent : true,
        tenant: TENANT_ID, // CRITICAL: always include tenant
        properties: {
          ...properties,
          // Remove fields that are at top level
          url: undefined,
          path: undefined,
          title: undefined,
          referrer: undefined,
          userAgent: undefined,
          sessionId: undefined,
          userId: undefined,
          device: undefined,
          consent: undefined,
          tenant: undefined,
        },
      };
    }

    // Log the complete event being sent
    console.log(`📤 [ANALYTICS ${requestId}] Sending to customer portal:`, {
      endpoint: ANALYTICS_ENDPOINT,
      event_type: analyticsEvent.event_type || analyticsEvent.eventType,
      tenant: analyticsEvent.tenant,
      sessionId: analyticsEvent.sessionId,
      device: analyticsEvent.device,
      consent: analyticsEvent.consent,
      url: analyticsEvent.url,
      hasProperties: !!analyticsEvent.properties,
      propertiesKeys: analyticsEvent.properties ? Object.keys(analyticsEvent.properties) : null,
      timestamp: analyticsEvent.timestamp,
    });
    
    console.log(`📤 [ANALYTICS ${requestId}] Full event payload (truncated):`, JSON.stringify(analyticsEvent, null, 2).substring(0, 1000));

    // Send to customer portal analytics endpoint
    // The endpoint expects an object with "events" array property (per error message "Events array krävs")
    // Wrap the event in an array and include tenant
    const eventsArray = [analyticsEvent];
    const payload = {
      tenant: TENANT_ID,
      events: eventsArray,
    };
    
    console.log(`📤 [ANALYTICS ${requestId}] Sending payload with ${eventsArray.length} event(s) in events array`);
    console.log(`📤 [ANALYTICS ${requestId}] Payload structure:`, {
      hasTenant: !!payload.tenant,
      tenant: payload.tenant,
      eventsCount: payload.events.length,
      firstEventType: payload.events[0]?.event_type || payload.events[0]?.eventType,
    });

    const response = await fetch(ANALYTICS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Tenant": TENANT_ID,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      result = { message: responseText };
    }

    console.log(`📥 [ANALYTICS ${requestId}] Customer portal response:`, {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      responseHeaders: Object.fromEntries(response.headers.entries()),
      responseBody: responseText.substring(0, 500), // Truncate long responses
      parsedResult: result,
    });

    if (response.ok) {
      console.log(`✅ [ANALYTICS ${requestId}] Successfully sent analytics event to customer portal`);
      return NextResponse.json({
        success: true,
        message: "Analytics event tracked successfully",
      });
    } else {
      console.error(`❌ [ANALYTICS ${requestId}] Customer portal error:`, {
        status: response.status,
        statusText: response.statusText,
        response: result,
        sentEvent: {
          event_type: analyticsEvent.event_type || analyticsEvent.eventType,
          tenant: analyticsEvent.tenant,
        },
      });

      return NextResponse.json(
        {
          success: false,
          message: result.message || "Failed to track analytics event",
        },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error(`❌ [ANALYTICS ${requestId}] Error sending analytics event:`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    return NextResponse.json(
      {
        success: false,
        message: "Failed to track analytics event",
      },
      { status: 500 }
    );
  }
}

