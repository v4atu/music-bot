# AGENTS.md

## Stack

NestJS + TypeScript Discord bot using [necord](https://necord.ljtech.dev) for slash commands and `@necord/lavalink` / `lavalink-client` for music playback via a Lavalink server.

## Commands

```bash
pnpm install          # install deps (pnpm 12.4.1 via corepack)
pnpm run build        # nest build (output: dist/)
pnpm run start:dev    # watch mode
pnpm run start:prod   # node dist/main
pnpm run lint         # eslint --fix
pnpm run test         # jest (unit, rootDir=src)
pnpm run test:e2e     # jest --config test/jest-e2e.json
pnpm run test:cov     # jest --coverage
pnpm run format       # prettier --write src/ test/
```

## Verification order

`pnpm run lint` → `pnpm run test` → `pnpm run build`

## Environment

Required env vars (see `.env.example`): `DISCORD_TOKEN`, `DISCORD_DEVELOPMENT_GUILD_ID`, `LAVALINK_PASSWORD`, `LAVALINK_HOST`, `LAVALINK_PORT`. Loaded via `@nestjs/config` `ConfigModule.forRoot()` — reads `.env` automatically.

A running Lavalink server is required for the bot to connect and play music.

## Architecture

- `src/main.ts` — bootstrap entrypoint
- `src/app.module.ts` — root module, imports `ConfigModule` + `DiscordModule`
- `src/discord/discord.module.ts` — configures NecordModule (Discord client) and NecordLavalinkModule; imports all feature modules
- `src/music/` — slash commands (`play`, `pause`, `resume`, `skip`, `clear`, `loop`, `queue`)
- `src/embed/` — `EmbedService` for building Discord embeds
- `src/message/` — `MessageService` (imported by `DiscordModule`)
- `src/utils/` — `PingCommand`
- `src/testing/` — shared test fixtures and mocks

## Testing patterns

- Unit tests use `@nestjs/testing` `Test.createTestingModule` for DI-aware commands; `EmbedService` is tested by direct instantiation.
- Shared fixtures in `src/testing/`: `createFakePlayer`, `createFakeTrack`, `createFakeQueue`, `createFakeInteraction`, `createPlayerManagerMock`.
- Test files co-located with source: `*.spec.ts` next to `*.ts`.
- ESLint relaxes `no-unsafe-*` rules for `**/*.spec.ts` and `src/testing/**/*.ts`.

## Style

- Prettier: single quotes, trailing commas (all). End-of-line: auto.
- `@typescript-eslint/no-explicit-any`: off. `no-floating-promises` and `no-unsafe-argument`: warn.
- `tsconfig.json`: `module`/`moduleResolution` = `nodenext`, `target` = `ES2023`, `strictNullChecks` = true, `noImplicitAny` = false.
- Imports use `src/...` paths (mapped in jest `moduleNameMapper`; `baseUrl` = `./`).

## Gotchas

- `nest build` deletes `dist/` before building (`compilerOptions.deleteOutDir: true` in `nest-cli.json`).
- Module imports use `src/` absolute paths (e.g. `import { MusicModule } from 'src/music/music.module'`). This works at runtime via NestJS but requires `baseUrl` in tsconfig.
- The `pnpm-workspace.yaml` exists but this is a single-package repo — no workspace packages.
- User-facing error messages in commands are in Spanish.
