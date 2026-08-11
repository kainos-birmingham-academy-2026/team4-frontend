# team4-frontend

Basic Node.js frontend scaffold using Express and Nunjucks.

## Prerequisites

- Node.js 18+
- npm
- Docker Desktop (for full-stack setup)

**Required Folder Structure:**

Both `team4-backend` and `team4-frontend` must be cloned in the same parent folder:

```
parent-folder/
  team4-backend/     ← Related repository
  team4-frontend/    ← This repository
```

This structure is required for the Docker Compose setup to work correctly.

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

## Testing

- `npm run test`
	- Runs unit tests once using Vitest
- `npm run test:ui`
	- Runs tests with Vitest UI mode enabled
- `npm run test:coverage`
	- Runs tests and generates a coverage report in `./coverage`

## Docker Compose (Full-Stack Setup)

For a complete development environment with frontend + backend + database, the compose file is included in this repository:

### Starting the Stack
& Deployment

### ⚠️ Docker Requirement

**Important:** Docker Desktop must be running before starting any containers or running the compose file.

### Full-Stack Setup with Docker Compose

The compose file in this repository orchestrates the complete development environment.

**Prerequisites:**
- Docker Desktop installed and running
- Both `team4-backend` and `team4-frontend` repositories cloned in the same parent folder:
  ```
  parent-folder/
    team4-backend/
    team4-frontend/
      compose.yaml  ← Located here
  ```

**Starting the Stack:**

```bash
docker compose up --build -d
```

This will automatically:
- Start PostgreSQL 15 database (port 5432)
- Start the backend API (port 4000)
- Start the frontend server (port 3000)
- Run database migrations
- Seed the database with initial data

Visit `http://localhost:3000` to access the frontend.

**Development with Hot Reload:**

When running via Docker Compose, the frontend supports hot-reload for templates:
- Edit `.njk` files in `src/views/`
- Refresh your browser to see changes without restarting the server

**Stopping and Cleaning Up:**

When you're done developing, clean up all containers and free up ports:

```bash
docker compose down -v
```

The `-v` flag removes volumes (including the database), allowing you to run `docker compose up --build -d` again for a completely fresh environment.

**View Logs:**

To debug or monitor services, view logs from specific containers:


## Git Hook Setup (Lefthook)

Pre-commit hooks are installed automatically by `npm install` through the `prepare` script.

You only need to run this manually if install scripts were skipped (for example, `npm install --ignore-scripts`):

```bash
npm run prepare
```

## Endpoints

- `GET /`
	- Displays a home page
- `GET /register`
	- Displays a registration page (not fully implemented)
- `GET /login`
	- Displays a login page (not fully implemented)
- `GET /job-roles`
	- Displays a page listing all open job roles
- `GET /health`
	- Displays this JSON object:
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
