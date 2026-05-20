import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { RagResult } from '../models/rag-result.model';

@Injectable({ providedIn: 'root' })
export class RagAdapterService {
  normalize(results: Partial<RagResult>[]): RagResult[] {
    return results.map((result, index) => ({
      ...result,
      id: result.id ?? `rag-${index + 1}`,
      title: result.title ?? 'Untitled source',
      snippet: result.snippet ?? 'No snippet available.',
      score: result.score ?? 0,
      sourceType: result.sourceType ?? 'knowledge-base',
    }));
  }

  search(query: string): Observable<RagResult[]> {
    return of(
      this.normalize([
        {
          id: 'mock-rag-1',
          title: 'Mock source',
          snippet: 'Replace this with backend RAG results for ' + query,
          score: 0.82,
        },
      ]),
    );
  }
}
