import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { expect } from "vitest";
import { AppRoutes } from "../app/routes";
import { ToastProvider } from "../shared/components/Toast/ToastProvider";
import { DataProvider } from "../shared/data/DataProvider";
import { LOADING_MESSAGE } from "../shared/data/DataGate";
import type { DataApi } from "../shared/services/dataApi";
import { createFakeApi } from "./fakeApi";

/** Renderiza o app com a API em memória e aguarda o carregamento inicial dos dados. */
export async function renderApp(path = "/", api: DataApi = createFakeApi()) {
    const user = userEvent.setup();
    const result = render(
        <MemoryRouter initialEntries={[path]}>
            <DataProvider api={api}>
                <ToastProvider>
                    <AppRoutes />
                </ToastProvider>
            </DataProvider>
        </MemoryRouter>,
    );
    await waitForDataLoaded();
    return { user, api, ...result };
}

export async function waitForDataLoaded() {
    await waitFor(() => expect(screen.queryByText(LOADING_MESSAGE)).not.toBeInTheDocument());
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
