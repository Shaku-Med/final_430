import { NextRequest, NextResponse } from "next/server";

const RATE_LIMIT = 200;
const IP_REQUESTS = new Map<string, { count: number; lastRequest: number }>();

export function middleware(request: NextRequest | any) {
  try {
    const response = NextResponse.next();
    const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown';
    const now = Date.now();
    const requestInfo = IP_REQUESTS.get(ip) || { count: 0, lastRequest: now };

    if (now - requestInfo.lastRequest > 60000) {
      requestInfo.count = 0;
      requestInfo.lastRequest = now;
    }

    requestInfo.count++;
    IP_REQUESTS.set(ip, requestInfo);

    if (requestInfo.count > RATE_LIMIT) {
      return new NextResponse("Too many requests", { status: 429 });
    }

    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    return response;
  } catch {
    return NextResponse.rewrite(new URL('/account', request.url));
  }
}
