import type { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "../shared/components/Toast/ToastProvider";
import { DataProvider } from "../shared/data/DataProvider";

interface AppProvidersProps {
    children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
    // Os dados ficam acima das rotas: são carregados uma vez e sobrevivem à navegação.
    return (
        <BrowserRouter>
            <DataProvider>
                <ToastProvider>{children}</ToastProvider>
            </DataProvider>
        </BrowserRouter>
    );
}
