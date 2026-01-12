import { next } from '@vercel/edge';

export const config = {
    matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};

export default function middleware(request: Request) {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
        return new Response('Authentication required', {
            status: 401,
            headers: {
                'WWW-Authenticate': 'Basic realm="Secure Area"',
            },
        });
    }

    const [scheme, encoded] = authHeader.split(' ');

    if (scheme !== 'Basic' || !encoded) {
        return new Response('Invalid authentication', {
            status: 401,
            headers: {
                'WWW-Authenticate': 'Basic realm="Secure Area"',
            },
        });
    }

    const decoded = atob(encoded);
    const [user, pass] = decoded.split(':');

    const validUser = process.env.BASIC_AUTH_USER || 'admin';
    const validPass = process.env.BASIC_AUTH_PASS || 'password';

    if (user === validUser && pass === validPass) {
        return next();
    }

    return new Response('Invalid credentials', {
        status: 401,
        headers: {
            'WWW-Authenticate': 'Basic realm="Secure Area"',
        },
    });
}
