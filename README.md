
## Model development dashboard

First, run the development server:

```bash
npm install
npm run dev
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

### Production / deployment

- Enable mocking at build time by setting `NEXT_PUBLIC_API_MOCKING=true`.
- If the app is served from a sub-path, set `NEXT_PUBLIC_BASE_PATH` (or provide a full
  `NEXT_PUBLIC_MSW_WORKER_URL`) so the worker script can be found.
- You can override mocking at runtime with `?__mock=1` (enable) or `?__mock=0` (disable);
  this preference is stored in `localStorage`.

## Assumptions made
- Decided to split the sample_data.json file into corresponding API routes to match the real world scenario more closely
- Mock user avatars rely on initials (no image asset requested by default)
