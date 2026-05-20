import '@angular/compiler';
import test from 'node:test';
import assert from 'node:assert/strict';
import { lastValueFrom } from 'rxjs';
import { toArray } from 'rxjs/operators';

import { StreamingAdapterService, tokenizePrompt } from '../src/public-api';

test('tokenizePrompt splits on whitespace', () => {
  const tokens = tokenizePrompt('hello world foo');
  assert.deepEqual(tokens.slice(-3), ['hello', 'world', 'foo']);
});

test('tokenizePrompt returns array with at least one token for single word', () => {
  const tokens = tokenizePrompt('hello');
  assert.ok(tokens.length >= 1);
  assert.ok(tokens.includes('hello'));
});

test('tokenizePrompt handles empty string without throwing', () => {
  const tokens = tokenizePrompt('');
  assert.ok(Array.isArray(tokens));
});

test('stream emits final chunk with done=true', async () => {
  const service = new StreamingAdapterService();
  const chunks = await lastValueFrom(service.stream('hello world').pipe(toArray()));
  assert.equal(chunks.at(-1)?.done, true);
});

test('stream emits all tokens from the prompt', async () => {
  const service = new StreamingAdapterService();
  const chunks = await lastValueFrom(service.stream('hello world').pipe(toArray()));
  const fullText = chunks.map(c => c.text).join('');
  assert.match(fullText, /hello/);
  assert.match(fullText, /world/);
});

test('stream emits multiple chunks for multi-word prompt', async () => {
  const service = new StreamingAdapterService();
  const chunks = await lastValueFrom(service.stream('one two three').pipe(toArray()));
  assert.ok(chunks.length > 1, 'expected more than one chunk for multi-word input');
});

test('stream chunks have text property', async () => {
  const service = new StreamingAdapterService();
  const chunks = await lastValueFrom(service.stream('test').pipe(toArray()));
  for (const chunk of chunks) {
    assert.ok('text' in chunk, 'each chunk should have a text property');
  }
});
