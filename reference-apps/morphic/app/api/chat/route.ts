import { cookies } from 'next/headers'

import { createDataStreamResponse, streamText } from 'ai'

import { helpAgent, HelpQuery } from '@/lib/agents/help-agent'
// Temporarily commented out for development - re-enable when authentication is properly configured
// import { getCurrentUserId } from '@/lib/auth/get-current-user'
import { createManualToolStreamResponse } from '@/lib/streaming/create-manual-tool-stream'
import { createToolCallingStreamResponse } from '@/lib/streaming/create-tool-calling-stream'
import { Model } from '@/lib/types/models'
import { getModel } from '@/lib/utils/registry'
import { isProviderEnabled } from '@/lib/utils/registry'

export const maxDuration = 30

const DEFAULT_MODEL: Model = {
  id: 'z-ai/glm-4.5-air:free',
  name: 'GLM-4.5 Air (Free)',
  provider: 'OpenRouter',
  providerId: 'openai-compatible',
  enabled: true,
  toolCallType: 'native'
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { messages, id: chatId, section = 'main-app' } = body
    const referer = req.headers.get('referer')
    const isSharePage = referer?.includes('/share/')

    // Temporarily disable authentication for development
    // Original authentication code:
    // const userId = await getCurrentUserId()
    // Temporary anonymous user for development:
    const userId = 'anonymous'

    if (isSharePage) {
      return new Response('Chat API is not available on share pages', {
        status: 403,
        statusText: 'Forbidden'
      })
    }

    const cookieStore = await cookies()
    const modelJson = cookieStore.get('selectedModel')?.value
    const searchModeValue = cookieStore.get('search-mode')?.value || 'search'
    const searchMode = searchModeValue === 'search'
    const helpOnlyMode = searchModeValue === 'help-only'

    let selectedModel = DEFAULT_MODEL

    if (modelJson) {
      try {
        selectedModel = JSON.parse(modelJson) as Model
      } catch (e) {
        console.error('Failed to parse selected model:', e)
      }
    }

    if (
      !isProviderEnabled(selectedModel.providerId) ||
      selectedModel.enabled === false
    ) {
      return new Response(
        `Selected provider is not enabled ${selectedModel.providerId}`,
        {
          status: 404,
          statusText: 'Not Found'
        }
      )
    }

    // Handle help-only mode with RAG-based help agent
    if (helpOnlyMode) {
      console.log('[Chat API] RAG-based help mode activated for section:', section)

      return createDataStreamResponse({
        execute: async (dataStream) => {
          try {
            const userMessage = messages[messages.length - 1]?.content || ''
            if (!userMessage.trim()) {
              // For empty messages, create a simple text response
              const result = await streamText({
                model: getModel(`${selectedModel.providerId}:${selectedModel.id}`),
                system: 'You are a helpful assistant.',
                prompt: 'Please provide a specific question for help.'
              })
              result.mergeIntoDataStream(dataStream)
              return
            }

            // Use the help agent directly
            const modelId = `${selectedModel.providerId}:${selectedModel.id}`
            const helpQuery: HelpQuery = {
              query: userMessage,
              category: section,
              userId,
              context: `Help request from ${section} section`,
              model: modelId
            }

            const helpResponse = await helpAgent.processQuery(helpQuery)

            // Combine all content into a single response
            let fullResponse = helpResponse.answer

            // Add sources if available
            if (helpResponse.sources && helpResponse.sources.length > 0) {
              fullResponse += '\n\n**Sources:**\n'
              helpResponse.sources.forEach((source, index: number) => {
                fullResponse += `${index + 1}. ${source.title} (${source.category})\n`
              })
            }

            // Add suggestions if available
            if (helpResponse.suggestions && helpResponse.suggestions.length > 0) {
              fullResponse += '\n\n**Related topics you might find helpful:**\n'
              helpResponse.suggestions.forEach((suggestion: string) => {
                fullResponse += `• ${suggestion}\n`
              })
            }

            // Stream the complete response
            const result = await streamText({
              model: getModel(modelId),
              system: 'You are a helpful assistant providing information from documentation.',
              prompt: `Please provide this information to the user: ${fullResponse}`
            })

            result.mergeIntoDataStream(dataStream)
          } catch (error) {
            console.error('[Chat API] Error in RAG help mode:', error)
            // Stream error message
            const result = await streamText({
              model: getModel(`${selectedModel.providerId}:${selectedModel.id}`),
              system: 'You are a helpful assistant.',
              prompt: 'I apologize, but I encountered an error while processing your help request. Please try again or contact support if the issue persists.'
            })
            result.mergeIntoDataStream(dataStream)
          }
        },
        onError: (error) => {
          console.error('Help stream error:', error)
          return error instanceof Error ? error.message : String(error)
        }
      })
    }

    const supportsToolCalling = selectedModel.toolCallType === 'native'

    return supportsToolCalling
      ? createToolCallingStreamResponse({
          messages,
          model: selectedModel,
          chatId,
          searchMode,
          userId
        })
      : createManualToolStreamResponse({
          messages,
          model: selectedModel,
          chatId,
          searchMode,
          userId
        })
  } catch (error) {
    console.error('API route error:', error)
    return new Response('Error processing your request', {
      status: 500,
      statusText: 'Internal Server Error'
    })
  }
}
