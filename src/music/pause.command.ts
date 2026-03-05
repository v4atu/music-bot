import { Injectable, Logger } from '@nestjs/common';
import { Context, SlashCommand } from 'necord';
import type { SlashCommandContext } from 'necord';
import { PlayerManagerService } from '@necord/lavalink';
import { EmbedService } from 'src/embed/embed.service';
import { UserFacingError } from './errors/music-bot.errors';

@Injectable()
export class PauseCommand {
  private readonly logger = new Logger(PauseCommand.name);

  public constructor(
    private readonly playerManager: PlayerManagerService,
    private readonly embedService: EmbedService,
  ) {}

  @SlashCommand({
    name: 'pause',
    description: 'Pauses the current track.',
  })
  public async onPause(@Context() [interaction]: SlashCommandContext) {
    try {
      const player = this.playerManager.get(interaction.guildId!);

      if (!player) {
        throw new UserFacingError('No hay música reproduciéndose en este servidor.');
      }
      if (player.paused) {
        throw new UserFacingError('El reproductor ya está en pausa.');
      }

      player.pause();
      return interaction.reply({
        embeds: [this.embedService.createSimpleEmbed('Paused the current track.')],
      });
    } catch (error) {
      if (error instanceof UserFacingError) {
        this.logger.warn(`[PauseCommand] ${error.message}`);
        return interaction.reply({
          embeds: [this.embedService.createUserErrorEmbed(error.message)],
        });
      }
      this.logger.error('[PauseCommand] Unexpected error', error instanceof Error ? error.stack : String(error));
      return interaction.reply({
        embeds: [this.embedService.createInternalErrorEmbed()],
      });
    }
  }
}
