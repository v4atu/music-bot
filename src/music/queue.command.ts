import { Injectable, Logger } from '@nestjs/common';
import { Context, SlashCommand } from 'necord';
import type { SlashCommandContext } from 'necord';
import { PlayerManagerService } from '@necord/lavalink';
import { EmbedService } from 'src/embed/embed.service';
import { UserFacingError } from './errors/music-bot.errors';

@Injectable()
export class QueueCommand {
  private readonly logger = new Logger(QueueCommand.name);

  public constructor(
    private readonly playerManager: PlayerManagerService,
    private readonly embedService: EmbedService,
  ) {}

  @SlashCommand({
    name: 'queue',
    description: 'Shows the current queue.',
  })
  public async onQueue(@Context() [interaction]: SlashCommandContext) {
    try {
      const player = this.playerManager.get(interaction.guildId!);

      if (!player) {
        throw new UserFacingError('No hay música reproduciéndose en este servidor.');
      }
      if (!player.queue.current && player.queue.tracks.length === 0) {
        throw new UserFacingError('La cola está vacía.');
      }

      return interaction.reply({
        embeds: [this.embedService.createQueueEmbed(player.queue)],
        flags: 'Ephemeral',
      });
    } catch (error) {
      if (error instanceof UserFacingError) {
        this.logger.warn(`[QueueCommand] ${error.message}`);
        return interaction.reply({
          embeds: [this.embedService.createUserErrorEmbed(error.message)],
        });
      }
      this.logger.error('[QueueCommand] Unexpected error', error instanceof Error ? error.stack : String(error));
      return interaction.reply({
        embeds: [this.embedService.createInternalErrorEmbed()],
      });
    }
  }
}
