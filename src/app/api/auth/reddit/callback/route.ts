import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { exchangeCodeForTokens, verifyState, calculateExpiresAt } from '@/lib/oauth'
import { createSupabaseServiceClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/signin`)
  }

  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?error=oauth_denied`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?error=invalid_callback`)
  }

  try {
    // Verify state parameter
    const [stateValue, signature] = state.split('.')
    if (!verifyState(stateValue, signature)) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?error=invalid_state`)
    }

    // Exchange code for tokens
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/reddit/callback`
    const tokens = await exchangeCodeForTokens(
      code,
      redirectUri,
      process.env.REDDIT_CLIENT_ID!,
      process.env.REDDIT_CLIENT_SECRET!
    )

    // Calculate expiration
    const expiresAt = calculateExpiresAt(tokens.expires_in)

    // Store credentials in database
    const supabase = createSupabaseServiceClient()

    // Check if credential already exists
    const { data: existing } = await supabase
      .from('service_credentials')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('service_name', 'reddit_trigger')
      .single()

    const credentialData = {
      user_id: session.user.id,
      service_name: 'reddit_trigger',
      credentials: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt.toISOString(),
        scope: tokens.scope
      }
    }

    if (existing) {
      // Update existing credential
      await supabase
        .from('service_credentials')
        .update({
          credentials: credentialData.credentials,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
    } else {
      // Create new credential
      await supabase
        .from('service_credentials')
        .insert([credentialData])
    }

    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?success=reddit_connected`)
  } catch (error) {
    console.error('Reddit OAuth callback error:', error)
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?error=oauth_failed`)
  }
} 