import { useState, type ReactNode } from "react";
import { Icon } from "../Icon/Icon";
import { Modal } from "../Modal/Modal";

interface ConfirmDialogProps {
    title: string;
    children: ReactNode;
    confirmLabel: string;
    onCancel: () => void;
    /** Pode ser assíncrona; o botão de confirmação fica desativado até ela terminar. */
    onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({ title, children, confirmLabel, onCancel, onConfirm }: ConfirmDialogProps) {
    const [pending, setPending] = useState(false);

    const handleConfirm = async () => {
        setPending(true);
        try {
            await onConfirm();
        } finally {
            setPending(false);
        }
    };

    return (
        <Modal
            title={title}
            description={children}
            onClose={onCancel}
            size="sm"
            role="alertdialog"
            footer={
                <>
                    <button type="button" className="button button--secondary" onClick={onCancel} data-autofocus>
                        Cancelar
                    </button>
                    <button type="button" className="button button--danger" onClick={handleConfirm} disabled={pending}>
                        <Icon name="trash" size={16} />
                        {confirmLabel}
                    </button>
                </>
            }
        />
    );
}
