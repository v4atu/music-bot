import { OnLavalinkManager } from '@necord/lavalink';
import type { LavalinkManagerContextOf } from '@necord/lavalink';
import { Injectable, Logger } from '@nestjs/common';
import { Client } from 'discord.js';
import { Context } from 'necord';
import { EmbedService } from 'src/embed/embed.service';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);
  constructor(
    private readonly client: Client,
    private readonly embedService: EmbedService,
  ) {}

  @OnLavalinkManager('trackStart')
  public onTrackStart(
    @Context() [player, track]: LavalinkManagerContextOf<'trackStart'>,
  ) {
    try {
      if (!track) return;

      this.client.channels.fetch(player.textChannelId!).then((channel) => {
        if (!channel || !channel.isTextBased() || !channel.isSendable()) return;

        const songEmbed = this.embedService.createSongEmbed(track);
        channel.send({ embeds: [songEmbed] });
      });
      this.logger.log(
        `Track started at ${player.guildId} by ${track.requester}`,
      );
    } catch (error) {
      this.logger.log(
        `Error at displaying track start message at ${player.guildId}`,
      );
    }
  }

  @OnLavalinkManager('trackError')
  public onTrackError(
    @Context() [player, track, payload]: LavalinkManagerContextOf<'trackError'>,
  ) {
    try {
      if (!track) return;

      this.client.channels.fetch(player.textChannelId!).then((channel) => {
        if (!channel || !channel.isTextBased() || !channel.isSendable()) return;

        const songEmbed = this.embedService.createUserErrorEmbed(
          'An error occurred while playing the track.',
        );
        channel.send({ embeds: [songEmbed] });
      });
      this.logger.log('-------------------------------');
      this.logger.log('----------Track error----------');
      this.logger.log('-------------------------------');
      this.logger.error(payload.error);
      this.logger.log('-------------------------------');
    } catch (error) {
      this.logger.log(
        `Error at displaying track error message at ${player.guildId}`,
      );
    }
  }

  @OnLavalinkManager('queueEnd')
  public onQueueEnd(
    @Context() [player, track]: LavalinkManagerContextOf<'queueEnd'>,
  ) {
    try {
      if (!track) return;

      this.client.channels.fetch(player.textChannelId!).then((channel) => {
        if (!channel || !channel.isTextBased() || !channel.isSendable()) return;

        const songEmbed = this.embedService.createSimpleEmbed(
          'The queue has ended. Thanks for listening!',
        );
        channel.send({ embeds: [songEmbed] });
      });
    } catch (error) {
      this.logger.log(
        `Error at displaying queue end message at ${player.guildId}`,
      );
    }
  }
}
