import { tool } from 'ai';
import { z } from 'zod';
import { RedditSubredditService } from '@/lib/services/reddit-subreddit-service';
import { RedditError } from '@/lib/services/reddit-error';

export const redditModerateSub = tool({
  description: 'Perform moderation actions on a subreddit including removing posts, banning users, or approving posts. Requires Reddit moderator authentication.',
  parameters: z.object({
    subreddit: z.string().describe('Subreddit name (without r/)'),
    action: z.enum(['remove_post', 'ban_user', 'approve_post']).describe('Moderation action to perform'),
    id: z.string().optional().describe('Post ID (required for remove_post and approve_post actions)'),
    user: z.string().optional().describe('Username (required for ban_user action)'),
    reason: z.string().optional().describe('Reason for the moderation action'),
  }),
  execute: async ({ subreddit, action, id, user, reason = '' }) => {
    try {
      const subredditService = new RedditSubredditService();
      const result = await subredditService.moderateSub({
        subreddit,
        action,
        id,
        user,
        reason,
      });

      if (result.success) {
        let message: string;
        switch (action) {
          case 'remove_post':
            message = `Post ${id} removed from r/${subreddit}${reason ? ` (Reason: ${reason})` : ''}`;
            break;
          case 'ban_user':
            message = `User ${user} banned from r/${subreddit}${reason ? ` (Reason: ${reason})` : ''}`;
            break;
          case 'approve_post':
            message = `Post ${id} approved in r/${subreddit}`;
            break;
        }

        return {
          success: true,
          message,
          action,
          subreddit,
        };
      } else {
        return {
          success: false,
          error: `Failed to perform ${action} on r/${subreddit}`,
        };
      }
    } catch (error) {
      if (error instanceof RedditError) {
        return {
          success: false,
          error: error.message,
          type: error.type,
        };
      }

      return {
        success: false,
        error: `An unexpected error occurred while performing ${action}`,
      };
    }
  },
}); 