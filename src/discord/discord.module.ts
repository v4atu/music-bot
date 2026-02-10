import { Module } from '@nestjs/common';
import { IntentsBitField } from 'discord.js';
import { NecordModule } from 'necord';
import { DiscordService } from './discord.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MusicModule } from 'src/music/music.module';
import { UtilsModule } from 'src/utils/utils.module';
import { NecordLavalinkModule } from '@necord/lavalink';
import { MessageModule } from 'src/message/message.module';

@Module({
  imports: [
    NecordModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const devGuild = configService.get<string>(
          'DISCORD_DEVELOPMENT_GUILD_ID',
        );

        return {
          token: configService.getOrThrow<string>('DISCORD_TOKEN'),
          intents: [
            IntentsBitField.Flags.Guilds,
            IntentsBitField.Flags.GuildVoiceStates,
          ],
          development: devGuild ? [devGuild] : false,
        };
      },
      inject: [ConfigService],
    }),
    NecordLavalinkModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        nodes: [
          {
            authorization: configService.getOrThrow('LAVALINK_PASSWORD'),
            host: configService.getOrThrow('LAVALINK_HOST'),
            port: parseInt(configService.getOrThrow('LAVALINK_PORT')),
          },
        ],
      }),
      inject: [ConfigService],
    }),
    MessageModule,
    MusicModule,
    UtilsModule,
  ],
  providers: [DiscordService],
})
export class DiscordModule {}
