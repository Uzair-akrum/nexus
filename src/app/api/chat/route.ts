import {
  type Message,
  convertToCoreMessages,
  createDataStreamResponse,
  streamText,
} from 'ai';

import { customModel } from '@/lib/ai';
import { models } from '@/lib/ai/models';
import { regularPrompt } from '@/lib/ai/prompts';
import { getWeather } from '@/lib/ai/tools/get-weather';
import { generateUUID, getMostRecentUserMessage } from '@/lib/utils';
import { auth } from '@/auth';

export const maxDuration = 60;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const {
      id,
      messages,
      modelId,
    }: { id: string; messages: Array<Message>; modelId: string } =
      await request.json();

    const model = models.find((model) => model.id === modelId);

    if (!model) {
      return new Response('Model not found', { status: 404 });
    }

    const coreMessages = convertToCoreMessages(messages);
    const userMessage = getMostRecentUserMessage(coreMessages);

    if (!userMessage) {
      return new Response('No user message found', { status: 400 });
    }

    const userMessageId = generateUUID();

    return createDataStreamResponse({
      execute: (dataStream) => {
        try {
          dataStream.writeData({
            type: 'user-message-id',
            content: userMessageId,
          });

          const result = streamText({
            model: customModel(model.apiIdentifier),
            system: regularPrompt,
            messages: coreMessages,
            tools: {
              getWeather,
            },
          });
          result.mergeIntoDataStream(dataStream);
        } catch (error) {
          console.error('Stream execution error:', error);
          dataStream.writeData({
            type: 'error',
            content: error instanceof Error ? error.message : String(error),
          });
        }
      },
    });
  } catch (error) {
    console.error('API route error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 