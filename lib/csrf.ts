/**
 * Mohawk Medibles — CSRF Protection
 * ═══════════════════════════════════
 * Double-submit cookie pattern for CSRF protection.
 * The server sets a random CSRF token in a cookie, and the client
 * must include it in requests via X-CSRF-Token header.
 *
 * Usage in API routes:
 *   const csrfError = verifyCsrf(req);
 *   if (csrfError) return csrfError;
 */

import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual, randomBytes } from "crypto";

const CSRF_COOKIE = "mm-csrf";
const CSRF_HEADER = "x-csrf-token";

/**
 * Generate a new CSRF token and set it as a cookie on a response.
 */
export function setCsrfCookie(response: NextResponse): NextResponse {
    const token = randomBytes(32).toString("hex");
    response.cookies.set(CSRF_COOKIE, token, {
        httpOnly: false, // Client JS needs to read this to send as header
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24, // 1 day
    });
    return response;
}

/**
 * Verify CSRF token: cookie value must match X-CSRF-Token header.
 * Returns a 403 NextResponse on failure, or null on success.
 */
export function verifyCsrf(req: NextRequest): NextResponse | null {
    // Skip CSRF in development for easier testing
    if (process.env.NODE_ENV === "development" && !process.env.ENFORCE_CSRF) {
        return null;
    }

    const cookieToken = req.cookies.get(CSRF_COOKIE)?.value;
    const headerToken = req.headers.get(CSRF_HEADER);

    if (!cookieToken || !headerToken) {
        return NextResponse.json(
            { error: "Missing CSRF token" },
            { status: 403 }
        );
    }

    if (cookieToken.length !== headerToken.length) {
        return NextResponse.json(
            { error: "Invalid CSRF token" },
            { status: 403 }
        );
    }

    const valid = timingSafeEqual(
        Buffer.from(cookieToken),
        Buffer.from(headerToken)
    );

    if (!valid) {
        return NextResponse.json(
            { error: "Invalid CSRF token" },
            { status: 403 }
        );
    }

    return null;
}
