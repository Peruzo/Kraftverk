import { NextRequest, NextResponse } from "next/server";
import * as crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message } = body;

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
    let messageContent = message;
    if (phone) {
      messageContent = `Telefon: ${phone}\n\n${message}`;
    }

    const payload = {
      tenant: "kraftverk",
      name: name || undefined,
      email: email,
      phone: phone || undefined,
      subject: "Kontaktformulär",
      message: messageContent,
    };

    // Generate HMAC signature
    const payloadString = JSON.stringify(payload);
    const signature = crypto
      .createHmac("sha256", webhookSecret)
      .update(payloadString, "utf8")
      .digest("hex");

    console.log("📤 Sending contact form message to webhook endpoint...");
    console.log("🔐 HMAC signature generated (first 10 chars):", signature.substring(0, 10) + "...");

    // Send to customer portal webhook endpoint
    const response = await fetch(
      "https://source-database.onrender.com/webhooks/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Signature": signature,
        },
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

    if (response.ok && result.success) {
      console.log("✅ Contact form message sent successfully:", result.id);
      
      return NextResponse.json({
        success: true,
        id: result.id,
        message: "Meddelandet har skickats!",
      });
    } else {
      console.error("❌ Customer portal webhook error:", {
        status: response.status,
        statusText: response.statusText,
        response: result,
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
    console.error("❌ Error submitting contact form:", error);
    console.error("❌ Error details:", {
      message: error instanceof Error ? error.message : String(error),
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
