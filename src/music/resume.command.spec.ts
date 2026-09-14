import { Test } from '@nestjs/testing';
import { PlayerManagerService } from '@necord/lavalink';
import { EmbedService } from 'src/embed/embed.service';
import { ResumeCommand } from './resume.command';
import { createFakePlayer } from 'src/testing/lavalink.fixtures';
import { createPlayerManagerMock } from 'src/testing/player-manager.mock';
import { createFakeInteraction } from 'src/testing/discord.fixtures';

async function buildCommand(
  player: ReturnType<typeof createFakePlayer> | undefined,
) {
  const moduleRef = await Test.createTestingModule({
    providers: [
      ResumeCommand,
      {
        provide: PlayerManagerService,
        useValue: createPlayerManagerMock(player),
      },
      EmbedService,
    ],
  }).compile();

  return moduleRef.get(ResumeCommand);
}

describe('ResumeCommand', () => {
  it('replies with a UserFacingError when there is no active player', async () => {
    const command = await buildCommand(undefined);
    const interaction = createFakeInteraction();

    await command.onResume([interaction] as any);

    const embed = interaction.reply.mock.calls[0][0].embeds[0];
    expect(embed.data.title).toBe('User Input Error');
  });

  it('replies with a UserFacingError when not currently paused', async () => {
    const player = createFakePlayer({ paused: false });
    const command = await buildCommand(player);
    const interaction = createFakeInteraction();

    await command.onResume([interaction] as any);

    expect(player.resume).not.toHaveBeenCalled();
    const embed = interaction.reply.mock.calls[0][0].embeds[0];
    expect(embed.data.title).toBe('User Input Error');
  });

  it('resumes the player and replies with success when paused', async () => {
    const player = createFakePlayer({ paused: true });
    const command = await buildCommand(player);
    const interaction = createFakeInteraction();

    await command.onResume([interaction] as any);

    expect(player.resume).toHaveBeenCalledTimes(1);
    const embed = interaction.reply.mock.calls[0][0].embeds[0];
    expect(embed.data.title).toBe('Resumed the current track.');
  });

  it('replies with an internal error embed when an unexpected error is thrown', async () => {
    const player = createFakePlayer({ paused: true });
    player.resume.mockImplementation(() => {
      throw new Error('boom');
    });
    const command = await buildCommand(player);
    const interaction = createFakeInteraction();

    await command.onResume([interaction] as any);

    const embed = interaction.reply.mock.calls[0][0].embeds[0];
    expect(embed.data.title).toBe('Internal Error');
  });
});
