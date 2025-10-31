import { NextRequest, NextResponse } from "next/server";

const ANALYTICS_ENDPOINT = 'https://source-database.onrender.com/api/ingest/analytics';
const TENANT_ID = 'kraftverk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, properties } = body;

    if (!eventType) {
      return NextResponse.json(
        { success: false, message: "Event type is required" },
        { status: 400 }
      );
    }

    // Prepare analytics event payload
    const event = {
      type: eventType,
      url: properties?.url || "",
      path: properties?.path || "",
      title: properties?.title || "",
      timestamp: new Date().toISOString(),
      referrer: properties?.referrer || "",
      userAgent: properties?.userAgent || "",
      screenWidth: properties?.screenWidth,
      screenHeight: properties?.screenHeight,
      properties: properties || {},
    };

    const payload = {
      tenant: TENANT_ID,
      events: [event]
    };

    // Send to customer portal analytics endpoint
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

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: "Analytics event tracked successfully",
      });
    } else {
      console.error("Analytics endpoint error:", {
        status: response.status,
        statusText: response.statusText,
        response: result,
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
    console.error("Error sending analytics event:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to track analytics event",
      },
      { status: 500 }
    );
  }
}

