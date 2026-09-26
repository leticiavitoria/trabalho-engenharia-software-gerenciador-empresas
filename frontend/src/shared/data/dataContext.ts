import { createContext } from "react";
import type { LoadStatus } from "./dataReducer";
import type { Company, CompanyInput, PermissionId, PermissionMatrix, RoleId, User, UserInput } from "./types";

export interface DataContextValue {
    status: LoadStatus;
    error: string | null;
    reload: () => void;
    companies: Company[];
    users: User[];
    permissions: PermissionMatrix;
    createCompany: (input: CompanyInput) => Promise<Company>;
    updateCompany: (id: string, input: CompanyInput) => Promise<Company>;
    deleteCompany: (id: string) => Promise<void>;
    createUser: (input: UserInput) => Promise<User>;
    updateUser: (id: string, input: UserInput) => Promise<User>;
    deleteUser: (id: string) => Promise<void>;
    setPermission: (permissionId: PermissionId, roleId: RoleId, enabled: boolean) => Promise<void>;
}

export const DataContext = createContext<DataContextValue | null>(null);
