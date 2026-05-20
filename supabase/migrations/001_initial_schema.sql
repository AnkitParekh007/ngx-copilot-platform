-- =====================================================
-- Migration: 001_initial_schema
-- Description: Initial database schema with RLS policies
-- Created: 2024
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- API Keys Table (for SDK authentication)
-- =====================================================
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_hash TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permissions JSONB DEFAULT '["read", "write"]',
  rate_limit_tier TEXT DEFAULT 'standard',
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_keys_hash ON api_keys(key_hash) WHERE is_active = TRUE;
CREATE INDEX idx_api_keys_user ON api_keys(user_id);

-- =====================================================
-- Documents Table (for documentation chunks)
-- =====================================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  embedding vector(1536),
  chunk_index INTEGER DEFAULT 0,
  total_chunks INTEGER DEFAULT 1,
  headings JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  content_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source_url, chunk_index)
);

CREATE INDEX idx_documents_source_url ON documents(source_url);
CREATE INDEX idx_documents_content_hash ON documents(content_hash);
CREATE INDEX idx_documents_embedding ON documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- =====================================================
-- Code Chunks Table (for repository code)
-- =====================================================
CREATE TABLE IF NOT EXISTS code_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_slug TEXT NOT NULL,
  branch TEXT DEFAULT 'main',
  file_path TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  language TEXT DEFAULT 'typescript',
  component_type TEXT,
  component_name TEXT,
  selectors JSONB DEFAULT '[]',
  routes JSONB DEFAULT '[]',
  dependencies JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  line_start INTEGER,
  line_end INTEGER,
  content_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_code_chunks_repo ON code_chunks(repo_slug, branch);
CREATE INDEX idx_code_chunks_file_path ON code_chunks(file_path);
CREATE INDEX idx_code_chunks_component_type ON code_chunks(component_type);
CREATE INDEX idx_code_chunks_embedding ON code_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- =====================================================
-- Conversations Table
-- =====================================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
  title TEXT,
  mode TEXT DEFAULT 'ask' CHECK (mode IN ('ask', 'plan', 'agent')),
  messages JSONB DEFAULT '[]',
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_user ON conversations(user_id);
CREATE INDEX idx_conversations_api_key ON conversations(api_key_id);
CREATE INDEX idx_conversations_mode ON conversations(mode);

-- =====================================================
-- Ingestion Jobs Table
-- =====================================================
CREATE TABLE IF NOT EXISTS ingestion_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('documentation', 'bitbucket', 'github')),
  source TEXT NOT NULL,
  branch TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  progress INTEGER DEFAULT 0,
  total_items INTEGER DEFAULT 0,
  processed_items INTEGER DEFAULT 0,
  error TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_ingestion_jobs_status ON ingestion_jobs(status);
CREATE INDEX idx_ingestion_jobs_type ON ingestion_jobs(type);

