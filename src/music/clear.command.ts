import { Injectable } from '@nestjs/common';
import { Context, SlashCommand } from 'necord';
import type { SlashCommandContext } from 'necord';
import { PlayerManagerService } from '@necord/lavalink';
import { EmbedService } from 'src/embed/embed.service';

@Injectable()
export class ClearCommand {
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
      player.stopPlaying();

      await interaction.reply({
        embeds: [this.embedService.createSimpleEmbed('Queue Cleared')],
      });
    } catch (error) {
      interaction.reply({
        embeds: [this.embedService.createInternalErrorEmbed()],
      });
    }
  }
}
