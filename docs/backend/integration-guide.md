# Integration Guide

This guide explains how to integrate the ngx-copilot-platform backend with your Angular application using the [ngx-copilot-platform](https://github.com/AnkitParekh007/ngx-copilot-platform) frontend SDK and example apps.

## Prerequisites

- Angular 17+ application
- Node.js 18+
- Supabase account (for vector storage)
- OpenAI API key (for embeddings)

## 1. Deploy the Backend

The backend (`packages/backend`) is a standard Next.js app that runs on any Node.js host. Choose any platform:

| Platform | Notes |
|---|---|
| **Railway** | `railway up` from `packages/backend/` |
| **Fly.io** | `flyctl deploy` from `packages/backend/` |
| **Render** | Connect repo, set root dir to `packages/backend` |
| **Docker** | `docker build -t ngx-copilot-backend packages/backend` |
| **Self-hosted** | See below |

### Self-host

```bash
# Clone the repository
git clone https://github.com/AnkitParekh007/ngx-copilot-platform.git
cd ngx-copilot-platform

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run locally
pnpm dev
```

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# OpenAI
OPENAI_API_KEY=sk-...

# Optional: GitHub (for private repos)
GITHUB_TOKEN=ghp_...

# Optional: Bitbucket (for private repos)
BITBUCKET_USERNAME=your-username
BITBUCKET_APP_PASSWORD=your-app-password
```

## 2. Set Up the Database

The backend requires a Supabase database with pgvector. Run the following SQL migrations:

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  embedding vector(1536),
  chunk_index INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create code_chunks table
CREATE TABLE code_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_slug TEXT NOT NULL,
  branch TEXT DEFAULT 'main',
  file_path TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  component_type TEXT,
  component_name TEXT,
  selectors JSONB DEFAULT '[]',
  routes JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create vector search functions
CREATE FUNCTION match_documents(query_embedding vector(1536), match_threshold FLOAT, match_count INT)
RETURNS TABLE (id UUID, source_url TEXT, title TEXT, content TEXT, similarity FLOAT)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT d.id, d.source_url, d.title, d.content,
         1 - (d.embedding <=> query_embedding) AS similarity
  FROM documents d
  WHERE 1 - (d.embedding <=> query_embedding) > match_threshold
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

CREATE FUNCTION match_code_chunks(query_embedding vector(1536), match_threshold FLOAT, match_count INT)
RETURNS TABLE (id UUID, repo_slug TEXT, file_path TEXT, content TEXT, component_type TEXT, similarity FLOAT)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.repo_slug, c.file_path, c.content, c.component_type,
         1 - (c.embedding <=> query_embedding) AS similarity
  FROM code_chunks c
  WHERE 1 - (c.embedding <=> query_embedding) > match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create indexes
CREATE INDEX documents_embedding_idx ON documents USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX code_chunks_embedding_idx ON code_chunks USING ivfflat (embedding vector_cosine_ops);
```

## 3. Install the Angular SDK

```bash
npm install @ankit-parekh-007/ngx-copilot-sdk
```

## 4. Configure the Angular Application

### app.config.ts

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideCopilot } from '@ankit-parekh-007/ngx-copilot-sdk';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideCopilot({
      apiBaseUrl: 'https://your-backend.example.com/api/copilot',
      defaultMode: 'ask',
      features: {
        approvals: true,
        ragSources: true,
        toolTimeline: true,
        suggestions: true,
      },
      ui: {
        position: 'right',
        width: 420,
        theme: 'auto',
      },
    }),
  ],
};
```

### Add the Copilot Shell

```typescript
// app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CopilotShellComponent } from '@ankit-parekh-007/ngx-copilot-sdk';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CopilotShellComponent],
  template: `
    <div class="app-container">
      <router-outlet />
      <copilot-shell />
    </div>
  `,
})
export class AppComponent {}
```

## 5. Ingest Your Content

### Ingest Documentation

```bash
curl -X POST https://your-backend.example.com/api/ingestion/documentation \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-docs.example.com",
    "maxDepth": 3,
    "maxPages": 100
  }'
```

### Ingest GitHub Repository

```bash
curl -X POST https://your-backend.example.com/api/ingestion/github \
  -H "Content-Type: application/json" \
  -d '{
    "owner": "your-org",
    "repo": "your-angular-app",
    "branch": "main",
    "token": "ghp_xxx"
  }'
```

### Ingest Bitbucket Repository

```bash
curl -X POST https://your-backend.example.com/api/ingestion/bitbucket \
  -H "Content-Type: application/json" \
  -d '{
    "workspace": "your-workspace",
    "repoSlug": "your-angular-app",
    "branch": "main",
    "username": "your-username",
    "appPassword": "your-app-password"
  }'
```

## 6. Provide Context

The copilot works best when it has context about the current application state:

```typescript
// In your feature components
import { CopilotService } from '@ankit-parekh-007/ngx-copilot-sdk';

@Component({...})
export class ProductDetailComponent {
  private copilot = inject(CopilotService);

  ngOnInit() {
    // Update context when the page loads
    this.copilot.setContext({
      currentRoute: '/products/123',
      currentPage: 'Product Detail',
      selectedEntity: {
        type: 'product',
        id: '123',
        data: this.product,
      },
      userRole: 'admin',
    });
  }
}
```

## 7. Handle Approvals

For sensitive actions, the copilot will request user approval:

```typescript
// The SDK handles this automatically, but you can customize:
provideCopilot({
  // ...
  approvals: {
    autoApprove: ['navigate', 'scroll'],
    requireApproval: ['submit', 'delete', 'publish'],
    showConfirmation: true,
  },
})
```

## 8. Customize the UI

```typescript
provideCopilot({
  // ...
  ui: {
    position: 'right', // 'left' | 'right' | 'bottom'
    width: 420,
    height: '100vh',
    theme: 'auto', // 'light' | 'dark' | 'auto'
    showModeSelector: true,
    showSources: true,
    showTimeline: true,
    showSuggestions: true,
    branding: {
      name: 'Product Copilot',
      logo: '/assets/logo.svg',
      primaryColor: '#6366f1',
    },
  },
})
```

## Troubleshooting

### CORS Issues

Ensure your backend allows requests from your Angular app:

```typescript
// next.config.mjs
export default {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://your-angular-app.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ];
  },
};
```

### SSE Connection Drops

If the SSE connection drops frequently:

1. Check for proxy/load balancer timeouts
2. Ensure `Connection: keep-alive` headers are passed through
3. Consider using the WebSocket endpoint instead

### Slow RAG Results

If vector search is slow:

1. Ensure pgvector indexes are created
2. Consider reducing the number of chunks
3. Adjust the similarity threshold

## Next Steps

- [API Reference](./api-reference.md) - Complete endpoint documentation
- [Architecture](./architecture.md) - System design overview
- [RetailOps PXM Example](../examples/retailops-pxm/) - Full working example
