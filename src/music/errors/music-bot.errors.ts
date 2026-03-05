export class MusicBotError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

/** Error causado por el usuario o estado inválido (player no existe, cola vacía, etc.) */
export class UserFacingError extends MusicBotError {}

/** Error inesperado del sistema (Lavalink, red, librería externa) */
export class InternalMusicError extends MusicBotError {}
