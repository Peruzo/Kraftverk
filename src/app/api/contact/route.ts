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

    // Step 1: Get CSRF token by making a GET request first
    let csrfToken: string | null = null;
    const cookieStore: string[] = [];
    
    try {
      console.log("🔍 Step 1: Fetching CSRF token...");
      const csrfResponse = await fetch(
        "https://source-database.onrender.com/api/messages",
        {
          method: "GET",
          headers: {
            "X-Tenant": "kraftverk",
          },
        }
      );

      // Extract CSRF token from Set-Cookie header
      const setCookieHeader = csrfResponse.headers.get("set-cookie");
      if (setCookieHeader) {
        console.log("🍪 Set-Cookie header received:", setCookieHeader);
        
        // Extract _csrf token from cookie
        const csrfMatch = setCookieHeader.match(/_csrf=([^;]+)/);
        if (csrfMatch && csrfMatch[1]) {
          csrfToken = csrfMatch[1];
          cookieStore.push(`_csrf=${csrfToken}`);
          console.log("✅ CSRF token extracted:", csrfToken.substring(0, 10) + "...");
        }
      }

      // Also try X-CSRF-Token header
      const csrfHeader = csrfResponse.headers.get("X-CSRF-Token");
      if (csrfHeader) {
        csrfToken = csrfHeader;
        console.log("✅ CSRF token from header:", csrfToken.substring(0, 10) + "...");
      }
    } catch (error) {
      console.log("⚠️ Could not fetch CSRF token, will try without it:", error);
    }

    // Step 2: Prepare headers for POST request
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Tenant": "kraftverk",
    };

    // Add CSRF token if we got one
    if (csrfToken) {
      headers["X-CSRF-Token"] = csrfToken;
      console.log("✅ Adding X-CSRF-Token header");
    }

    // Add cookies if we have them
    if (cookieStore.length > 0) {
      headers["Cookie"] = cookieStore.join("; ");
      console.log("✅ Adding Cookie header");
    }

    // Step 3: Send POST request with CSRF token
    console.log("📤 Step 2: Sending POST request with CSRF token...");
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

