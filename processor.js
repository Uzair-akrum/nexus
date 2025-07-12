const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');
const axios = require('axios');

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Reddit API base URL
const REDDIT_BASE_URL = 'https://oauth.reddit.com';

// AI Filter function (simplified version of existing one)
async function filterPost(postContent, filterInstruction) {
  try {
    const prompt = `You are an AI filter that analyzes Reddit posts to determine if they should trigger an action. Your job is to evaluate posts based on the user's filter criteria and return a JSON response.

User Filter: "${filterInstruction}"
Post: "${postContent}"

Response must be valid JSON with "proceed" (boolean) and "reasoning" (string) fields only.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI filter that analyzes content and returns JSON responses. Always respond with valid JSON containing 'proceed' and 'reasoning' fields."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 200,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.error('No content received from OpenAI');
      return null;
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('Error in AI filter:', error);
    return null;
  }
}

// Generate AI summary for Discord
async function generateSummary(postContent, title) {
  try {
    const prompt = `Create a concise summary of this Reddit post for Discord notification:

Title: ${title}
Content: ${postContent}

Format the response as a brief, engaging summary (max 280 characters) suitable for Discord.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that creates concise summaries for social media notifications."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 100
    });

    return response.choices[0]?.message?.content || 'New Reddit post matched your criteria';
  } catch (error) {
    console.error('Error generating summary:', error);
    return 'New Reddit post matched your criteria';
  }
}

// Fetch Reddit posts
async function fetchRedditPosts(accessToken, query, limit = 10) {
  try {
    const response = await axios.get(`${REDDIT_BASE_URL}/search`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'Nexus Processor 1.0'
      },
      params: {
        q: query,
        sort: 'new',
        limit: limit,
        type: 'link'
      }
    });

    return response.data.data.children.map(child => child.data);
  } catch (error) {
    console.error('Error fetching Reddit posts:', error);
    return [];
  }
}

// Post to Discord
async function postToDiscord(botToken, channelId, message) {
  try {
    const response = await axios.post(
      `https://discord.com/api/v10/channels/${channelId}/messages`,
      {
        content: message
      },
      {
        headers: {
          'Authorization': `Bot ${botToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.status === 200;
  } catch (error) {
    console.error('Error posting to Discord:', error);
    return false;
  }
}

// Get active workflows for all users
async function getActiveWorkflows() {
  try {
    const { data, error } = await supabase
      .from('user_workflows')
      .select('*')
      .eq('status', 'active');

    if (error) {
      console.error('Error fetching workflows:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return [];
  }
}

// Get service credentials for a user
async function getUserCredentials(userId, serviceName) {
  try {
    const { data, error } = await supabase
      .from('service_credentials')
      .select('*')
      .eq('user_id', userId)
      .eq('service_name', serviceName)
      .single();

    if (error) {
      console.error(`Error fetching ${serviceName} credentials:`, error);
      return null;
    }

    return data;
  } catch (error) {
    console.error(`Error fetching ${serviceName} credentials:`, error);
    return null;
  }
}

// Update workflow run statistics
async function updateWorkflowStats(workflowId) {
  try {
    const { error } = await supabase
      .from('user_workflows')
      .update({
        last_run: new Date().toISOString(),
        total_runs: supabase.sql`total_runs + 1`
      })
      .eq('id', workflowId);

    if (error) {
      console.error('Error updating workflow stats:', error);
    }
  } catch (error) {
    console.error('Error updating workflow stats:', error);
  }
}

// Main processing function
async function processWorkflows() {
  console.log(`[${new Date().toISOString()}] Starting workflow processing...`);

  const workflows = await getActiveWorkflows();
  console.log(`Found ${workflows.length} active workflows`);

  for (const workflow of workflows) {
    try {
      console.log(`Processing workflow: ${workflow.name} (ID: ${workflow.id})`);

      // Get Reddit credentials
      const redditCreds = await getUserCredentials(workflow.user_id, 'reddit_trigger');
      if (!redditCreds) {
        console.log(`No Reddit credentials found for workflow ${workflow.id}`);
        continue;
      }

      // Get Discord credentials
      const discordCreds = await getUserCredentials(workflow.user_id, 'discord_action');
      if (!discordCreds) {
        console.log(`No Discord credentials found for workflow ${workflow.id}`);
        continue;
      }

      const { trigger, filter, action } = workflow.config;

      // Fetch Reddit posts
      const posts = await fetchRedditPosts(
        redditCreds.credentials.access_token,
        trigger.query || 'startup',
        5
      );

      console.log(`Found ${posts.length} Reddit posts for workflow ${workflow.id}`);

      // Process each post sequentially
      for (const post of posts) {
        try {
          const postContent = `${post.title}\n\n${post.selftext || ''}`;

          // Apply AI filter
          const filterResult = await filterPost(postContent, filter.prompt);

          if (filterResult && filterResult.proceed) {
            console.log(`Post passed filter: ${post.title}`);
            console.log(`Reasoning: ${filterResult.reasoning}`);

            // Generate summary
            const summary = await generateSummary(postContent, post.title);

            // Create Discord message
            const discordMessage = `🎯 **New Reddit Post Match**\n\n**${post.title}**\n\n${summary}\n\n**Link:** ${post.url}\n\n**Filter Reasoning:** ${filterResult.reasoning}`;

            // Post to Discord
            const success = await postToDiscord(
              discordCreds.credentials.bot_token,
              discordCreds.credentials.channel_id,
              discordMessage
            );

            if (success) {
              console.log(`Successfully posted to Discord for workflow ${workflow.id}`);
            } else {
              console.log(`Failed to post to Discord for workflow ${workflow.id}`);
            }

            // Add small delay between posts to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 2000));
          } else {
            console.log(`Post did not pass filter: ${post.title}`);
            if (filterResult) {
              console.log(`Reasoning: ${filterResult.reasoning}`);
            }
          }
        } catch (error) {
          console.error(`Error processing post in workflow ${workflow.id}:`, error);
        }
      }

      // Update workflow statistics
      await updateWorkflowStats(workflow.id);

    } catch (error) {
      console.error(`Error processing workflow ${workflow.id}:`, error);
    }
  }

  console.log(`[${new Date().toISOString()}] Workflow processing completed`);
}

// Main execution
async function main() {
  console.log('Starting Reddit-Discord Processor...');
  console.log('Environment check:');
  console.log('- Supabase URL:', SUPABASE_URL ? 'Set' : 'Missing');
  console.log('- Supabase Service Key:', SUPABASE_SERVICE_KEY ? 'Set' : 'Missing');
  console.log('- OpenAI API Key:', OPENAI_API_KEY ? 'Set' : 'Missing');

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !OPENAI_API_KEY) {
    console.error('Missing required environment variables');
    process.exit(1);
  }

  // Check if we should run once (for GitHub Actions) or continuously
  const runOnce = process.env.RUN_ONCE === 'true';

  if (runOnce) {
    console.log('Running in single-execution mode (GitHub Actions)');
    await processWorkflows();
    console.log('Single execution completed, exiting...');
    process.exit(0);
  } else {
    console.log('Running in continuous mode (Docker/Fargate)');

    // Initial run
    await processWorkflows();

    // Set up interval for every minute (60000ms)
    setInterval(async () => {
      await processWorkflows();
    }, 60000);

    console.log('Processor is now running. Press Ctrl+C to stop.');
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down processor...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down processor...');
  process.exit(0);
});

// Start the processor
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 