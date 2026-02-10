import { NumberOption } from 'necord';

export class SkipDto {
  @NumberOption({
    name: 'songs',
    description: 'The number of songs to skip',
    required: false,
  })
  songs: number;
}
