import { RedditBaseService } from './reddit-base';
import { RedditError } from './reddit-error';

export class RedditSubredditService extends RedditBaseService {
  public async moderateSub(params: {
    subreddit: string;
    action: 'remove_post' | 'ban_user' | 'approve_post';
    id?: string;
    user?: string;
    reason?: string
  }, userId?: string): Promise<{ success: boolean }> {
    const { subreddit, action, id, user, reason = '' } = params;

    let endpoint: string;
    const formData = new URLSearchParams({ sr: subreddit });

    switch (action) {
      case 'remove_post':
        if (!id) throw new RedditError('Post ID required', 'VALIDATION_ERROR');
        endpoint = '/api/remove';
        formData.append('id', id);
        formData.append('spam', 'false');  // Or true if spamming
        formData.append('reason', reason);
        break;
      case 'ban_user':
        if (!user) throw new RedditError('User required', 'VALIDATION_ERROR');
        endpoint = '/api/friend';  // Bans use friend with type='banned'
        formData.append('name', user);
        formData.append('type', 'banned');
        formData.append('ban_reason', reason);
        break;
      case 'approve_post':
        if (!id) throw new RedditError('Post ID required', 'VALIDATION_ERROR');
        endpoint = '/api/approve';
        formData.append('id', id);
        break;
      default:
        throw new RedditError('Invalid action', 'VALIDATION_ERROR');
    }

    const response = await this.redditFetch<{ success: boolean }>(endpoint, {
      method: 'POST',
      body: formData,
    }, userId);

    return response;
  }
} 