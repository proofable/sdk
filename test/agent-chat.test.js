import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProofableClient } from '../client.js';
import { ApiError, NetworkError, ValidationError } from '../errors.js';

const BOOK = `0x${'b'.repeat(64)}`;

/** A streamed response whose body arrives in the given chunks, split anywhere. */
function sseResponse(chunks, status = 200) {
  const encoder = new TextEncoder();
  return new Response(new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    }
  }), { status, headers: { 'content-type': 'text/event-stream' } });
}

const event = (id, type, data) => `id: ${id}\nevent: ${type}\ndata: ${JSON.stringify(data)}\n\n`;

describe('ProofableClient.agentChat', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('streams the turn and resolves with its final event, citations and all', async () => {
    const final = {
      turnId: 't1',
      outcome: 'succeeded',
      answer: 'Be kind.',
      citations: [{ qHash: BOOK, title: 'Chapter 1', facet: 'memory', visibility: 'public' }],
      agent: { agentId: 'human-alignment', agentWallet: `0x${'2'.repeat(40)}`, identityQHash: null, delegationQHash: null },
      credits: { spent: 2 }
    };
    const body = `${event(1, 'turn.start', { turnId: 't1' })  }: keep-alive\n\n${  event(2, 'answer.delta', { text: 'Be ' })
    }${event(3, 'answer.delta', { text: 'kind.' })  }${event(4, 'final', final)}`;
    // Split mid-event, as a network does.
    const fetch = vi.fn(async () => sseResponse([body.slice(0, 37), body.slice(37, 120), body.slice(120)]));
    vi.stubGlobal('fetch', fetch);

    const events = [];
    const client = new ProofableClient({ apiKey: 'npk_test' });
    const result = await client.agentChat({
      agentId: 'human-alignment',
      messages: [{ role: 'user', content: 'How does the book open?' }],
      onEvent: (type, data) => events.push([type, data])
    });

    expect(result).toEqual(final);
    expect(events.map(([type]) => type)).toEqual(['turn.start', 'answer.delta', 'answer.delta', 'final']);
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe('https://api.proofable.me/api/v1/agent/chat/turn');
    expect(init.headers).toMatchObject({ Authorization: 'Bearer npk_test', Accept: 'text/event-stream' });
    expect(JSON.parse(init.body)).toEqual({ agentId: 'human-alignment', messages: [{ role: 'user', content: 'How does the book open?' }] });
  });

  it('sends the app\'s sponsor grant for a chat when the client bills the app', async () => {
    const fetch = vi.fn(async (url) => {
      if (String(url).endsWith('/api/v1/sponsor/grant')) {
        return new Response(JSON.stringify({ success: true, data: { sponsorGrant: 'grant-1', exp: Math.floor(Date.now() / 1000) + 900, orgWallet: `0x${'3'.repeat(40)}`, appId: 'everyone' } }), { status: 200, headers: { 'content-type': 'application/json' } });
      }
      return sseResponse([event(1, 'final', { turnId: 't3', outcome: 'succeeded', answer: 'Hi.', citations: [] })]);
    });
    vi.stubGlobal('fetch', fetch);
    const client = new ProofableClient({ apiKey: 'at-ada', appId: 'everyone', billingWallet: `0x${'3'.repeat(40)}`, appOrigin: 'https://everyone.team' });
    await client.agentChat({ agentId: 'human-alignment', agentWallet: `0x${'3'.repeat(40)}`, messages: [{ role: 'user', content: 'hi' }] });
    await client.agentChat({ agentId: 'human-alignment', agentWallet: `0x${'3'.repeat(40)}`, messages: [{ role: 'user', content: 'again' }] });
    const grantCalls = fetch.mock.calls.filter(([url]) => String(url).endsWith('/api/v1/sponsor/grant'));
    // A grant is accepted once, so every turn takes its own.
    expect(grantCalls).toHaveLength(2);
    expect(JSON.parse(grantCalls[0][1].body)).toMatchObject({ scope: 'agent-chat', orgWallet: `0x${'3'.repeat(40)}` });
    expect(grantCalls[0][1].headers).toMatchObject({ Origin: 'https://everyone.team', 'X-Client-Origin': 'https://everyone.team' });
    const turnCall = fetch.mock.calls.find(([url]) => String(url).endsWith('/api/v1/agent/chat/turn'));
    expect(turnCall[1].headers).toMatchObject({ Authorization: 'Bearer at-ada', 'X-Sponsor-Grant': 'grant-1', Origin: 'https://everyone.team' });
  });

  it('raises a refusal before the stream as an ApiError with its code', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({
      success: false,
      error: { code: 'AGENT_DELEGATION_REQUIRED', message: 'No active delegation from this account to agent "x".' }
    }), { status: 403, headers: { 'content-type': 'application/json' } })));
    const client = new ProofableClient({ apiKey: 'npk_test' });
    const error = await client.agentChat({ agentId: 'x', messages: [{ role: 'user', content: 'hi' }] }).catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.statusCode ?? error.status).toBe(403);
  });

  it('fails plainly when the stream ends without a final event', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => sseResponse([event(1, 'turn.start', {})])));
    const client = new ProofableClient({ apiKey: 'npk_test' });
    await expect(client.agentChat({ messages: [{ role: 'user', content: 'hi' }] })).rejects.toBeInstanceOf(NetworkError);
  });

  it('needs a conversation', async () => {
    const client = new ProofableClient({ apiKey: 'npk_test' });
    await expect(client.agentChat({ agentId: 'x', messages: [] })).rejects.toBeInstanceOf(ValidationError);
  });
});

describe('ProofableClient.me', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('says who the credential belongs to', async () => {
    const fetch = vi.fn(async () => new Response(JSON.stringify({
      success: true,
      data: { authenticated: true, address: `0x${'3'.repeat(40)}`, handle: 'ada', profileSummary: { displayName: 'Ada Lovelace' } }
    }), { status: 200, headers: { 'content-type': 'application/json' } }));
    vi.stubGlobal('fetch', fetch);
    const client = new ProofableClient({ apiKey: 'at-1' });
    expect(await client.me()).toMatchObject({ authenticated: true, handle: 'ada', profileSummary: { displayName: 'Ada Lovelace' } });
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe('https://api.proofable.me/api/v1/auth/me');
    expect(init.headers).toMatchObject({ Authorization: 'Bearer at-1' });
  });
});

describe('ProofableClient.getUsage', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('reads the balance and spend for a period', async () => {
    const data = { credits: { remaining: 494 }, usage: { summary: { debitedByDay: { '2026-11-01': 4 } } } };
    const fetch = vi.fn(async () => new Response(JSON.stringify({ success: true, data }), { status: 200, headers: { 'content-type': 'application/json' } }));
    vi.stubGlobal('fetch', fetch);
    const client = new ProofableClient({ apiKey: 'npk_test' });
    expect(await client.getUsage({ from: '2026-10-01', to: '2026-11-01' })).toEqual(data);
    expect(fetch.mock.calls[0][0]).toBe('https://api.proofable.me/api/v1/profile/usage?from=2026-10-01&to=2026-11-01');
  });

  it('refuses a period it cannot read before calling', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    const client = new ProofableClient({ apiKey: 'npk_test' });
    await expect(client.getUsage({ from: 'last week' })).rejects.toBeInstanceOf(ValidationError);
    expect(fetch).not.toHaveBeenCalled();
  });
});
