import type { Player } from 'lavalink-client';
import type { PlayerManagerService } from '@necord/lavalink';

export function createPlayerManagerMock(
  player: Player | undefined = undefined,
): jest.Mocked<PlayerManagerService> {
  return {
    get: jest.fn().mockReturnValue(player),
    create: jest.fn().mockReturnValue(player),
  } as unknown as jest.Mocked<PlayerManagerService>;
}
