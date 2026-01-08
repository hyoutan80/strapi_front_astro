import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const basicAuth = request.headers.get("authorization");

    if (basicAuth) {
        const authValue = basicAuth.split(" ")[1];
        const [user, password] = atob(authValue).split(":");

        const validUser = process.env.BASIC_AUTH_USER;
        const validPassword = process.env.BASIC_AUTH_PASSWORD;

        if (user === validUser && password === validPassword) {
            return NextResponse.next();
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
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
