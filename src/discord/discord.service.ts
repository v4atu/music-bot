import { Injectable, Logger } from '@nestjs/common';
import { Context, Once } from 'necord';
import type { ContextOf } from 'necord';

@Injectable()
export class DiscordService {
  private readonly logger = new Logger(DiscordService.name);

  @Once('clientReady')
  public onReady(@Context() [client]: ContextOf<'clientReady'>) {
    this.logger.log(`Bot logged in as ${client.user.username}`);
  }
}
