import { createClient } from '@/lib/supabase/server'
import { generateEmbeddings, chunkText, createContentHash } from './embedding'
import type {
  CodeChunk,
  AngularComponentType,
  SelectorInfo,
  RouteInfo,
} from '@/lib/types/copilot'

interface GitHubConfig {
  owner: string
  repo: string
  branch?: string
  token?: string // Personal Access Token (optional for public repos)
}

interface GitHubTreeItem {
  path: string
  mode: string
  type: 'blob' | 'tree'
  sha: string
  size?: number
  url: string
}

// Angular file patterns (shared with Bitbucket)
const ANGULAR_FILE_PATTERNS = {
  component: /\.component\.ts$/,
  service: /\.service\.ts$/,
  module: /\.module\.ts$/,
  directive: /\.directive\.ts$/,
  pipe: /\.pipe\.ts$/,
  guard: /\.guard\.ts$/,
  resolver: /\.resolver\.ts$/,
  interceptor: /\.interceptor\.ts$/,
  model: /\.model\.ts$/,
  interface: /\.(interface|types?)\.ts$/,
  store: /\.(store|state)\.ts$/,
  effect: /\.effects?\.ts$/,
  action: /\.actions?\.ts$/,
  reducer: /\.reducer\.ts$/,
  selector: /\.selectors?\.ts$/,
  routing: /(-routing|\.routes)\.ts$/,
  spec: /\.spec\.ts$/,
}

export async function crawlGitHubRepo(
  config: GitHubConfig,
  jobId: string
): Promise<void> {
  const { owner, repo, branch = 'main', token } = config
  const supabase = await createClient()

  // Update job status
  await supabase
    .from('ingestion_jobs')
    .update({ status: 'running', started_at: new Date().toISOString() })
    .eq('id', jobId)

  try {
    // Get the tree recursively (all files)
    const files = await getRepoTree(owner, repo, branch, token)

    // Filter to Angular-related files
    const angularFiles = files.filter((f) => isAngularFile(f.path))

    await supabase
      .from('ingestion_jobs')
      .update({ total_items: angularFiles.length })
      .eq('id', jobId)

    let processedCount = 0

    // Process files in batches
    const batchSize = 10
    for (let i = 0; i < angularFiles.length; i += batchSize) {
      const batch = angularFiles.slice(i, i + batchSize)

      await Promise.all(
        batch.map(async (file) => {
          try {
            const content = await fetchFileContent(owner, repo, file.sha, token)
            if (content) {
              await storeCodeChunk(
                {
                  repoSlug: `${owner}/${repo}`,
                  branch,
                  filePath: file.path,
                  content,
                  provider: 'github',
                },
                supabase
              )
            }
          } catch (error) {
            console.error(`Error processing ${file.path}:`, error)
          }
        })
      )

      processedCount += batch.length

      // Update progress
      await supabase
        .from('ingestion_jobs')
        .update({
          processed_items: processedCount,
          progress: Math.floor((processedCount / angularFiles.length) * 100),
        })
        .eq('id', jobId)
    }

    // Mark job as completed
    await supabase
      .from('ingestion_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        progress: 100,
      })
      .eq('id', jobId)
  } catch (error) {
    // Mark job as failed
    await supabase
      .from('ingestion_jobs')
      .update({
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      .eq('id', jobId)

    throw error
  }
}

async function getRepoTree(
  owner: string,
  repo: string,
  branch: string,
  token?: string
): Promise<GitHubTreeItem[]> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'ngx-copilot-sdk',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // First, get the branch ref to get the commit SHA
  const refUrl = `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branch}`
  const refResponse = await fetch(refUrl, { headers })

  if (!refResponse.ok) {
    throw new Error(`Failed to get branch ref: ${refResponse.statusText}`)
  }

  const refData = await refResponse.json()
  const commitSha = refData.object.sha

  // Get the tree recursively
  const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${commitSha}?recursive=1`
  const treeResponse = await fetch(treeUrl, { headers })

  if (!treeResponse.ok) {
    throw new Error(`Failed to get tree: ${treeResponse.statusText}`)
  }

  const treeData = await treeResponse.json()

  // Filter to only blobs (files, not directories)
  return (treeData.tree || []).filter(
    (item: GitHubTreeItem) => item.type === 'blob'
  )
}

async function fetchFileContent(
  owner: string,
  repo: string,
  sha: string,
  token?: string
): Promise<string | null> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3.raw',
    'User-Agent': 'ngx-copilot-sdk',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const url = `https://api.github.com/repos/${owner}/${repo}/git/blobs/${sha}`

  const response = await fetch(url, { headers })

  if (!response.ok) {
    console.error(`Failed to fetch file: ${response.statusText}`)
    return null
  }

  // GitHub returns base64 encoded content for blobs
  const data = await response.json()
  
  if (data.encoding === 'base64') {
    return Buffer.from(data.content, 'base64').toString('utf-8')
  }

  return data.content
}

