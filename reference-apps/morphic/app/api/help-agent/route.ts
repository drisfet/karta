import { NextRequest, NextResponse } from 'next/server'

import { helpAgent, HelpQuery } from '@/lib/agents/help-agent'

/**
 * Help Agent API Route
 *
 * Specialized endpoint for processing help queries using RAG (Retrieval-Augmented Generation).
 * Uses the help agent to retrieve relevant documentation and provide intelligent responses.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, category, userId, context } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      )
    }

    console.log(`[Help Agent API] Processing query: "${query}" for category: ${category || 'all'}`)

    // Create help query object
    const helpQuery: HelpQuery = {
      query: query.trim(),
      category,
      userId,
      context
    }

    // Process the query using the help agent
    const response = await helpAgent.processQuery(helpQuery)

    console.log(`[Help Agent API] Generated response with ${response.sources.length} sources`)

    return NextResponse.json({
      success: true,
      response,
      metadata: {
        query: helpQuery.query,
        category: helpQuery.category,
        processedAt: new Date().toISOString(),
        sourcesCount: response.sources.length,
        confidence: response.confidence
      }
    })

  } catch (error) {
    console.error('[Help Agent API] Error processing help query:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process help query',
        details: error instanceof Error ? error.message : 'Unknown error',
        response: {
          answer: 'I apologize, but I encountered an error while processing your help request. Please try again or contact support if the issue persists.',
          sources: [],
          confidence: 0,
          suggestions: [
            'Try rephrasing your question',
            'Check the documentation for related topics',
            'Contact support for complex issues'
          ]
        }
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')
  const category = searchParams.get('category')

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    )
  }

  // Redirect to POST handler
  const helpQuery: HelpQuery = {
    query,
    category: category || undefined
  }

  try {
    const response = await helpAgent.processQuery(helpQuery)

    return NextResponse.json({
      success: true,
      response
    })

  } catch (error) {
    console.error('[Help Agent API] GET error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process help query',
        response: {
          answer: 'Sorry, I encountered an error processing your request.',
          sources: [],
          confidence: 0
        }
      },
      { status: 500 }
    )
  }
}