import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Extract client IP for testing
    const clientIp = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    request.ip || 
                    '127.0.0.1';
    
    // Test geo lookup
    const geoResponse = await fetch(`http://ip-api.com/json/${clientIp}?fields=status,country,countryCode,region,regionName,city,lat,lon,timezone,zip`);
    const geoData = await geoResponse.json();
    
    return NextResponse.json({
      success: true,
      clientIp,
      geoData,
      message: 'Geo tracking test successful'
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Geo tracking test failed'
    }, { status: 500 });
  }
}
