import { Test } from '@nestjs/testing';
import { PlayerManagerService } from '@necord/lavalink';
import { EmbedService } from 'src/embed/embed.service';
import { ClearCommand } from './clear.command';
import {
  createFakePlayer,
  createFakeQueue,
} from 'src/testing/lavalink.fixtures';
import { createPlayerManagerMock } from 'src/testing/player-manager.mock';
import { createFakeInteraction } from 'src/testing/discord.fixtures';

async function buildCommand(
  player: ReturnType<typeof createFakePlayer> | undefined,
) {
  const moduleRef = await Test.createTestingModule({
    providers: [
      ClearCommand,
      {
        provide: PlayerManagerService,
        useValue: createPlayerManagerMock(player),
      },
      EmbedService,
    ],
  }).compile();

  return moduleRef.get(ClearCommand);
}

describe('ClearCommand', () => {
  it('replies with a UserFacingError when there is no active player', async () => {
    const command = await buildCommand(undefined);
    const interaction = createFakeInteraction();

    await command.onClear([interaction] as any);

    const embed = interaction.reply.mock.calls[0][0].embeds[0];
    expect(embed.data.title).toBe('User Input Error');
  });

  it('stops playback and replies with success', async () => {
    const player = createFakePlayer({ queue: createFakeQueue() });
    const command = await buildCommand(player);
    const interaction = createFakeInteraction();

    await command.onClear([interaction] as any);

    expect(player.stopPlaying).toHaveBeenCalledTimes(1);
    const embed = interaction.reply.mock.calls[0][0].embeds[0];
    expect(embed.data.title).toBe('Queue Cleared');
  });

  it('does not throw when the queue is already empty', async () => {
    const player = createFakePlayer({
      queue: createFakeQueue({ current: null, tracks: [] }),
    });
    const command = await buildCommand(player);
    const interaction = createFakeInteraction();

    await expect(command.onClear([interaction] as any)).resolves.not.toThrow();
    expect(player.stopPlaying).toHaveBeenCalledTimes(1);
  });

  it('replies with an internal error embed when an unexpected error is thrown', async () => {
    const player = createFakePlayer({ queue: createFakeQueue() });
    player.stopPlaying.mockImplementation(() => {
      throw new Error('boom');
    });
    const command = await buildCommand(player);
    const interaction = createFakeInteraction();

    await command.onClear([interaction] as any);

    const embed = interaction.reply.mock.calls[0][0].embeds[0];
    expect(embed.data.title).toBe('Internal Error');
  });
});
