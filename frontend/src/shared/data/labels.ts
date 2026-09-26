import { formatDateTime } from "../utils/format";
import type { PermissionId, RecordStatus, RoleId } from "./types";

export const RECORD_STATUSES: RecordStatus[] = ["active", "pending", "inactive"];

export const COMPANY_STATUS_LABELS: Record<RecordStatus, string> = {
    active: "Ativa",
    pending: "Pendente",
    inactive: "Inativa",
};

export const USER_STATUS_LABELS: Record<RecordStatus, string> = {
    active: "Ativo",
    pending: "Pendente",
    inactive: "Inativo",
};

export interface RoleDefinition {
    id: RoleId;
    name: string;
    /** Propósito do perfil na configuração padrão (seed do banco). */
    defaultDescription: string;
}

export const ROLES: RoleDefinition[] = [
    {
        id: "admin",
        name: "Administrador",
        defaultDescription: "Na configuração padrão, acessa todas as funcionalidades, inclusive permissões.",
    },
    {
        id: "editor",
        name: "Editor",
        defaultDescription: "Na configuração padrão, cadastra e edita empresas, sem excluir nem gerenciar usuários.",
    },
    {
        id: "viewer",
        name: "Visualizador",
        defaultDescription: "Na configuração padrão, apenas consulta empresas e usuários.",
    },
];

export const ROLE_NAMES = Object.fromEntries(ROLES.map((role) => [role.id, role.name])) as Record<RoleId, string>;

export const PERMISSIONS: { id: PermissionId; label: string }[] = [
    { id: "companies.view", label: "Visualizar empresas" },
    { id: "companies.create", label: "Cadastrar empresas" },
    { id: "companies.edit", label: "Editar empresas" },
    { id: "companies.delete", label: "Excluir empresas" },
    { id: "users.view", label: "Visualizar usuários" },
    { id: "users.manage", label: "Gerenciar usuários" },
    { id: "permissions.manage", label: "Alterar permissões" },
];

export const NEVER_ACCESSED_LABEL = "Nunca acessou";

export function lastAccessLabel(lastAccess: string | null): string {
    return lastAccess ? formatDateTime(lastAccess) : NEVER_ACCESSED_LABEL;
}
