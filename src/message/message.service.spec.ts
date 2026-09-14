import { Test } from '@nestjs/testing';
import { Client } from 'discord.js';
import { EmbedService } from 'src/embed/embed.service';
import { MessageService } from './message.service';
import { createFakeTrack } from 'src/testing/lavalink.fixtures';
import {
  createFakeClient,
  createFakeNonSendableChannel,
  createFakeTextChannel,
} from 'src/testing/discord.fixtures';

async function buildService(client: ReturnType<typeof createFakeClient>) {
  const moduleRef = await Test.createTestingModule({
    providers: [
      MessageService,
      { provide: Client, useValue: client },
      EmbedService,
    ],
  }).compile();

  return moduleRef.get(MessageService);
}

function fakePlayer(overrides: Record<string, any> = {}) {
  return { guildId: 'guild-1', textChannelId: 'channel-1', ...overrides };
}

async function flushMicrotasks() {
  await Promise.resolve();
  await Promise.resolve();
}

describe('MessageService', () => {
  describe('onTrackStart', () => {
    it('sends a song embed when the channel is text-based and sendable', async () => {
      const channel = createFakeTextChannel();
      const client = createFakeClient();
      client.channels.fetch.mockResolvedValue(channel);
      const service = await buildService(client);
      const track = createFakeTrack();

      service.onTrackStart([fakePlayer(), track] as any);
      await flushMicrotasks();

      expect(client.channels.fetch).toHaveBeenCalledWith('channel-1');
      expect(channel.send).toHaveBeenCalledTimes(1);
    });

    it('does not send when the resolved channel is not sendable', async () => {
      const channel = createFakeNonSendableChannel();
      const client = createFakeClient();
      client.channels.fetch.mockResolvedValue(channel);
      const service = await buildService(client);
      const track = createFakeTrack();

      service.onTrackStart([fakePlayer(), track] as any);
      await flushMicrotasks();

      expect(channel.send).not.toHaveBeenCalled();
    });

    it('never fetches a channel when there is no track', async () => {
      const client = createFakeClient();
      const service = await buildService(client);

      service.onTrackStart([fakePlayer(), undefined] as any);
      await flushMicrotasks();

      expect(client.channels.fetch).not.toHaveBeenCalled();
    });

    it('does not throw and logs when channels.fetch rejects', async () => {
      const client = createFakeClient();
      client.channels.fetch.mockRejectedValue(new Error('discord API down'));
      const service = await buildService(client);
      const track = createFakeTrack();

      expect(() =>
        service.onTrackStart([fakePlayer(), track] as any),
      ).not.toThrow();
      await flushMicrotasks();
    });
  });

  describe('onTrackError', () => {
    it('sends a generic track-error embed when a track fails to load/play', async () => {
      const channel = createFakeTextChannel();
      const client = createFakeClient();
      client.channels.fetch.mockResolvedValue(channel);
      const service = await buildService(client);
      const track = createFakeTrack();

      service.onTrackError([
        fakePlayer(),
        track,
        { error: new Error('video unavailable') },
      ] as any);
      await flushMicrotasks();

      expect(channel.send).toHaveBeenCalledTimes(1);
      const embed = channel.send.mock.calls[0][0].embeds[0];
      expect(embed.data.title).toBe('User Input Error');
    });

    it('never fetches a channel when there is no track', async () => {
      const client = createFakeClient();
      const service = await buildService(client);

      service.onTrackError([
        fakePlayer(),
        undefined,
        { error: new Error('x') },
      ] as any);
      await flushMicrotasks();

      expect(client.channels.fetch).not.toHaveBeenCalled();
    });

    it('does not throw and logs when channels.fetch rejects', async () => {
      const client = createFakeClient();
      client.channels.fetch.mockRejectedValue(new Error('discord API down'));
      const service = await buildService(client);
      const track = createFakeTrack();

      expect(() =>
        service.onTrackError([
          fakePlayer(),
          track,
          { error: new Error('boom') },
        ] as any),
      ).not.toThrow();
      await flushMicrotasks();
    });
  });

  describe('onQueueEnd', () => {
    it('sends a queue-ended embed when a track was present', async () => {
      const channel = createFakeTextChannel();
      const client = createFakeClient();
      client.channels.fetch.mockResolvedValue(channel);
      const service = await buildService(client);
      const track = createFakeTrack();

      service.onQueueEnd([fakePlayer(), track] as any);
      await flushMicrotasks();

      expect(channel.send).toHaveBeenCalledTimes(1);
    });

    it('never fetches a channel when there is no track', async () => {
      const client = createFakeClient();
      const service = await buildService(client);

      service.onQueueEnd([fakePlayer(), undefined] as any);
      await flushMicrotasks();

      expect(client.channels.fetch).not.toHaveBeenCalled();
    });

    it('does not throw and logs when channels.fetch rejects', async () => {
      const client = createFakeClient();
      client.channels.fetch.mockRejectedValue(new Error('discord API down'));
      const service = await buildService(client);
      const track = createFakeTrack();

      expect(() =>
        service.onQueueEnd([fakePlayer(), track] as any),
      ).not.toThrow();
      await flushMicrotasks();
    });
  });
});
