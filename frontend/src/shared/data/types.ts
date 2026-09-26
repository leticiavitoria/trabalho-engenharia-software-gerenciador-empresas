export type RecordStatus = "active" | "pending" | "inactive";

export interface Company {
    id: string;
    name: string;
    /** Identificador fictício, sem validação fiscal real. */
    cnpj: string;
    sector: string;
    /** Cidade e UF exibidas como um único valor. */
    city: string;
    status: RecordStatus;
    email: string;
    phone?: string;
    /** Data de cadastro no formato AAAA-MM-DD. */
    createdAt: string;
}

export type CompanyInput = Omit<Company, "id" | "createdAt">;

export type RoleId = "admin" | "editor" | "viewer";

export interface User {
    id: string;
    name: string;
    email: string;
    companyId: string;
    role: RoleId;
    status: RecordStatus;
    /** Data e hora do último acesso (ISO 8601); `null` quando nunca acessou. */
    lastAccess: string | null;
}

export type UserInput = Omit<User, "id" | "lastAccess">;

export type PermissionId =
    | "companies.view"
    | "companies.create"
    | "companies.edit"
    | "companies.delete"
    | "users.view"
    | "users.manage"
    | "permissions.manage";

export type PermissionMatrix = Record<PermissionId, Record<RoleId, boolean>>;
