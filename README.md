# PrynceIndiv

Single-server voting system using Express + Prisma + SQLite.

## Run Project

1. Install dependencies:

```bash
npm install
```

2. Create/update the database and Prisma client:

```bash
npm run prisma:migrate
```

3. Start the app:

```bash
npm run start
```

Or use:

```bash
npm run dev
```

The app runs at `http://127.0.0.1:3000`.

## Entry Page

Use this single entry point:

- `/` -> Main index page

From there you can open:

- `/landing`
- `/login`
- `/admin/login`
- `/home`
- `/admin/dashboard`

## Environment

`.env` is used for runtime configuration:

```env
PORT=3000
DATABASE_URL="file:./dev.db"
```

## Prisma Files

- `prisma/schema.prisma`
- `prisma/migrations/*`

## Git Ignore

`.gitignore` excludes:

- `node_modules/`
- `.env`
- `prisma/dev.db`
