# PRM Network

Personal Relationship Management web app. Built with Next.js 15, Prisma, SQLite, Tailwind CSS, and shadcn/ui components.

## Features

- Contact management with full CRUD
- Warmth rating (0–10) with color-coded visual
- Group tagging (Friends, Tepper, Work, etc.)
- Last interaction tracking
- Search and filter (by name, group, warmth range)
- Import contacts from CSV or Excel (.xlsx/.xls)
- Export contacts to CSV or Excel
- Persistent SQLite database

## Development

```bash
npm install
npm run db:migrate   # create/update database
npm run db:seed      # seed default groups
npm run dev          # start dev server at localhost:3000
```

## Deploy to Railway

1. Create a Railway project and link this repo
2. Add a persistent volume mounted at `/app/data`
3. Set environment variable: `DATABASE_URL=file:/app/data/prm.db`
4. Railway will use `railway.toml` for build/deploy config

## CSV Import Format

Columns: `firstName, lastName, email, phone, workTitle, company, warmth, notes, lastInteraction, linkedinUrl, groups`

- `warmth`: integer 0–10 (defaults to 5 if missing/invalid)
- `lastInteraction`: ISO 8601 date string
- `groups`: pipe-separated group names, e.g. `Friends|Tepper`
