import { useState, useCallback, useRef, useEffect } from 'react';
import { UIMessage } from 'ai';

interface UseDynamicChatOptions {
  api: string;
  initialMessages?: UIMessage[];
  searchContext?: string;
}

interface ChatState {
  messages: UIMessage[];
  isLoading: boolean;
  error: Error | null;
}

export function useDynamicChat({ api, initialMessages = [], searchContext }: UseDynamicChatOptions) {
  const [state, setState] = useState<ChatState>({
    messages: initialMessages,
    isLoading: false,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Get current model from context
  const { selectedModel } = useChatModel();

  const sendMessage = useCallback(async (message: { text: string }) => {
    console.log('AI Chat - Sending message:', message.text);
    console.log('AI Chat - Current model:', selectedModel);

    if (!selectedModel) {
      throw new Error('No model selected');
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Add user message to local state immediately
    const userMessage = {
      role: 'user' as const,
      parts: [{ type: 'text' as const, text: message.text }],
      id: `user-${Date.now()}`,
    };

    setState(prev => ({
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    try {
      const requestBody = {
        messages: [...state.messages, userMessage], // Use current state + user message
        searchContext: searchContext || undefined,
        model: selectedModel,
      };

      console.log('AI Chat - Request body:', requestBody);

      const response = await fetch(api, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      // Handle streaming response from Vercel AI SDK
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let currentMessage = '';
      let messageId = `assistant-${Date.now()}`;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // Process complete lines
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (dataStr === '[DONE]') {
              // Stream ended - add the complete message
              if (currentMessage.trim()) {
                console.log('AI Chat - Stream ended, adding complete message:', currentMessage.trim());
                const newMessage = {
                  id: messageId,
                  role: 'assistant' as const,
                  parts: [{ type: 'text' as const, text: currentMessage.trim() }],
                  createdAt: new Date(),
                };
                console.log('AI Chat - New message object:', newMessage);
                setState(prev => {
                  const updatedMessages = [...prev.messages, newMessage];
                  console.log('AI Chat - Updated messages array:', updatedMessages);
                  return {
                    ...prev,
                    messages: updatedMessages,
                  };
                });
              }
              break;
            }

            try {
              const data = JSON.parse(dataStr);
              console.log('AI Chat - Received streaming data:', data);

              // Handle different streaming data types
              if (data.type === 'text-delta' && data.delta) {
                currentMessage += data.delta;
                console.log('AI Chat - Accumulated message so far:', currentMessage);
              } else if (data.type === 'text-start') {
                console.log('AI Chat - Text streaming started');
              } else if (data.type === 'finish') {
                // Stream finished for this step
                console.log('AI Chat - Step finished');
              } else if (data.type === 'step-finish') {
                console.log('AI Chat - Step finished, message complete');
              }
            } catch (e) {
              // Ignore parsing errors for incomplete chunks
              console.warn('AI Chat - Failed to parse streaming data:', dataStr, e);
            }
          }
        }

        buffer = lines[lines.length - 1];
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        // Request was cancelled, ignore
        return;
      }

      setState(prev => ({
        ...prev,
        error: error,
      }));
    } finally {
      setState(prev => ({
        ...prev,
        isLoading: false,
      }));
      abortControllerRef.current = null;
    }
  }, [api, selectedModel, searchContext]);

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setState(prev => ({
        ...prev,
        isLoading: false,
      }));
    }
  }, []);

  const clearMessages = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: initialMessages,
      error: null,
    }));
  }, [initialMessages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    sendMessage,
    stop,
    clearMessages,
  };
}

// Import here to avoid circular dependency
import { useChatModel } from './use-chat-model';