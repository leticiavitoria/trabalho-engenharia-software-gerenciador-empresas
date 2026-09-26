import { useCallback, useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { findNavItem } from "../../app/navigation";
import { DataGate } from "../data/DataGate";
import { Header } from "../components/Header/Header";
import { Sidebar } from "../components/Sidebar/Sidebar";

const SIDEBAR_ID = "app-sidebar";
const DESKTOP_QUERY = "(min-width: 960px)";
const APP_NAME = "Acme Gestão";

export function SystemTemplate() {
    const { pathname } = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const mainRef = useRef<HTMLElement>(null);
    const previousPath = useRef<string | null>(null);
    const sectionLabel = findNavItem(pathname)?.label ?? "Página não encontrada";

    const closeMenu = useCallback((returnFocus: boolean) => {
        setMenuOpen(false);
        if (returnFocus) menuButtonRef.current?.focus();
    }, []);

    // Após trocar de rota, move o foco para o título da nova página (NAV-004).
    useEffect(() => {
        if (previousPath.current !== null && previousPath.current !== pathname) {
            const heading = mainRef.current?.querySelector<HTMLElement>("h1");
            (heading ?? mainRef.current)?.focus();
        }
        previousPath.current = pathname;
        document.title = `${sectionLabel} · ${APP_NAME}`;
    }, [pathname, sectionLabel]);

    useEffect(() => {
        if (!menuOpen) return;

        document.querySelector<HTMLElement>(`#${SIDEBAR_ID} .sidebar__link`)?.focus();

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") closeMenu(true);
        };
        const desktop = window.matchMedia(DESKTOP_QUERY);
        const handleViewportChange = () => {
            if (desktop.matches) closeMenu(false);
        };

        document.addEventListener("keydown", handleKeyDown);
        desktop.addEventListener("change", handleViewportChange);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            desktop.removeEventListener("change", handleViewportChange);
        };
    }, [menuOpen, closeMenu]);

    return (
        <div className="shell">
            <Sidebar id={SIDEBAR_ID} open={menuOpen} onNavigate={() => closeMenu(false)} />

            {menuOpen && <div className="shell__overlay" aria-hidden="true" onClick={() => closeMenu(true)} />}

            <div className="shell__content" inert={menuOpen}>
                <Header
                    ref={menuButtonRef}
                    sectionLabel={sectionLabel}
                    menuOpen={menuOpen}
                    menuId={SIDEBAR_ID}
                    onToggleMenu={() => (menuOpen ? closeMenu(true) : setMenuOpen(true))}
                />
                <main ref={mainRef} className="shell__main" tabIndex={-1}>
                    <DataGate>
                        <Outlet />
                    </DataGate>
                </main>
            </div>
        </div>
    );
}
