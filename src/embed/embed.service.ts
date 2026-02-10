import { Injectable } from '@nestjs/common';
import { EmbedBuilder } from 'discord.js';
import { Queue, Track } from 'lavalink-client';

@Injectable()
export class EmbedService {
  private calculateTime(duration: number) {
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  private shortenTrackTitle(title: string) {
    if (title.length > 40) {
      return title.substring(0, 40) + '...';
    } else {
      return title;
    }
  }

  public createSimpleEmbed(message: string) {
    const newEmbed = new EmbedBuilder().setTitle(message).setColor('#0099ff');
    return newEmbed;
  }

  public createSongEmbed(track: Track) {
    const newEmbed = new EmbedBuilder()
      .setTitle(`💿 ${track.info.title}`)
      .setAuthor({ name: `🖋️ Author: ${track.info.author}` })
      .addFields(
        {
          name: '🎵 Video Length',
          value: `${this.calculateTime(track.info.duration)} minutes`,
          inline: false,
        },
        { name: 'Added by:', value: `${track.requester}`, inline: true },
      )
      .setImage(track.info.artworkUrl)
      .setColor('#0099ff');

    return newEmbed;
  }

  public createQueueEmbed(queue: Queue) {
    const currentPlusQueue = Array.from(queue.tracks);
    if (queue.current) {
      currentPlusQueue.unshift(queue.current);
    }

    const newEmbed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Tracks queue')
      .setDescription(
        currentPlusQueue
          .map((track, index) =>
            index == 0
              ? `▶️ ${this.shortenTrackTitle(track.info.title)}`
              : `${index + 1}. ${this.shortenTrackTitle(track.info.title)}`,
          )
          .join('\n'),
      )
      .setFooter({ text: `Queue size: ${queue.tracks.length} songs.` });

    return newEmbed;
  }

  public createUserErrorEmbed(errorReason: string) {
    const newEmbed = new EmbedBuilder()
      .setTitle('User Input Error')
      .addFields({ name: 'Reason:', value: errorReason, inline: true })
      .setColor('#ff0000');
    return newEmbed;
  }

  public createInternalErrorEmbed() {
    const newEmbed = new EmbedBuilder()
      .setTitle('Internal Error')
      .setColor('#4d0000');
    return newEmbed;
  }
}
