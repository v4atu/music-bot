import { Test } from '@nestjs/testing';
import { PlayerManagerService } from '@necord/lavalink';
import { EmbedService } from 'src/embed/embed.service';
import { QueueCommand } from './queue.command';
import {
  createFakePlayer,
  createFakeQueue,
  createFakeTrack,
} from 'src/testing/lavalink.fixtures';
import { createPlayerManagerMock } from 'src/testing/player-manager.mock';
import { createFakeInteraction } from 'src/testing/discord.fixtures';

async function buildCommand(
  player: ReturnType<typeof createFakePlayer> | undefined,
) {
  const moduleRef = await Test.createTestingModule({
    providers: [
      QueueCommand,
      {
        provide: PlayerManagerService,
        useValue: createPlayerManagerMock(player),
      },
      EmbedService,
    ],
  }).compile();

  return moduleRef.get(QueueCommand);
}

describe('QueueCommand', () => {
  it('replies with a UserFacingError when there is no active player', async () => {
    const command = await buildCommand(undefined);
    const interaction = createFakeInteraction();

    await command.onQueue([interaction] as any);

    const embed = interaction.reply.mock.calls[0][0].embeds[0];
    expect(embed.data.title).toBe('User Input Error');
  });

  it('replies with a UserFacingError when the queue is empty', async () => {
    const player = createFakePlayer({
      queue: createFakeQueue({ current: null, tracks: [] }),
    });
    const command = await buildCommand(player);
    const interaction = createFakeInteraction();

    await command.onQueue([interaction] as any);

    const embed = interaction.reply.mock.calls[0][0].embeds[0];
    expect(embed.data.title).toBe('User Input Error');
  });

  it('replies with an ephemeral queue embed when there is content', async () => {
    const player = createFakePlayer({
      queue: createFakeQueue({
        current: createFakeTrack(),
        tracks: [createFakeTrack()],
      }),
    });
    const command = await buildCommand(player);
    const interaction = createFakeInteraction();

    await command.onQueue([interaction] as any);

    const call = interaction.reply.mock.calls[0][0];
    expect(call.flags).toBe('Ephemeral');
    expect(call.embeds[0].data.title).toBe('🎵 Music Queue');
  });

  it('replies with an internal error embed when an unexpected error is thrown', async () => {
    const player = createFakePlayer({
      queue: {
        get current() {
          throw new Error('boom');
        },
        tracks: [],
      } as any,
    });
    const command = await buildCommand(player);
    const interaction = createFakeInteraction();

    await command.onQueue([interaction] as any);

    const embed = interaction.reply.mock.calls[0][0].embeds[0];
    expect(embed.data.title).toBe('Internal Error');
  });
});
