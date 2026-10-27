// Preloaded with `node --import` by the CLI import tests. Replaces fetch with canned
// API and MCP replies read from PROOFABLE_TEST_FETCH_REPLIES and records every request
// to PROOFABLE_TEST_FETCH_LOG as one JSON line.
import fs from 'node:fs';

const replies = JSON.parse(fs.readFileSync(process.env.PROOFABLE_TEST_FETCH_REPLIES, 'utf8'));
const logPath = process.env.PROOFABLE_TEST_FETCH_LOG;

function json(value, init = {}) {
  return new Response(JSON.stringify(value), {
    status: init.status || 200,
    headers: { 'content-type': 'application/json', ...(init.headers || {}) }
  });
}

globalThis.fetch = async (input, init = {}) => {
  const url = String(input);
  const body = typeof init.body === 'string' ? JSON.parse(init.body) : null;
  const key = body?.jsonrpc
    ? body.method === 'tools/call'
      ? `mcp:${body.params.name}`
      : `mcp:${body.method}`
    : new URL(url).pathname;
  fs.appendFileSync(logPath, `${JSON.stringify({ url, key, headers: init.headers || {}, body })}\n`);

  if (!(key in replies)) return json({ error: { message: `No test reply for ${key}` } }, { status: 500 });
  const reply = replies[key];
  if (!body?.jsonrpc) return json(reply.body, { status: reply.status || 200 });
  const result = key === 'mcp:initialize'
    ? reply
    : { content: [{ type: 'text', text: JSON.stringify(reply) }] };
  return json({ jsonrpc: '2.0', id: body.id, result }, { headers: { 'mcp-session-id': 'test-session' } });
};
