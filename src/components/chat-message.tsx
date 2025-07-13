'use client';

import { Bot, User, Code, Loader2, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Message } from 'ai';
import { WeatherDisplay } from '@/components/weather-display';

// Extend the Message type to include parts for forward compatibility
interface ExtendedMessage extends Message {
  parts?: MessagePart[];
}

// Define tool invocation type
interface ToolInvocation {
  state: 'partial-call' | 'call' | 'result';
  toolCallId: string;
  toolName: string;
  args: any;
  result?: any;
  step?: number;
}

// Define MessagePart type as specified in the instructions
type MessagePart = {
  type: 'text';
  text: string;
} | {
  type: 'tool-invocation';
  toolInvocation: ToolInvocation;
} | {
  type: 'reasoning';
  reasoning: string;
  details: Array<{
    type: 'text';
    text: string;
    signature?: string;
  } | {
    type: 'redacted';
    data: string;
  }>;
} | {
  type: 'source';
  source: any;
} | {
  type: 'file';
  mimeType: string;
  data: string;
} | {
  type: 'step-start';
};

interface ChatMessageProps {
  message: ExtendedMessage;
}

function normaliseMessage(msg: ExtendedMessage): ExtendedMessage & { parts: MessagePart[] } {
  if (msg.parts) return msg as any;           // already new format

  const parts: MessagePart[] = [
    { type: 'text', text: msg.content }
  ];

  // Convert toolInvocations to parts if they exist
  if ((msg as any).toolInvocations) {
    parts.push(...(msg as any).toolInvocations.map((inv: any) => ({
      type: 'tool-invocation' as const,
      toolInvocation: inv
    })));
  }

  return { ...msg, parts };
}

export function ChatMessage({ message }: ChatMessageProps) {
  console.log('message=========', message)
  const normalizedMessage = normaliseMessage(message);
  const parts: MessagePart[] = normalizedMessage.parts;
  console.log('parts=========', parts)
  return (
    <div
      className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'
        }`}
    >
      {message.role === 'assistant' && (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="w-4 h-4 text-primary" />
        </div>
      )}

      <div
        className={`max-w-[70%] p-3 rounded-lg ${message.role === 'user'
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted'
          }`}
      >
        {parts.map((part: MessagePart, index: number) => (
          <MessagePartRenderer key={index} part={part} />
        ))}
      </div>

      {message.role === 'user' && (
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}

function MessagePartRenderer({ part }: { part: MessagePart }) {
  console.log('part=========', part)
  switch (part.type) {
    case 'text':
      return (
        <p className="text-sm whitespace-pre-wrap">
          {part.text}
        </p>
      );

    case 'tool-invocation':
      console.log('tool-invocation', part.toolInvocation)
      return <ToolInvocationRenderer toolInvocation={part.toolInvocation} />;

    // Skip other part types as specified in instructions
    default:
      return null;
  }
}

function ToolInvocationRenderer({ toolInvocation }: { toolInvocation: ToolInvocation }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStateIcon = () => {
    switch (toolInvocation.state) {
      case 'partial-call':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'call':
        return <Code className="w-4 h-4" />;
      case 'result':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Code className="w-4 h-4" />;
    }
  };

  const getStateLabel = () => {
    switch (toolInvocation.state) {
      case 'partial-call':
        return 'Calling...';
      case 'call':
        return 'Called';
      case 'result':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  const getStateBadgeVariant = (): 'default' | 'secondary' | 'outline' => {
    switch (toolInvocation.state) {
      case 'partial-call':
        return 'secondary';
      case 'call':
        return 'secondary';
      case 'result':
        return 'default';
      default:
        return 'outline';
    }
  };

  return (
    <div className="mt-2 first:mt-0">
      <Card className="border-border/50">
        <CardContent className="p-3">
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between p-0 h-auto"
              >
                <div className="flex items-center gap-2">
                  {getStateIcon()}
                  <span className="font-medium text-sm">
                    Tool: {toolInvocation.toolName}
                  </span>
                  <Badge variant={getStateBadgeVariant()}>
                    {getStateLabel()}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {isExpanded ? 'Hide' : 'Show'} details
                </span>
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-2 space-y-2">
              {/* Show arguments */}
              {toolInvocation.args && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Arguments:
                  </p>
                  <pre className="text-xs bg-muted/50 p-2 rounded border overflow-x-auto">
                    {JSON.stringify(toolInvocation.args, null, 2)}
                  </pre>
                </div>
              )}

              {/* Show result if available */}
              {toolInvocation.state === 'result' && toolInvocation.result && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Result:
                  </p>
                  <div className="text-xs bg-muted/50 p-2 rounded border">
                    {toolInvocation.toolName === 'getWeather' && typeof toolInvocation.result === 'object' ? (
                      <WeatherDisplay data={toolInvocation.result} />
                    ) : typeof toolInvocation.result === 'string' ? (
                      <p className="whitespace-pre-wrap">{toolInvocation.result}</p>
                    ) : (
                      <pre className="overflow-x-auto">
                        {JSON.stringify(toolInvocation.result, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              )}

              {/* Show step number if available */}
              {toolInvocation.step !== undefined && (
                <div>
                  <p className="text-xs text-muted-foreground">
                    Step: {toolInvocation.step}
                  </p>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </div>
  );
} 