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

    if (!fs.existsSync(helpDir)) {
      console.warn(`Help directory not found: ${helpDir}`)
      return
    }

    const categories = fs.readdirSync(helpDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)

    for (const category of categories) {
      const categoryPath = path.join(helpDir, category)
      await this.loadCategoryDocuments(category, categoryPath)
    }
  }

  private async loadCategoryDocuments(category: string, categoryPath: string): Promise<void> {
    const files = fs.readdirSync(categoryPath)
      .filter(file => file.endsWith('.md'))

    for (const file of files) {
      const filePath = path.join(categoryPath, file)
      const document = this.parseMarkdownFile(filePath, category)
      if (document) {
        this.cache.set(document.id, document)
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
    await serverHelpSystem.initialize()

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

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Help API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}