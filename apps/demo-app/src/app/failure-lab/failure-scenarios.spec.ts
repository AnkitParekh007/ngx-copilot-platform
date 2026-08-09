import { buildFailureLabScenario, retryFailureLabScenario } from './failure-scenarios';

describe('failure lab SDK contracts', () => {
  it('models an SSE disconnect as recoverable error without done event', () => {
    const scenario = buildFailureLabScenario('sse-disconnect');
    const errorEvent = scenario.events.find(event => event.type === 'error');

    expect(errorEvent?.type).toBe('error');
    if (errorEvent?.type === 'error') {
      expect(errorEvent.error.code).toBe('STREAM_DISCONNECTED');
      expect(errorEvent.error.recoverable).toBeTrue();
    }
    expect(scenario.events.some(event => event.type === 'done')).toBeFalse();
    expect(scenario.terminalClaim).toBe('failed');
  });

  it('suppresses citations and tools when retrieval fails', () => {
    const scenario = buildFailureLabScenario('retrieval-failure');

    expect(scenario.sources).toEqual([]);
    expect(scenario.timeline).toEqual([]);
    expect(scenario.events.some(event => event.type === 'sources')).toBeFalse();
    expect(scenario.events.some(event => event.type === 'tool-timeline')).toBeFalse();
    expect(scenario.result).toContain('no citations');
  });

  it('records rejected approval as terminal non-executed state', () => {
    const scenario = buildFailureLabScenario('approval-rejected');
    const resolution = scenario.events.find(event => event.type === 'approval-resolved');

    expect(resolution?.type).toBe('approval-resolved');
    if (resolution?.type === 'approval-resolved') {
      expect(resolution.decision).toBe('rejected');
    }
    expect(scenario.timeline[0]?.status).toBe('skipped');
    expect(scenario.terminalClaim).toBe('not-executed');
  });

  it('keeps disabled execution explicit', () => {
    const scenario = buildFailureLabScenario('tool-disabled');

    expect(scenario.timeline[0]?.status).toBe('skipped');
    expect(scenario.timeline[0]?.summary).toContain('disabled');
    expect(scenario.terminalClaim).toBe('not-executed');
  });

  it('retries disconnected stream with the exact same request context', () => {
    const failed = buildFailureLabScenario('sse-disconnect');
    const recovered = retryFailureLabScenario(failed);

    expect(recovered.recovered).toBeTrue();
    expect(recovered.requestContext).toEqual(failed.requestContext);
    expect(recovered.sources.length).toBeGreaterThan(0);
    expect(recovered.timeline[0]?.status).toBe('awaiting_approval');
    expect(recovered.terminalClaim).toBe('none');
  });
});
