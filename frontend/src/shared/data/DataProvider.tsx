import { useCallback, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { toApiError } from "../services/apiError";
import { httpDataApi, type DataApi } from "../services/dataApi";
import { DataContext, type DataContextValue } from "./dataContext";
import { createInitialDataState, dataReducer, type DataAction } from "./dataReducer";
import type { CompanyInput, PermissionId, RoleId, UserInput } from "./types";

interface DataProviderProps {
    children: ReactNode;
    /** Permite trocar o backend real por uma implementação em memória nos testes. */
    api?: DataApi;
}

/**
 * Estado compartilhado por todas as telas. Carrega empresas, usuários e
 * permissões do backend e mantém a cópia local sincronizada após cada
 * operação confirmada pela API.
 */
export function DataProvider({ children, api = httpDataApi }: DataProviderProps) {
    const [state, dispatch] = useReducer(dataReducer, undefined, createInitialDataState);

    const fetchAll = useCallback(async (): Promise<DataAction> => {
        try {
            const [companies, users, permissions] = await Promise.all([
                api.listCompanies(),
                api.listUsers(),
                api.getPermissions(),
            ]);
            return { type: "load/success", companies, users, permissions };
        } catch (error) {
            return { type: "load/failure", error: toApiError(error).message };
        }
    }, [api]);

    useEffect(() => {
        let active = true;
        void fetchAll().then((action) => {
            if (active) dispatch(action);
        });
        return () => {
            active = false;
        };
    }, [fetchAll]);

    const reload = useCallback(() => {
        dispatch({ type: "load/start" });
        void fetchAll().then(dispatch);
    }, [fetchAll]);

    const createCompany = useCallback(
        async (input: CompanyInput) => {
            const company = await api.createCompany(input);
            dispatch({ type: "company/create", company });
            return company;
        },
        [api],
    );

    const updateCompany = useCallback(
        async (id: string, input: CompanyInput) => {
            const company = await api.updateCompany(id, input);
            dispatch({ type: "company/update", company });
            return company;
        },
        [api],
    );

    const deleteCompany = useCallback(
        async (id: string) => {
            await api.deleteCompany(id);
            dispatch({ type: "company/delete", id });
        },
        [api],
    );

    const createUser = useCallback(
        async (input: UserInput) => {
            const user = await api.createUser(input);
            dispatch({ type: "user/create", user });
            return user;
        },
        [api],
    );

    const updateUser = useCallback(
        async (id: string, input: UserInput) => {
            const user = await api.updateUser(id, input);
            dispatch({ type: "user/update", user });
            return user;
        },
        [api],
    );

    const deleteUser = useCallback(
        async (id: string) => {
            await api.deleteUser(id);
            dispatch({ type: "user/delete", id });
        },
        [api],
    );

    // Atualização otimista: a célula muda na hora e volta ao valor anterior se a API falhar.
    const setPermission = useCallback(
        async (permissionId: PermissionId, roleId: RoleId, enabled: boolean) => {
            dispatch({ type: "permission/set", permissionId, roleId, enabled });
            try {
                await api.setPermission(permissionId, roleId, enabled);
            } catch (error) {
                dispatch({ type: "permission/set", permissionId, roleId, enabled: !enabled });
                throw error;
            }
        },
        [api],
    );

    const value = useMemo<DataContextValue>(
        () => ({
            ...state,
            reload,
            createCompany,
            updateCompany,
            deleteCompany,
            createUser,
            updateUser,
            deleteUser,
            setPermission,
        }),
        [state, reload, createCompany, updateCompany, deleteCompany, createUser, updateUser, deleteUser, setPermission],
    );

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
