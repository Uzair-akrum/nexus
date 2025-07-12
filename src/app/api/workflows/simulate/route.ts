import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createSupabaseServiceClient } from '@/lib/supabase'

// Simulate workflow execution
export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { workflowId } = await request.json()

    if (!workflowId) {
      return NextResponse.json({ error: 'Workflow ID is required' }, { status: 400 })
    }

    const supabase = createSupabaseServiceClient()

    // Get workflow configuration
    const { data: workflow, error: workflowError } = await supabase
      .from('user_workflows')
      .select('*')
      .eq('id', workflowId)
      .eq('user_id', session.user.id)
      .single()

    if (workflowError || !workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    // Get user's service credentials
    const { data: credentials, error: credError } = await supabase
      .from('service_credentials')
      .select('*')
      .eq('user_id', session.user.id)
      .in('service_name', ['reddit_trigger', 'discord_action'])


    console.log('Credentials:', credentials)

    if (credError) {
      return NextResponse.json({ error: 'Failed to fetch credentials' }, { status: 500 })
    }

    const redditCreds = credentials.find(c => c.service_name === 'reddit_trigger')
    const discordCreds = credentials.find(c => c.service_name === 'discord_action')

    // Simulate workflow execution steps
    const simulationSteps = []
    const startTime = Date.now()

    // Step 1: Reddit Trigger Simulation
    if (workflow.config.trigger.service === 'reddit') {
      simulationSteps.push({
        step: 'reddit_trigger',
        name: 'Reddit Search',
        status: redditCreds ? 'success' : 'error',
        duration: 450,
        timestamp: new Date(startTime).toISOString(),
        details: redditCreds ? {
          query: workflow.config.trigger.query || 'startup',
          results_found: 12,
          sample_posts: [
            {
              title: "Looking for a project management tool for my startup",
              author: "startup_founder_2024",
              score: 45,
              created_utc: Math.floor(Date.now() / 1000) - 3600,
              subreddit: "entrepreneur"
            },
            {
              title: "Best CRM for small businesses?",
              author: "business_owner",
              score: 32,
              created_utc: Math.floor(Date.now() / 1000) - 7200,
              subreddit: "smallbusiness"
            },
            {
              title: "Need help with customer analytics",
              author: "growth_hacker",
              score: 28,
              created_utc: Math.floor(Date.now() / 1000) - 1800,
              subreddit: "startup"
            }
          ]
        } : {
          error: 'Reddit credentials not found. Please connect your Reddit account.'
        }
      })
    }

    // Step 2: AI Filter Simulation
    if (workflow.config.filter.enabled) {
      simulationSteps.push({
        step: 'ai_filter',
        name: 'AI Content Filter',
        status: 'success',
        duration: 1200,
        timestamp: new Date(startTime + 450).toISOString(),
        details: {
          prompt: workflow.config.filter.prompt,
          posts_analyzed: redditCreds ? 3 : 0,
          posts_passed: redditCreds ? 2 : 0,
          ai_reasoning: redditCreds ? [
            {
              post_title: "Looking for a project management tool for my startup",
              decision: "PASS",
              confidence: 0.85,
              reasoning: "High-intent lead actively seeking business solutions"
            },
            {
              post_title: "Best CRM for small businesses?",
              decision: "PASS",
              confidence: 0.78,
              reasoning: "Direct request for business software recommendation"
            },
            {
              post_title: "Need help with customer analytics",
              decision: "REJECT",
              confidence: 0.65,
              reasoning: "Too vague, not clearly expressing purchase intent"
            }
          ] : []
        }
      })
    }

    // Step 3: Discord Action Simulation
    if (workflow.config.action.service === 'discord') {
      simulationSteps.push({
        step: 'discord_action',
        name: 'Discord Notification',
        status: discordCreds ? 'success' : 'error',
        duration: 320,
        timestamp: new Date(startTime + 1650).toISOString(),
        details: discordCreds ? {
          channel_id: discordCreds.credentials.channel_id,
          messages_sent: redditCreds ? 2 : 0,
          sample_message: redditCreds ? {
            content: "🚀 **New High-Intent Lead Detected!**\n\n**Post:** Looking for a project management tool for my startup\n**Author:** startup_founder_2024\n**Score:** 45 upvotes\n**Subreddit:** r/entrepreneur\n\n**AI Analysis:** High-intent lead actively seeking business solutions (85% confidence)\n\n[View Post](https://reddit.com/r/entrepreneur/post/123)",
            timestamp: new Date().toISOString()
          } : null
        } : {
          error: 'Discord credentials not found. Please connect your Discord bot.'
        }
      })
    }

    // Calculate total execution time
    const totalDuration = simulationSteps.reduce((sum, step) => sum + step.duration, 0)

    const simulationResult = {
      workflow_id: workflowId,
      workflow_name: workflow.name,
      simulation_id: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: simulationSteps.every(step => step.status === 'success') ? 'success' : 'partial_failure',
      total_duration: totalDuration,
      started_at: new Date(startTime).toISOString(),
      completed_at: new Date(startTime + totalDuration).toISOString(),
      steps: simulationSteps,
      summary: {
        reddit_posts_found: redditCreds ? 3 : 0,
        posts_filtered: redditCreds ? 2 : 0,
        discord_messages_sent: (redditCreds && discordCreds) ? 2 : 0,
        credentials_missing: [
          ...(!redditCreds ? ['reddit_trigger'] : []),
          ...(!discordCreds ? ['discord_action'] : [])
        ]
      }
    }

    return NextResponse.json(simulationResult)
  } catch (error) {
    console.error('Error in workflow simulation:', error)
    return NextResponse.json({ error: 'Simulation failed' }, { status: 500 })
  }
} 