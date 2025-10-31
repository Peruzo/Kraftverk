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

    // Try to get CSRF token first by making a GET request
    let csrfToken: string | null = null;
    try {
      const csrfResponse = await fetch(
        "https://source-database.onrender.com/api/messages",
        {
          method: "GET",
          headers: {
            "X-Tenant": "kraftverk",
          },
        }
      );
      
      // Try to extract CSRF token from response headers or cookies
      const csrfHeader = csrfResponse.headers.get("X-CSRF-Token");
      if (csrfHeader) {
        csrfToken = csrfHeader;
      }
    } catch (error) {
      console.log("Could not fetch CSRF token, proceeding anyway");
    }

    // Prepare headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Tenant": "kraftverk",
    };

    // Add CSRF token if we got one
    if (csrfToken) {
      headers["X-CSRF-Token"] = csrfToken;
    }

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
      console.error("Customer portal error:", {
        status: response.status,
        statusText: response.statusText,
        response: result,
      });
      
      // If CSRF error, provide helpful message
      if (response.status === 403 && result.message?.includes("CSRF")) {
        return NextResponse.json(
          {
            success: false,
            message: "Kontakta support - CSRF-token problem. Meddelandet kunde inte skickas.",
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

