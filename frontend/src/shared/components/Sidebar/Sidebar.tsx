import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "../../../app/navigation";
import { Icon } from "../Icon/Icon";

interface SidebarProps {
    id: string;
    open: boolean;
    onNavigate: () => void;
}

export function Sidebar({ id, open, onNavigate }: SidebarProps) {
    return (
        <aside id={id} className={`sidebar${open ? " sidebar--open" : ""}`}>
            <div className="sidebar__brand">
                <span className="sidebar__logo" aria-hidden="true">
                    GE
                </span>
                <span className="sidebar__product">Gerenciador de Empresas</span>
            </div>

            <div className="sidebar__workspace">
                <span className="sidebar__caption">Espaço de trabalho</span>
                <span className="sidebar__workspace-name">Acme Gestão</span>
            </div>

            <nav aria-label="Menu principal" className="sidebar__nav">
                <ul>
                    {NAV_ITEMS.map((item) => (
                        <li key={item.path}>
                            {/* NavLink aplica aria-current="page" ao item da rota atual. */}
                            <NavLink to={item.path} end className="sidebar__link" onClick={onNavigate}>
                                <Icon name={item.icon} />
                                {item.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="sidebar__notice">
                <Icon name="info" size={16} />
                <p>
                    <strong>Ambiente de demonstração.</strong> Todos os dados são fictícios; as alterações são
                    salvas no banco de dados do servidor.
                </p>
            </div>

            <div className="sidebar__profile">
                <span className="sidebar__avatar" aria-hidden="true">
                    JS
                </span>
                <div>
                    <p className="sidebar__profile-name">João Sampaio</p>
                    <p className="sidebar__profile-role">Perfil fictício</p>
                </div>
            </div>
        </aside>
    );
}
