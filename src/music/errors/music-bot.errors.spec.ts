import {
  InternalMusicError,
  MusicBotError,
  UserFacingError,
} from './music-bot.errors';

describe('music-bot.errors', () => {
  it('UserFacingError is an Error and a MusicBotError with the right name and message', () => {
    const error = new UserFacingError('something went wrong');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(MusicBotError);
    expect(error).toBeInstanceOf(UserFacingError);
    expect(error.name).toBe('UserFacingError');
    expect(error.message).toBe('something went wrong');
  });

  it('InternalMusicError is an Error and a MusicBotError with the right name and message', () => {
    const error = new InternalMusicError('unexpected failure');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(MusicBotError);
    expect(error).toBeInstanceOf(InternalMusicError);
    expect(error.name).toBe('InternalMusicError');
    expect(error.message).toBe('unexpected failure');
  });

  it('UserFacingError and InternalMusicError are not instances of each other', () => {
    expect(new UserFacingError('x')).not.toBeInstanceOf(InternalMusicError);
    expect(new InternalMusicError('x')).not.toBeInstanceOf(UserFacingError);
  });
});
