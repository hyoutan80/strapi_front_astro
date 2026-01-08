import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const basicAuth = request.headers.get("authorization");

    if (basicAuth) {
        try {
            const authValue = basicAuth.split(" ")[1];
            const decoded = atob(authValue);
            const [user, password] = decoded.split(":");

            const validUser = process.env.BASIC_AUTH_USER;
            const validPassword = process.env.BASIC_AUTH_PASSWORD;

            if (user === validUser && password === validPassword) {
                return NextResponse.next();
            }

            console.log("Auth failed for user:", user);
        } catch (e) {
            console.error("Auth decoding failed", e);
        }
    }

    return new NextResponse("Authentication required", {
        status: 401,
        headers: {
            "WWW-Authenticate": 'Basic realm="Secure Area"',
        },
    });
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
