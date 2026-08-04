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
- `npm start`
	- Starts the app from the `./dist` folder

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
