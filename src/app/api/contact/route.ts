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

      // Extract all cookies from Set-Cookie header(s)
      try {
        // Try getSetCookie() first (newer API)
        if (typeof csrfResponse.headers.getSetCookie === "function") {
          const setCookieHeaders = csrfResponse.headers.getSetCookie();
          if (setCookieHeaders && setCookieHeaders.length > 0) {
            console.log("🍪 Set-Cookie headers received (getSetCookie):", setCookieHeaders);
            
            setCookieHeaders.forEach((cookieHeader) => {
              const cookieMatch = cookieHeader.match(/^([^=]+)=([^;]+)/);
              if (cookieMatch && cookieMatch[1] && cookieMatch[2]) {
                const cookieName = cookieMatch[1];
                const cookieValue = cookieMatch[2];
                cookieStore.push(`${cookieName}=${cookieValue}`);
                
                if (cookieName === "_csrf") {
                  csrfToken = cookieValue;
                  console.log("✅ CSRF token extracted:", csrfToken.substring(0, 10) + "...");
                } else {
                  console.log(`✅ Cookie extracted: ${cookieName}=${cookieValue.substring(0, 10)}...`);
                }
              }
            });
          }
        }
      } catch (error) {
        console.log("⚠️ getSetCookie() not available, using fallback method");
      }
      
      // Fallback: try to get from single Set-Cookie header
      if (!csrfToken) {
        const setCookieHeader = csrfResponse.headers.get("set-cookie");
        if (setCookieHeader) {
          console.log("🍪 Fallback: Set-Cookie header received:", setCookieHeader);
          const csrfMatch = setCookieHeader.match(/_csrf=([^;]+)/);
          if (csrfMatch && csrfMatch[1]) {
            csrfToken = csrfMatch[1];
            cookieStore.push(`_csrf=${csrfToken}`);
            console.log("✅ CSRF token extracted (fallback):", csrfToken.substring(0, 10) + "...");
          }
          
          // Also extract other cookies
          const allCookies = setCookieHeader.split(",");
          allCookies.forEach((cookie) => {
            const match = cookie.match(/([^=]+)=([^;]+)/);
            if (match && match[1] !== "_csrf") {
              cookieStore.push(`${match[1]}=${match[2]}`);
            }
          });
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

    // Add CSRF token in multiple formats (try all common variations)
    if (csrfToken) {
      headers["X-CSRF-Token"] = csrfToken;
      headers["X-Csrf-Token"] = csrfToken;
      headers["CSRF-Token"] = csrfToken;
      headers["X-XSRF-Token"] = csrfToken;
      console.log("✅ Adding CSRF token headers (multiple variations)");
      console.log("🔑 CSRF token value:", csrfToken);
    }

    // Add cookies if we have them (critical for CSRF validation)
    if (cookieStore.length > 0) {
      headers["Cookie"] = cookieStore.join("; ");
      console.log("✅ Adding Cookie header:", headers["Cookie"]);
    }

    // Step 3: Send POST request with CSRF token
    console.log("📤 Step 2: Sending POST request with CSRF token...");
    console.log("📋 Request headers:", JSON.stringify(headers, null, 2));
    
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

