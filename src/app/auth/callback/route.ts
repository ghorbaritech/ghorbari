import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'
  const origin = requestUrl.origin

  console.log('Auth Callback initiated:', { origin, next, hasCode: !!code })

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth Callback: Error exchanging code for session:', error.message)
      // Redirect to a friendly error page or back to login with error
      return NextResponse.redirect(`${origin}/partner?error=auth_callback_failure&message=${encodeURIComponent(error.message)}`)
    }

    console.log('Auth Callback: Successfully exchanged code for session')

    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'

    let redirectUrl = `${origin}${next}`

    if (isLocalEnv) {
      redirectUrl = `${origin}${next}`
    } else if (forwardedHost) {
      redirectUrl = `https://${forwardedHost}${next}`
    }

    console.log('Auth Callback: Redirecting to:', redirectUrl)
    return NextResponse.redirect(redirectUrl)
  }

  console.error('Auth Callback: No code found in search params')
  return NextResponse.redirect(`${origin}/partner?error=no_auth_code`)
}
