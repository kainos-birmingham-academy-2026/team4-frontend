# team4-frontend

Basic Node.js frontend scaffold using Express and Nunjucks.

## Prerequisites

- Node.js 18+
- npm

## Install

```bash
npm install
```

## Run Scripts

- `npm run build`
	- Builds the app and stores output in `./dist`
- `npm run dev`
	- Runs the app in hot reload mode
- `npm run start`
	- Starts the app from the `./dist` folder

## Testing

Unit tests are written with [Vitest](https://vitest.dev/).

- `npm run test`
	- Runs all unit tests once
- `npm run test:ui`
	- Opens the Vitest browser UI for interactive test inspection
- `npm run test:coverage`
	- Runs tests and generates a coverage report in `./coverage`

Test files follow the `*.test.ts` naming convention and live alongside the source files they cover.

## Linting And Type Checking

- `npm run lint`
	- Runs Biome checks across the project without changing files
- `npm run lint:fix`
	- Runs Biome checks and writes safe automatic fixes
- `npm run format`
	- Applies Biome formatter changes
- `npm run typecheck`
	- Runs TypeScript checks with `tsc --noEmit`

Use these commands when you want to lint manually outside of git hooks.

## Git Hook Setup (Lefthook)

Pre-commit hooks are installed automatically by `npm install` through the `prepare` script.

You only need to run this manually if install scripts were skipped (for example, `npm install --ignore-scripts`):

```bash
npm run prepare
```

## Endpoints

- `GET /`
	- Returns a basic HTML page with hello world
- `GET /health`
	- Returns health JSON:

```json
{
	"status": "UP",
	"time": "<current timestamp>"
}
```

## Default Port

The app runs on port 3000 by default.
You can override this with:

```bash
PORT=3100 npm run dev
```
