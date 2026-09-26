import type { Company, PermissionMatrix, User } from "../shared/data/types";
import type { DataApi } from "../shared/services/dataApi";
import { ApiError } from "../shared/services/apiError";
import { INITIAL_COMPANIES, INITIAL_PERMISSIONS, INITIAL_USERS } from "./fixtures";

const TODAY = "2026-09-26";

/**
 * Implementação em memória da API, com as mesmas regras do backend que as
 * telas percebem: ids novos nunca reutilizados, data de cadastro definida no
 * servidor e exclusão em cascata dos usuários de uma empresa.
 */
export function createFakeApi(overrides: Partial<DataApi> = {}): DataApi {
    let companies: Company[] = structuredClone(INITIAL_COMPANIES);
    let users: User[] = structuredClone(INITIAL_USERS);
    let permissions: PermissionMatrix = structuredClone(INITIAL_PERMISSIONS);
    let nextCompanyId = companies.length + 1;
    let nextUserId = users.length + 1;

    const notFound = () => new ApiError("Registro não encontrado.", 404);

    const api: DataApi = {
        async listCompanies() {
            return structuredClone(companies);
        },
        async createCompany(input) {
            const company = { ...input, id: String(nextCompanyId++), createdAt: TODAY };
            companies = [...companies, company];
            return structuredClone(company);
        },
        async updateCompany(id, input) {
            const current = companies.find((company) => company.id === id);
            if (!current) throw notFound();
            const updated = { ...input, id, createdAt: current.createdAt };
            companies = companies.map((company) => (company.id === id ? updated : company));
            return structuredClone(updated);
        },
        async deleteCompany(id) {
            if (!companies.some((company) => company.id === id)) throw notFound();
            companies = companies.filter((company) => company.id !== id);
            users = users.filter((user) => user.companyId !== id);
        },
        async listUsers() {
            return structuredClone(users);
        },
        async createUser(input) {
            const user = { ...input, id: String(nextUserId++), lastAccess: null };
            users = [...users, user];
            return structuredClone(user);
        },
        async updateUser(id, input) {
            const current = users.find((user) => user.id === id);
            if (!current) throw notFound();
            const updated = { ...input, id, lastAccess: current.lastAccess };
            users = users.map((user) => (user.id === id ? updated : user));
            return structuredClone(updated);
        },
        async deleteUser(id) {
            if (!users.some((user) => user.id === id)) throw notFound();
            users = users.filter((user) => user.id !== id);
        },
        async getPermissions() {
            return structuredClone(permissions);
        },
        async setPermission(permissionId, roleId, enabled) {
            permissions = { ...permissions, [permissionId]: { ...permissions[permissionId], [roleId]: enabled } };
        },
    };

    return { ...api, ...overrides };
}
