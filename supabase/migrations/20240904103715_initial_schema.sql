-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Users table (using Supabase auth)
-- This is handled by Supabase auth, so we don't create it here

-- Workspaces table
CREATE TABLE workspaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Panels table
CREATE TABLE panels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  panel_type TEXT NOT NULL,
  props JSONB DEFAULT '{}',
  x INTEGER NOT NULL DEFAULT 0,
  y INTEGER NOT NULL DEFAULT 0,
  width INTEGER NOT NULL DEFAULT 400,
  height INTEGER NOT NULL DEFAULT 300,
  z_index INTEGER NOT NULL DEFAULT 0,
  pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Queries table
CREATE TABLE queries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  query_text TEXT NOT NULL,
  mode TEXT DEFAULT 'general',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  answer_html TEXT,
  citations JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Docs cache table
CREATE TABLE docs_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT UNIQUE NOT NULL,
  html TEXT,
  text TEXT,
  fetch_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  provider TEXT
);

-- Embeddings table
CREATE TABLE embeddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doc_id UUID REFERENCES docs_cache(id) ON DELETE CASCADE,
  vector vector(1536), -- OpenAI ada-002 dimension
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent runs table
CREATE TABLE agent_runs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id TEXT UNIQUE NOT NULL,
  workflow_id TEXT NOT NULL,
  logs JSONB DEFAULT '[]',
  status TEXT DEFAULT 'running',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_panels_workspace_id ON panels(workspace_id);
CREATE INDEX idx_queries_user_id ON queries(user_id);
CREATE INDEX idx_docs_cache_url ON docs_cache(url);
CREATE INDEX idx_embeddings_doc_id ON embeddings(doc_id);
CREATE INDEX idx_agent_runs_run_id ON agent_runs(run_id);

-- Enable RLS
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE panels ENABLE ROW LEVEL SECURITY;
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE docs_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own workspaces" ON workspaces
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workspaces" ON workspaces
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workspaces" ON workspaces
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view panels in their workspaces" ON panels
  FOR SELECT USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert panels in their workspaces" ON panels
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT id FROM workspaces WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update panels in their workspaces" ON panels
  FOR UPDATE USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own queries" ON queries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own queries" ON queries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public access for docs_cache and embeddings (for now)
CREATE POLICY "Public read access to docs_cache" ON docs_cache
  FOR SELECT USING (true);

CREATE POLICY "Public read access to embeddings" ON embeddings
  FOR SELECT USING (true);

CREATE POLICY "Public read access to agent_runs" ON agent_runs
  FOR SELECT USING (true);