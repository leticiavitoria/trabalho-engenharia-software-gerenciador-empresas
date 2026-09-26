import type {
    Company,
    CompanyInput,
    PermissionId,
    PermissionMatrix,
    RoleId,
    User,
    UserInput,
} from "../data/types";
import { httpClient } from "./httpClient";

/** Operações do backend usadas pelas telas. Os testes usam uma implementação em memória. */
export interface DataApi {
    listCompanies: () => Promise<Company[]>;
    createCompany: (input: CompanyInput) => Promise<Company>;
    updateCompany: (id: string, input: CompanyInput) => Promise<Company>;
    deleteCompany: (id: string) => Promise<void>;
    listUsers: () => Promise<User[]>;
    createUser: (input: UserInput) => Promise<User>;
    updateUser: (id: string, input: UserInput) => Promise<User>;
    deleteUser: (id: string) => Promise<void>;
    getPermissions: () => Promise<PermissionMatrix>;
    setPermission: (permissionId: PermissionId, roleId: RoleId, enabled: boolean) => Promise<void>;
}

// Formato trafegado pela API: ids numéricos e telefone nulo quando ausente.
export interface CompanyDto extends Omit<Company, "id" | "phone"> {
    id: number;
    phone: string | null;
}

export interface UserDto extends Omit<User, "id" | "companyId"> {
    id: number;
    companyId: number;
}

interface PermissionsDto {
    matrix: PermissionMatrix;
}

export function toCompany({ id, phone, ...rest }: CompanyDto): Company {
    return { ...rest, id: String(id), ...(phone ? { phone } : {}) };
}

export function toUser({ id, companyId, ...rest }: UserDto): User {
    return { ...rest, id: String(id), companyId: String(companyId) };
}

function toCompanyPayload(input: CompanyInput) {
    return { ...input, phone: input.phone ?? null };
}

function toUserPayload(input: UserInput) {
    return { ...input, companyId: Number(input.companyId) };
}

const path = (...segments: string[]) => `/api/${segments.map(encodeURIComponent).join("/")}`;

export const httpDataApi: DataApi = {
    async listCompanies() {
        const { data } = await httpClient.get<CompanyDto[]>(path("companies"));
        return data.map(toCompany);
    },
    async createCompany(input) {
        const { data } = await httpClient.post<CompanyDto>(path("companies"), toCompanyPayload(input));
        return toCompany(data);
    },
    async updateCompany(id, input) {
        const { data } = await httpClient.put<CompanyDto>(path("companies", id), toCompanyPayload(input));
        return toCompany(data);
    },
    async deleteCompany(id) {
        await httpClient.delete(path("companies", id));
    },
    async listUsers() {
        const { data } = await httpClient.get<UserDto[]>(path("users"));
        return data.map(toUser);
    },
    async createUser(input) {
        const { data } = await httpClient.post<UserDto>(path("users"), toUserPayload(input));
        return toUser(data);
    },
    async updateUser(id, input) {
        const { data } = await httpClient.put<UserDto>(path("users", id), toUserPayload(input));
        return toUser(data);
    },
    async deleteUser(id) {
        await httpClient.delete(path("users", id));
    },
    async getPermissions() {
        const { data } = await httpClient.get<PermissionsDto>(path("permissions"));
        return data.matrix;
    },
    async setPermission(permissionId, roleId, enabled) {
        await httpClient.put(path("permissions", permissionId, "roles", roleId), { enabled });
    },
};
