import { RedditError } from './reddit-error';

// Development-only mock function to avoid Supabase dependency
async function getDevRedditCredentials(userId: string) {
  if (process.env.NODE_ENV !== 'production' && process.env.DEV_REDDIT_ACCESS_TOKEN) {
    return {
      access_token: process.env.DEV_REDDIT_ACCESS_TOKEN,
      refresh_token: process.env.DEV_REDDIT_REFRESH_TOKEN || '',
      expires_at: null,
      scopes: ['identity', 'read', 'modposts'],
      service: 'reddit',
      user_id: userId,
      id: 0,
      created_at: new Date().toISOString()
    };
  }
  return null;
}

export class RedditBaseService {
  protected async redditFetch<T>(
    endpoint: string,
    options: RequestInit = {},
    userId?: string
  ): Promise<T> {
    let userIdToUse = userId;

    // In development, skip auth check if userId is provided
    if (!userIdToUse && process.env.NODE_ENV !== 'production') {
      userIdToUse = process.env.DEV_USER_ID || 'dev-user';
    } else if (!userIdToUse) {
      // In production, import and use auth
      const { auth } = await import('@/auth');
      const session = await auth();
      if (!session?.user?.id) {
        throw new RedditError('User not authenticated', 'AUTH_ERROR');
      }
      userIdToUse = session.user.id;
    }

    // In development, use mock credentials to avoid database dependency
    let credentials = null;
    if (process.env.NODE_ENV !== 'production') {
      credentials = await getDevRedditCredentials(userIdToUse);
    } else {
      // In production, import and use the real function
      const { getUserRedditCredentials } = await import('@/lib/reddit');
      credentials = await getUserRedditCredentials(userIdToUse);
    }

    if (!credentials) {
      throw new RedditError('Reddit credentials not found', 'AUTH_ERROR');
    }

    const response = await fetch(`https://oauth.reddit.com${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${credentials.access_token}`,
        'User-Agent': 'Nexus App 1.0',
        'Content-Type': 'application/x-www-form-urlencoded',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new RedditError(`Reddit API error: ${response.status}`, 'API_ERROR');
    }

    return response.json();
  }
} 