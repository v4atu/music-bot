import { Test } from '@nestjs/testing';
import { PlayerManagerService } from '@necord/lavalink';
import { EmbedService } from 'src/embed/embed.service';
import { LoopCommand } from './loop.command';
import { createFakePlayer } from 'src/testing/lavalink.fixtures';
import { createPlayerManagerMock } from 'src/testing/player-manager.mock';
import { createFakeInteraction } from 'src/testing/discord.fixtures';

async function buildCommand(
  player: ReturnType<typeof createFakePlayer> | undefined,
) {
  const moduleRef = await Test.createTestingModule({
    providers: [
      LoopCommand,
      {
        provide: PlayerManagerService,
        useValue: createPlayerManagerMock(player),
      },
      EmbedService,
    ],
  }).compile();

  return moduleRef.get(LoopCommand);
}

describe('LoopCommand', () => {
  it('replies with a UserFacingError when there is no active player', async () => {
    const command = await buildCommand(undefined);
    const interaction = createFakeInteraction();

    await command.onLoop([interaction] as any);

    const embed = interaction.reply.mock.calls[0][0].embeds[0];
    expect(embed.data.title).toBe('User Input Error');
  });

  it('turns looping on when currently off', async () => {
    const player = createFakePlayer({ repeatMode: 'off' });
    const command = await buildCommand(player);
    const interaction = createFakeInteraction();

    await command.onLoop([interaction] as any);

    expect(player.repeatMode).toBe('track');
    const embed = interaction.reply.mock.calls[0][0].embeds[0];
    expect(embed.data.title).toContain('activado');
  });

  it('turns looping off when currently on', async () => {
    const player = createFakePlayer({ repeatMode: 'track' });
    const command = await buildCommand(player);
    const interaction = createFakeInteraction();

    await command.onLoop([interaction] as any);

    expect(player.repeatMode).toBe('off');
    const embed = interaction.reply.mock.calls[0][0].embeds[0];
    expect(embed.data.title).toContain('desactivado');
  });

  it('replies with an internal error embed when an unexpected error is thrown', async () => {
    const player = {
      get repeatMode() {
        throw new Error('boom');
      },
    } as any;
    const command = await buildCommand(player);
    const interaction = createFakeInteraction();

    await command.onLoop([interaction] as any);

    const embed = interaction.reply.mock.calls[0][0].embeds[0];
    expect(embed.data.title).toBe('Internal Error');
  });
});
