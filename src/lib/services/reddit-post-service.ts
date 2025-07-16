import { RedditBaseService } from './reddit-base';
import { RedditError } from './reddit-error';

export class RedditPostService extends RedditBaseService {
  public async removePost(params: {
    id: string;
    subreddit: string;
    asMod?: boolean;
    spam?: boolean
  }): Promise<{ success: boolean }> {
    const { id, subreddit, asMod = false, spam = false } = params;

    if (!id.match(/^t3_[a-z0-9]+$/i)) {
      throw new RedditError('Invalid post ID format (must be t3_...)', 'VALIDATION_ERROR');
    }

    const endpoint = asMod ? '/api/remove' : '/api/del'; // del for own, remove for mod
    const formData = new URLSearchParams({
      id,  // e.g., t3_abc123
      spam: spam.toString(),  // Only for mod remove
    });

    if (asMod) formData.append('sr', subreddit);  // Required for mod actions

    const response = await this.redditFetch<{ success: boolean }>(endpoint, {
      method: 'POST',
      body: formData,
    });

    return response;
  }
} 