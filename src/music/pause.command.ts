import { Injectable } from '@nestjs/common';
import { Context, SlashCommand } from 'necord';
import type { SlashCommandContext } from 'necord';
import { PlayerManagerService } from '@necord/lavalink';
import { EmbedService } from 'src/embed/embed.service';

@Injectable()
export class PauseCommand {
  public constructor(
    private readonly playerManager: PlayerManagerService,
    private readonly embedService: EmbedService,
  ) {}

  @SlashCommand({
    name: 'pause',
    description: 'Pauses the current track.',
  })
  public async onPause(@Context() [interaction]: SlashCommandContext) {
    const player = this.playerManager.get(interaction.guildId!);

    player.pause();
    interaction.reply({
      embeds: [
        this.embedService.createSimpleEmbed(`Paused the current track.`),
      ],
    });
  }
}
