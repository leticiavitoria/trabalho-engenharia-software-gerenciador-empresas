import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { INITIAL_COMPANIES, INITIAL_PERMISSIONS, INITIAL_USERS } from "../shared/demo/fixtures";
import { PERMISSIONS, ROLES } from "../shared/demo/labels";

/**
 * Backend em memória que imita as respostas da API Flask (mesmas rotas,
 * formatos e regras, como a exclusão em cascata). Permite testar as telas
 * sem subir o backend nem o PostgreSQL.
 */

interface FakeCompany {
    id: number;
    name: string;
    cnpj: string;
    sector: string;
    city: string;
    status: string;
    email: string;
    phone: string | null;
    createdAt: string;
}

interface FakeUser {
    id: number;
    name: string;
    email: string;
    companyId: number;
    role: string;
    status: string;
    lastAccess: string | null;
}

interface FakePermission {
    role: string;
    functionality: string;
    enabled: boolean;
}

/** Usuário logado nos testes (fora da lista de exemplo, como no seed do backend). */
export const TEST_AUTH_USER = {
    id: 99,
    name: "João Sampaio",
    email: "joao.sampaio@aurora.exemplo",
    companyId: 1,
    companyName: "Aurora Tecnologia",
    role: "Administrador",
    status: "active",
};

const PER_PAGE = 5;
const ROLE_NAME = Object.fromEntries(ROLES.map((role) => [role.id, role.name]));

let companies: FakeCompany[] = [];
let users: FakeUser[] = [];
let permissions: FakePermission[] = [];
let nextCompanyId = 1;
let nextUserId = 1;

/** Volta o backend aos dados de exemplo. Chamado antes de cada renderização. */
export function resetFakeBackend() {
    const companyIds = new Map<string, number>();
    companies = INITIAL_COMPANIES.map((company, index) => {
        companyIds.set(company.id, index + 1);
        return {
            id: index + 1,
            name: company.name,
            cnpj: company.cnpj,
            sector: company.sector,
            city: company.city,
            status: company.status,
            email: company.email,
            phone: company.phone ?? null,
            createdAt: `${company.createdAt}T12:00:00`,
        };
    });
    users = INITIAL_USERS.map((user, index) => ({
        id: index + 1,
        name: user.name,
        email: user.email,
        companyId: companyIds.get(user.companyId)!,
        role: ROLE_NAME[user.role],
        status: user.status,
        lastAccess: user.lastAccess,
    }));
    permissions = PERMISSIONS.flatMap((permission) =>
        ROLES.map((role) => ({
            role: role.name,
            functionality: permission.label,
            enabled: INITIAL_PERMISSIONS[permission.id][role.id],
        })),
    );
    nextCompanyId = companies.length + 1;
    nextUserId = users.length + 1;
}

function companyToJson(company: FakeCompany) {
    return {
        ...company,
        userCount: users.filter((user) => user.companyId === company.id).length,
    };
}

function userToJson(user: FakeUser) {
    return {
        ...user,
        companyName: companies.find((company) => company.id === user.companyId)?.name ?? null,
    };
}

function paginate<T>(items: T[], page: number) {
    return {
        items: items.slice((page - 1) * PER_PAGE, page * PER_PAGE),
        total: items.length,
        page,
        perPage: PER_PAGE,
    };
}

type Handler = (body: Record<string, unknown>, params: Record<string, unknown>) => [number, unknown];

