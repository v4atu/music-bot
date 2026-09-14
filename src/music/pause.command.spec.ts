import { Test } from '@nestjs/testing';
import { PlayerManagerService } from '@necord/lavalink';
import { EmbedService } from 'src/embed/embed.service';
import { PauseCommand } from './pause.command';
import { createFakePlayer } from 'src/testing/lavalink.fixtures';
import { createPlayerManagerMock } from 'src/testing/player-manager.mock';
import { createFakeInteraction } from 'src/testing/discord.fixtures';

async function buildCommand(
  player: ReturnType<typeof createFakePlayer> | undefined,
) {
  const moduleRef = await Test.createTestingModule({
    providers: [
      PauseCommand,
      {
        provide: PlayerManagerService,
        useValue: createPlayerManagerMock(player),
      },
      EmbedService,
    ],
  }).compile();

  return moduleRef.get(PauseCommand);
}

describe('PauseCommand', () => {
  it('replies with a UserFacingError when there is no active player', async () => {
    const command = await buildCommand(undefined);
    const interaction = createFakeInteraction();

    await command.onPause([interaction] as any);

    const embed = interaction.reply.mock.calls[0][0].embeds[0];
    expect(embed.data.title).toBe('User Input Error');
  });

  it('replies with a UserFacingError when already paused', async () => {
    const player = createFakePlayer({ paused: true });
    const command = await buildCommand(player);
    const interaction = createFakeInteraction();

    await command.onPause([interaction] as any);

    expect(player.pause).not.toHaveBeenCalled();
    const embed = interaction.reply.mock.calls[0][0].embeds[0];
    expect(embed.data.title).toBe('User Input Error');
  });

  it('pauses the player and replies with success when playing', async () => {
    const player = createFakePlayer({ paused: false });
    const command = await buildCommand(player);
    const interaction = createFakeInteraction();

    await command.onPause([interaction] as any);

    expect(player.pause).toHaveBeenCalledTimes(1);
    const embed = interaction.reply.mock.calls[0][0].embeds[0];
    expect(embed.data.title).toBe('Paused the current track.');
  });

  it('replies with an internal error embed when an unexpected error is thrown', async () => {
    const player = createFakePlayer({ paused: false });
    player.pause.mockImplementation(() => {
      throw new Error('boom');
    });
    const command = await buildCommand(player);
    const interaction = createFakeInteraction();

    await command.onPause([interaction] as any);

    const embed = interaction.reply.mock.calls[0][0].embeds[0];
    expect(embed.data.title).toBe('Internal Error');
  });
});
