import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { createSupabaseServiceClient } from "@/lib/supabase"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null
        }

        const supabase = createSupabaseServiceClient()

        try {
          // Get user by email
          const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', credentials.email as string)
            .single()

          if (error || !user || !user.hashed_password) {
            console.log('User not found or no password:', { error, hasUser: !!user, hasPassword: !!user?.hashed_password })
            return null
          }

          const isValidPassword = await bcrypt.compare(
            credentials.password as string,
            user.hashed_password
          )

          if (!isValidPassword) {
            console.log('Invalid password for user:', user.email)
            return null
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
          }
        } catch (error) {
          console.error('Error in credentials authorize:', error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt", // Using JWT since we're not using Prisma adapter
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("signIn callback:", { user: user?.email, provider: account?.provider })

      if (account?.provider === "google") {
        const supabase = createSupabaseServiceClient()

        try {
          // Check if user exists
          const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('email', user.email)
            .single()

          if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows found
            console.error('Error fetching user:', fetchError)
            return false
          }

          if (!existingUser) {
            // Create new user
            const { data: newUser, error: insertError } = await supabase
              .from('users')
              .insert([
                {
                  email: user.email,
                  name: user.name,
                  image: user.image,
                  email_verified: new Date().toISOString(),
                },
              ])
              .select()
              .single()

            if (insertError) {
              console.error('Error creating user:', insertError)
              return false
            }

            // Set the user ID for the session
            user.id = newUser.id.toString()
          } else {
            // Set the user ID for the session
            user.id = existingUser.id.toString()
          }
        } catch (error) {
          console.error('Error in Google signIn callback:', error)
          return false
        }
      }

      return true
    },
    async session({ session, token }) {
      console.log("Session callback:", { hasToken: !!token, hasUser: !!session.user, tokenSub: token.sub })

      if (token.sub && session.user) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user, account }) {
      console.log("JWT callback:", { hasToken: !!token, hasUser: !!user, provider: account?.provider })

      if (user) {
        token.sub = user.id
      }
      return token
    },
    async redirect({ url, baseUrl }) {
      console.log("Redirect callback:", { url, baseUrl })

      // If url is relative, make it absolute
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }

      // If url is on the same domain, allow it
      if (url.startsWith(baseUrl)) {
        return url
      }

      // Default redirect to dashboard
      return `${baseUrl}/dashboard`
    },
  },
  pages: {
    signIn: "/signin",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === "development",
}) 