import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { generateState, signState, buildRedditAuthUrl } from '@/lib/oauth'

export async function GET() {
  try {
    // Generate state parameter for CSRF protection
    const state = generateState()
    const stateSignature = signState(state)

    // Store state in secure cookie
    const cookieStore = await cookies()
    cookieStore.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600 // 10 minutes
    })

    cookieStore.set('oauth_state_signature', stateSignature, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600 // 10 minutes
    })

    // Build Reddit authorization URL
    const clientId = process.env.REDDIT_CLIENT_ID!
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/reddit/callback`
    const authUrl = buildRedditAuthUrl(clientId, redirectUri, state)

    // Redirect to Reddit
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('OAuth initiation error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/credentials?error=oauth_init_failed`
    )
  }
} 