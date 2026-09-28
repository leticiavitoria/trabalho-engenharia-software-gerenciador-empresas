import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AppRoutes } from "../app/routes";
import { AuthProvider } from "../shared/auth/AuthProvider";
import { ToastProvider } from "../shared/components/Toast/ToastProvider";
import { DemoDataProvider } from "../shared/demo/DemoDataProvider";
import { httpClient } from "../shared/services/httpClient";
import { TEST_AUTH_USER, fakeBackendAdapter, resetFakeBackend } from "./fakeBackend";

const AUTH_STORAGE_KEY = "gerenciador-empresas:auth";

/**
 * Renderiza o app como um usuário já logado, com a API respondida pelo
 * backend em memória (`fakeBackend.ts`), e espera os dados carregarem.
 */
export async function renderApp(path = "/") {
    resetFakeBackend();
    httpClient.defaults.adapter = fakeBackendAdapter;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: "token-de-teste", user: TEST_AUTH_USER }));

    const user = userEvent.setup();
    const result = render(
        <MemoryRouter initialEntries={[path]}>
            <AuthProvider>
                <DemoDataProvider>
                    <ToastProvider>
                        <AppRoutes />
                    </ToastProvider>
                </DemoDataProvider>
            </AuthProvider>
        </MemoryRouter>,
    );
    // As telas só aparecem depois que os dados da API chegam.
    await screen.findByRole("heading", { level: 1 });
    return { user, ...result };
}

/** Linhas do corpo da primeira tabela dentro de `container` (ou da página). */
export function bodyRows(container: HTMLElement = document.body) {
    const table = within(container).getAllByRole("table")[0];
    return within(table).getAllByRole("row").slice(1);
}

export function mainNav() {
    return screen.getByRole("navigation", { name: "Menu principal" });
}

export async function goTo(user: ReturnType<typeof userEvent.setup>, label: string) {
    await user.click(within(mainNav()).getByRole("link", { name: label }));
}
