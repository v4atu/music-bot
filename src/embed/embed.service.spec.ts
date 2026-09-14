import { EmbedService } from './embed.service';
import {
  createFakeQueue,
  createFakeTrack,
} from 'src/testing/lavalink.fixtures';

describe('EmbedService', () => {
  let service: EmbedService;

  beforeEach(() => {
    service = new EmbedService();
  });

  it('createSimpleEmbed sets the title and blue color', () => {
    const embed = service.createSimpleEmbed('Paused the current track.');

    expect(embed.data.title).toBe('Paused the current track.');
    expect(embed.data.color).toBe(0x0099ff);
  });

  it('createUserErrorEmbed sets a red color and the reason field', () => {
    const embed = service.createUserErrorEmbed('La cola está vacía.');

    expect(embed.data.title).toBe('User Input Error');
    expect(embed.data.color).toBe(0xff0000);
    expect(embed.data.fields?.[0].value).toBe('La cola está vacía.');
  });

  it('createInternalErrorEmbed sets a dark-red color with no reason field', () => {
    const embed = service.createInternalErrorEmbed();

    expect(embed.data.title).toBe('Internal Error');
    expect(embed.data.color).toBe(0x4d0000);
    expect(embed.data.fields).toBeUndefined();
  });

  describe('createSongEmbed', () => {
    it('includes the title, author, and zero-padded duration', () => {
      const track = createFakeTrack({
        info: {
          title: 'My Song',
          author: 'The Artist',
          duration: 185000,
          artworkUrl: 'https://x/y.png',
        },
      });

      const embed = service.createSongEmbed(track);

      expect(embed.data.title).toContain('My Song');
      expect(embed.data.author?.name).toContain('The Artist');
      expect(embed.data.fields?.[0].value).toBe('3:05 minutes');
      expect(embed.data.image?.url).toBe('https://x/y.png');
    });

    it('does not zero-pad seconds when they are already two digits', () => {
      const track = createFakeTrack({
        info: {
          title: 'T',
          author: 'A',
          duration: 195000,
          artworkUrl: 'https://x/y.png',
        },
      });

      const embed = service.createSongEmbed(track);

      expect(embed.data.fields?.[0].value).toBe('3:15 minutes');
    });
  });

  describe('createQueueEmbed', () => {
    it('shows only "Now Playing" when there is a current track and nothing queued', () => {
      const queue = createFakeQueue({ current: createFakeTrack(), tracks: [] });

      const embed = service.createQueueEmbed(queue);

      const fieldNames = embed.data.fields?.map((f) => f.name) ?? [];
      expect(fieldNames).toContain('▶️ Now Playing');
      expect(fieldNames).not.toContain('📋 Up Next');
    });

    it('shows only "Up Next" when there is no current track but tracks are queued', () => {
      const queue = createFakeQueue({
        current: null,
        tracks: [createFakeTrack(), createFakeTrack()],
      });

      const embed = service.createQueueEmbed(queue);

      const fieldNames = embed.data.fields?.map((f) => f.name) ?? [];
      expect(fieldNames).not.toContain('▶️ Now Playing');
      expect(fieldNames).toContain('📋 Up Next');
    });

    it('truncates the upcoming list to 10 and adds a "+N more" field beyond that', () => {
      const tracks = Array.from({ length: 12 }, (_, i) =>
        createFakeTrack({ info: { title: `Track ${i}` } }),
      );
      const queue = createFakeQueue({ current: null, tracks });

      const embed = service.createQueueEmbed(queue);

      const upNext = embed.data.fields?.find((f) => f.name === '📋 Up Next');
      expect(upNext?.value.match(/\*\*\d+\.\*\*/g)?.length).toBe(10);
      const moreField = embed.data.fields?.find(
        (f) => f.name === '➕ More tracks',
      );
      expect(moreField?.value).toContain('2 more songs');
    });

    it('does not truncate a title at exactly 40 characters', () => {
      const title = 'a'.repeat(40);
      const queue = createFakeQueue({
        current: createFakeTrack({ info: { title } }),
        tracks: [],
      });

      const embed = service.createQueueEmbed(queue);

      const nowPlaying = embed.data.fields?.find(
        (f) => f.name === '▶️ Now Playing',
      );
      expect(nowPlaying?.value).toContain(title);
      expect(nowPlaying?.value).not.toContain('...');
    });

    it('truncates a title over 40 characters with an ellipsis', () => {
      const title = 'a'.repeat(41);
      const queue = createFakeQueue({
        current: createFakeTrack({ info: { title } }),
        tracks: [],
      });

      const embed = service.createQueueEmbed(queue);

      const nowPlaying = embed.data.fields?.find(
        (f) => f.name === '▶️ Now Playing',
      );
      expect(nowPlaying?.value).toContain('a'.repeat(40) + '...');
    });

    it('sums the total duration of current + queued tracks in the footer', () => {
      const queue = createFakeQueue({
        current: createFakeTrack({ info: { duration: 60000 } }),
        tracks: [createFakeTrack({ info: { duration: 120000 } })],
      });

      const embed = service.createQueueEmbed(queue);

      expect(embed.data.footer?.text).toContain('2 songs in queue');
      expect(embed.data.footer?.text).toContain('3:00');
    });
  });
});
