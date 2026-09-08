# Local Docker verification

Run commands from the repository root. Docker Desktop must be running with Linux containers.

1. Copy `deploy/docker-local.env.example` to `.env.docker.local` and replace the two auth secrets with random strings (at least 32 characters).
2. Build and start:

```sh
docker compose -f compose.local.yml up -d --build --wait --wait-timeout 180
docker compose -f compose.local.yml ps -a
docker compose -f compose.local.yml logs --tail=100 app migrate
```

Open http://localhost:3000. The repository's `local.db` is separate from this deployment. On the first run, a new empty database is created in the Docker volume; subsequent runs preserve it.

Dependencies and Prisma generation use Bun 1.4.2 with the frozen lockfile. Next.js is built in production mode; the final standalone server runs on Node.js 22. The `migrate` service applies the committed Prisma migrations to the same SQLite file used by the app. A Turso development server is unnecessary for a `file:` URL.

`/api/health` checks access to the application database. The service runs as an unprivileged user and binds only to the host's loopback interface. Database files persist in the `biztrokz-local_database` Docker volume across rebuilds and container restarts.

The example contains placeholders for mandatory integration settings. Google login, R2 uploads and Resend email require real credentials in `.env.docker.local`. New accounts also require an enabled waitlist entry under the existing authentication rules. No authentication bypass or test account is added.

Verified on 2026-09-06: production image build, all 41 migrations on an empty database, HTTP 200 for `/`, `/login`, `/api/health` and `/api/auth/get-session`, and browser navigation from `/dashboard` to `/login` without a session. Typecheck passes; ESLint reports zero errors and 114 existing warnings. The build also logs an existing private-cache prerender warning for `/dashboard/settings`; authenticated flows have not been verified with the placeholder credentials.

Stop the local deployment while retaining the database:

```sh
docker compose -f compose.local.yml down
```

Do not add `--volumes` unless you intend to delete the test database.
