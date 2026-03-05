import { Injectable, Logger } from '@nestjs/common';
import { Context, Options, SlashCommand } from 'necord';
import type { SlashCommandContext } from 'necord';
import { PlayDto } from './dtos/play.dto';
import { NecordLavalinkService, PlayerManagerService } from '@necord/lavalink';
import { EmbedService } from 'src/embed/embed.service';
import { UserFacingError } from './errors/music-bot.errors';

@Injectable()
export class PlayCommand {
  private readonly logger = new Logger(PlayCommand.name);

  public constructor(
    private readonly playerManager: PlayerManagerService,
    private readonly lavalinkService: NecordLavalinkService,
    private readonly embedService: EmbedService,
  ) {}

  @SlashCommand({
    name: 'play',
    description: 'Plays a track in a voice channel.',
  })
  public async onPlay(
    @Context() [interaction]: SlashCommandContext,
    @Options() { query }: PlayDto,
  ) {
    try {
      const player =
        this.playerManager.get(interaction.guildId!) ??
        this.playerManager.create({
          ...this.lavalinkService.extractInfoForPlayer(interaction),
          selfDeaf: true,
          selfMute: false,
        });

      await player.connect();

      const res = await player.search(
        {
          query,
          source: 'youtube',
        },
        interaction.user,
      );

      if (!res.tracks || res.tracks.length === 0) {
        throw new UserFacingError(`No se encontraron resultados para: "${query}". Intenta con otro término.`);
      }

      await player.queue.add(res.tracks[0]);
      if (!player.playing) await player.play();

      return interaction.reply({
        embeds: [
          this.embedService.createSimpleEmbed(
            `✅ Added '${res.tracks[0].info.title}' to the queue`,
          ),
        ],
      });
    } catch (error) {
      if (error instanceof UserFacingError) {
        this.logger.warn(`[PlayCommand] ${error.message}`);
        return interaction.reply({
          embeds: [this.embedService.createUserErrorEmbed(error.message)],
        });
      }
      this.logger.error('[PlayCommand] Unexpected error', error instanceof Error ? error.stack : String(error));
      return interaction.reply({
        embeds: [this.embedService.createInternalErrorEmbed()],
      });
    }
  }
}
