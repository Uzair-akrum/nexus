# NextAuth.js Authentication Setup Guide

This guide will help you set up the complete NextAuth.js authentication system in your Next.js application using Supabase as the database.

## Features Implemented

- ✅ Email/Password authentication with secure password hashing
- ✅ Google OAuth authentication
- ✅ Protected routes and pages
- ✅ Custom sign-in and sign-up pages
- ✅ Error handling and custom error pages
- ✅ Session management
- ✅ Database integration with Supabase
- ✅ Responsive UI with Tailwind CSS

## Prerequisites

- Node.js 18+ installed
- A Supabase project set up
- Google OAuth credentials (optional, for Google sign-in)

## Installation Steps

### 1. Install Dependencies

```bash
npm install next-auth@beta @auth/core bcryptjs
npm install -D @types/bcryptjs
```

### 2. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key

# NextAuth.js Configuration
AUTH_SECRET=your-super-secret-auth-secret-string
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (Optional)
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
```

**Generate AUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Database Setup

Run the SQL schema in your Supabase database:

```sql
-- Enable the pgsodium extension for encryption
CREATE EXTENSION IF NOT EXISTS pgsodium;

-- Create users table for NextAuth.js
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    image TEXT,
    email_verified TIMESTAMPTZ,
    hashed_password TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own profile"
ON public.users
FOR ALL
USING (auth.uid() = id);

-- Create indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_id ON public.users(id);
```

### 4. Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Create credentials (OAuth 2.0 Client ID)
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)

## File Structure

The implementation creates the following files:

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   └── signup/
│   │       └── route.ts
│   ├── auth/
│   │   └── error/
│   │       └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── signin/
│   │   └── page.tsx
│   ├── signup/
│   │   └── page.tsx
│   └── layout.tsx
├── components/
│   └── providers/
│       └── SessionProvider.tsx
├── lib/
│   └── supabase.ts
└── auth.ts
```

## Usage Examples

### Protecting Pages

```typescript
// app/protected-page/page.tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function ProtectedPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/signin")
  }
  
  return <div>Protected content</div>
}
```

### Client-Side Session Access

```typescript
"use client"
import { useSession } from "next-auth/react"

export default function ClientComponent() {
  const { data: session, status } = useSession()
  
  if (status === "loading") return <div>Loading...</div>
  if (!session) return <div>Not authenticated</div>
  
  return <div>Welcome {session.user.email}</div>
}
```

### Sign Out

```typescript
import { signOut } from "@/auth"

// Server action
async function handleSignOut() {
  "use server"
  await signOut({ redirectTo: "/" })
}

// Client-side
import { signOut } from "next-auth/react"

function SignOutButton() {
  return (
    <button onClick={() => signOut()}>
      Sign Out
    </button>
  )
}
```

## API Routes

### Authentication
- `GET/POST /api/auth/signin` - Sign in page
- `GET/POST /api/auth/signup` - Sign up page
- `GET/POST /api/auth/signout` - Sign out
- `GET/POST /api/auth/callback/[provider]` - OAuth callbacks

### Custom Routes
- `POST /api/signup` - Create new user with email/password

## Pages

### Public Pages
- `/signin` - Sign in page
- `/signup` - Sign up page
- `/auth/error` - Authentication error page

### Protected Pages
- `/dashboard` - Main dashboard (requires authentication)

## Security Features

1. **Password Hashing**: Uses bcrypt with salt rounds
2. **CSRF Protection**: Built-in with NextAuth.js
3. **Row Level Security**: Supabase RLS policies
4. **Secure Cookies**: HTTP-only, secure cookies
5. **Session Management**: JWT-based sessions

## Customization

### Styling
The pages use Tailwind CSS classes. You can customize the appearance by modifying the className attributes in the components.

### Callbacks
Modify the callbacks in `auth.ts` to customize user data handling:

```typescript
callbacks: {
  async signIn({ user, account, profile }) {
    // Custom sign-in logic
    return true
  },
  async session({ session, token }) {
    // Custom session data
    return session
  }
}
```

## Troubleshooting

### Common Issues

1. **Module not found errors**: Install the missing dependencies
2. **Authentication not working**: Check environment variables
3. **Database connection issues**: Verify Supabase credentials
4. **Google OAuth errors**: Check redirect URIs and credentials

### Debug Mode
Add this to your `auth.ts` for debugging:

```typescript
export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: process.env.NODE_ENV === "development",
  // ... rest of config
})
```

## Production Deployment

1. Update `NEXTAUTH_URL` to your production domain
2. Update Google OAuth redirect URIs
3. Ensure all environment variables are set in your hosting platform
4. Apply the database schema to your production Supabase instance

## Next Steps

- Add email verification
- Implement password reset functionality
- Add more OAuth providers
- Implement role-based access control
- Add user profile management

## Support

For issues and questions:
- Check the [NextAuth.js documentation](https://next-auth.js.org/)
- Review the [Supabase documentation](https://supabase.com/docs)
- Check the implementation files for examples 