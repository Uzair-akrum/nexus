import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createSupabaseServiceClient } from '@/lib/supabase'

// Get user's service credentials
export async function GET(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createSupabaseServiceClient()

    const { data: credentials, error } = await supabase
      .from('service_credentials')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching service credentials:', error)
      return NextResponse.json({ error: 'Failed to fetch credentials' }, { status: 500 })
    }

    // Don't expose sensitive tokens in response
    const sanitizedCredentials = credentials.map(cred => ({
      ...cred,
      credentials: {
        ...cred.credentials,
        access_token: cred.credentials.access_token ? '[REDACTED]' : undefined,
        refresh_token: cred.credentials.refresh_token ? '[REDACTED]' : undefined,
        bot_token: cred.credentials.bot_token ? '[REDACTED]' : undefined,
        channel_id: cred.credentials.channel_id
      }
    }))

    return NextResponse.json(sanitizedCredentials)
  } catch (error) {
    console.error('Error in services GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Create or update service credential
export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { service_name, credentials } = await request.json()

    if (!service_name || !credentials) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate Discord credentials
    if (service_name === 'discord_action') {
      const { bot_token, channel_id } = credentials
      if (!bot_token || !channel_id) {
        return NextResponse.json({
          error: 'Discord bot token and channel ID are required'
        }, { status: 400 })
      }

      // Basic validation for Discord bot token format
      if (!bot_token.match(/^[A-Za-z0-9._-]+$/)) {
        return NextResponse.json({
          error: 'Invalid Discord bot token format'
        }, { status: 400 })
      }

      // Basic validation for Discord channel ID format
      if (!channel_id.match(/^\d+$/)) {
        return NextResponse.json({
          error: 'Invalid Discord channel ID format'
        }, { status: 400 })
      }
    }

    const supabase = createSupabaseServiceClient()

    // Check if credential already exists
    const { data: existing } = await supabase
      .from('service_credentials')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('service_name', service_name)
      .single()

    const credentialData = {
      user_id: session.user.id,
      service_name,
      credentials
    }

    if (existing) {
      // Update existing credential
      const { error } = await supabase
        .from('service_credentials')
        .update({
          credentials,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)

      if (error) {
        console.error('Error updating service credential:', error)
        return NextResponse.json({ error: 'Failed to update credential' }, { status: 500 })
      }
    } else {
      // Create new credential
      const { error } = await supabase
        .from('service_credentials')
        .insert([credentialData])

      if (error) {
        console.error('Error creating service credential:', error)
        return NextResponse.json({ error: 'Failed to create credential' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in services POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Delete service credential
export async function DELETE(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const service_name = searchParams.get('service_name')

    if (!service_name) {
      return NextResponse.json({ error: 'Service name is required' }, { status: 400 })
    }

    const supabase = createSupabaseServiceClient()

    const { error } = await supabase
      .from('service_credentials')
      .delete()
      .eq('user_id', session.user.id)
      .eq('service_name', service_name)

    if (error) {
      console.error('Error deleting service credential:', error)
      return NextResponse.json({ error: 'Failed to delete credential' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in services DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 