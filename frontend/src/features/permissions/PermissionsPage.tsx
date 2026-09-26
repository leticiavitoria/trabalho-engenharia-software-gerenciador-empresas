import { Icon } from "../../shared/components/Icon/Icon";
import { PageHeader } from "../../shared/components/PageHeader/PageHeader";
import { useToast } from "../../shared/components/Toast/useToast";
import { PERMISSIONS, ROLES } from "../../shared/data/labels";
import type { PermissionId, RoleId } from "../../shared/data/types";
import { useAppData } from "../../shared/data/useAppData";
import { toApiError } from "../../shared/services/apiError";

export function PermissionsPage() {
    const { permissions, setPermission } = useAppData();
    const { showToast } = useToast();

    const enabledCount = (roleId: RoleId) => PERMISSIONS.filter(({ id }) => permissions[id][roleId]).length;

    const handleToggle = async (
        permissionId: PermissionId,
        permissionLabel: string,
        roleId: RoleId,
        roleName: string,
    ) => {
        const willEnable = !permissions[permissionId][roleId];
        try {
            await setPermission(permissionId, roleId, willEnable);
            showToast(
                `${roleName}: “${permissionLabel}” ${willEnable ? "ativada" : "desativada"}. A configuração foi salva, mas ainda não controla o acesso.`,
            );
        } catch (error) {
            showToast(`Não foi possível alterar “${permissionLabel}”. ${toApiError(error).message}`, "error");
        }
    };

    return (
        <>
            <PageHeader
                title="Permissões"
                description="Defina quais ações cada perfil de acesso pode realizar."
            />

            <div className="notice notice--info" role="note">
                <Icon name="info" />
                <p>
                    As alterações nesta matriz são salvas no servidor, mas ainda não são aplicadas aos usuários: o
                    sistema não possui autenticação, então nenhuma tela ou ação é bloqueada pelos perfis.
                </p>
            </div>

            <ul className="roles" aria-label="Perfis de acesso">
                {ROLES.map((role) => {
                    const count = enabledCount(role.id);
                    return (
                        <li key={role.id} className="card role-card">
                            <h2 className="card__title">{role.name}</h2>
                            <p className="role-card__description">{role.defaultDescription}</p>
                            <p className="role-card__count">
                                {count} de {PERMISSIONS.length} funcionalidades ativas
                            </p>
                        </li>
                    );
                })}
            </ul>

            <section className="card" aria-labelledby="matrix-title">
                <header className="card__header">
                    <div>
                        <h2 id="matrix-title" className="card__title">
                            Matriz de permissões
                        </h2>
                        <p className="card__subtitle">Selecione uma célula para ativar ou desativar a funcionalidade.</p>
                    </div>
                </header>
                <div className="table-scroll">
                    <table className="table matrix">
                        <thead>
                            <tr>
                                <th scope="col">Funcionalidade</th>
                                {ROLES.map((role) => (
                                    <th key={role.id} scope="col" className="matrix__role">
                                        {role.name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {PERMISSIONS.map((permission) => (
                                <tr key={permission.id}>
                                    <th scope="row" className="table__primary">
                                        {permission.label}
                                    </th>
                                    {ROLES.map((role) => {
                                        const enabled = permissions[permission.id][role.id];
                                        return (
                                            <td key={role.id} className="matrix__cell">
                                                <button
                                                    type="button"
                                                    className={`toggle${enabled ? " toggle--on" : ""}`}
                                                    aria-pressed={enabled}
                                                    aria-label={`${enabled ? "Desativar" : "Ativar"} ${permission.label} para ${role.name}`}
                                                    onClick={() =>
                                                        void handleToggle(
                                                            permission.id,
                                                            permission.label,
                                                            role.id,
                                                            role.name,
                                                        )
                                                    }
                                                >
                                                    <Icon name={enabled ? "check" : "minus"} size={16} />
                                                    <span aria-hidden="true">{enabled ? "Permitido" : "Sem acesso"}</span>
                                                </button>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </>
    );
}
