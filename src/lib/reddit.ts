import { supabase } from './supabase'
import { type UserCredentials } from './supabase'

// Check if user has Reddit credentials
export async function getUserRedditCredentials(userId: string): Promise<UserCredentials | null> {
  try {
    const { data, error } = await supabase
      .from('user_credentials')
      .select('*')
      .eq('user_id', userId)
      .eq('service', 'reddit')
      .single()

    if (error) {
      console.error('Error fetching Reddit credentials:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching Reddit credentials:', error)
    return null
  }
}

// Check if Reddit tokens are still valid
export function isTokenValid(credentials: UserCredentials): boolean {
  if (!credentials.expires_at) return true // No expiration set

  const expiresAt = new Date(credentials.expires_at)
  const now = new Date()

  // Consider token expired if it expires within the next 5 minutes
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000)

  return expiresAt > fiveMinutesFromNow
}

// Make authenticated request to Reddit API
export async function makeRedditRequest(
  credentials: UserCredentials,
  endpoint: string,
  options?: RequestInit
): Promise<Response> {
  const headers = {
    'Authorization': `Bearer ${credentials.access_token}`,
    'User-Agent': 'Nexus App 1.0',
    ...options?.headers
  }

  return fetch(`https://oauth.reddit.com${endpoint}`, {
    ...options,
    headers
  })
}

// Get Reddit user info
export async function getRedditUserInfo(credentials: UserCredentials) {
  try {
    const response = await makeRedditRequest(credentials, '/api/v1/me')

    if (!response.ok) {
      throw new Error('Failed to fetch Reddit user info')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching Reddit user info:', error)
    return null
  }
} 