function route(method: string, path: string): Handler | null {
    const companyMatch = path.match(/^\/api\/empresas\/(\d+)$/);
    const userMatch = path.match(/^\/api\/usuarios\/(\d+)$/);

    if (method === "get" && path === "/api/empresas") {
        return (_, params) => {
            const sorted = [...companies].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id);
            return [200, paginate(sorted.map(companyToJson), Number(params.page ?? 1))];
        };
    }
    if (method === "post" && path === "/api/empresas") {
        return (body) => {
            const company: FakeCompany = {
                id: nextCompanyId++,
                name: String(body.name),
                cnpj: String(body.cnpj),
                sector: String(body.sector),
                city: String(body.city),
                status: String(body.status),
                email: String(body.email),
                phone: (body.phone as string | undefined) ?? null,
                createdAt: new Date().toISOString().slice(0, 19),
            };
            companies.push(company);
            return [201, { company: companyToJson(company) }];
        };
    }
    if (companyMatch) {
        const id = Number(companyMatch[1]);
        const company = companies.find((item) => item.id === id);
        if (!company) return () => [404, { error: "Empresa não encontrada" }];
        if (method === "get") return () => [200, companyToJson(company)];
        if (method === "put") {
            return (body) => {
                Object.assign(company, body, { phone: (body.phone as string | undefined) ?? null });
                return [200, { company: companyToJson(company) }];
            };
        }
        if (method === "delete") {
            return () => {
                users = users.filter((user) => user.companyId !== id);
                companies = companies.filter((item) => item.id !== id);
                return [200, { message: "Empresa e usuários vinculados removidos" }];
            };
        }
    }

    if (method === "get" && path === "/api/usuarios") {
        return (_, params) => {
            const sorted = [...users].sort((a, b) => b.id - a.id);
            return [200, paginate(sorted.map(userToJson), Number(params.page ?? 1))];
        };
    }
    if (method === "post" && path === "/api/usuarios") {
        return (body) => {
            if (!companies.some((company) => company.id === Number(body.companyId))) {
                return [422, { error: "Empresa informada não existe" }];
            }
            const user: FakeUser = {
                id: nextUserId++,
                name: String(body.name),
                email: String(body.email),
                companyId: Number(body.companyId),
                role: String(body.role),
                status: String(body.status),
                lastAccess: null,
            };
            users.push(user);
            return [201, { user: userToJson(user) }];
        };
    }
    if (userMatch) {
        const id = Number(userMatch[1]);
        const user = users.find((item) => item.id === id);
        if (!user) return () => [404, { error: "Usuário não encontrado" }];
        if (method === "get") return () => [200, userToJson(user)];
        if (method === "put") {
            return (body) => {
                Object.assign(user, body, { companyId: Number(body.companyId) });
                return [200, { user: userToJson(user) }];
            };
        }
        if (method === "delete") {
            return () => {
                users = users.filter((item) => item.id !== id);
                return [200, { message: "Usuário removido" }];
            };
        }
    }

    if (method === "get" && path === "/api/permissoes") {
        return () => [200, permissions.map((permission) => ({ ...permission }))];
    }
    if (method === "post" && path === "/api/permissoes/toggle") {
        return (body) => {
            const permission = permissions.find(
                (item) => item.role === body.role && item.functionality === body.functionality,
            );
            if (!permission) return [404, { error: "Permissão não encontrada" }];
            permission.enabled = !permission.enabled;
            return [200, { permission: { ...permission } }];
        };
    }
    return null;
}

/** Adapter do axios que responde com o backend em memória em vez de fazer requisições de rede. */
export const fakeBackendAdapter: AxiosAdapter = async (config: InternalAxiosRequestConfig) => {
    const method = (config.method ?? "get").toLowerCase();
    const path = new URL(config.url ?? "", "http://fake-backend").pathname;
    const body = typeof config.data === "string" && config.data ? JSON.parse(config.data) : (config.data ?? {});
    const handler = route(method, path);
    const [status, data] = handler ? handler(body, config.params ?? {}) : [404, { error: "Rota não encontrada" }];

    const response: AxiosResponse = { data, status, statusText: String(status), headers: {}, config };
    if (status >= 400) {
        const error = Object.assign(new Error(`Request failed with status code ${status}`), {
            isAxiosError: true,
            config,
            response,
        });
        throw error;
    }
    return response;
};
