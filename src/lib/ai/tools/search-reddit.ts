import { tool } from 'ai';
import { z } from 'zod';

export const searchReddit = tool({
  description: 'Search Reddit posts by query, optionally within a specific subreddit. After receiving the results, you MUST analyze and summarize the posts for the user in natural language. Never show the raw JSON data to users - always provide a helpful summary of what you found.',
  parameters: z.object({
    query: z.string().optional(),
    subreddit: z.string().optional(),
    limit: z.number().default(5),
  }),
  execute: async ({ query, subreddit, limit = 5 }) => {
    const baseUrl = 'https://www.reddit.com';

    // If no query is provided, get latest posts from subreddit or all of Reddit
    let endpoint: string;
    const params = new URLSearchParams();

    if (!query || query.trim() === '') {
      // Get latest posts from subreddit or all of Reddit
      endpoint = subreddit ? `/r/${subreddit}/new.json` : '/new.json';
      params.append('limit', limit.toString());
    } else {
      // Search with query
      endpoint = subreddit ? `/r/${subreddit}/search.json` : '/search.json';
      params.append('q', query);
      params.append('sort', 'new');
      params.append('limit', limit.toString());
      params.append('restrict_sr', subreddit ? 'true' : 'false');
    }

    const url = `${baseUrl}${endpoint}?${params.toString()}`;

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'RedditSearchTool/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status}`);
      }

      const text = await response.text();

      // Check if response is HTML (blocked by Reddit)
      if (text.includes('<html') || text.includes('<!DOCTYPE')) {
        return {
          posts: [],
          error: 'Reddit is currently blocking requests. This might be due to rate limiting or anti-bot measures. Please try again later or use a different approach to access Reddit content.'
        };
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        return {
          posts: [],
          error: 'Unable to parse Reddit response. The service might be temporarily unavailable.'
        };
      }

      // Extract relevant post data
      const posts = data.data?.children?.map((child: any) => ({
        title: child.data.title,
        subreddit: child.data.subreddit,
        url: `https://reddit.com${child.data.permalink}`,
        score: child.data.score,
        numComments: child.data.num_comments,
        createdUtc: child.data.created_utc,
        summary: child.data.selftext?.substring(0, 200) || '',
        id: child.data.id,
      })) || [];

      return { posts };
    } catch (error) {
      return {
        posts: [],
        error: `Failed to fetch Reddit data: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  },
}); 