import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createSupabaseServiceClient } from '@/lib/supabase'

// Get user's workflows
export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createSupabaseServiceClient()

    const { data: workflows, error } = await supabase
      .from('user_workflows')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching workflows:', error)
      return NextResponse.json({ error: 'Failed to fetch workflows' }, { status: 500 })
    }

    return NextResponse.json(workflows)
  } catch (error) {
    console.error('Error in workflows GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Create new workflow
export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { name, config } = await request.json()

    if (!name || !config) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate workflow configuration
    if (!config.trigger || !config.filter || !config.action) {
      return NextResponse.json({
        error: 'Workflow must have trigger, filter, and action'
      }, { status: 400 })
    }

    const supabase = createSupabaseServiceClient()

    const workflowData = {
      user_id: session.user.id,
      name,
      config,
      status: 'draft' as const,
      total_runs: 0
    }

    const { data: workflow, error } = await supabase
      .from('user_workflows')
      .insert([workflowData])
      .select()
      .single()

    if (error) {
      console.error('Error creating workflow:', error)
      return NextResponse.json({ error: 'Failed to create workflow' }, { status: 500 })
    }

    return NextResponse.json(workflow)
  } catch (error) {
    console.error('Error in workflows POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Update workflow
export async function PUT(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id, name, config, status } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Workflow ID is required' }, { status: 400 })
    }

    const supabase = createSupabaseServiceClient()

    const updateData: {
      updated_at: string
      name?: string
      config?: unknown
      status?: string
    } = {
      updated_at: new Date().toISOString()
    }

    if (name !== undefined) updateData.name = name
    if (config !== undefined) updateData.config = config
    if (status !== undefined) updateData.status = status

    const { data: workflow, error } = await supabase
      .from('user_workflows')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating workflow:', error)
      return NextResponse.json({ error: 'Failed to update workflow' }, { status: 500 })
    }

    return NextResponse.json(workflow)
  } catch (error) {
    console.error('Error in workflows PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Delete workflow
export async function DELETE(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Workflow ID is required' }, { status: 400 })
    }

    const supabase = createSupabaseServiceClient()

    const { error } = await supabase
      .from('user_workflows')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id)

    if (error) {
      console.error('Error deleting workflow:', error)
      return NextResponse.json({ error: 'Failed to delete workflow' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in workflows DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 