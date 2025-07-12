import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { buildRedditAuthUrl, generateState, signState } from '@/lib/oauth'

export async function GET(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const state = generateState()
    const signature = signState(state)
    const stateParam = `${state}.${signature}`

    const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/reddit/callback`
    const clientId = process.env.REDDIT_CLIENT_ID

    // Debug logging
    console.log('Reddit OAuth Debug:', {
      clientId: clientId ? '[REDACTED]' : 'NOT SET',
      redirectUri,
      hasStateSecret: !!process.env.OAUTH_STATE_SECRET,
      nodeEnv: process.env.NODE_ENV
    })

    if (!clientId) {
      console.error('REDDIT_CLIENT_ID environment variable is not set')
      return NextResponse.json({
        error: 'Reddit client ID not configured. Please set REDDIT_CLIENT_ID in your environment variables.'
      }, { status: 500 })
    }

    const authUrl = buildRedditAuthUrl(clientId, redirectUri, stateParam)

    // Log the actual URL being generated (for debugging)
    console.log('Generated Reddit auth URL:', authUrl)

    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('Reddit OAuth initiation error:', error)
    return NextResponse.json({ error: 'OAuth initiation failed' }, { status: 500 })
  }
} 