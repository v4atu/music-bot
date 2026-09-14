import { Test } from '@nestjs/testing';
import { PlayerManagerService } from '@necord/lavalink';
import { EmbedService } from 'src/embed/embed.service';
import { SkipCommand } from './skip.command';
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
      SkipCommand,
      {
        provide: PlayerManagerService,
        useValue: createPlayerManagerMock(player),
      },
      EmbedService,
    ],
  }).compile();

  return moduleRef.get(SkipCommand);
}

describe('SkipCommand', () => {
  it('defaults to skipping 1 song when songs is omitted', async () => {
    const player = createFakePlayer({
      queue: createFakeQueue({
        current: createFakeTrack(),
        tracks: [createFakeTrack()],
      }),
    });
    const command = await buildCommand(player);
    const interaction = createFakeInteraction();

    await command.onSkip([interaction] as any, { songs: undefined } as any);

    expect(player.skip).toHaveBeenCalledWith(1);
  });

  it('rejects a skip count of 0 with a UserFacingError reply, without touching the player', async () => {
    const player = createFakePlayer();
    const command = await buildCommand(player);
    const interaction = createFakeInteraction();

    await command.onSkip([interaction] as any, { songs: 0 } as any);

    expect(interaction.reply).toHaveBeenCalledTimes(1);
    expect(player.skip).not.toHaveBeenCalled();
    expect(player.stopPlaying).not.toHaveBeenCalled();
  });

  it('rejects a negative skip count with a UserFacingError reply', async () => {
    const player = createFakePlayer();
    const command = await buildCommand(player);
    const interaction = createFakeInteraction();

    await command.onSkip([interaction] as any, { songs: -2 } as any);

    expect(interaction.reply).toHaveBeenCalledTimes(1);
    expect(player.skip).not.toHaveBeenCalled();
  });

  it('replies with a UserFacingError when there is no active player for the guild', async () => {
    const command = await buildCommand(undefined);
    const interaction = createFakeInteraction();

    await command.onSkip([interaction] as any, { songs: 1 } as any);

    const embed = interaction.reply.mock.calls[0][0].embeds[0];
    expect(embed.data.title).toBe('User Input Error');
  });

  it('replies with a UserFacingError when the queue is completely empty', async () => {
    const player = createFakePlayer({
      queue: createFakeQueue({ current: null, tracks: [] }),
    });
    const command = await buildCommand(player);
    const interaction = createFakeInteraction();

    await command.onSkip([interaction] as any, { songs: 1 } as any);

    const embed = interaction.reply.mock.calls[0][0].embeds[0];
    expect(embed.data.title).toBe('User Input Error');
    expect(player.skip).not.toHaveBeenCalled();
    expect(player.stopPlaying).not.toHaveBeenCalled();
  });

  it('skips to the next track when one is available', async () => {
    const player = createFakePlayer({
      queue: createFakeQueue({
        current: createFakeTrack(),
        tracks: [createFakeTrack(), createFakeTrack()],
      }),
    });
    const command = await buildCommand(player);
    const interaction = createFakeInteraction();

    await command.onSkip([interaction] as any, { songs: 1 } as any);

    expect(player.skip).toHaveBeenCalledWith(1);
    expect(player.stopPlaying).not.toHaveBeenCalled();
    const embed = interaction.reply.mock.calls[0][0].embeds[0];
    expect(embed.data.title).toBe('Skipped 1 song(s).');
  });

  it('stops playback (not an error) when skipping 1 with nothing left in the queue', async () => {
    const player = createFakePlayer({
      queue: createFakeQueue({ current: createFakeTrack(), tracks: [] }),
    });
    const command = await buildCommand(player);
    const interaction = createFakeInteraction();

    await command.onSkip([interaction] as any, { songs: 1 } as any);

    expect(player.stopPlaying).toHaveBeenCalledTimes(1);
    expect(player.skip).not.toHaveBeenCalled();
    const embed = interaction.reply.mock.calls[0][0].embeds[0];
    expect(embed.data.title).not.toBe('User Input Error');
    expect(embed.data.title).toBe('Skipped 1 song(s).');
  });

  it('rejects skipping more songs than are queued, listing the available count', async () => {
    const player = createFakePlayer({
      queue: createFakeQueue({
        current: createFakeTrack(),
        tracks: [createFakeTrack()],
      }),
    });
    const command = await buildCommand(player);
    const interaction = createFakeInteraction();

    await command.onSkip([interaction] as any, { songs: 3 } as any);

    const embed = interaction.reply.mock.calls[0][0].embeds[0];
    expect(embed.data.title).toBe('User Input Error');
    expect(embed.data.fields[0].value).toContain('1');
    expect(player.skip).not.toHaveBeenCalled();
  });

  it('allows skipping exactly the number of queued tracks', async () => {
    const player = createFakePlayer({
      queue: createFakeQueue({
        current: createFakeTrack(),
        tracks: [createFakeTrack(), createFakeTrack()],
      }),
    });
    const command = await buildCommand(player);
    const interaction = createFakeInteraction();

    await command.onSkip([interaction] as any, { songs: 2 } as any);

    expect(player.skip).toHaveBeenCalledWith(2);
  });

  it('replies with an internal error embed when an unexpected error is thrown', async () => {
    const player = createFakePlayer({
      queue: createFakeQueue({
        current: createFakeTrack(),
        tracks: [createFakeTrack()],
      }),
    });
    player.skip.mockImplementation(() => {
      throw new Error('boom');
    });
    const command = await buildCommand(player);
    const interaction = createFakeInteraction();

    await command.onSkip([interaction] as any, { songs: 1 } as any);

    const embed = interaction.reply.mock.calls[0][0].embeds[0];
    expect(embed.data.title).toBe('Internal Error');
  });
});
