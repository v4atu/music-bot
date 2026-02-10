import { Module } from '@nestjs/common';
import { PingCommand } from './ping.command';

@Module({
  imports: [],
  providers: [PingCommand],
})
export class UtilsModule {}
