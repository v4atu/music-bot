import { Test } from '@nestjs/testing';
import { NecordLavalinkService, PlayerManagerService } from '@necord/lavalink';
import { EmbedService } from 'src/embed/embed.service';
import { PlayCommand } from './play.command';
import {
  createFakePlayer,
  createFakeQueue,
  createFakeTrack,
} from 'src/testing/lavalink.fixtures';
import { createPlayerManagerMock } from 'src/testing/player-manager.mock';
import { createFakeInteraction } from 'src/testing/discord.fixtures';

async function buildCommand(
  player: ReturnType<typeof createFakePlayer> | undefined,
  playerManager = createPlayerManagerMock(player),
) {
  const lavalinkService = {
    extractInfoForPlayer: jest.fn().mockReturnValue({
      guildId: 'guild-1',
      voiceChannelId: 'vc-1',
      textChannelId: 'channel-1',
    }),
  };

  const moduleRef = await Test.createTestingModule({
    providers: [
      PlayCommand,
      { provide: PlayerManagerService, useValue: playerManager },
      { provide: NecordLavalinkService, useValue: lavalinkService },
      EmbedService,
    ],
  }).compile();

  return {
    command: moduleRef.get(PlayCommand),
    playerManager,
    lavalinkService,
  };
}

describe('PlayCommand', () => {
  it('creates a new player when none exists yet, then connects', async () => {
    const track = createFakeTrack();
    const player = createFakePlayer({ playing: false });
    player.search.mockResolvedValue({ tracks: [track] } as any);
    const playerManager = createPlayerManagerMock(undefined);
    playerManager.create.mockReturnValue(player);
    const { command, lavalinkService } = await buildCommand(
      undefined,
      playerManager,
    );
    const interaction = createFakeInteraction();

    await command.onPlay([interaction] as any, { query: 'some song' } as any);

    expect(lavalinkService.extractInfoForPlayer).toHaveBeenCalledWith(
      interaction,
    );
    expect(playerManager.create).toHaveBeenCalled();
    expect(player.connect).toHaveBeenCalled();
  });

  it('reuses an existing player without creating a new one', async () => {
    const track = createFakeTrack();
    const player = createFakePlayer({ playing: false });
    player.search.mockResolvedValue({ tracks: [track] } as any);
    const { command, playerManager } = await buildCommand(player);
    const interaction = createFakeInteraction();

    await command.onPlay([interaction] as any, { query: 'some song' } as any);

    expect(playerManager.create).not.toHaveBeenCalled();
    expect(player.connect).toHaveBeenCalled();
  });

  it('adds the first search result to the queue and replies with its title', async () => {
    const track = createFakeTrack({ info: { title: 'My Great Song' } });
    const player = createFakePlayer({
      playing: true,
      queue: createFakeQueue(),
    });
    player.search.mockResolvedValue({ tracks: [track] } as any);
    const { command } = await buildCommand(player);
    const interaction = createFakeInteraction();

    await command.onPlay(
      [interaction] as any,
      { query: 'my great song' } as any,
    );

    expect(player.queue.add).toHaveBeenCalledWith(track);
    const embed = interaction.reply.mock.calls[0][0].embeds[0];
    expect(embed.data.title).toContain('My Great Song');
  });

  it('replies with a UserFacingError when the search returns no tracks', async () => {
    const player = createFakePlayer({ queue: createFakeQueue() });
    player.search.mockResolvedValue({ tracks: [] } as any);
    const { command } = await buildCommand(player);
    const interaction = createFakeInteraction();

    await command.onPlay([interaction] as any, { query: 'nonexistent' } as any);

    const embed = interaction.reply.mock.calls[0][0].embeds[0];
    expect(embed.data.title).toBe('User Input Error');
    expect(player.queue.add).not.toHaveBeenCalled();
    expect(player.play).not.toHaveBeenCalled();
  });

  it('replies with a UserFacingError when the search returns undefined tracks', async () => {
    const player = createFakePlayer({ queue: createFakeQueue() });
    player.search.mockResolvedValue({ tracks: undefined } as any);
    const { command } = await buildCommand(player);
    const interaction = createFakeInteraction();

    await command.onPlay([interaction] as any, { query: 'nonexistent' } as any);

    const embed = interaction.reply.mock.calls[0][0].embeds[0];
    expect(embed.data.title).toBe('User Input Error');
  });

  it('starts playback when the player is not already playing', async () => {
    const track = createFakeTrack();
    const player = createFakePlayer({
      playing: false,
      queue: createFakeQueue(),
    });
    player.search.mockResolvedValue({ tracks: [track] } as any);
    const { command } = await buildCommand(player);
    const interaction = createFakeInteraction();

    await command.onPlay([interaction] as any, { query: 'song' } as any);

    expect(player.play).toHaveBeenCalled();
  });

  it('does not call play again when the player is already playing', async () => {
    const track = createFakeTrack();
    const player = createFakePlayer({
      playing: true,
      queue: createFakeQueue(),
    });
    player.search.mockResolvedValue({ tracks: [track] } as any);
    const { command } = await buildCommand(player);
    const interaction = createFakeInteraction();

    await command.onPlay([interaction] as any, { query: 'song' } as any);

    expect(player.play).not.toHaveBeenCalled();
    expect(interaction.reply).toHaveBeenCalledTimes(1);
  });

  it('replies with an internal error embed when the search unexpectedly throws', async () => {
    const player = createFakePlayer({ queue: createFakeQueue() });
    player.search.mockRejectedValue(new Error('network down'));
    const { command } = await buildCommand(player);
    const interaction = createFakeInteraction();

    await command.onPlay([interaction] as any, { query: 'song' } as any);

    const embed = interaction.reply.mock.calls[0][0].embeds[0];
    expect(embed.data.title).toBe('Internal Error');
  });
});
