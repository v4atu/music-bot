import { Injectable } from '@nestjs/common';
import { Context, Options, SlashCommand } from 'necord';
import type { SlashCommandContext } from 'necord';
import { PlayDto } from './dtos/play.dto';
import { NecordLavalinkService, PlayerManagerService } from '@necord/lavalink';
import { EmbedService } from 'src/embed/embed.service';

@Injectable()
export class PlayCommand {
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

    await player.queue.add(res.tracks[0]);
    if (!player.playing) await player.play();

    return interaction.reply({
      embeds: [
        this.embedService.createSimpleEmbed(
          `✅ Added '${res.tracks[0].info.title}' to the queue`,
        ),
      ],
    });
  }
}
