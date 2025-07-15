'use client';

import { useState } from 'react';
import { useChat } from 'ai/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StickToBottom } from 'use-stick-to-bottom';
import { ChatMessage } from '@/components/chat-message';
import { DEFAULT_MODEL_NAME } from '@/lib/ai/models';
import { Send, Bot } from 'lucide-react';

interface ChatProps {
  id: string;
  selectedModelId: string;
}

export function Chat({ id, selectedModelId }: ChatProps) {
  const [input, setInput] = useState('');

  const { messages, handleSubmit, isLoading, setInput: setChatInput } = useChat({
    id,
    api: '/api/chat',
    body: {
      id,
      modelId: selectedModelId || DEFAULT_MODEL_NAME,
    },

    onFinish: () => {
      setInput('');
    },
  });

  console.log('messages=========', messages)
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setChatInput(input);
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle className="text-xl font-bold">AI Chat</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <StickToBottom
            className="flex-1 relative [&>div]:pr-4"
            resize="smooth"
            initial="smooth"
          >
            <StickToBottom.Content className="flex flex-col space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Bot className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <p>Start a conversation with the AI assistant!</p>
                </div>
              )}

              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </StickToBottom.Content>
          </StickToBottom>

          <form onSubmit={handleFormSubmit} className="flex gap-2 mt-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 