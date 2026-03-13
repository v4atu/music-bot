import { Injectable, Logger } from '@nestjs/common';
import { Context, SlashCommand } from 'necord';
import type { SlashCommandContext } from 'necord';
import { PlayerManagerService } from '@necord/lavalink';
import { EmbedService } from 'src/embed/embed.service';
import { UserFacingError } from './errors/music-bot.errors';

@Injectable()
export class LoopCommand {
  private readonly logger = new Logger(LoopCommand.name);

  public constructor(
    private readonly playerManager: PlayerManagerService,
    private readonly embedService: EmbedService,
  ) {}

  @SlashCommand({
    name: 'loop',
    description: 'Loops the current track.',
  })
  public async onLoop(@Context() [interaction]: SlashCommandContext) {
    try {
      const player = this.playerManager.get(interaction.guildId!);

      if (!player) {
        throw new UserFacingError('No hay música reproduciéndose en este servidor.');
      }

      const inLoop = player.repeatMode == 'track';
      player.repeatMode = inLoop ? 'off' : 'track';
      return interaction.reply({
        embeds: [this.embedService.createSimpleEmbed(`Loop ${inLoop ? 'desactivado' : 'activado'}.`)],
      });
    } catch (error) {
      if (error instanceof UserFacingError) {
        this.logger.warn(`[LoopCommand] ${error.message}`);
        return interaction.reply({
          embeds: [this.embedService.createUserErrorEmbed(error.message)],
        });
      }
      this.logger.error('[LoopCommand] Unexpected error', error instanceof Error ? error.stack : String(error));
      return interaction.reply({
        embeds: [this.embedService.createInternalErrorEmbed()],
      });
    }
  }
}
