import { StringOption } from 'necord';

export class PlayDto {
  @StringOption({
    name: 'query',
    description: 'The name or URL of the song to play',
    required: true,
  })
  query: string;
}
