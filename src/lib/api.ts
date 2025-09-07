const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ||
  (typeof window !== 'undefined'
    ? (() => {
        // Use Next.js API routes for all environments (handles CORS and proxying)
        console.log('🔧 API Configuration:');
        console.log('📍 Environment:', window.location.hostname);
        console.log('🎯 Using Next.js API Routes: /api/search');
        console.log('💡 Next.js handles backend proxying and CORS');

        return ''; // Use relative URLs for Next.js API routes
      })()
    : 'http://localhost:3001'
  );

export interface SearchRequest {
  query: string;
  mode?: string;
  workspaceId?: string;
  context?: string;
  modelPreference?: string;
}

export interface SearchResponse {
  answerHtml: string;
  citations: Array<{
    id: string;
    title: string;
    url: string;
    snippet: string;
    favicon: string;
  }>;
  ui_intents: Array<{
    type: string;
    panel: string;
    props: any;
  }>;
}

export async function searchQuery(request: SearchRequest): Promise<SearchResponse> {
  try {
    console.log('🌐 Frontend Environment:', typeof window !== 'undefined' ? window.location.hostname : 'server-side');
    console.log('🏗️  Frontend URL Pattern:', typeof window !== 'undefined' ? window.location.href : 'server-side');
    console.log('🔗 Constructed API Base URL:', API_BASE_URL);

    // For Google Cloud Workstations, send data as query parameters (workstation proxy converts POST to GET)
    const isWorkstation = typeof window !== 'undefined' && window.location.hostname.includes('cloudworkstations.dev');

    console.log('🔍 Environment Detection:');
    console.log('   • Is Workstation:', isWorkstation);
    console.log('   • Hostname:', typeof window !== 'undefined' ? window.location.hostname : 'server-side');
    console.log('   • API Base URL:', API_BASE_URL);
    console.log('   • Current Location:', typeof window !== 'undefined' ? window.location.href : 'server-side');

    let url: string;
    let options: RequestInit;

    if (isWorkstation) {
      // Send data as query parameters for workstation proxy
      const params = new URLSearchParams();
      params.append('query', request.query);
      if (request.mode) params.append('mode', request.mode);
      if (request.workspaceId) params.append('workspaceId', request.workspaceId);
      if (request.context) params.append('context', request.context);
      if (request.modelPreference) params.append('modelPreference', request.modelPreference);

      url = `${API_BASE_URL}/api/search?${params.toString()}`;
      options = {
        method: 'GET', // Workstation proxy will handle this
      };

      console.log('🔄 Workstation Mode - Using GET with query params');
      console.log('📡 Full API request URL:', url);
      console.log('🔍 URL Components:', {
        base: API_BASE_URL,
        endpoint: '/api/search',
        params: params.toString()
      });
    } else {
      // Normal POST request for other environments
      url = `${API_BASE_URL}/api/search`;
      options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      };

      console.log('🏠 Local Mode - Using POST with JSON body');
      console.log('📡 Full API request URL:', url);
      console.log('📋 Request payload:', request);
    }

    const response = await fetch(url, options);

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);

      // Detect if backend server is not running
      const isServerDown = response.status === 500 &&
        (errorText.includes('Internal server error') ||
         errorText.includes('ECONNREFUSED') ||
         errorText.includes('ENOTFOUND'));

      // Detect server timeout (504) or HTML error pages
      const isTimeout = response.status === 504 ||
        (errorText.includes('<html>') && errorText.includes('Error reaching server'));

      if (isServerDown) {
        throw new Error('BACKEND_SERVER_DOWN');
      }

      if (isTimeout) {
        throw new Error('BACKEND_TIMEOUT');
      }

      throw new Error(`Search failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('API Response:', data);
    return data;
  } catch (error: any) {
    console.error('Network/API Error:', error);

    // Detect if backend server is not running based on fetch errors
    if (error.message?.includes('fetch') || error.name === 'TypeError') {
      // Check if it's likely a server connection issue
      if (error.message?.includes('ECONNREFUSED') ||
          error.message?.includes('ENOTFOUND') ||
          error.message?.includes('Failed to fetch')) {
        throw new Error('BACKEND_SERVER_DOWN');
      }
    }

    throw error;
  }
}