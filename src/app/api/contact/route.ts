import { NextRequest, NextResponse } from "next/server";

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

    // Prepare headers - try multiple approaches
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Tenant": "kraftverk",
    };

    // Try adding tenant as both header and in body (some APIs require both)
    // Also try common CSRF header names
    const possibleCSRFHeaders = [
      "X-CSRF-Token",
      "X-Csrf-Token", 
      "CSRF-Token",
      "X-XSRF-Token",
    ];

    // For server-to-server requests, some APIs accept empty CSRF token
    // or special server authentication. Let's try with tenant only first.

    // Send to customer portal
    const response = await fetch(
      "https://source-database.onrender.com/api/messages",
      {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
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
      return NextResponse.json({
        success: true,
        id: result.id,
        message: "Meddelandet har skickats!",
      });
    } else {
      console.error("❌ Customer portal /api/messages error:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        response: result,
        payload: { ...payload, message: "[redacted]" }, // Don't log full message content
      });
      
      // If CSRF error, provide detailed helpful message
      if (response.status === 403 && (result.message?.includes("CSRF") || result.message?.includes("token"))) {
        console.error("🔒 CSRF Token Issue:", {
          endpoint: "https://source-database.onrender.com/api/messages",
          issue: "Endpoint requires CSRF token even for server-to-server requests",
          solution: "Need customer portal team to provide webhook endpoint or API key authentication",
        });
        
        return NextResponse.json(
          {
            success: false,
            message: "Kontaktformuläret kunde inte skickas på grund av ett autentiseringsproblem. Vänligen kontakta oss direkt via e-post eller telefon.",
            error: "CSRF_TOKEN_REQUIRED",
          },
          { status: 403 }
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
    console.error("Error submitting contact form:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Kunde inte skicka meddelandet. Vänligen försök igen senare.",
      },
      { status: 500 }
    );
  }
}

