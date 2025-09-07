import { generateText } from 'ai'
import fs from 'fs'
import path from 'path'

import { getModel } from '../utils/registry'

/**
 * Help Agent
 *
 * An intelligent agent specifically designed for providing help and support.
 * Uses RAG (Retrieval-Augmented Generation) to retrieve relevant documentation
 * and provide contextual, accurate assistance.
 */

export interface HelpQuery {
  query: string
  category?: string
  userId?: string
  context?: string
  model?: string // Model identifier like "openai-compatible:gpt-4o-mini"
}

export interface HelpResponse {
  answer: string
  sources: Array<{
    id: string
    title: string
    category: string
    relevance: number
    excerpt: string
  }>
  confidence: number
  suggestions?: string[]
}

interface HelpDocument {
  id: string
  title: string
  content: string
  path: string
  category: string
  lastModified: Date
}

interface HelpSearchResult {
  document: HelpDocument
  relevance: number
  excerpt: string
}

class ServerHelpSystem {
  private basePath = 'docs/help'
  private cache: Map<string, HelpDocument> = new Map()
  private initialized = false

  async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      await this.loadHelpDocuments()
      this.initialized = true
    } catch (error) {
      console.error('Failed to initialize server help system:', error)
      throw error
    }
  }

  private async loadHelpDocuments(): Promise<void> {
    const helpDir = path.join(process.cwd(), this.basePath)
    console.log(`[Help System] Attempting to load help documents from: ${helpDir}`)

    if (!fs.existsSync(helpDir)) {
      console.warn(`[Help System] Help directory not found: ${helpDir}`)
      return
    }

    const categories = fs.readdirSync(helpDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)

    console.log(`[Help System] Found categories: ${categories.join(', ')}`)

    for (const category of categories) {
      const categoryPath = path.join(helpDir, category)
      console.log(`[Help System] Loading documents for category: ${category}`)
      await this.loadCategoryDocuments(category, categoryPath)
    }

    console.log(`[Help System] Successfully loaded ${this.cache.size} help documents`)
  }

  private async loadCategoryDocuments(category: string, categoryPath: string): Promise<void> {
    const files = fs.readdirSync(categoryPath)
      .filter(file => file.endsWith('.md'))

    console.log(`[Help System] Found ${files.length} MD files in ${category}: ${files.join(', ')}`)

    for (const file of files) {
      const filePath = path.join(categoryPath, file)
      console.log(`[Help System] Processing file: ${filePath}`)
      const document = this.parseMarkdownFile(filePath, category)
      if (document) {
        this.cache.set(document.id, document)
        console.log(`[Help System] Successfully loaded document: ${document.id}`)
      } else {
        console.warn(`[Help System] Failed to parse document: ${filePath}`)
      }
    }
  }

  private parseMarkdownFile(filePath: string, category: string): HelpDocument | null {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      const stats = fs.statSync(filePath)

      // Extract title from first heading
      const titleMatch = content.match(/^#\s+(.+)$/m)
      const title = titleMatch ? titleMatch[1].trim() : path.basename(filePath, '.md')

      const id = `${category}/${path.basename(filePath, '.md')}`

      return {
        id,
        title,
        content,
        path: filePath,
        category,
        lastModified: stats.mtime
      }
    } catch (error) {
      console.error(`Failed to parse help file ${filePath}:`, error)
      return null
    }
  }

  search(query: string, category?: string): HelpSearchResult[] {
    const queryWords = query.toLowerCase().split(/\s+/)
    const results: HelpSearchResult[] = []

    for (const [id, document] of this.cache) {
      if (category && document.category !== category) continue

      const relevance = this.calculateRelevance(document, queryWords)
      if (relevance > 0) {
        const excerpt = this.generateExcerpt(document.content, queryWords)
        results.push({
          document,
          relevance,
          excerpt
        })
      }
    }

    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance)

    return results.slice(0, 10) // Return top 10 results
  }

  private calculateRelevance(document: HelpDocument, queryWords: string[]): number {
    const text = (document.title + ' ' + document.content).toLowerCase()
    let score = 0

    for (const word of queryWords) {
      // Title matches are more valuable
      if (document.title.toLowerCase().includes(word)) {
        score += 10
      }

      // Content matches
      const occurrences = (text.match(new RegExp(word, 'g')) || []).length
      score += occurrences * 2

      // Exact phrase matches
      if (text.includes(word)) {
        score += 5
      }
    }

    return score
  }

  private generateExcerpt(content: string, queryWords: string[]): string {
    const lines = content.split('\n')
    const relevantLines: string[] = []

    for (const line of lines) {
      const lowerLine = line.toLowerCase()
      if (queryWords.some(word => lowerLine.includes(word))) {
        relevantLines.push(line.trim())
      }
    }

    return relevantLines.slice(0, 3).join(' ').substring(0, 200) + '...'
  }
}

// Singleton instance
const serverHelpSystem = new ServerHelpSystem()

export class HelpAgent {

