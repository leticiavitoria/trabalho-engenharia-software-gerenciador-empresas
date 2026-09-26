import type { RecordStatus } from "./types";

export type StatusFilter = "all" | RecordStatus;

export function isStatusFilter(value: string): value is StatusFilter {
    return value === "all" || value === "active" || value === "pending" || value === "inactive";
}

export function matchesStatus(filter: StatusFilter, status: RecordStatus): boolean {
    return filter === "all" || filter === status;
}