-- =====================================================
-- Audit Logs Table
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  action_name TEXT,
  request TEXT,
  plan JSONB,
  target JSONB,
  result JSONB,
  error TEXT,
  requires_approval BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  request_id TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_conversation ON audit_logs(conversation_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action_type ON audit_logs(action_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- =====================================================
-- Browser Sessions Table
-- =====================================================
CREATE TABLE IF NOT EXISTS browser_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'initializing' CHECK (status IN ('initializing', 'ready', 'busy', 'error', 'closed')),
  current_url TEXT,
  current_page_title TEXT,
  last_screenshot_url TEXT,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_browser_sessions_conversation ON browser_sessions(conversation_id);
CREATE INDEX idx_browser_sessions_status ON browser_sessions(status);

-- =====================================================
-- Action Queue Table (for approval workflows)
-- =====================================================
CREATE TABLE IF NOT EXISTS action_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  action_details JSONB NOT NULL,
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'approved', 'rejected', 'executed', 'failed', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 hour'),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  executed_at TIMESTAMPTZ,
  result JSONB,
  error TEXT
);

CREATE INDEX idx_action_queue_conversation ON action_queue(conversation_id);
CREATE INDEX idx_action_queue_status ON action_queue(status);

-- =====================================================
-- Vector Search Functions
-- =====================================================

-- Match documents function
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  source_url TEXT,
  title TEXT,
  content TEXT,
  headings JSONB,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.source_url,
    d.title,
    d.content,
    d.headings,
    d.metadata,
    1 - (d.embedding <=> query_embedding) AS similarity
  FROM documents d
  WHERE 1 - (d.embedding <=> query_embedding) > match_threshold
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Match code chunks function
CREATE OR REPLACE FUNCTION match_code_chunks(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  repo_slug TEXT,
  branch TEXT,
  file_path TEXT,
  content TEXT,
  component_type TEXT,
  component_name TEXT,
  selectors JSONB,
  routes JSONB,
  metadata JSONB,
  line_start INTEGER,
  line_end INTEGER,
  similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.repo_slug,
    c.branch,
    c.file_path,
    c.content,
    c.component_type,
    c.component_name,
    c.selectors,
    c.routes,
    c.metadata,
    c.line_start,
    c.line_end,
    1 - (c.embedding <=> query_embedding) AS similarity
  FROM code_chunks c
  WHERE 1 - (c.embedding <=> query_embedding) > match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- =====================================================
-- Row Level Security Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingestion_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE browser_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_queue ENABLE ROW LEVEL SECURITY;

-- API Keys: Users can only see their own keys
CREATE POLICY "api_keys_select_own" ON api_keys FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "api_keys_insert_own" ON api_keys FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "api_keys_update_own" ON api_keys FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "api_keys_delete_own" ON api_keys FOR DELETE
  USING (auth.uid() = user_id);

-- Documents: Public read, authenticated write
CREATE POLICY "documents_select_all" ON documents FOR SELECT
  USING (TRUE);
CREATE POLICY "documents_insert_authenticated" ON documents FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "documents_update_authenticated" ON documents FOR UPDATE
  USING (auth.role() = 'authenticated');
CREATE POLICY "documents_delete_authenticated" ON documents FOR DELETE
  USING (auth.role() = 'authenticated');

-- Code Chunks: Public read, authenticated write
CREATE POLICY "code_chunks_select_all" ON code_chunks FOR SELECT
  USING (TRUE);
CREATE POLICY "code_chunks_insert_authenticated" ON code_chunks FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "code_chunks_update_authenticated" ON code_chunks FOR UPDATE
  USING (auth.role() = 'authenticated');
CREATE POLICY "code_chunks_delete_authenticated" ON code_chunks FOR DELETE
  USING (auth.role() = 'authenticated');

-- Conversations: Users see their own, API key users see API key conversations
CREATE POLICY "conversations_select_own" ON conversations FOR SELECT
  USING (auth.uid() = user_id OR api_key_id IS NOT NULL);
CREATE POLICY "conversations_insert" ON conversations FOR INSERT
  WITH CHECK (TRUE);
CREATE POLICY "conversations_update_own" ON conversations FOR UPDATE
  USING (auth.uid() = user_id OR api_key_id IS NOT NULL);
CREATE POLICY "conversations_delete_own" ON conversations FOR DELETE
  USING (auth.uid() = user_id);

-- Ingestion Jobs: Public read, authenticated write
CREATE POLICY "ingestion_jobs_select_all" ON ingestion_jobs FOR SELECT
  USING (TRUE);
CREATE POLICY "ingestion_jobs_insert_authenticated" ON ingestion_jobs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');
CREATE POLICY "ingestion_jobs_update_authenticated" ON ingestion_jobs FOR UPDATE
  USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Audit Logs: Users see their own, admins see all
CREATE POLICY "audit_logs_select_own" ON audit_logs FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "audit_logs_insert" ON audit_logs FOR INSERT
  WITH CHECK (TRUE);

-- Browser Sessions: Users see sessions for their conversations
CREATE POLICY "browser_sessions_select_own" ON browser_sessions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM conversations c 
    WHERE c.id = conversation_id AND c.user_id = auth.uid()
  ));
CREATE POLICY "browser_sessions_insert" ON browser_sessions FOR INSERT
  WITH CHECK (TRUE);
CREATE POLICY "browser_sessions_update" ON browser_sessions FOR UPDATE
  USING (TRUE);

-- Action Queue: Users see and manage their own pending actions
CREATE POLICY "action_queue_select_own" ON action_queue FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM conversations c 
    WHERE c.id = conversation_id AND c.user_id = auth.uid()
  ));
CREATE POLICY "action_queue_insert" ON action_queue FOR INSERT
  WITH CHECK (TRUE);
CREATE POLICY "action_queue_update_own" ON action_queue FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM conversations c 
    WHERE c.id = conversation_id AND c.user_id = auth.uid()
  ));

-- =====================================================
-- Triggers for updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_code_chunks_updated_at
  BEFORE UPDATE ON code_chunks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_browser_sessions_updated_at
  BEFORE UPDATE ON browser_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- Service Role Bypass (for API operations)
-- =====================================================
-- Note: Service role bypasses RLS by default in Supabase
-- The API uses service role for operations that need full access
