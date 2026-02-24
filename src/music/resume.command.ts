import { Injectable } from '@nestjs/common';
import { Context, SlashCommand } from 'necord';
import type { SlashCommandContext } from 'necord';
import { PlayerManagerService } from '@necord/lavalink';
import { EmbedService } from 'src/embed/embed.service';

@Injectable()
export class ResumeCommand {
  public constructor(
    private readonly playerManager: PlayerManagerService,
    private readonly embedService: EmbedService,
  ) {}

  @SlashCommand({
    name: 'resume',
    description: 'Resumes the current track.',
  })
  public async onResume(@Context() [interaction]: SlashCommandContext) {
    try {
      const player = this.playerManager.get(interaction.guildId!);
      player.resume();

      interaction.reply({
        embeds: [
          this.embedService.createSimpleEmbed('Resumed the current track.'),
        ],
      });
    } catch (error) {
      interaction.reply({
        embeds: [this.embedService.createInternalErrorEmbed()],
      });
    }
  }
}
