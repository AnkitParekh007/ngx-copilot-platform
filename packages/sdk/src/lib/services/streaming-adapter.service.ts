import { Injectable } from '@angular/core';
import { Observable, from, concatMap, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface StreamingChunk { text: string; done: boolean; }

export function tokenizePrompt(prompt: string): string[] {
  return (`Mock streamed SDK response for: ${prompt}`).split(' ');
}

@Injectable({ providedIn: 'root' })
export class StreamingAdapterService {
  stream(prompt: string): Observable<StreamingChunk> {
    const tokens = tokenizePrompt(prompt);

    return from(tokens).pipe(
      concatMap((token, index) =>
        of({ text: token + ' ', done: index === tokens.length - 1 }).pipe(delay(35)),
      ),
    );
  }
}
