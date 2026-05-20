export interface RagResult {
  id: string;
  title: string;
  snippet: string;
  score: number;
  sourceType?: string;
  sourceUrl?: string;
  /** Repository name (e.g. monorepo package) when source is from code search. */
  repo?: string;
  /** VCS branch for code-backed citations. */
  branch?: string;
  /** Path within the repo for file-level citations. */
  filePath?: string;
  /** Lexical kind hint: e.g. component, service, route. */
  fileKind?: string;
  /** Chunk identifier from a backend chunking pipeline (optional). */
  chunkId?: string;
  /** Free-form tags for filtering or UI chips. */
  tags?: string[];
}
