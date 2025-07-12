import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const supabase = createSupabaseServerClient(request)
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Delete Reddit credentials
    const { error: deleteError } = await supabase
      .from('user_credentials')
      .delete()
      .eq('user_id', user.id)
      .eq('service', 'reddit')

    if (deleteError) {
      console.error('Error deleting Reddit credentials:', deleteError)
      return NextResponse.json(
        { error: 'Failed to disconnect Reddit account' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Disconnect error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 