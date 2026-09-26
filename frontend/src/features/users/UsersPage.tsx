import { useMemo, useState } from "react";
import { Icon } from "../../shared/components/Icon/Icon";
import { ListToolbar } from "../../shared/components/ListToolbar/ListToolbar";
import { PageHeader } from "../../shared/components/PageHeader/PageHeader";
import { Pagination } from "../../shared/components/Pagination/Pagination";
import { StatusBadge } from "../../shared/components/StatusBadge/StatusBadge";
import { isStatusFilter, matchesStatus, type StatusFilter } from "../../shared/data/filters";
import { lastAccessLabel, ROLE_NAMES } from "../../shared/data/labels";
import { useAppData } from "../../shared/data/useAppData";
import { usePagination } from "../../shared/hooks/usePagination";
import { matchesSearch, pluralize } from "../../shared/utils/format";
import { useUserDialogs } from "./useUserDialogs";

const STATUS_FILTER_OPTIONS = [
    { value: "all", label: "Todas as situações" },
    { value: "active", label: "Ativos" },
    { value: "pending", label: "Pendentes" },
    { value: "inactive", label: "Inativos" },
];

export function UsersPage() {
    const { companies, users } = useAppData();
    const { openDetails, openCreate, dialogs } = useUserDialogs();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

    const rows = useMemo(() => {
        const companyNames = new Map(companies.map((company) => [company.id, company.name]));
        return users.map((user) => ({
            user,
            companyName: companyNames.get(user.companyId) ?? "—",
            roleName: ROLE_NAMES[user.role],
        }));
    }, [companies, users]);

    const filtered = useMemo(
        () =>
            rows.filter(
                ({ user, companyName, roleName }) =>
                    matchesStatus(statusFilter, user.status) &&
                    matchesSearch(search, [user.name, user.email, companyName, roleName]),
            ),
        [rows, search, statusFilter],
    );
    const pagination = usePagination(filtered);

    return (
        <>
            <PageHeader
                title="Usuários"
                description={`${pluralize(users.length, "usuário cadastrado", "usuários cadastrados")}. Os perfis são apenas exibidos e ainda não controlam o acesso.`}
                actions={
                    <button type="button" className="button button--primary" onClick={openCreate}>
                        <Icon name="plus" size={16} />
                        Novo usuário
                    </button>
                }
            />

            <section className="card" aria-label="Lista de usuários">
                <ListToolbar
                    searchLabel="Buscar usuários"
                    searchPlaceholder="Nome, e-mail, empresa ou perfil"
                    search={search}
                    onSearchChange={(value) => {
                        setSearch(value);
                        pagination.setPage(1);
                    }}
                    statusLabel="Situação"
                    status={statusFilter}
                    onStatusChange={(value) => {
                        if (isStatusFilter(value)) setStatusFilter(value);
                        pagination.setPage(1);
                    }}
                    statusOptions={STATUS_FILTER_OPTIONS}
                />

                <div className="table-scroll">
                    <table className="table">
                        <thead>
                            <tr>
                                <th scope="col">Nome</th>
                                <th scope="col">E-mail</th>
                                <th scope="col">Empresa</th>
                                <th scope="col">Perfil</th>
                                <th scope="col">Situação</th>
                                <th scope="col">Último acesso</th>
                                <th scope="col">
                                    <span className="visually-hidden">Ações</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {pagination.pageItems.map(({ user, companyName, roleName }) => (
                                <tr key={user.id}>
                                    <th scope="row" className="table__primary">
                                        {user.name}
                                    </th>
                                    <td>{user.email}</td>
                                    <td>{companyName}</td>
                                    <td>{roleName}</td>
                                    <td>
                                        <StatusBadge kind="user" status={user.status} />
                                    </td>
                                    <td className="muted">{lastAccessLabel(user.lastAccess)}</td>
                                    <td className="table__actions">
                                        <button
                                            type="button"
                                            className="button button--ghost button--small"
                                            aria-label={`Ver detalhes de ${user.name}`}
                                            onClick={() => openDetails(user.id)}
                                        >
                                            <Icon name="eye" size={16} />
                                            Detalhes
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="table__empty">
                                        {users.length === 0
                                            ? "Nenhum usuário cadastrado. Use “Novo usuário” para começar."
                                            : "Nenhum usuário encontrado com a busca e a situação selecionadas."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    label="Paginação de usuários"
                    page={pagination.page}
                    totalPages={pagination.totalPages}
                    rangeStart={pagination.rangeStart}
                    rangeEnd={pagination.rangeEnd}
                    total={pagination.total}
                    onPageChange={pagination.setPage}
                />
            </section>

            {dialogs}
        </>
    );
}
