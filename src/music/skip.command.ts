import { Injectable, Logger } from '@nestjs/common';
import { Context, Options, SlashCommand } from 'necord';
import type { SlashCommandContext } from 'necord';
import { PlayerManagerService } from '@necord/lavalink';
import { EmbedService } from 'src/embed/embed.service';
import { SkipDto } from './dtos/skip.dto';
import { UserFacingError } from './errors/music-bot.errors';

@Injectable()
export class SkipCommand {
  private readonly logger = new Logger(SkipCommand.name);

  public constructor(
    private readonly playerManager: PlayerManagerService,
    private readonly embedService: EmbedService,
  ) {}

  @SlashCommand({
    name: 'skip',
    description: 'Skips the current track.',
  })
  public async onSkip(
    @Context() [interaction]: SlashCommandContext,
    @Options() { songs }: SkipDto,
  ) {
    try {
      const player = this.playerManager.get(interaction.guildId!);
      const skipCount = songs ?? 1;

      if (skipCount <= 0) {
        throw new UserFacingError('No se puede saltar un numero 0 o negativo de canciones.');
      }

      if (!player) {
        throw new UserFacingError('No hay música reproduciéndose en este servidor.');
      }

      if (!player.queue.current && player.queue.tracks.length === 0) {
        throw new UserFacingError('La cola está vacía — no hay nada que saltarse.');
      }

      if (skipCount == 1 && player.queue.tracks.length == 0) {
        player.stopPlaying();
        return interaction.reply({
          embeds: [this.embedService.createSimpleEmbed(`Skipped 1 song(s).`)],
        });
      }

      else if (skipCount > player.queue.tracks.length) {
        throw new UserFacingError(
          `No se pueden saltar ${skipCount} canciones — la cola solo tiene ${player.queue.tracks.length} canción(es) pendiente(s).`,
        );
      }

      player.skip(skipCount);
      return interaction.reply({
        embeds: [this.embedService.createSimpleEmbed(`Skipped ${skipCount} song(s).`)],
      });
    } catch (error) {
      if (error instanceof UserFacingError) {
        this.logger.warn(`[SkipCommand] ${error.message}`);
        return interaction.reply({
          embeds: [this.embedService.createUserErrorEmbed(error.message)],
        });
      }
      this.logger.error('[SkipCommand] Unexpected error', error instanceof Error ? error.stack : String(error));
      return interaction.reply({
        embeds: [this.embedService.createInternalErrorEmbed()],
      });
    }
  }
}
