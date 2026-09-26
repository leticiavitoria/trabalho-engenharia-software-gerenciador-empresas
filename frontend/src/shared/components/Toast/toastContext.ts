import { createContext } from "react";

export type ToastVariant = "success" | "error";

export interface ToastValue {
    showToast: (message: string, variant?: ToastVariant) => void;
}

export const ToastContext = createContext<ToastValue | null>(null);
