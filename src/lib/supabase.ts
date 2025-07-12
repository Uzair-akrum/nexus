import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { NextRequest } from 'next/server'

// Client-side Supabase client
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Server-side Supabase client for API routes
export function createSupabaseServerClient(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        },
      },
    }
  )
}

// Service client for server-side operations (bypasses RLS)
export const createSupabaseServiceClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// Types for our database schema
export interface UserCredentials {
  id: number
  user_id: string
  service: string
  access_token: string
  refresh_token: string | null
  scopes: string[]
  expires_at: string | null
  created_at: string
}

// New ServiceCredential table schema
export interface ServiceCredential {
  id: number
  user_id: string
  service_name: string // e.g., 'reddit_trigger', 'discord_action'
  credentials: {
    access_token?: string
    refresh_token?: string
    expires_at?: string
    bot_token?: string
    channel_id?: string
    [key: string]: string | number | boolean | undefined
  }
  created_at: string
  updated_at: string
}

// New UserWorkflow table schema
export interface UserWorkflow {
  id: number
  user_id: string
  name: string
  config: {
    trigger: {
      service: string
      query?: string
      subreddit?: string
      [key: string]: string | number | boolean | undefined
    }
    filter: {
      prompt: string
      enabled: boolean
    }
    action: {
      service: string
      channel_id?: string
      [key: string]: string | number | boolean | undefined
    }
  }
  status: 'active' | 'paused' | 'draft'
  created_at: string
  updated_at: string
  last_run?: string
  total_runs: number
} 