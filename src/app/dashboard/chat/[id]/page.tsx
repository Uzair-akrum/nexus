import { cookies } from 'next/headers';
import { Chat } from '@/components/chat';
import { DEFAULT_MODEL_NAME, models } from '@/lib/ai/models';

export default async function ChatPage({ params }: { params: { id: string } }) {
  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('model-id')?.value;
  const selectedModelId =
    models.find((model) => model.id === modelIdFromCookie)?.id ||
    DEFAULT_MODEL_NAME;

  return (
    <div className="h-[calc(100vh-4rem)] p-4">
      <Chat id={params.id} selectedModelId={selectedModelId} />
    </div>
  );
} 