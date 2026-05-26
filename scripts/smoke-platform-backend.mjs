#!/usr/bin/env node

const args = new Map(
  process.argv.slice(2).map(arg => {
    const [key, ...rest] = arg.replace(/^--/, '').split('=');
    return [key, rest.join('=') || 'true'];
  }),
);

if (args.has('help')) {
  printHelp();
  process.exit(0);
}

const baseUrl = (args.get('url') || process.env.BACKEND_URL || 'http://localhost:3001').replace(/\/$/, '');
const apiKey = args.get('apiKey') || process.env.COPILOT_API_KEY || process.env.API_KEY || '';
const ragQuery = args.get('ragQuery') || 'upload workflow';
const chatMessage = args.get('chatMessage') || 'Explain the upload workflow briefly.';

if (!apiKey) {
  console.error('Missing API key. Pass --apiKey=cpk_... or set COPILOT_API_KEY.');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${apiKey}`,
};

async function main() {
  console.log(`Smoke target: ${baseUrl}`);

  await smokeRag();
  await smokeStream();

  console.log('Smoke check passed.');
}

async function smokeRag() {
  const response = await fetch(`${baseUrl}/api/copilot/rag/query`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: ragQuery,
      limit: 3,
    }),
  });

  if (!response.ok) {
    throw new Error(`RAG query failed: HTTP ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload)) {
    throw new Error(`RAG query returned non-array payload: ${JSON.stringify(payload)}`);
  }

  console.log(`RAG query ok: received ${payload.length} result(s).`);
}

async function smokeStream() {
  const response = await fetch(`${baseUrl}/api/copilot/chat/stream`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      sessionId: 'smoke-session',
      message: chatMessage,
      mode: 'ask',
      context: {
        currentUrl: 'http://localhost:4201',
        pageTitle: 'Smoke Test',
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Chat stream failed: HTTP ${response.status} ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error('Chat stream response body is not readable.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  const eventTypes = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const json = line.slice(6).trim();
      if (!json || json === '[DONE]') continue;

      const event = JSON.parse(json);
      eventTypes.push(event.type);

      if (event.type === 'error') {
        throw new Error(`Chat stream returned error event: ${JSON.stringify(event.error)}`);
      }
    }
  }

  const requiredTypes = ['session-started', 'message-start', 'message-complete', 'done'];
  for (const type of requiredTypes) {
    if (!eventTypes.includes(type)) {
      throw new Error(`Chat stream missing required event type "${type}". Saw: ${eventTypes.join(', ')}`);
    }
  }

  console.log(`Chat stream ok: ${eventTypes.join(' -> ')}`);
}

function printHelp() {
  console.log(`Usage:
  node scripts/smoke-platform-backend.mjs --apiKey=cpk_dev_xxx [--url=http://localhost:3001]

Options:
  --url         Backend base URL. Defaults to http://localhost:3001
  --apiKey      Backend API key (cpk_*). Can also use COPILOT_API_KEY env var.
  --ragQuery    Query sent to /api/copilot/rag/query
  --chatMessage Message sent to /api/copilot/chat/stream
  --help        Show this message`);
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
