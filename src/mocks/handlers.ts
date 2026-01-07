import { HttpResponse, delay, http } from "msw";
import type { Governance, SampleData } from "@/lib/types";
import data from "@/mocks/sample_data.json";

const db = data as SampleData;

const defaultGovernance: Governance = {
  approvals: [],
  compliance_checklist: null,
  stakeholders: [],
};

const DEFAULT_DELAY_RANGE_MS = { min: 250, max: 900 };

const getDefaultDelayMs = () => {
  const { min, max } = DEFAULT_DELAY_RANGE_MS;
  return Math.floor(min + Math.random() * (max - min));
};

const parseControlParams = (request: Request) => {
  const url = new URL(request.url);
  const delayParam = url.searchParams.get("__delay");
  const statusParam = url.searchParams.get("__status");
  const networkError = url.searchParams.get("__networkError") === "1";
  const delayMs =
    delayParam !== null ? Number(delayParam) : getDefaultDelayMs();
  const status = statusParam ? Number(statusParam) : null;

  return {
    delayMs: Number.isFinite(delayMs) && delayMs > 0 ? delayMs : 0,
    status: Number.isFinite(status) && status ? status : null,
    networkError,
  };
};

const gate = async (request: Request) => {
  const { delayMs, status, networkError } = parseControlParams(request);
  if (delayMs) {
    await delay(delayMs);
  }
  if (networkError) {
    return HttpResponse.error();
  }
  if (status) {
    return HttpResponse.json({ message: "Forced error" }, { status });
  }
  return null;
};

export const handlers = [
  http.get("/api/projects", async ({ request }) => {
    const blocked = await gate(request);
    if (blocked) return blocked;
    return HttpResponse.json(db.projects);
  }),

  http.get("/api/projects/:projectId", async ({ params, request }) => {
    const blocked = await gate(request);
    if (blocked) return blocked;
    const projectId = params.projectId as string;
    const project = db.projects.find(
      (item) => item.project_id === projectId,
    );
    if (!project) {
      return HttpResponse.json({ message: "Project not found" }, { status: 404 });
    }
    return HttpResponse.json(project);
  }),

  http.get("/api/project_tables/:projectId", async ({ params, request }) => {
    const blocked = await gate(request);
    if (blocked) return blocked;
    const projectId = params.projectId as string;
    const tables = db.project_tables[projectId] ?? [];
    return HttpResponse.json(tables);
  }),

  http.get("/api/recent_operations/:projectId", async ({ params, request }) => {
    const blocked = await gate(request);
    if (blocked) return blocked;
    const projectId = params.projectId as string;
    const operations = db.recent_operations[projectId] ?? [];
    return HttpResponse.json(operations.slice(0, 10));
  }),

  http.get("/api/governance/:projectId", async ({ params, request }) => {
    const blocked = await gate(request);
    if (blocked) return blocked;
    const projectId = params.projectId as string;
    const governance = db.governance[projectId] ?? defaultGovernance;
    return HttpResponse.json(governance);
  }),

  http.get("/api/table_lineage/:projectId", async ({ params, request }) => {
    const blocked = await gate(request);
    if (blocked) return blocked;
    const projectId = params.projectId as string;
    const edges = db.table_lineage[projectId] ?? [];
    return HttpResponse.json(edges);
  }),
];
