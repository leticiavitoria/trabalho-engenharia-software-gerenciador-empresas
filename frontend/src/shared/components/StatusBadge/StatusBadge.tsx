import { COMPANY_STATUS_LABELS, USER_STATUS_LABELS } from "../../data/labels";
import type { RecordStatus } from "../../data/types";

interface StatusBadgeProps {
    status: RecordStatus;
    kind: "company" | "user";
}

export function StatusBadge({ status, kind }: StatusBadgeProps) {
    const label = kind === "company" ? COMPANY_STATUS_LABELS[status] : USER_STATUS_LABELS[status];
    return (
        <span className={`badge badge--${status}`}>
            <span className="badge__dot" aria-hidden="true" />
            {label}
        </span>
    );
}
