
## Model development dashboard

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## UI Shell

This project uses the `dashboard-01` layout from shadcn/ui as the base shell for the
project list (`/`) and project overview (`/projects/[projectId]/overview`).

## Project Overview Sections

The overview route surfaces the required panels from the case study:
- Project Header (status, owners, timestamps, department)
- Data Tables Summary (expandable columns + versions)
- Recent Operations Timeline (last 10, grouped by date)
- Governance Status (approvals, compliance, stakeholders)
- Data Lineage mini-view (source → derived with highlights)


## Mock API

This dashboard uses Mock Service Worker to intercept `/api/*` requests in the browser.

1. Create a local `.env.local` file with `NEXT_PUBLIC_API_MOCKING=true`.
2. Run the dev server and open the app.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.
