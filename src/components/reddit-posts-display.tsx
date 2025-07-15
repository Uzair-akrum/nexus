import { ExternalLink, MessageSquare, ArrowUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RedditPost {
  title: string;
  subreddit: string;
  url: string;
  score: number;
  numComments: number;
  createdUtc: number;
  summary: string;
  id: string;
}

interface RedditPostsDisplayProps {
  posts: RedditPost[];
}

export function RedditPostsDisplay({ posts }: RedditPostsDisplayProps) {
  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now() / 1000;
    const diff = now - timestamp;

    if (diff < 3600) {
      return `${Math.floor(diff / 60)}m ago`;
    } else if (diff < 86400) {
      return `${Math.floor(diff / 3600)}h ago`;
    } else {
      return `${Math.floor(diff / 86400)}d ago`;
    }
  };

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-4">
        No Reddit posts found
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <Card key={post.id} className="border-border/50">
          <CardContent className="p-4">
            <div className="space-y-2">
              {/* Header with subreddit and time */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  r/{post.subreddit}
                </Badge>
                <span>{formatTimeAgo(post.createdUtc)}</span>
              </div>

              {/* Title */}
              <h3 className="font-medium text-sm leading-tight">
                {post.title}
              </h3>

              {/* Summary if available */}
              {post.summary && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {post.summary}
                </p>
              )}

              {/* Footer with stats and link */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <ArrowUp className="w-3 h-3" />
                    <span>{post.score}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    <span>{post.numComments}</span>
                  </div>
                </div>
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  View
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 