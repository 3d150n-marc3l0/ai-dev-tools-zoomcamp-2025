import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock socket.io-client
const mockSocket = {
  on: vi.fn(),
  emit: vi.fn(),
  disconnect: vi.fn(),
  off: vi.fn(),
  connected: false,
};

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocket),
}));

describe('useSocketSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSocket.on.mockReset();
    mockSocket.emit.mockReset();
    mockSocket.disconnect.mockReset();
    mockSocket.off.mockReset();
    localStorage.clear();
  });

  it('should be importable', async () => {
    const { useSocketSession } = await import('./useSocketSession');
    expect(useSocketSession).toBeDefined();
  });

  it('should set up socket event listeners', async () => {
    const { useSocketSession } = await import('./useSocketSession');

    renderHook(() => useSocketSession({
      sessionCode: 'ABC123',
    }));

    // Verify socket.on was called for expected events
    expect(mockSocket.on).toHaveBeenCalled();
  });

  it('should provide emit functions', async () => {
    const { useSocketSession } = await import('./useSocketSession');

    const { result } = renderHook(() => useSocketSession({
      sessionCode: 'ABC123',
    }));

    expect(result.current.emitContentUpdate).toBeDefined();
    expect(result.current.emitLanguageUpdate).toBeDefined();
    expect(result.current.emitTitleUpdate).toBeDefined();
  });

  it('should disconnect on unmount', async () => {
    const { useSocketSession } = await import('./useSocketSession');

    const { unmount } = renderHook(() => useSocketSession({
      sessionCode: 'ABC123',
    }));

    unmount();

    expect(mockSocket.disconnect).toHaveBeenCalled();
  });

  it('should send username in session:join event', async () => {
    const { useSocketSession } = await import('./useSocketSession');
    localStorage.setItem('code_connect_username', 'TestUser');

    renderHook(() => useSocketSession({
      sessionCode: 'ABC123',
    }));

    // Simulate connect event to trigger join
    const connectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect')?.[1];
    expect(connectHandler).toBeDefined();

    act(() => {
      connectHandler();
    });

    expect(mockSocket.emit).toHaveBeenCalledWith('session:join', {
      sessionCode: 'ABC123',
      username: 'TestUser'
    });
  });

  it('should update participants when participant:joined event is received', async () => {
    const { useSocketSession } = await import('./useSocketSession');

    const { result } = renderHook(() => useSocketSession({
      sessionCode: 'ABC123',
    }));

    // Find the event handler
    const joinHandler = mockSocket.on.mock.calls.find(call => call[0] === 'participant:joined')?.[1];
    expect(joinHandler).toBeDefined();

    const participantsPayload = [
      { id: '1', name: 'User1' },
      { id: '2', name: 'User2' }
    ];

    act(() => {
      joinHandler({ participantCount: 2, participants: participantsPayload });
    });

    expect(result.current.participantCount).toBe(2);
    expect(result.current.participants).toEqual(participantsPayload);
  });
});
