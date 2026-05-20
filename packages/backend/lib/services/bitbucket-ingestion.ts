import { createClient } from '@/lib/supabase/server'
import { generateEmbeddings, chunkText, createContentHash } from './embedding'
import type {
  CodeChunk,
  AngularComponentType,
  SelectorInfo,
  RouteInfo,
} from '@/lib/types/copilot'

interface BitbucketConfig {
  workspace: string
  repoSlug: string
  branch?: string
  username: string
  appPassword: string
}

interface BitbucketFile {
  path: string
  type: 'commit_file' | 'commit_directory'
  size?: number
}

// Angular file patterns
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

export async function crawlBitbucketRepo(
  config: BitbucketConfig,
  jobId: string
): Promise<void> {
  const { workspace, repoSlug, branch = 'main', username, appPassword } = config
  const supabase = await createClient()
  const auth = Buffer.from(`${username}:${appPassword}`).toString('base64')

  // Update job status
  await supabase
    .from('ingestion_jobs')
    .update({ status: 'running', started_at: new Date().toISOString() })
    .eq('id', jobId)

  try {
    // Get all files in the repository
    const files = await listAllFiles(workspace, repoSlug, branch, auth)

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
            const content = await fetchFileContent(
              workspace,
              repoSlug,
              branch,
              file.path,
              auth
            )
            if (content) {
              await storeCodeChunk(
                {
                  repoSlug,
                  branch,
                  filePath: file.path,
                  content,
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

async function listAllFiles(
  workspace: string,
  repoSlug: string,
  branch: string,
  auth: string,
  path: string = ''
): Promise<BitbucketFile[]> {
  const files: BitbucketFile[] = []
  let url = `https://api.bitbucket.org/2.0/repositories/${workspace}/${repoSlug}/src/${branch}/${path}?pagelen=100`

  while (url) {
    const response = await fetch(url, {
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to list files: ${response.statusText}`)
    }

    const data = await response.json()

    for (const item of data.values || []) {
      if (item.type === 'commit_file') {
        files.push({
          path: item.path,
          type: item.type,
          size: item.size,
        })
      } else if (item.type === 'commit_directory') {
        // Recursively get files from subdirectories
        const subFiles = await listAllFiles(workspace, repoSlug, branch, auth, item.path)
        files.push(...subFiles)
      }
    }

    url = data.next || null
  }

  return files
}

async function fetchFileContent(
  workspace: string,
  repoSlug: string,
  branch: string,
  filePath: string,
  auth: string
): Promise<string | null> {
  const url = `https://api.bitbucket.org/2.0/repositories/${workspace}/${repoSlug}/src/${branch}/${filePath}`

  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: 'text/plain',
    },
  })

  if (!response.ok) {
    console.error(`Failed to fetch ${filePath}: ${response.statusText}`)
    return null
  }

  return response.text()
}

function isAngularFile(path: string): boolean {
  // Include TypeScript files but exclude node_modules, dist, etc.
  if (!path.endsWith('.ts') && !path.endsWith('.html')) return false
  if (path.includes('node_modules/')) return false
  if (path.includes('/dist/')) return false
  if (path.includes('/.angular/')) return false

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
      // Skip Angular interpolations
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
  },
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<void> {
  const { repoSlug, branch, filePath, content } = data

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
        content_hash: contentHash,
        line_start: i > 0 ? i * 50 : 1, // Approximate line numbers
        line_end: (i + 1) * 50,
      })
    }
  }
}

// Get repository branches
export async function getBitbucketBranches(
  workspace: string,
  repoSlug: string,
  username: string,
  appPassword: string
): Promise<Array<{ name: string; isDefault: boolean }>> {
  const auth = Buffer.from(`${username}:${appPassword}`).toString('base64')
  const url = `https://api.bitbucket.org/2.0/repositories/${workspace}/${repoSlug}/refs/branches`

  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch branches: ${response.statusText}`)
  }

  const data = await response.json()

  return (data.values || []).map((branch: Record<string, unknown>) => ({
    name: branch.name as string,
    isDefault: (branch as { name: string; default_merge_strategy?: { name?: string } }).name === 'main' || (branch as { name: string; default_merge_strategy?: { name?: string } }).name === 'master',
  }))
}

// Validate Bitbucket credentials
export async function validateBitbucketCredentials(
  workspace: string,
  repoSlug: string,
  username: string,
  appPassword: string
): Promise<boolean> {
  const auth = Buffer.from(`${username}:${appPassword}`).toString('base64')
  const url = `https://api.bitbucket.org/2.0/repositories/${workspace}/${repoSlug}`

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: 'application/json',
      },
    })

    return response.ok
  } catch {
    return false
  }
}
