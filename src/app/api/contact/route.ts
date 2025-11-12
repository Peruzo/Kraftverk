import { NextRequest, NextResponse } from "next/server";
import * as crypto from "crypto";

export async function POST(request: NextRequest) {
  const requestId = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    console.log(`📧 [CONTACT ${requestId}] Received contact form submission`);
    const body = await request.json();
    const { name, email, phone, message } = body;
    
    console.log(`📧 [CONTACT ${requestId}] Form data:`, {
      hasName: !!name,
      hasEmail: !!email,
      hasPhone: !!phone,
      hasMessage: !!message,
      emailDomain: email ? email.split('@')[1] : null,
      messageLength: message ? message.length : 0,
    });

    // Validate required fields
    if (!email || !message) {
      return NextResponse.json(
        { success: false, message: "E-post och meddelande är obligatoriska fält." },
        { status: 400 }
      );
    }

    // Get webhook secret from environment variables
    const webhookSecret = process.env.WEBHOOK_SECRET_MESSAGES;
    
    if (!webhookSecret) {
      console.error("❌ WEBHOOK_SECRET_MESSAGES environment variable not set");
      return NextResponse.json(
        {
          success: false,
          message: "Kontaktformuläret är inte korrekt konfigurerat. Vänligen kontakta support.",
        },
        { status: 500 }
      );
    }

    // Prepare payload for customer portal
    // According to their instructions, phone can be included in message body
    // or sent as separate field. We'll include it in message body as they suggested.
    let messageContent = message;
    if (phone) {
      messageContent = `Telefon: ${phone}\n\n${message}`;
    }

    // Build payload matching their example format exactly
    const payload: Record<string, string> = {
      tenant: "kraftverk",
      email: email,
      subject: "Kontaktformulär",
      message: messageContent,
    };

    // Only add optional fields if they have values (as shown in their examples)
    if (name) {
      payload.name = name;
    }
    // Note: Phone is included in message body, not as separate field per their preference

    // Generate HMAC signature - must be calculated on the exact JSON string
    const payloadString = JSON.stringify(payload);
    const signature = crypto
      .createHmac("sha256", webhookSecret)
      .update(payloadString, "utf8")
      .digest("hex");

    console.log(`📤 [CONTACT ${requestId}] Sending contact form message to webhook endpoint...`);
    console.log(`📋 [CONTACT ${requestId}] Payload being sent:`, JSON.stringify(payload, null, 2));
    console.log(`🔐 [CONTACT ${requestId}] HMAC signature generated (first 20 chars):`, signature.substring(0, 20) + "...");
    console.log(`🔐 [CONTACT ${requestId}] HMAC signature (full):`, signature);
    console.log(`🔑 [CONTACT ${requestId}] Secret configured:`, webhookSecret ? "Yes (length: " + webhookSecret.length + ")" : "No");

    // Send to customer portal webhook endpoint
    const requestHeaders = {
      "Content-Type": "application/json",
      "X-Signature": signature,
    };

    console.log(`📤 [CONTACT ${requestId}] Request details:`, {
      url: "https://source-database.onrender.com/webhooks/messages",
      method: "POST",
      headers: {
        ...requestHeaders,
        "X-Signature": signature.substring(0, 20) + "..." + " (truncated for security)",
      },
      bodyLength: payloadString.length,
      tenant: payload.tenant,
      email: payload.email,
      hasName: !!payload.name,
      subject: payload.subject,
      messageLength: payload.message.length,
    });

    const response = await fetch(
      "https://source-database.onrender.com/webhooks/messages",
      {
        method: "POST",
        headers: requestHeaders,
        body: payloadString,
      }
    );

    const responseText = await response.text();
    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      result = { message: responseText };
    }

    console.log(`📥 [CONTACT ${requestId}] Customer portal response:`, {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      responseHeaders: Object.fromEntries(response.headers.entries()),
      responseBody: responseText.substring(0, 500),
      parsedResult: result,
    });

    if (response.ok && result.success) {
      console.log(`✅ [CONTACT ${requestId}] Contact form message sent successfully:`, result.id);
      
      return NextResponse.json({
        success: true,
        id: result.id,
        message: "Meddelandet har skickats!",
      });
    } else {
      console.error(`❌ [CONTACT ${requestId}] Customer portal webhook error:`, {
        status: response.status,
        statusText: response.statusText,
        response: result,
        sentPayload: {
          tenant: payload.tenant,
          email: payload.email,
          subject: payload.subject,
          hasName: !!payload.name,
        },
      });

      // Handle specific error cases
      if (response.status === 401) {
        return NextResponse.json(
          {
            success: false,
            message: "Autentisering misslyckades. Vänligen försök igen.",
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: result.message || "Något gick fel. Vänligen försök igen senare.",
        },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error(`❌ [CONTACT ${requestId}] Error submitting contact form:`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    return NextResponse.json(
      {
        success: false,
        message: "Kunde inte skicka meddelandet. Vänligen försök igen senare.",
      },
      { status: 500 }
    );
  }
}
