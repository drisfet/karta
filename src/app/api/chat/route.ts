import { streamText, convertToModelMessages, UIMessage } from 'ai';
import { NextRequest } from 'next/server';
import { AISDKModelProvider } from '@/lib/ai-sdk-models';
import { chatModels } from '@/lib/models';

export async function POST(request: NextRequest) {
    try {
       const { messages, searchContext, model }: { messages: UIMessage[], searchContext?: string, model?: string } = await request.json();

       console.log('AI Chat API - Received messages:', messages);
       console.log('AI Chat API - Search context present:', !!searchContext);
       console.log('AI Chat API - Selected model:', model);

       // Extract search context from message if embedded
       let processedMessages = messages;
       let extractedSearchContext = searchContext;

       if (messages.length > 0 && messages[messages.length - 1].role === 'user') {
         const lastMessage = messages[messages.length - 1];
         const firstPart = lastMessage.parts?.[0];
         const messageText = (firstPart && 'text' in firstPart) ? firstPart.text : '';

         // Check if message contains embedded search context
         const contextMatch = messageText.match(/\[SYSTEM CONTEXT\]\n(.*?)\n\n\[USER MESSAGE\]\n([\s\S]*)/);
         if (contextMatch) {
           extractedSearchContext = contextMatch[1];
           // Replace the message with just the user message
           processedMessages = [
             ...messages.slice(0, -1),
             {
               ...lastMessage,
               parts: [{ type: 'text' as const, text: contextMatch[2] }]
             }
           ];
           console.log('AI Chat API - Extracted search context from message');
         }
       }

       if (!messages || messages.length === 0) {
          return new Response(JSON.stringify({ error: 'No messages provided' }), {
             status: 400,
             headers: { 'Content-Type': 'application/json' }
          });
       }

       const modelMessages = convertToModelMessages(processedMessages);
       console.log('AI Chat API - Converted model messages:', modelMessages);

       // Enhanced system prompt with search context
       const finalSearchContext = extractedSearchContext || searchContext;
       const systemPrompt = finalSearchContext
         ? `You are a helpful AI assistant with access to search results. The user has previously searched for information, and you have the context of those results. Use this information to provide informed, contextual responses to follow-up questions.

Search Context:
${finalSearchContext}

When answering questions, reference the search results when relevant and maintain context throughout the conversation. If the user asks about something not covered in the search results, let them know you can help search for additional information.`
         : 'You are a helpful AI assistant.';

       // Configure model (support both Gemini and OpenRouter) - NO FALLBACKS
       const selectedModel = model;

       if (!selectedModel) {
         console.error('AI Chat API - No model selected!');
         return new Response(JSON.stringify({
           error: 'No AI model selected. Please select a model from the chat model switcher.',
           code: 'NO_MODEL_SELECTED'
         }), {
           status: 400,
           headers: { 'Content-Type': 'application/json' }
         });
       }

       console.log('AI Chat API - Selected model:', selectedModel);
       console.log('AI Chat API - Model from body:', model);

       // Validate the model exists in our configuration
       if (!AISDKModelProvider.validateModel(selectedModel)) {
         console.error('AI Chat API - Invalid model selected:', selectedModel);
         return new Response(JSON.stringify({
           error: `Invalid model selected: ${selectedModel}. Please select a valid model.`,
           code: 'INVALID_MODEL'
         }), {
           status: 400,
           headers: { 'Content-Type': 'application/json' }
         });
       }

       // Create the model instance using our provider
       const providerType = AISDKModelProvider.getProviderType(selectedModel);
       console.log(`AI Chat API - Using ${providerType} provider for model: ${selectedModel}`);

       const modelInstance = AISDKModelProvider.createModel(selectedModel);

       const result = streamText({
          model: modelInstance,
          system: systemPrompt,
          messages: modelMessages,
       });

       console.log('AI Chat API - Streaming result created');

       const streamResponse = result.toUIMessageStreamResponse();
       console.log('AI Chat API - Stream response created');

       return streamResponse;
    } catch (error: any) {
       console.error('AI Chat API - Error:', error);

       // Handle specific AI SDK errors
       let errorMessage = 'An unexpected error occurred while processing your request.';
       let statusCode = 500;

       if (error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
          errorMessage = 'I\'ve reached my usage limit for today. Please try again tomorrow or consider upgrading your plan.';
          statusCode = 429;
       } else if (error.message?.includes('rate limit') || error.statusCode === 429) {
          errorMessage = 'I\'m currently receiving too many requests. Please wait a moment and try again.';
          statusCode = 429;
       } else if (error.message?.includes('network') || error.message?.includes('timeout')) {
          errorMessage = 'There seems to be a network issue. Please check your connection and try again.';
          statusCode = 503;
       } else if (error.message?.includes('model') || error.message?.includes('AI_')) {
          errorMessage = 'There\'s an issue with the AI service. Please try again in a few moments.';
          statusCode = 503;
       }

       // Return a streaming error response that the frontend can handle
       const errorStream = new ReadableStream({
          start(controller) {
             // Send error as a text message
             const errorData = {
                id: `error-${Date.now()}`,
                role: 'assistant',
                parts: [{ type: 'text', text: `⚠️ ${errorMessage}` }],
                createdAt: new Date()
             };

             controller.enqueue(`data: ${JSON.stringify(errorData)}\n\n`);
             controller.close();
          }
       });

       return new Response(errorStream, {
          status: statusCode,
          headers: {
             'Content-Type': 'text/plain; charset=utf-8',
             'Cache-Control': 'no-cache',
             'Connection': 'keep-alive',
          },
       });
    }
}