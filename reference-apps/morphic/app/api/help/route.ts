import { NextRequest, NextResponse } from 'next/server'

import fs from 'fs'
import path from 'path'

/**
 * Help API Route
 *
 * Server-side API for help system operations that require file system access.
 * This handles loading and searching help documents.
 */

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

  getDocument(id: string): HelpDocument | null {
    return this.cache.get(id) || null
  }

  getCategoryDocuments(category: string): HelpDocument[] {
    return Array.from(this.cache.values())
      .filter(doc => doc.category === category)
  }

  getCategories(): string[] {
    const categories = new Set<string>()
    for (const doc of this.cache.values()) {
      categories.add(doc.category)
    }
    return Array.from(categories)
  }

  getFormattedHelp(query: string, category?: string): string {
    const results = this.search(query, category)

    if (results.length === 0) {
      return `No help documents found for query: "${query}"`
    }

    let formattedHelp = `Help results for "${query}":\n\n`

    for (const result of results.slice(0, 3)) { // Top 3 results
      formattedHelp += `## ${result.document.title}\n`
      formattedHelp += `Category: ${result.document.category}\n`
      formattedHelp += `Relevance: ${result.relevance}\n\n`
      formattedHelp += `${result.excerpt}\n\n`
      formattedHelp += `---\n\n`
    }

    return formattedHelp
  }

  async generateSuggestions(category: string): Promise<Array<{ heading: string; message: string }>> {
    console.log(`[Help System] Generating suggestions for category: ${category}`)

    const documents = this.getCategoryDocuments(category)
    if (documents.length === 0) {
      console.log(`[Help System] No documents found for category: ${category}`)
      return this.getDefaultSuggestions()
    }

    const suggestions: Array<{ heading: string; message: string }> = []

    // Extract key topics and questions from document content
    for (const doc of documents.slice(0, 2)) { // Process top 2 documents
      const content = doc.content.toLowerCase()

      // Look for common question patterns
      const questionPatterns = [
        /how (do|to|can)/g,
        /what (is|are|do)/g,
        /why (do|is)/g,
        /when (do|should)/g,
        /where (do|can)/g
      ]

      // Extract headings as potential question topics
      const headings = doc.content.match(/^#{1,3}\s+(.+)$/gm) || []
      for (const heading of headings.slice(0, 2)) {
        const cleanHeading = heading.replace(/^#{1,3}\s+/, '').trim()
        if (cleanHeading.length > 10 && cleanHeading.length < 50) {
          suggestions.push({
            heading: `About ${cleanHeading}`,
            message: `Tell me about ${cleanHeading.toLowerCase()}`
          })
        }
      }

      // Generate contextual questions based on content
      if (content.includes('workflow') || content.includes('node')) {
        suggestions.push({
          heading: 'How do workflows work?',
          message: 'How do I create and manage workflows?'
        })
      }

      if (content.includes('troubleshoot') || content.includes('error')) {
        suggestions.push({
          heading: 'Common issues and fixes',
          message: 'What are common issues and how do I fix them?'
        })
      }

      if (content.includes('feature') || content.includes('tool')) {
        suggestions.push({
          heading: 'Available features',
          message: 'What features and tools are available?'
        })
      }
    }

    // Ensure we have at least 4 suggestions
    while (suggestions.length < 4) {
      const defaultSuggestions = this.getDefaultSuggestions()
      const needed = 4 - suggestions.length
      suggestions.push(...defaultSuggestions.slice(0, needed))
    }

    console.log(`[Help System] Generated ${suggestions.length} suggestions`)
    return suggestions.slice(0, 4) // Return top 4
  }

  private getDefaultSuggestions(): Array<{ heading: string; message: string }> {
    return [
      {
        heading: 'Getting started guide',
        message: 'How do I get started with this feature?'
      },
      {
        heading: 'Basic usage instructions',
        message: 'What are the basic steps to use this?'
      },
      {
        heading: 'Common questions',
        message: 'What are some common questions about this?'
      },
      {
        heading: 'Advanced features',
        message: 'What advanced features are available?'
      }
    ]
  }
}

// Singleton instance
const serverHelpSystem = new ServerHelpSystem()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const query = searchParams.get('query')
  const category = searchParams.get('category')
  const id = searchParams.get('id')

  try {
    console.log(`[Help API] Initializing help system...`)
    await serverHelpSystem.initialize()
    console.log(`[Help API] Help system initialized successfully`)

    switch (action) {
      case 'search':
        if (!query) {
          return NextResponse.json({ error: 'Query parameter required' }, { status: 400 })
        }
        const searchResults = serverHelpSystem.search(query, category || undefined)
        return NextResponse.json({ results: searchResults })

      case 'document':
        if (!id) {
          return NextResponse.json({ error: 'ID parameter required' }, { status: 400 })
        }
        const document = serverHelpSystem.getDocument(id)
        if (!document) {
          return NextResponse.json({ error: 'Document not found' }, { status: 404 })
        }
        return NextResponse.json({ document })

      case 'category':
        if (!category) {
          return NextResponse.json({ error: 'Category parameter required' }, { status: 400 })
        }
        const categoryDocs = serverHelpSystem.getCategoryDocuments(category)
        return NextResponse.json({ documents: categoryDocs })

      case 'categories':
        const categories = serverHelpSystem.getCategories()
        return NextResponse.json({ categories })

      case 'formatted':
        if (!query) {
          return NextResponse.json({ error: 'Query parameter required' }, { status: 400 })
        }
        const formattedHelp = serverHelpSystem.getFormattedHelp(query, category || undefined)
        return NextResponse.json({ help: formattedHelp })

      case 'suggestions':
        if (!category) {
          return NextResponse.json({ error: 'Category parameter required' }, { status: 400 })
        }
        console.log(`[Help API] Generating suggestions for category: ${category}`)
        const suggestions = await serverHelpSystem.generateSuggestions(category)
        console.log(`[Help API] Generated ${suggestions.length} suggestions`)
        return NextResponse.json({ suggestions })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Help API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}