function isAngularFile(path: string): boolean {
  // Include TypeScript files but exclude node_modules, dist, etc.
  if (!path.endsWith('.ts') && !path.endsWith('.html')) return false
  if (path.includes('node_modules/')) return false
  if (path.includes('/dist/')) return false
  if (path.includes('/.angular/')) return false
  if (path.includes('/.git/')) return false

  return true
}

function detectComponentType(filePath: string, content: string): AngularComponentType | undefined {
  for (const [type, pattern] of Object.entries(ANGULAR_FILE_PATTERNS)) {
    if (pattern.test(filePath)) {
      return type as AngularComponentType
    }
  }

  // Check content for decorators
  if (content.includes('@Component')) return 'component'
  if (content.includes('@Injectable')) return 'service'
  if (content.includes('@NgModule')) return 'module'
  if (content.includes('@Directive')) return 'directive'
  if (content.includes('@Pipe')) return 'pipe'

  return undefined
}

function extractComponentName(content: string, filePath: string): string | undefined {
  // Try to extract from class declaration
  const classMatch = content.match(/export\s+class\s+(\w+)/)?.[1]
  if (classMatch) return classMatch

  // Fall back to file name
  const fileName = filePath.split('/').pop()
  if (fileName) {
    return fileName.replace(/\.(component|service|module|directive|pipe|guard|resolver)\.ts$/, '')
  }

  return undefined
}

function extractSelectors(content: string, filePath: string): SelectorInfo[] {
  const selectors: SelectorInfo[] = []

  // Extract Angular component selector
  const selectorMatch = content.match(/selector:\s*['"]([^'"]+)['"]/)?.[1]
  if (selectorMatch) {
    selectors.push({
      selector: selectorMatch,
      type: 'css',
      description: 'Angular component selector',
    })
  }

  // Extract data-testid attributes from templates
  const testIdMatches = content.matchAll(/data-testid=["']([^"']+)["']/g)
  for (const match of testIdMatches) {
    selectors.push({
      selector: `[data-testid="${match[1]}"]`,
      type: 'testId',
    })
  }

  // Extract id attributes
  const idMatches = content.matchAll(/\bid=["']([^"']+)["']/g)
  for (const match of idMatches) {
    if (!match[1].includes('{{')) {
      selectors.push({
        selector: `#${match[1]}`,
        type: 'css',
      })
    }
  }

  // Extract class attributes for interactive elements
  const buttonClasses = content.matchAll(/<button[^>]+class=["']([^"']+)["']/g)
  for (const match of buttonClasses) {
    const classes = match[1].split(' ').filter((c) => c.trim())
    if (classes.length > 0) {
      selectors.push({
        selector: `button.${classes[0]}`,
        type: 'css',
        description: 'Button element',
      })
    }
  }

  return selectors
}

