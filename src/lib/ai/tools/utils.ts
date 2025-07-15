// Types for tool responses
export interface ToolResponse<T> {
  status: "success" | "error";
  message: string;
  result?: T;
  error?: string;
}

export interface CallToolResult {
  content: Array<{
    type: "text";
    text: string;
  }>;
}

// Format tool response with standard structure
export function formatToolResponse<T>(
  response: Partial<ToolResponse<T>> & Pick<ToolResponse<T>, "message">,
): CallToolResult {
  const standardResponse: ToolResponse<T> = {
    status: response.status || "success",
    message: response.message,
    ...(response.result && { result: response.result }),
    ...(response.error && { error: response.error }),
  };

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(standardResponse, null, 2),
      },
    ],
  };
}

// Success message for Reddit search
export const searchRedditSuccessMessage = "Successfully searched Reddit posts"; 