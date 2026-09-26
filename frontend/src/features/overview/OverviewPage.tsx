import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Icon, type IconName } from "../../shared/components/Icon/Icon";
import { PageHeader } from "../../shared/components/PageHeader/PageHeader";
import { StatusBadge } from "../../shared/components/StatusBadge/StatusBadge";
import { useAppData } from "../../shared/data/useAppData";
import { useCompanyDialogs } from "../companies/useCompanyDialogs";
import { computeOverviewMetrics, selectRecentCompanies } from "./overviewMetrics";

const SAMPLE_ACTIVITIES = [
    {
        title: "Empresa cadastrada",
        description: "Ponto Saúde foi adicionada ao painel.",
        time: "Exemplo · há 2 horas",
    },
    {
        title: "Perfil alterado",
        description: "Rafael Lima passou a ter o perfil Editor.",
        time: "Exemplo · ontem",
    },
    {
        title: "Cadastro aguardando aprovação",
        description: "Norte Logística enviou os dados cadastrais.",
        time: "Exemplo · há 3 dias",
    },
    {
        title: "Usuário convidado",
        description: "Beatriz Souza recebeu acesso de Visualizador.",
        time: "Exemplo · há 5 dias",
    },
];

export function OverviewPage() {
    const { companies, users } = useAppData();
    const { openDetails, dialogs } = useCompanyDialogs();

    const metrics = useMemo(() => computeOverviewMetrics(companies, users), [companies, users]);
    const recentCompanies = useMemo(() => selectRecentCompanies(companies), [companies]);

    const cards: { label: string; value: number; icon: IconName; hint: string }[] = [
        { label: "Total de empresas", value: metrics.totalCompanies, icon: "companies", hint: "Todas as situações" },
        { label: "Empresas ativas", value: metrics.activeCompanies, icon: "check", hint: "Situação ativa" },
        { label: "Usuários cadastrados", value: metrics.totalUsers, icon: "users", hint: "Em todas as empresas" },
        {
            label: "Aguardando aprovação",
            value: metrics.pendingRecords,
            icon: "info",
            hint: "Empresas e usuários pendentes",
        },
    ];

    return (
        <>
            <PageHeader
                title="Visão geral"
                description="Resumo das empresas e usuários cadastrados, calculado a partir dos dados salvos no servidor."
            />

            <ul className="metrics" aria-label="Indicadores">
                {cards.map((card) => (
                    <li key={card.label} className="card metric">
                        <div className="metric__icon">
                            <Icon name={card.icon} size={20} />
                        </div>
                        <div>
                            <p className="metric__label">{card.label}</p>
                            <p className="metric__value">{card.value}</p>
                            <p className="metric__hint">{card.hint}</p>
                        </div>
                    </li>
                ))}
            </ul>

            <div className="overview-grid">
                <section className="card" aria-labelledby="recent-companies-title">
                    <header className="card__header">
                        <div>
                            <h2 id="recent-companies-title" className="card__title">
                                Empresas recentes
                            </h2>
                            <p className="card__subtitle">Últimos cadastros realizados.</p>
                        </div>
                        <Link to="/empresas" className="button button--ghost button--small">
                            Ver todas
                            <Icon name="arrowRight" size={16} />
                        </Link>
                    </header>

                    {recentCompanies.length === 0 ? (
                        <p className="empty-state">
                            Nenhuma empresa cadastrada até o momento. Acesse “Ver todas” para cadastrar a primeira.
                        </p>
                    ) : (
                        <div className="table-scroll">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th scope="col">Empresa</th>
                                        <th scope="col">CNPJ fictício</th>
                                        <th scope="col">Segmento</th>
                                        <th scope="col">Situação</th>
                                        <th scope="col">
                                            <span className="visually-hidden">Ações</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentCompanies.map((company) => (
                                        <tr key={company.id}>
                                            <th scope="row" className="table__primary">
                                                {company.name}
                                            </th>
                                            <td className="mono">{company.cnpj}</td>
                                            <td>{company.sector}</td>
                                            <td>
                                                <StatusBadge kind="company" status={company.status} />
                                            </td>
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
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <section className="card" aria-labelledby="activity-title">
                    <header className="card__header">
                        <div>
                            <h2 id="activity-title" className="card__title">
                                Movimentações de exemplo
                            </h2>
                            <p className="card__subtitle">
                                Itens ilustrativos; não são um histórico real nem registram as ações realizadas.
                            </p>
                        </div>
                    </header>
                    <ul className="activity">
                        {SAMPLE_ACTIVITIES.map((activity) => (
                            <li key={activity.title} className="activity__item">
                                <span className="activity__dot" aria-hidden="true" />
                                <div>
                                    <p className="activity__title">{activity.title}</p>
                                    <p className="activity__description">{activity.description}</p>
                                    <p className="activity__time">{activity.time}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>

            {dialogs}
        </>
    );
}
