import '@angular/compiler';
import test from 'node:test';
import assert from 'node:assert/strict';
import { firstValueFrom, toArray } from 'rxjs';

import {
  NgxCopilotPlatformBackendAdapter,
  type CopilotEvent,
  type RagResult,
} from '../src/public-api';

const originalFetch = globalThis.fetch;

function createSseResponse(events: CopilotEvent[]): Response {
  const payload = events.map(event => `data: ${JSON.stringify(event)}\n\n`).join('');
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(payload));
      controller.close();
    },
  });

  return new Response(stream, {
    status: 200,
    headers: { 'Content-Type': 'text/event-stream' },
  });
}

test('platform adapter send() posts CopilotRequest JSON and parses backend SSE events', async () => {
  const events: CopilotEvent[] = [
    { type: 'session-started', sessionId: 's1' },
    { type: 'message-start', messageId: 'm1' },
    { type: 'message-chunk', messageId: 'm1', content: 'Hello' },
    {
      type: 'message-complete',
      message: { id: 'm1', role: 'assistant', content: 'Hello', createdAt: '2026-05-26T00:00:00.000Z' },
    },
    { type: 'done' },
  ];

  let requestUrl = '';
  let requestMethod = '';
  let requestHeaders: HeadersInit | undefined;
  let requestBody = '';

  globalThis.fetch = (async (input, init) => {
    requestUrl = String(input);
    requestMethod = init?.method ?? 'GET';
    requestHeaders = init?.headers;
    requestBody = String(init?.body ?? '');
    return createSseResponse(events);
  }) as typeof fetch;

  try {
    const adapter = new NgxCopilotPlatformBackendAdapter({
      apiUrl: 'http://localhost:3001',
      apiKey: 'cpk_test_key',
    });

    const received = await firstValueFrom(
      adapter.send({
        sessionId: 's1',
        message: 'hello',
        mode: 'ask',
      }).pipe(toArray()),
    );

    assert.equal(requestUrl, 'http://localhost:3001/api/copilot/chat/stream');
    assert.equal(requestMethod, 'POST');
    assert.match(requestBody, /"message":"hello"/);
    assert.deepEqual(received, events);

    const headers = new Headers(requestHeaders);
    assert.equal(headers.get('Content-Type'), 'application/json');
    assert.equal(headers.get('Authorization'), 'Bearer cpk_test_key');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('platform adapter queryRag() accepts raw RagResult[] responses', async () => {
  const results: RagResult[] = [
    {
      id: 'rag-1',
      title: 'Upload Component',
      snippet: 'Handles uploads.',
      score: 0.91,
      sourceType: 'code',
      filePath: 'src/app/upload/upload.component.ts',
    },
  ];

  globalThis.fetch = (async () =>
    new Response(JSON.stringify(results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })) as typeof fetch;

  try {
    const adapter = new NgxCopilotPlatformBackendAdapter({
      apiUrl: 'http://localhost:3001',
      apiKey: 'cpk_test_key',
    });

    const received = await firstValueFrom(
      adapter.queryRag({
        query: 'upload workflow',
        limit: 10,
      }),
    );

    assert.deepEqual(received, results);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
