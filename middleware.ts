import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const publicRoutes = ['/login']
  const pathname = request.nextUrl.pathname
  const isPublicRoute = publicRoutes.includes(pathname)

  const copyCookies = (response: NextResponse) => {
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie)
    })

    return response
  }

  const redirectToLogin = (reason?: string) => {
    const url = new URL('/login', request.url)
    if (reason) {
      url.searchParams.set('error', reason)
    }

    return copyCookies(NextResponse.redirect(url))
  }

  const {
    data: { claims },
    error: claimsError,
  } = await supabase.auth.getClaims()
  const userId = typeof claims?.sub === 'string' ? claims.sub : null

  if (!userId || claimsError) {
    if (isPublicRoute) {
      return supabaseResponse
    }

    return redirectToLogin()
  }

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle()

  const profile = profileData as { role?: string } | null
  const isAdmin = !profileError && profile?.role === 'admin'

  if (isPublicRoute) {
    if (isAdmin) {
      return copyCookies(NextResponse.redirect(new URL('/', request.url)))
    }

    return supabaseResponse
  }

  if (!isAdmin) {
    return redirectToLogin('unauthorized')
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
