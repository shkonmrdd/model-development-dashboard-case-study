
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
- Recent Operations Timeline (grouped by date, filterable)
- Governance Status (approvals, compliance, stakeholders)
- Data Lineage mini-view (source → derived with highlights)


## Mock API

This dashboard uses Mock Service Worker to intercept `/api/*` requests in the browser.
Responses include a realistic network delay (randomized between 250–900ms by default).
Override with `__delay=0` to disable or set a specific value in milliseconds.

### Production / deployment

- Mocking is forced on for this assignment (see `src/components/providers/MockProvider.tsx`).
- If you want real API calls, wire up the flag in `MockProvider` and remove the MSW worker start.

## Assumptions made
- I chose Next.js as a strong, well‑established baseline that serves as a point of contract for developer(s): “we do things the Next.js way, and we follow the Next.js guidelines.”
- Decided to split `sample_data.json` into corresponding API routes to match a real‑world backend conventions more closely.
- Mock Service Worker (https://www.npmjs.com/package/msw) is chosen over inventing a mock data solution from scratch, and it stays forced‑on for this case study.
- It’s an internal‑use dashboard, so there’s no need for SEO‑friendly SSR; for simplicity it stays CSR‑only.
- Styling is heavily inspired by shadcn/ui guidelines and implemented using minimal Tailwind + shadcn components.
- State management: TanStack Query handles server data. There’s no Redux/Zustand because no client state is reused across pages.
- Dark/Light mode was implemented but removed due to a tiny blink on load (if there’s time, it can be re‑implemented properly).
- React Flow (`@xyflow/react`) is used for the lineage diagram because it’s feature‑rich and easy to extend.
- Recent operations return the full mock dataset and are grouped by date; the UI defaults to a smaller visible slice with “Show more.”
- If `current_version_id` is missing, tables fall back to the latest version in the list.