  /**
   * Process a help query and provide an intelligent response
   */
  async processQuery(query: HelpQuery): Promise<HelpResponse> {
    try {
      console.log(`[Help Agent] Processing query: "${query.query}"`)

      // Step 1: Initialize help system and retrieve relevant documentation
      await serverHelpSystem.initialize()
      const searchResults = serverHelpSystem.search(query.query, query.category)
      const documents = searchResults.slice(0, 3).map(result => ({
        id: result.document.id,
        title: result.document.title,
        content: result.document.content,
        category: result.document.category,
        relevance: result.relevance,
        excerpt: result.excerpt
      }))

      console.log(`[Help Agent] Retrieved ${documents.length} documents`)

      // Step 2: Generate contextual response using retrieved documents
      const context = this.buildContextFromDocuments(documents, query)

      const systemPrompt = `You are an expert help assistant for the Morphic application.

Your role is to provide accurate, helpful, and contextual assistance to users based on the available documentation.

Guidelines:
- Be concise but comprehensive in your explanations
- Reference specific features, tools, or concepts from the documentation
- Provide step-by-step instructions when appropriate
- Suggest related topics or next steps when relevant
- Maintain a friendly, professional tone
- If the documentation doesn't cover the query, acknowledge this and provide general guidance

Always base your responses on the provided documentation context. If you need to make assumptions, clearly state them.`

      const userPrompt = `Help Query: "${query.query}"
${query.category ? `Category: ${query.category}` : ''}
${query.context ? `Additional Context: ${query.context}` : ''}

Please provide a helpful response based on the available documentation.`

      // Use the model from the query or default to a compatible model
      const modelId = query.model || 'openai-compatible:gpt-4o-mini'
      const model = getModel(modelId)

      const response = await generateText({
        model: model,
        system: systemPrompt,
        prompt: userPrompt + '\n\n' + context,
        temperature: 0.3, // Lower temperature for more consistent help responses
        maxTokens: 1000
      })

      // Step 3: Extract sources and generate suggestions
      const sources = documents.map((doc: any) => ({
        id: doc.id,
        title: doc.title,
        category: doc.category,
        relevance: doc.relevance,
        excerpt: doc.excerpt
      }))

      const suggestions = this.generateSuggestions(query.query, documents)

      // Calculate confidence based on retrieval results
      const confidence = this.calculateConfidence(documents, query.query)

      return {
        answer: response.text,
        sources,
        confidence,
        suggestions
      }

    } catch (error) {
      console.error('[Help Agent] Error processing query:', error)

      // Fallback response
      return {
        answer: `I'm sorry, I encountered an error while processing your help request. Please try rephrasing your question or contact support if the issue persists.`,
        sources: [],
        confidence: 0,
        suggestions: [
          'Try rephrasing your question',
          'Check the documentation for related topics',
          'Contact support for complex issues'
        ]
      }
    }
  }

  /**
   * Build context from retrieved documents
   */
  private buildContextFromDocuments(documents: any[], query: HelpQuery): string {
    if (documents.length === 0) {
      return `
No specific documentation found for this query. Please provide general assistance based on your knowledge of the Morphic application.

Query: "${query.query}"
${query.category ? `Category: ${query.category}` : ''}
`
    }

    let context = 'Relevant Documentation:\n\n'

    documents.forEach((doc, index) => {
      context += `--- Document ${index + 1} ---\n`
      context += `Title: ${doc.title}\n`
      context += `Category: ${doc.category}\n`
      context += `Relevance: ${doc.relevance}/100\n\n`
      context += `Content:\n${doc.content}\n\n`
      context += `Excerpt: ${doc.excerpt}\n\n`
    })

    return context
  }

  /**
   * Generate follow-up suggestions based on the query and documents
   */
  private generateSuggestions(query: string, documents: any[]): string[] {
    const suggestions: string[] = []

    // Add category-specific suggestions
    const categories = [...new Set(documents.map((doc: any) => doc.category))]
    categories.forEach(category => {
      if (category === 'studio') {
        suggestions.push('Learn about workflow creation in Agent Studio')
        suggestions.push('Explore node types and their configurations')
      } else if (category === 'main-app') {
        suggestions.push('Discover main application features')
        suggestions.push('Learn about search and research tools')
      }
    })

    // Add general suggestions
    if (suggestions.length === 0) {
      suggestions.push('Explore the user guide for detailed instructions')
      suggestions.push('Check the technical documentation for advanced features')
      suggestions.push('Browse example workflows and templates')
    }

    return suggestions.slice(0, 3) // Return top 3 suggestions
  }

  /**
   * Calculate confidence score based on retrieval results
   */
  private calculateConfidence(documents: any[], query: string): number {
    if (documents.length === 0) return 0

    // Base confidence on number of documents and their relevance scores
    const avgRelevance = documents.reduce((sum, doc) => sum + doc.relevance, 0) / documents.length
    const documentCount = documents.length

    // Formula: weighted average of relevance and document count
    const confidence = (avgRelevance * 0.7) + (Math.min(documentCount / 3, 1) * 30)

    return Math.min(Math.max(confidence, 0), 100) // Clamp between 0-100
  }
}

// Export singleton instance
export const helpAgent = new HelpAgent()

/**
 * Convenience function for processing help queries
 */
export async function processHelpQuery(query: HelpQuery): Promise<HelpResponse> {
  return helpAgent.processQuery(query)
}