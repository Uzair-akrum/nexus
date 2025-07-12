"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Home, ArrowLeft } from "lucide-react"
import Link from "next/link"

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const errorMessages: { [key: string]: string } = {
    CredentialsSignin: "Invalid email or password. Please try again.",
    OAuthAccountNotLinked: "This email is already linked with another provider. Please sign in with the original method.",
    OAuthSignin: "There was an issue signing in with your OAuth provider.",
    OAuthCallback: "There was an issue with the OAuth callback.",
    OAuthCreateAccount: "Could not create OAuth account.",
    EmailCreateAccount: "Could not create email account.",
    Callback: "There was an issue with the authentication callback.",
    OAuthAccountAlreadyLinked: "This account is already linked with another provider.",
    EmailSignin: "Check your email address.",
    CredentialsSignup: "Check your details.",
    SessionRequired: "Please sign in to access this page.",
    default: "An authentication error occurred. Please try again.",
  }

  const message = error ? (errorMessages[error] || errorMessages.default) : errorMessages.default

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header with Nexus branding */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="text-3xl font-bold font-[family-name:var(--font-geist-sans)] text-foreground">
              Nexus
            </div>
            <div className="w-2 h-2 bg-primary rounded-full"></div>
          </div>

          <h2 className="text-2xl font-bold font-[family-name:var(--font-geist-sans)] text-foreground mb-2">
            Authentication Error
          </h2>
          <p className="text-muted-foreground font-[family-name:var(--font-inter)]">
            Something went wrong during authentication
          </p>
        </div>

        <Card className="border-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-[family-name:var(--font-geist-sans)] text-destructive flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Authentication Failed
            </CardTitle>
            <CardDescription className="font-[family-name:var(--font-inter)]">
              We encountered an issue while trying to authenticate you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-destructive mb-1">
                    Error Details
                  </h3>
                  <p className="text-sm text-destructive/80">
                    {message}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button asChild className="w-full">
                <Link href="/signup">
                  Create Account
                </Link>
              </Button>

              <Button variant="outline" asChild className="w-full">
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Return to Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground font-[family-name:var(--font-inter)]">
            Need help? Contact our support team for assistance.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="text-2xl font-bold font-[family-name:var(--font-geist-sans)] text-foreground">
              Nexus
            </div>
            <div className="w-2 h-2 bg-primary rounded-full"></div>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
} 