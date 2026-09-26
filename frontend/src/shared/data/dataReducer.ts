import { PERMISSIONS, ROLES } from "./labels";
import type { Company, PermissionId, PermissionMatrix, RoleId, User } from "./types";

export type LoadStatus = "loading" | "ready" | "error";

export interface DataState {
    status: LoadStatus;
    /** Mensagem da última falha de carregamento. */
    error: string | null;
    companies: Company[];
    users: User[];
    permissions: PermissionMatrix;
}

export type DataAction =
    | { type: "load/start" }
    | { type: "load/success"; companies: Company[]; users: User[]; permissions: PermissionMatrix }
    | { type: "load/failure"; error: string }
    | { type: "company/create"; company: Company }
    | { type: "company/update"; company: Company }
    | { type: "company/delete"; id: string }
    | { type: "user/create"; user: User }
    | { type: "user/update"; user: User }
    | { type: "user/delete"; id: string }
    | { type: "permission/set"; permissionId: PermissionId; roleId: RoleId; enabled: boolean };

function emptyPermissionMatrix(): PermissionMatrix {
    const row = Object.fromEntries(ROLES.map((role) => [role.id, false])) as Record<RoleId, boolean>;
    return Object.fromEntries(PERMISSIONS.map((permission) => [permission.id, { ...row }])) as PermissionMatrix;
}

export function createInitialDataState(): DataState {
    return { status: "loading", error: null, companies: [], users: [], permissions: emptyPermissionMatrix() };
}

export function dataReducer(state: DataState, action: DataAction): DataState {
    switch (action.type) {
        case "load/start":
            return { ...state, status: "loading", error: null };
        case "load/success":
            return {
                status: "ready",
                error: null,
                companies: action.companies,
                users: action.users,
                permissions: action.permissions,
            };
        case "load/failure":
            return { ...state, status: "error", error: action.error };
        case "company/create":
            return { ...state, companies: [...state.companies, action.company] };
        case "company/update":
            return {
                ...state,
                companies: state.companies.map((company) =>
                    company.id === action.company.id ? action.company : company,
                ),
            };
        case "company/delete":
            // Espelha o ON DELETE CASCADE do banco: os usuários da empresa também saem (COM-006).
            return {
                ...state,
                companies: state.companies.filter((company) => company.id !== action.id),
                users: state.users.filter((user) => user.companyId !== action.id),
            };
        case "user/create":
            return { ...state, users: [...state.users, action.user] };
        case "user/update":
            return {
                ...state,
                users: state.users.map((user) => (user.id === action.user.id ? action.user : user)),
            };
        case "user/delete":
            return { ...state, users: state.users.filter((user) => user.id !== action.id) };
        case "permission/set": {
            const row = state.permissions[action.permissionId];
            return {
                ...state,
                permissions: {
                    ...state.permissions,
                    [action.permissionId]: { ...row, [action.roleId]: action.enabled },
                },
            };
        }
    }
}