function extractRoutes(content: string): RouteInfo[] {
  const routes: RouteInfo[] = []

  // Match route configurations
  const routePattern = /\{\s*path:\s*['"]([^'"]*)['"]/g
  let match

  while ((match = routePattern.exec(content)) !== null) {
    const path = match[1]

    // Try to extract component
    const afterPath = content.slice(match.index, match.index + 200)
    const componentMatch = afterPath.match(/component:\s*(\w+)/)

    routes.push({
      path: path || '/',
      component: componentMatch?.[1],
    })
  }

  return routes
}

function extractDependencies(content: string): string[] {
  const dependencies: string[] = []

  // Extract imports
  const importMatches = content.matchAll(/import\s+.*?from\s+['"]([^'"]+)['"]/g)
  for (const match of importMatches) {
    const importPath = match[1]
    if (!importPath.startsWith('.') && !importPath.startsWith('@angular')) {
      dependencies.push(importPath)
    }
  }

  // Extract constructor injections
  const injectionMatches = content.matchAll(/constructor\s*\([^)]*private\s+\w+:\s*(\w+)/g)
  for (const match of injectionMatches) {
    dependencies.push(match[1])
  }

  return [...new Set(dependencies)]
}

async function storeCodeChunk(
  data: {
    repoSlug: string
    branch: string
    filePath: string
    content: string
    provider: 'github' | 'bitbucket'
  },
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<void> {
  const { repoSlug, branch, filePath, content, provider } = data

  // Analyze the code
  const componentType = detectComponentType(filePath, content)
  const componentName = extractComponentName(content, filePath)
  const selectors = extractSelectors(content, filePath)
  const routes = extractRoutes(content)
  const dependencies = extractDependencies(content)

  // Create chunks if the file is large
  const chunks = content.length > 2000 ? chunkText(content, { maxChunkSize: 2000 }) : [content]

  // Generate embeddings
  const textsToEmbed = chunks.map((chunk) => {
    const context = [
      filePath,
      componentType,
      componentName,
      selectors.map((s) => s.selector).join(' '),
      routes.map((r) => r.path).join(' '),
    ]
      .filter(Boolean)
      .join(' | ')

    return `${context}\n\n${chunk}`
  })

  const embeddings = await generateEmbeddings(textsToEmbed)

  // Store each chunk
  for (let i = 0; i < chunks.length; i++) {
    const contentHash = createContentHash(chunks[i])

    // Check if this exact content already exists
    const { data: existing } = await supabase
      .from('code_chunks')
      .select('id')
      .eq('content_hash', contentHash)
      .eq('repo_slug', repoSlug)
      .eq('branch', branch)
      .single()

    const metadata = {
      provider,
      chunkIndex: i,
      totalChunks: chunks.length,
    }

    if (existing) {
      // Update existing chunk
      await supabase
        .from('code_chunks')
        .update({
          content: chunks[i],
          embedding: embeddings[i],
          component_type: componentType,
          component_name: componentName,
          selectors,
          routes,
          dependencies,
          metadata,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
    } else {
      // Insert new chunk
      await supabase.from('code_chunks').insert({
        repo_slug: repoSlug,
        branch,
        file_path: filePath,
        content: chunks[i],
        embedding: embeddings[i],
        language: 'typescript',
        component_type: componentType,
        component_name: componentName,
        selectors,
        routes,
        dependencies,
        metadata,
        content_hash: contentHash,
        line_start: i > 0 ? i * 50 : 1,
        line_end: (i + 1) * 50,
      })
    }
  }
}

// Get repository branches
export async function getGitHubBranches(
  owner: string,
  repo: string,
  token?: string
): Promise<Array<{ name: string; isDefault: boolean }>> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'ngx-copilot-sdk',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Get repo info for default branch
  const repoUrl = `https://api.github.com/repos/${owner}/${repo}`
  const repoResponse = await fetch(repoUrl, { headers })

  if (!repoResponse.ok) {
    throw new Error(`Failed to fetch repo info: ${repoResponse.statusText}`)
  }

  const repoData = await repoResponse.json()
  const defaultBranch = repoData.default_branch

  // Get branches
  const branchesUrl = `https://api.github.com/repos/${owner}/${repo}/branches`
  const branchesResponse = await fetch(branchesUrl, { headers })

  if (!branchesResponse.ok) {
    throw new Error(`Failed to fetch branches: ${branchesResponse.statusText}`)
  }

  const branches = await branchesResponse.json()

  return branches.map((branch: { name: string }) => ({
    name: branch.name,
    isDefault: branch.name === defaultBranch,
  }))
}

// Validate GitHub access
export async function validateGitHubAccess(
  owner: string,
  repo: string,
  token?: string
): Promise<boolean> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'ngx-copilot-sdk',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const url = `https://api.github.com/repos/${owner}/${repo}`
    const response = await fetch(url, { headers })
    return response.ok
  } catch {
    return false
  }
}

// Parse GitHub URL to extract owner and repo
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  // Support various GitHub URL formats
  const patterns = [
    /github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?(?:\/.*)?$/,
    /^([^\/]+)\/([^\/]+)$/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace(/\.git$/, ''),
      }
    }
  }

  return null
}
