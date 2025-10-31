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

    // Send to customer portal
    const response = await fetch(
      "https://source-database.onrender.com/api/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Try to get CSRF token from cookie or pass X-Tenant header
          "X-Tenant": "kraftverk",
        },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();

    if (response.ok && result.success) {
      return NextResponse.json({
        success: true,
        id: result.id,
        message: "Meddelandet har skickats!",
      });
    } else {
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

