export type ProjectType = "ML" | "TimeSeries" | "Scorecard" | "AI";
export type ProjectStatus = "Draft" | "Active" | "Review" | "Approved" | "Locked";
export type TableType = "source" | "derived";
export type ColumnRole = "exog" | "endog" | "not_used" | "time_id" | "lookup";
export type CheckpointType =
  | "raw_upload"
  | "user_manual"
  | "development_gate"
  | "validation_gate"
  | "production";
export type OperationType = "column_action" | "table_action" | "table_operation";
export type ApprovalType =
  | "DevCompletion"
  | "ValidationStart"
  | "ValidationCompletion"
  | "ProductionApproval";
export type ApprovalStatus = "Pending" | "Approved";
export type ComplianceStatus = "in_progress" | "Completed";
export type LineageParentType = "source_dataset";

export interface Person {
  user_id: string;
  name: string;
  title?: string;
  role?: string;
}

export interface Department {
  department_id: string;
  name: string;
}

export interface Project {
  project_id: string;
  project_name: string;
  project_type: ProjectType;
  status: ProjectStatus;
  owner: Person;
  governance_manager: Person | null;
  department: Department | null;
  is_segmented: boolean;
  objectives: string;
  created_at: string;
  updated_at: string;
}

export interface Column {
  column_id: string;
  column_name: string;
  display_name: string;
  data_type: string;
  role: ColumnRole;
}

export interface TableVersion {
  table_version_id: string;
  version_number: number;
  row_count: number;
  column_count: number;
  is_materialized: boolean;
  checkpoint_type: CheckpointType | null;
  checkpoint_name?: string;
  parent_version_id?: string | null;
  created_at: string;
  created_by: string;
}

export interface ProjectTable {
  project_table_id: string;
  table_name: string;
  display_name: string;
  table_type: TableType;
  current_version_id: string;
  versions: TableVersion[];
  columns: Column[];
}

export interface OperationLog {
  operation_log_id: string;
  operation_type: OperationType;
  operation_name: string;
  input_parameters: Record<string, unknown>;
  executed_by: Person;
  execution_timestamp: string;
  affected_table: string | null;
  output_table_version: string | null;
}

export interface Approval {
  approval_id: string;
  approval_type: ApprovalType;
  status: ApprovalStatus;
  approver: Person;
  requested_by?: Person;
  created_at?: string;
  approved_at?: string;
  comments: string | null;
}

export interface ComplianceChecklist {
  checklist_id: string;
  template_name: string;
  status: ComplianceStatus;
  completion_percentage: number;
  total_items: number;
  completed_items: number;
  assigned_to: Person;
  completed_at?: string;
}

export interface Stakeholder {
  user_id: string;
  name: string;
  role: string;
}

export interface Governance {
  approvals: Approval[];
  compliance_checklist: ComplianceChecklist | null;
  stakeholders: Stakeholder[];
}

export interface TableLineageEdge {
  child_table: string;
  parent_table: string;
  parent_type: LineageParentType;
}

export interface SampleData {
  projects: Project[];
  project_tables: Record<string, ProjectTable[]>;
  recent_operations: Record<string, OperationLog[]>;
  governance: Record<string, Governance>;
  table_lineage: Record<string, TableLineageEdge[]>;
}
