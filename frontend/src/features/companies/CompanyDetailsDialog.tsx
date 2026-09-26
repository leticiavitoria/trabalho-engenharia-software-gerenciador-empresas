import { Icon } from "../../shared/components/Icon/Icon";
import { Modal } from "../../shared/components/Modal/Modal";
import { StatusBadge } from "../../shared/components/StatusBadge/StatusBadge";
import type { Company } from "../../shared/data/types";
import { formatDate, pluralize } from "../../shared/utils/format";

interface CompanyDetailsDialogProps {
    company: Company;
    userCount: number;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export function CompanyDetailsDialog({ company, userCount, onClose, onEdit, onDelete }: CompanyDetailsDialogProps) {
    return (
        <Modal
            title={company.name}
            description="Dados cadastrais da empresa."
            onClose={onClose}
            footer={
                <>
                    <button type="button" className="button button--danger-outline" onClick={onDelete}>
                        <Icon name="trash" size={16} />
                        Excluir empresa
                    </button>
                    <button type="button" className="button button--primary" onClick={onEdit}>
                        <Icon name="edit" size={16} />
                        Editar dados
                    </button>
                </>
            }
        >
            <dl className="details">
                <div className="details__item">
                    <dt>CNPJ fictício</dt>
                    <dd className="mono">{company.cnpj}</dd>
                </div>
                <div className="details__item">
                    <dt>Situação</dt>
                    <dd>
                        <StatusBadge kind="company" status={company.status} />
                    </dd>
                </div>
                <div className="details__item">
                    <dt>Segmento</dt>
                    <dd>{company.sector}</dd>
                </div>
                <div className="details__item">
                    <dt>Cidade / UF</dt>
                    <dd>{company.city}</dd>
                </div>
                <div className="details__item">
                    <dt>Data de cadastro</dt>
                    <dd>{formatDate(company.createdAt)}</dd>
                </div>
                <div className="details__item">
                    <dt>Usuários vinculados</dt>
                    <dd>{pluralize(userCount, "usuário", "usuários")}</dd>
                </div>
                <div className="details__item">
                    <dt>E-mail de contato</dt>
                    <dd className="break">{company.email}</dd>
                </div>
                <div className="details__item">
                    <dt>Telefone</dt>
                    <dd>{company.phone || "Não informado"}</dd>
                </div>
            </dl>
        </Modal>
    );
}
