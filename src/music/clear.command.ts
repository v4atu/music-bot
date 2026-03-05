import { Injectable, Logger } from '@nestjs/common';
import { Context, SlashCommand } from 'necord';
import type { SlashCommandContext } from 'necord';
import { PlayerManagerService } from '@necord/lavalink';
import { EmbedService } from 'src/embed/embed.service';
import { UserFacingError } from './errors/music-bot.errors';

@Injectable()
export class ClearCommand {
  private readonly logger = new Logger(ClearCommand.name);

  public constructor(
    private readonly playerManager: PlayerManagerService,
    private readonly embedService: EmbedService,
  ) {}

  @SlashCommand({
    name: 'clear',
    description: 'Clears the current queue.',
  })
  public async onClear(@Context() [interaction]: SlashCommandContext) {
    try {
      const player = this.playerManager.get(interaction.guildId!);

      if (!player) {
        throw new UserFacingError('No hay un reproductor activo en este servidor.');
      }

      player.stopPlaying();
      return await interaction.reply({
        embeds: [this.embedService.createSimpleEmbed('Queue Cleared')],
      });
    } catch (error) {
      if (error instanceof UserFacingError) {
        this.logger.warn(`[ClearCommand] ${error.message}`);
        return interaction.reply({
          embeds: [this.embedService.createUserErrorEmbed(error.message)],
        });
      }
      this.logger.error('[ClearCommand] Unexpected error', error instanceof Error ? error.stack : String(error));
      return interaction.reply({
        embeds: [this.embedService.createInternalErrorEmbed()],
      });
    }
  }
}
