import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    const { pathname, search } = request.nextUrl
    const publicRoutes = ['/auth/sign-in', '/auth/sign-up', '/auth/callback']
    const isPublic = publicRoutes.some((route) => pathname.startsWith(route))
    const isSignOutRoute = pathname.startsWith('/auth/sign-out')

    const { response, user, supabaseConfigured } = await updateSession(request)

    if (supabaseConfigured && user && isPublic) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    if (supabaseConfigured && !user && !isPublic && !isSignOutRoute) {
        const redirectTo = encodeURIComponent(pathname + search)
        const signInUrl = new URL(`/auth/sign-in?redirectTo=${redirectTo}`, request.url)
        return NextResponse.redirect(signInUrl)
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
