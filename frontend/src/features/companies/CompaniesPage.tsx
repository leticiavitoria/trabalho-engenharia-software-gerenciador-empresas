import { useMemo, useState } from "react";
import { Icon } from "../../shared/components/Icon/Icon";
import { ListToolbar } from "../../shared/components/ListToolbar/ListToolbar";
import { PageHeader } from "../../shared/components/PageHeader/PageHeader";
import { Pagination } from "../../shared/components/Pagination/Pagination";
import { StatusBadge } from "../../shared/components/StatusBadge/StatusBadge";
import { isStatusFilter, matchesStatus, type StatusFilter } from "../../shared/data/filters";
import { countUsersByCompany } from "../../shared/data/selectors";
import { useAppData } from "../../shared/data/useAppData";
import { usePagination } from "../../shared/hooks/usePagination";
import { matchesSearch, pluralize } from "../../shared/utils/format";
import { useCompanyDialogs } from "./useCompanyDialogs";

const STATUS_FILTER_OPTIONS = [
    { value: "all", label: "Todas as situações" },
    { value: "active", label: "Ativas" },
    { value: "pending", label: "Pendentes" },
    { value: "inactive", label: "Inativas" },
];

export function CompaniesPage() {
    const { companies, users } = useAppData();
    const { openDetails, openCreate, dialogs } = useCompanyDialogs();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

    const userCounts = useMemo(() => countUsersByCompany(users), [users]);
    const filtered = useMemo(
        () =>
            companies.filter(
                (company) =>
                    matchesStatus(statusFilter, company.status) &&
                    matchesSearch(search, [company.name, company.cnpj, company.sector, company.city]),
            ),
        [companies, search, statusFilter],
    );
    const pagination = usePagination(filtered);

    return (
        <>
            <PageHeader
                title="Empresas"
                description={`${pluralize(companies.length, "empresa cadastrada", "empresas cadastradas")}.`}
                actions={
                    <button type="button" className="button button--primary" onClick={openCreate}>
                        <Icon name="plus" size={16} />
                        Nova empresa
                    </button>
                }
            />

            <section className="card" aria-label="Lista de empresas">
                <ListToolbar
                    searchLabel="Buscar empresas"
                    searchPlaceholder="Nome, CNPJ, segmento ou cidade"
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
                                <th scope="col">Empresa</th>
                                <th scope="col">CNPJ fictício</th>
                                <th scope="col">Segmento</th>
                                <th scope="col">Cidade / UF</th>
                                <th scope="col">Situação</th>
                                <th scope="col" className="numeric">
                                    Usuários
                                </th>
                                <th scope="col">
                                    <span className="visually-hidden">Ações</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {pagination.pageItems.map((company) => (
                                <tr key={company.id}>
                                    <th scope="row" className="table__primary">
                                        {company.name}
                                    </th>
                                    <td className="mono">{company.cnpj}</td>
                                    <td>{company.sector}</td>
                                    <td>{company.city}</td>
                                    <td>
                                        <StatusBadge kind="company" status={company.status} />
                                    </td>
                                    <td className="numeric">{userCounts.get(company.id) ?? 0}</td>
                                    <td className="table__actions">
                                        <button
                                            type="button"
                                            className="button button--ghost button--small"
                                            aria-label={`Ver detalhes de ${company.name}`}
                                            onClick={() => openDetails(company.id)}
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
                                        {companies.length === 0
                                            ? "Nenhuma empresa cadastrada. Use “Nova empresa” para começar."
                                            : "Nenhuma empresa encontrada com a busca e a situação selecionadas."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    label="Paginação de empresas"
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
