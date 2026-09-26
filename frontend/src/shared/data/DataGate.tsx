import type { ReactNode } from "react";
import { useAppData } from "./useAppData";

export const LOADING_MESSAGE = "Carregando dados…";

/** Só exibe as telas depois que os dados do backend foram carregados. */
export function DataGate({ children }: { children: ReactNode }) {
    const { status, error, reload } = useAppData();

    if (status === "loading") {
        return (
            <p className="empty-state" aria-live="polite" aria-busy="true">
                {LOADING_MESSAGE}
            </p>
        );
    }

    if (status === "error") {
        return (
            <section className="card load-error" aria-labelledby="load-error-title">
                <h1 id="load-error-title" className="load-error__title" tabIndex={-1}>
                    Não foi possível carregar os dados
                </h1>
                <p className="load-error__message">{error}</p>
                <button type="button" className="button button--primary" onClick={reload}>
                    Tentar novamente
                </button>
            </section>
        );
    }

    return children;
}
