import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ExternalLink, Shield, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

function StatusMessage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const success = searchParams.success
  const error = searchParams.error

  if (success === 'reddit_connected') {
    return (
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <div>
          <h3 className="font-medium text-green-900">Reddit Connected Successfully</h3>
          <p className="text-sm text-green-700">Your Reddit account has been connected and is ready to use.</p>
        </div>
      </div>
    )
  }

  if (error) {
    const errorMessages = {
      oauth_init_failed: 'Failed to initiate OAuth flow',
      oauth_denied: 'OAuth authorization was denied',
      missing_parameters: 'Missing required parameters',
      invalid_state: 'Invalid state parameter - possible CSRF attack',
      not_authenticated: 'You must be logged in to connect accounts',
      storage_failed: 'Failed to store credentials',
      callback_failed: 'OAuth callback failed'
    }

    return (
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
        <XCircle className="w-5 h-5 text-red-600" />
        <div>
          <h3 className="font-medium text-red-900">Connection Failed</h3>
          <p className="text-sm text-red-700">
            {errorMessages[error as keyof typeof errorMessages] || 'An unknown error occurred'}
          </p>
        </div>
      </div>
    )
  }

  return null
}

export default function CredentialsPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Connect Services</h1>
          <p className="text-muted-foreground mt-2">
            Connect your external accounts to unlock powerful integrations and features.
          </p>
        </div>

        <Suspense fallback={null}>
          <StatusMessage searchParams={searchParams} />
        </Suspense>

        <div className="grid gap-6">
          {/* Reddit Connection Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <ExternalLink className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Reddit</CardTitle>
                    <CardDescription>
                      Connect your Reddit account to access your posts, comments, and more
                    </CardDescription>
                  </div>
                </div>
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <Link href="/api/auth/reddit/connect">
                    Connect Reddit
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Secure OAuth 2.0</p>
                    <p className="text-xs text-muted-foreground">
                      Your credentials are encrypted and stored securely
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Permissions</p>
                    <p className="text-xs text-muted-foreground">
                      This will request access to read your Reddit profile and content
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Future Services Placeholder */}
          <Card className="opacity-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    <ExternalLink className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">More Services</CardTitle>
                    <CardDescription>
                      Additional integrations coming soon
                    </CardDescription>
                  </div>
                </div>
                <Button disabled variant="outline">
                  Coming Soon
                </Button>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  )
} 