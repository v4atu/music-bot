import { Module } from '@nestjs/common';
import { PlayCommand } from './play.command';
import { PauseCommand } from './pause.command';
import { QueueCommand } from './queue.command';
import { SkipCommand } from './skip.command';
import { ClearCommand } from './clear.command';
import { ResumeCommand } from './resume.command';
import { EmbedModule } from 'src/embed/embed.module';
import { LoopCommand } from './loop.command';

@Module({
  imports: [EmbedModule],
  providers: [
    PlayCommand,
    PauseCommand,
    ResumeCommand,
    QueueCommand,
    SkipCommand,
    ClearCommand,
    LoopCommand,
  ],
})
export class MusicModule {}
