import { Icon } from "../../shared/components/Icon/Icon";
import { Modal } from "../../shared/components/Modal/Modal";
import { StatusBadge } from "../../shared/components/StatusBadge/StatusBadge";
import { lastAccessLabel, ROLE_NAMES } from "../../shared/data/labels";
import type { User } from "../../shared/data/types";

interface UserDetailsDialogProps {
    user: User;
    companyName: string;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export function UserDetailsDialog({ user, companyName, onClose, onEdit, onDelete }: UserDetailsDialogProps) {
    return (
        <Modal
            title={user.name}
            description="Dados cadastrais do usuário."
            onClose={onClose}
            footer={
                <>
                    <button type="button" className="button button--danger-outline" onClick={onDelete}>
                        <Icon name="trash" size={16} />
                        Excluir usuário
                    </button>
                    <button type="button" className="button button--primary" onClick={onEdit}>
                        <Icon name="edit" size={16} />
                        Editar usuário
                    </button>
                </>
            }
        >
            <dl className="details">
                <div className="details__item details__item--full">
                    <dt>E-mail</dt>
                    <dd className="break">{user.email}</dd>
                </div>
                <div className="details__item">
                    <dt>Situação</dt>
                    <dd>
                        <StatusBadge kind="user" status={user.status} />
                    </dd>
                </div>
                <div className="details__item">
                    <dt>Empresa</dt>
                    <dd>{companyName}</dd>
                </div>
                <div className="details__item">
                    <dt>Perfil de acesso</dt>
                    <dd>{ROLE_NAMES[user.role]}</dd>
                </div>
                <div className="details__item">
                    <dt>Último acesso</dt>
                    <dd>{lastAccessLabel(user.lastAccess)}</dd>
                </div>
            </dl>
        </Modal>
    );
}
