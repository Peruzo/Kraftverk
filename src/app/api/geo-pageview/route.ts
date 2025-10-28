import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Simple geo lookup function (you can replace with MaxMind GeoIP2 or IP-API.com)
async function getGeoData(ip: string) {
  try {
    // For demo purposes, we'll use a simple IP-API.com call
    // In production, you should use MaxMind GeoIP2 or your preferred service
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,region,regionName,city,lat,lon,timezone,zip`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return {
        country: data.country,
        countryCode: data.countryCode,
        region: data.regionName,
        regionCode: data.region,
        city: data.city,
        latitude: data.lat,
        longitude: data.lon,
        timezone: data.timezone,
        postalCode: data.zip
      };
    }
  } catch (error) {
    console.error('Geo lookup error:', error);
  }
  
  // Fallback to Sweden/Stockholm for demo
  return {
    country: "Sweden",
    countryCode: "SE",
    region: "Stockholm",
    regionCode: "AB",
    city: "Stockholm",
    latitude: 59.3293,
    longitude: 18.0686,
    timezone: "Europe/Stockholm",
    postalCode: null
  };
}

// Generate HMAC signature for authentication
function generateHMACSignature(payload: any, secret: string = process.env.ANALYTICS_SECRET || 'default-secret') {
  const payloadString = JSON.stringify(payload);
  return crypto.createHmac('sha256', secret).update(payloadString).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Extract client IP
    const clientIp = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    request.ip || 
                    '127.0.0.1';
    
    // Get geo data
    const geoData = await getGeoData(clientIp);
    
    // Prepare page view payload
    const payload = {
      url: body.url || request.url,
      path: body.path || new URL(request.url).pathname,
      timestamp: new Date().toISOString(),
      tenant: 'kraftverk',
      
      geo: {
        country: geoData.country,
        countryCode: geoData.countryCode,
        region: geoData.region,
        regionCode: geoData.regionCode,
        city: geoData.city,
        latitude: geoData.latitude,
        longitude: geoData.longitude,
        timezone: geoData.timezone,
        postalCode: geoData.postalCode
      },
      
      referrer: body.referrer || request.headers.get('referer') || null,
      userAgent: body.userAgent || request.headers.get('user-agent') || null,
      screenWidth: body.screenWidth || null,
      screenHeight: body.screenHeight || null
    };
    
    console.log('🌍 Geo page view data:', payload);
    
    // Send to your analytics endpoint
    const analyticsResponse = await fetch('https://source-database.onrender.com/api/statistics/track-pageview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant': 'kraftverk',
        'x-signature': generateHMACSignature(payload)
      },
      body: JSON.stringify(payload)
    });
    
    if (analyticsResponse.ok) {
      const result = await analyticsResponse.json();
      console.log('✅ Geo page view tracked successfully:', result);
      return NextResponse.json({ success: true, result });
    } else {
      const errorText = await analyticsResponse.text();
      console.error('❌ Geo page view tracking failed:', analyticsResponse.status, errorText);
      return NextResponse.json({ 
        success: false, 
        error: 'Analytics tracking failed',
        details: errorText 
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Geo page view error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
