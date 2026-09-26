import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Icon } from "../Icon/Icon";
import { ToastContext, type ToastVariant } from "./toastContext";

const TOAST_DURATION_MS = 5000;

interface Toast {
    id: number;
    message: string;
    variant: ToastVariant;
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toast, setToast] = useState<Toast | null>(null);
    const nextId = useRef(1);

    const showToast = useCallback((message: string, variant: ToastVariant = "success") => {
        setToast({ id: nextId.current++, message, variant });
    }, []);

    useEffect(() => {
        if (!toast) return;
        const timeout = window.setTimeout(() => setToast(null), TOAST_DURATION_MS);
        return () => window.clearTimeout(timeout);
    }, [toast]);

    const value = useMemo(() => ({ showToast }), [showToast]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="toast-region" role="status" aria-live="polite">
                {toast && (
                    <div className={`toast toast--${toast.variant}`} key={toast.id}>
                        <Icon name={toast.variant === "error" ? "info" : "check"} />
                        <p>{toast.message}</p>
                        <button
                            type="button"
                            className="icon-button icon-button--small"
                            aria-label="Fechar aviso"
                            onClick={() => setToast(null)}
                        >
                            <Icon name="close" size={16} />
                        </button>
                    </div>
                )}
            </div>
        </ToastContext.Provider>
    );
}
