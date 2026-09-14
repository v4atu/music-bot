export function createFakeInteraction(overrides: Record<string, any> = {}) {
  return {
    guildId: 'guild-1',
    user: { id: 'user-1', toString: () => '<@user-1>' },
    reply: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

export function createFakeTextChannel(overrides: Record<string, any> = {}) {
  return {
    isTextBased: () => true,
    isSendable: () => true,
    send: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

export function createFakeNonSendableChannel() {
  return createFakeTextChannel({ isSendable: () => false });
}

export function createFakeClient(overrides: Record<string, any> = {}) {
  return {
    channels: {
      fetch: jest.fn(),
    },
    ...overrides,
  };
}
