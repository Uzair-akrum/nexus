export class RedditError extends Error {
  constructor(
    message: string,
    public type: 'VALIDATION_ERROR' | 'API_ERROR' | 'AUTH_ERROR' = 'API_ERROR'
  ) {
    super(message);
    this.name = 'RedditError';
  }
} 