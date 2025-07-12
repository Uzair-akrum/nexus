import { createHmac, randomBytes } from 'crypto'

// Generate a secure state parameter for OAuth
export function generateState(): string {
  return randomBytes(32).toString('hex')
}

// Sign state with HMAC for security
export function signState(state: string): string {
  const secret = process.env.OAUTH_STATE_SECRET!
  const hmac = createHmac('sha256', secret)
  hmac.update(state)
  return hmac.digest('hex')
}

// Verify state signature
export function verifyState(state: string, signature: string): boolean {
  const expected = signState(state)
  return expected === signature
}

// Reddit OAuth configuration
export const REDDIT_CONFIG = {
  authUrl: 'https://www.reddit.com/api/v1/authorize',
  tokenUrl: 'https://www.reddit.com/api/v1/access_token',
  scopes: ['identity', 'read', 'history', 'mysubreddits'],
  duration: 'permanent'
}

// Build Reddit authorization URL
export function buildRedditAuthUrl(
  clientId: string,
  redirectUri: string,
  state: string
): string {
  // Debug logging
  console.log('buildRedditAuthUrl called with:', {
    clientId: clientId ? `${clientId.substring(0, 8)}...` : 'MISSING',
    redirectUri,
    state: state ? `${state.substring(0, 16)}...` : 'MISSING',
    duration: REDDIT_CONFIG.duration,
    scopes: REDDIT_CONFIG.scopes
  })

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    state: state,
    redirect_uri: redirectUri,
    duration: REDDIT_CONFIG.duration,
    scope: REDDIT_CONFIG.scopes.join(' ')
  })

  const url = `${REDDIT_CONFIG.authUrl}?${params.toString()}`
  console.log('Final URL params:', Object.fromEntries(params.entries()))

  return url
}

// Exchange authorization code for tokens
export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string,
  clientId: string,
  clientSecret: string
): Promise<{
  access_token: string
  refresh_token: string
  expires_in: number
  scope: string
}> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: redirectUri
  })

  const response = await fetch(REDDIT_CONFIG.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'User-Agent': 'Nexus App OAuth 1.0'
    },
    body: body.toString()
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Token exchange failed: ${error}`)
  }

  const data = await response.json()
  return data
}

// Calculate expiration timestamp
export function calculateExpiresAt(expiresIn: number): Date {
  return new Date(Date.now() + expiresIn * 1000)
} 