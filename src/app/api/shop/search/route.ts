import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, mode, workspaceId, context, modelPreference } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Proxy to backend - use same port as search API
    const backendUrl = 'http://localhost:3001/api/shop/search';

    console.log('🛒 Next.js Shop API Proxy:');
    console.log('📍 Frontend Request:', request.url);
    console.log('🎯 Backend URL:', backendUrl);
    console.log('📋 Request Body:', body);

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend Error:', errorText);
      return NextResponse.json(
        { error: `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Backend Response:', data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Shop API Proxy Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}