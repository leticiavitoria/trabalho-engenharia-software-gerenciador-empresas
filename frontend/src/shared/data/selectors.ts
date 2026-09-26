import type { User } from "./types";

export function countUsersByCompany(users: User[]): Map<string, number> {
    const counts = new Map<string, number>();
    for (const user of users) {
        counts.set(user.companyId, (counts.get(user.companyId) ?? 0) + 1);
    }
    return counts;
}
