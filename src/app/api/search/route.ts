import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Extract query parameters from the request
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const mode = searchParams.get('mode');
    const workspaceId = searchParams.get('workspaceId');
    const context = searchParams.get('context');
    const modelPreference = searchParams.get('modelPreference');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    // Build query string for backend
    const backendParams = new URLSearchParams();
    backendParams.append('query', query);
    if (mode) backendParams.append('mode', mode);
    if (workspaceId) backendParams.append('workspaceId', workspaceId);
    if (context) backendParams.append('context', context);
    if (modelPreference) backendParams.append('modelPreference', modelPreference);

    // Proxy to backend
    const backendUrl = `http://localhost:3001/api/search?${backendParams.toString()}`;

    console.log('🌐 Next.js API Proxy:');
    console.log('📍 Frontend Request:', request.url);
    console.log('🎯 Backend URL:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
    console.error('API Proxy Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, mode, workspaceId, context, modelPreference } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Proxy to backend
    const backendUrl = 'http://localhost:3001/api/search';

    console.log('🌐 Next.js API Proxy (POST):');
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
    console.error('API Proxy Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}