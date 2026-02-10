import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { EmbedModule } from 'src/embed/embed.module';

@Module({
  imports: [EmbedModule],
  providers: [MessageService],
})
export class MessageModule {}
