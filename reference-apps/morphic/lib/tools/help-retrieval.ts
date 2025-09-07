import { tool } from 'ai'
import { z } from 'zod'

/**
 * Help Retrieval Tool
 *
 * A specialized tool for retrieving relevant help documentation from MD files.
 * Implements RAG (Retrieval-Augmented Generation) for the help system.
 */

const helpRetrievalSchema = z.object({
  query: z.string().describe('The user\'s help query to search for relevant documentation'),
  category: z.string().optional().describe('Specific help category to search in (e.g., "studio", "main-app")'),
  max_results: z.number().optional().default(3).describe('Maximum number of relevant documents to retrieve')
})

interface HelpDocument {
  id: string
  title: string
  content: string
  category: string
  relevance: number
  excerpt: string
}

export const helpRetrievalTool = tool({
  description: 'Search and retrieve relevant help documentation from the knowledge base',
  parameters: helpRetrievalSchema,
  execute: async ({ query, category, max_results = 3 }) => {
    try {
      console.log(`[Help Retrieval] Searching for: "${query}" in category: ${category || 'all'}`)

      // Call the help API to search through documents
      const searchParams = new URLSearchParams({
        action: 'search',
        query: query
      })

      if (category) {
        searchParams.append('category', category)
      }

      const response = await fetch(`/api/help?${searchParams}`)

      if (!response.ok) {
        throw new Error(`Help API search failed: ${response.status}`)
      }

      const data = await response.json()
      const searchResults = data.results || []

      // Transform search results into help documents
      const documents: HelpDocument[] = searchResults
        .slice(0, max_results)
        .map((result: any) => ({
          id: result.document.id,
          title: result.document.title,
          content: result.document.content,
          category: result.document.category,
          relevance: result.relevance,
          excerpt: result.excerpt
        }))

      console.log(`[Help Retrieval] Found ${documents.length} relevant documents`)

      return {
        query,
        category: category || 'all',
        documents,
        total_found: searchResults.length,
        retrieved_count: documents.length
      }

    } catch (error) {
      console.error('[Help Retrieval] Error:', error)

      return {
        query,
        category: category || 'all',
        documents: [],
        total_found: 0,
        retrieved_count: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }
})

/**
 * Helper function to retrieve help documentation
 */
export async function retrieveHelpDocumentation(
  query: string,
  category?: string,
  maxResults: number = 3
) {
  return helpRetrievalTool.execute(
    {
      query,
      category,
      max_results: maxResults
    },
    {
      toolCallId: 'help-retrieval',
      messages: []
    }
  )
}