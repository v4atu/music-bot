import type { Player, Queue, Track } from 'lavalink-client';

export function createFakeTrack(overrides: Record<string, any> = {}): Track {
  const { info: infoOverrides, requester, ...rest } = overrides;

  return {
    requester: requester ?? '<@123456789>',
    ...rest,
    info: {
      title: 'Test Track',
      author: 'Test Author',
      duration: 185000,
      artworkUrl: 'https://example.com/art.png',
      ...infoOverrides,
    },
  } as unknown as Track;
}

export function createFakeQueue(overrides: Record<string, any> = {}): Queue {
  return {
    current: null,
    tracks: [],
    add: jest.fn(),
    ...overrides,
  } as unknown as Queue;
}

export function createFakePlayer(
  overrides: Record<string, any> = {},
): jest.Mocked<Player> {
  const queue = overrides.queue ?? createFakeQueue();

  return {
    guildId: 'guild-1',
    textChannelId: 'channel-1',
    playing: false,
    paused: false,
    repeatMode: 'off',
    queue,
    connect: jest.fn().mockResolvedValue(undefined),
    search: jest.fn(),
    play: jest.fn().mockResolvedValue(undefined),
    pause: jest.fn(),
    resume: jest.fn(),
    skip: jest.fn(),
    stopPlaying: jest.fn(),
    ...overrides,
  } as unknown as jest.Mocked<Player>;
}
