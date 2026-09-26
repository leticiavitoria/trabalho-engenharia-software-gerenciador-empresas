import { useRef, useState } from "react";
import { ConfirmDialog } from "../../shared/components/ConfirmDialog/ConfirmDialog";
import { useToast } from "../../shared/components/Toast/useToast";
import type { CompanyInput } from "../../shared/data/types";
import { useAppData } from "../../shared/data/useAppData";
import { toApiError } from "../../shared/services/apiError";
import { activeHtmlElement, restoreFocus } from "../../shared/utils/focus";
import { pluralize } from "../../shared/utils/format";
import { CompanyDetailsDialog } from "./CompanyDetailsDialog";
import { CompanyFormDialog } from "./CompanyFormDialog";

type DialogState =
    | { kind: "details"; companyId: string }
    | { kind: "create" }
    | { kind: "edit"; companyId: string }
    | { kind: "confirmDelete"; companyId: string }
    | null;

/**
 * Fluxo de detalhes, cadastro, edição e exclusão de empresas. Compartilhado
 * entre /empresas e a Visão geral para que ambos mostrem os mesmos detalhes.
 */
export function useCompanyDialogs() {
    const { companies, users, createCompany, updateCompany, deleteCompany } = useAppData();
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

    const openDetails = (companyId: string) => open({ kind: "details", companyId });
    const openCreate = () => open({ kind: "create" });

    // Sempre lê o registro atual do estado compartilhado, nunca uma cópia.
    const company = dialog && "companyId" in dialog ? companies.find((item) => item.id === dialog.companyId) : undefined;
    const linkedUsers = company ? users.filter((user) => user.companyId === company.id).length : 0;

    // Falhas de cadastro e edição sobem para o formulário, que continua aberto.
    const handleCreate = async (input: CompanyInput) => {
        const created = await createCompany(input);
        showToast(`Empresa “${created.name}” cadastrada com sucesso.`);
        close();
    };

    const handleUpdate = async (companyId: string, input: CompanyInput) => {
        const updated = await updateCompany(companyId, input);
        showToast(`Dados de “${updated.name}” atualizados.`);
        close();
    };

    const handleDelete = async (companyId: string, name: string) => {
        try {
            await deleteCompany(companyId);
            showToast(`Empresa “${name}” excluída, com seus usuários vinculados.`);
            close();
        } catch (error) {
            showToast(toApiError(error).message, "error");
        }
    };

    let dialogs = null;
    if (dialog?.kind === "create") {
        dialogs = <CompanyFormDialog onCancel={close} onSubmit={handleCreate} />;
    } else if (dialog && company) {
        if (dialog.kind === "details") {
            dialogs = (
                <CompanyDetailsDialog
                    company={company}
                    userCount={linkedUsers}
                    onClose={close}
                    onEdit={() => setDialog({ kind: "edit", companyId: company.id })}
                    onDelete={() => setDialog({ kind: "confirmDelete", companyId: company.id })}
                />
            );
        } else if (dialog.kind === "edit") {
            dialogs = (
                <CompanyFormDialog
                    key={company.id}
                    company={company}
                    onCancel={close}
                    onSubmit={(input) => handleUpdate(company.id, input)}
                />
            );
        } else {
            dialogs = (
                <ConfirmDialog
                    title={`Excluir “${company.name}”?`}
                    confirmLabel="Excluir empresa"
                    onCancel={close}
                    onConfirm={() => handleDelete(company.id, company.name)}
                >
                    {linkedUsers > 0
                        ? `${pluralize(linkedUsers, "usuário vinculado", "usuários vinculados")} a esta empresa também ${linkedUsers === 1 ? "será removido" : "serão removidos"}.`
                        : "Esta empresa não tem usuários vinculados."}{" "}
                    Esta ação não pode ser desfeita.
                </ConfirmDialog>
            );
        }
    }

    return { openDetails, openCreate, dialogs };
}
