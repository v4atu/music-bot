import { Injectable } from '@nestjs/common';
import { Context, SlashCommand } from 'necord';
import type { SlashCommandContext } from 'necord';
import { PlayerManagerService } from '@necord/lavalink';
import { EmbedService } from 'src/embed/embed.service';

@Injectable()
export class QueueCommand {
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

      interaction.reply({
        embeds: [this.embedService.createQueueEmbed(player.queue)],
        flags: 'Ephemeral',
      });
    } catch (error) {
      interaction.reply({
        embeds: [this.embedService.createInternalErrorEmbed()],
      });
    }
  }
}
