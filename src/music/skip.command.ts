import { Injectable } from '@nestjs/common';
import { Context, Options, SlashCommand } from 'necord';
import type { SlashCommandContext } from 'necord';
import { PlayerManagerService } from '@necord/lavalink';
import { EmbedService } from 'src/embed/embed.service';
import { SkipDto } from './dtos/skip.dto';

@Injectable()
export class SkipCommand {
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
      player.skip(songs ?? 1);

      interaction.reply({
        embeds: [
          this.embedService.createSimpleEmbed(`Skipped ${songs ?? 1} song(s).`),
        ],
      });
    } catch (error) {
      interaction.reply({
        embeds: [this.embedService.createInternalErrorEmbed()],
      });
    }
  }
}
