# Music Bot

A Discord music bot built with NestJS, [necord](https://necord.ljtech.dev), and [lavalink-client](https://www.npmjs.com/package/lavalink-client) for playing YouTube audio in voice channels. Designed to run on a **single Discord server** — either on a remote VPS or a local homelab.

Un bot de musica para Discord construido con NestJS, [necord](https://necord.ljtech.dev) y [lavalink-client](https://www.npmjs.com/package/lavalink-client) para reproducir audio de YouTube en canales de voz. disenado para funcionar en **un solo servidor de Discord** — ya sea en un VPS remoto o un homelab local.

---

## Scope / Alcance

> **This bot was built to serve one Discord server.** It was not designed or tested for multi-guild deployments. If you need a bot that works across many servers, this is not the right project.

> **Este bot fue construido para servir un solo servidor de Discord.** No fue disenado ni probado para despliegues multi-guild. Si necesitas un bot que funcione en multiples servidores, este no es el proyecto indicado.

---

## Deployment / Despliegue

### Remote VPS

If you deploy on a remote VPS, you **must** read the [Lavalink](https://github.com/lavalink-devs/Lavalink) and [Lavaplayer](https://github.com/lavalink-devs/lavaplayer) documentation carefully. YouTube actively blocks datacenter IPs, and without proper configuration (e.g. using a proxy or correct source setup) your bot **will** get blocked.

Si despliegas en un VPS remoto, **debes** leer la documentacion de [Lavalink](https://github.com/lavalink-devs/Lavalink) y [Lavaplayer](https://github.com/lavalink-devs/lavaplayer) detenidamente. YouTube bloquea activamente IPs de centros de datos, y sin una configuracion adecuada (por ejemplo, usando un proxy o configuracion correcta de fuentes) tu bot **sera** bloqueado.

### Local Homelab

If you run the bot from a home network, you should not face YouTube IP blocks. Residential IPs are not targeted by YouTube's rate limiting. You can run Lavalink and the bot without worrying about getting blocked.

Si ejecutas el bot desde una red doméstica, no deberías enfrentar bloqueos de IP por parte de YouTube. Las IPs residenciales no son objetivo del rate limiting de YouTube. Puedes ejecutar Lavalink y el bot sin preocuparte por ser bloqueado.

---

## Prerequisites / Requisitos

- [Node.js](https://nodejs.org/) >= 20
- [pnpm](https://pnpm.io/) (via corepack)


- A running [Lavalink](https://github.com/lavalink-devs/Lavalink) server
- A Discord bot token with the `bot` scope and permissions to connect to voice channels

- Un servidor [Lavalink](https://github.com/lavalink-devs/Lavalink) en ejecucion
- Un token de bot de Discord con el scope `bot` y permisos para conectarse a canales de voz

---

## Setup / Configuracion

1. Clone the repository / Clona el repositorio:

```bash
git clone https://github.com/<your-user>/music-bot.git
cd music-bot
```

2. Install dependencies / Instala las dependencias:

```bash
pnpm install
```

3. Create your `.env` file from the example / Crea tu archivo `.env` a partir del ejemplo:

```bash
cp .env.example .env
```

4. Fill in the required environment variables / Completa las variables de entorno requeridas:

| Variable | Description |
|---|---|
| `DISCORD_TOKEN` | Your Discord bot token |
| `DISCORD_DEVELOPMENT_GUILD_ID` | Guild ID where slash commands are registered instantly during development (optional in production) |
| `LAVALINK_PASSWORD` | Password for your Lavalink server |
| `LAVALINK_HOST` | Host of your Lavalink server (e.g. `localhost`) |
| `LAVALINK_PORT` | Port of your Lavalink server (e.g. `2333`) |

---

## Run / Ejecutar

```bash
# Development with hot-reload / Desarrollo con hot-reload
pnpm run start:dev

# Production / Produccion
pnpm run build
pnpm run start:prod
```

---

## Slash Commands / Comandos

| Command | Description |
|---|---|
| `/play <query>` | Play a song by name or URL from YouTube |
| `/pause` | Pause the current track |
| `/resume` | Resume the current track |
| `/skip [songs]` | Skip the current track (optionally skip N tracks) |
| `/clear` | Clear the queue and stop playback |
| `/loop` | Toggle loop on the current track |
| `/queue` | Show the current queue (ephemeral) |
| `/ping` | Check bot latency |

---

## Tech Stack

- [NestJS](https://nestjs.com/) — Node.js framework
- [necord](https://necord.ljtech.dev) — Discord.js wrapper for Necord
- [@necord/lavalink](https://www.npmjs.com/package/@necord/lavalink) — Lavalink integration
- [lavalink-client](https://www.npmjs.com/package/lavalink-client) — Lavalink client
- [discord.js](https://discord.js.org/) — Discord API library
- [TypeScript](https://www.typescriptlang.org/)
- [Lavalink](https://github.com/lavalink-devs/Lavalink) + [Lavaplayer](https://github.com/lavalink-devs/lavaplayer) — Audio playback server

---

## License

This project is private and unlicensed.
