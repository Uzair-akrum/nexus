export interface Model {
  id: string;
  label: string;
  apiIdentifier: string;
  description: string;
}

export const models: Array<Model> = [
  {
    id: 'gpt-4',
    label: 'GPT-4',
    apiIdentifier: 'gpt-4',
    description: 'OpenAI\'s most capable model for complex tasks.',
  },
] as const;

export const DEFAULT_MODEL_NAME: string = 'gpt-4'; 