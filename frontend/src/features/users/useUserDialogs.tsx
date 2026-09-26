import { useRef, useState } from "react";
import { ConfirmDialog } from "../../shared/components/ConfirmDialog/ConfirmDialog";
import { useToast } from "../../shared/components/Toast/useToast";
import type { UserInput } from "../../shared/data/types";
import { useAppData } from "../../shared/data/useAppData";
import { toApiError } from "../../shared/services/apiError";
import { activeHtmlElement, restoreFocus } from "../../shared/utils/focus";
import { UserDetailsDialog } from "./UserDetailsDialog";
import { UserFormDialog } from "./UserFormDialog";

type DialogState =
    | { kind: "details"; userId: string }
    | { kind: "create" }
    | { kind: "edit"; userId: string }
    | { kind: "confirmDelete"; userId: string }
    | null;

export function useUserDialogs() {
    const { companies, users, createUser, updateUser, deleteUser } = useAppData();
    const { showToast } = useToast();
    const [dialog, setDialog] = useState<DialogState>(null);
    const triggerRef = useRef<HTMLElement | null>(null);

    const open = (next: Exclude<DialogState, null>) => {
        triggerRef.current = activeHtmlElement();
        setDialog(next);
    };

    const close = () => {
        setDialog(null);
        restoreFocus(triggerRef.current);
    };

    const openDetails = (userId: string) => open({ kind: "details", userId });
    const openCreate = () => open({ kind: "create" });

    // Sempre lê o registro atual do estado compartilhado, nunca uma cópia.
    const user = dialog && "userId" in dialog ? users.find((item) => item.id === dialog.userId) : undefined;
    const companyName = user ? (companies.find((company) => company.id === user.companyId)?.name ?? "—") : "";

    // Falhas de cadastro e edição sobem para o formulário, que continua aberto.
    const handleCreate = async (input: UserInput) => {
        const created = await createUser(input);
        showToast(`Usuário “${created.name}” cadastrado com sucesso. Nenhuma senha ou convite foi enviado.`);
        close();
    };

    const handleUpdate = async (userId: string, input: UserInput) => {
        const updated = await updateUser(userId, input);
        showToast(`Dados de “${updated.name}” atualizados.`);
        close();
    };

    const handleDelete = async (userId: string, name: string) => {
        try {
            await deleteUser(userId);
            showToast(`Usuário “${name}” excluído.`);
            close();
        } catch (error) {
            showToast(toApiError(error).message, "error");
        }
    };

    let dialogs = null;
    if (dialog?.kind === "create") {
        dialogs = <UserFormDialog companies={companies} onCancel={close} onSubmit={handleCreate} />;
    } else if (dialog && user) {
        if (dialog.kind === "details") {
            dialogs = (
                <UserDetailsDialog
                    user={user}
                    companyName={companyName}
                    onClose={close}
                    onEdit={() => setDialog({ kind: "edit", userId: user.id })}
                    onDelete={() => setDialog({ kind: "confirmDelete", userId: user.id })}
                />
            );
        } else if (dialog.kind === "edit") {
            dialogs = (
                <UserFormDialog
                    key={user.id}
                    user={user}
                    companies={companies}
                    onCancel={close}
                    onSubmit={(input) => handleUpdate(user.id, input)}
                />
            );
        } else {
            dialogs = (
                <ConfirmDialog
                    title={`Excluir “${user.name}”?`}
                    confirmLabel="Excluir usuário"
                    onCancel={close}
                    onConfirm={() => handleDelete(user.id, user.name)}
                >
                    O cadastro do usuário será excluído. Esta ação não pode ser desfeita.
                </ConfirmDialog>
            );
        }
    }

    return { openDetails, openCreate, dialogs };
}
