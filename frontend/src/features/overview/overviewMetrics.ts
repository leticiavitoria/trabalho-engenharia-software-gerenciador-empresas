import type { Company, User } from "../../shared/data/types";

export const RECENT_COMPANIES_LIMIT = 4;

export interface OverviewMetrics {
    totalCompanies: number;
    activeCompanies: number;
    totalUsers: number;
    pendingRecords: number;
}

/** Todos os números vêm das coleções carregadas do servidor (OV-002). */
export function computeOverviewMetrics(companies: Company[], users: User[]): OverviewMetrics {
    return {
        totalCompanies: companies.length,
        activeCompanies: companies.filter((company) => company.status === "active").length,
        totalUsers: users.length,
        pendingRecords:
            companies.filter((company) => company.status === "pending").length +
            users.filter((user) => user.status === "pending").length,
    };
}

/** Empresas mais recentes primeiro, pela ordem de inserção na coleção. */
export function selectRecentCompanies(companies: Company[], limit = RECENT_COMPANIES_LIMIT): Company[] {
    return companies.slice(-limit).reverse();
}
