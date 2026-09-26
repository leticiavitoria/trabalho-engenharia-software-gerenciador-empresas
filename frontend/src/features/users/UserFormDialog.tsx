import { useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { SelectField, TextField } from "../../shared/components/Form/Field";
import { Icon } from "../../shared/components/Icon/Icon";
import { Modal } from "../../shared/components/Modal/Modal";
import { RECORD_STATUSES, ROLES, USER_STATUS_LABELS } from "../../shared/data/labels";
import type { Company, RecordStatus, RoleId, User, UserInput } from "../../shared/data/types";
import { toApiError } from "../../shared/services/apiError";
import { focusFirstInvalidField } from "../../shared/utils/focus";
import { hasErrors, type FieldErrors } from "../../shared/utils/validation";
import { validateUser } from "./userValidation";

interface UserFormDialogProps {
    user?: User;
    companies: Company[];
    onCancel: () => void;
    /** Rejeitar a promessa mantém o formulário aberto e exibe o erro. */
    onSubmit: (input: UserInput) => Promise<void>;
}

const ROLE_OPTIONS = ROLES.map((role) => ({ value: role.id, label: role.name }));
const STATUS_OPTIONS = RECORD_STATUSES.map((status) => ({ value: status, label: USER_STATUS_LABELS[status] }));

export function UserFormDialog({ user, companies, onCancel, onSubmit }: UserFormDialogProps) {
    const [values, setValues] = useState<UserInput>(() => ({
        name: user?.name ?? "",
        email: user?.email ?? "",
        companyId: user?.companyId ?? "",
        role: user?.role ?? "viewer",
        status: user?.status ?? "active",
    }));
    const [errors, setErrors] = useState<FieldErrors<UserInput>>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const isEditing = Boolean(user);
    const hasCompanies = companies.length > 0;

    const setField = <K extends keyof UserInput>(field: K, value: UserInput[K]) => {
        setValues((current) => ({ ...current, [field]: value }));
        if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (submitting) return;
        const nextErrors = validateUser(values, companies);
        if (hasErrors(nextErrors)) {
            setErrors(nextErrors);
            focusFirstInvalidField(formRef.current);
            return;
        }
        setFormError(null);
        setSubmitting(true);
        try {
            await onSubmit({ ...values, name: values.name.trim(), email: values.email.trim() });
        } catch (error) {
            // Erros por campo do servidor (ex.: e-mail duplicado) aparecem junto ao campo.
            const apiError = toApiError(error);
            const fieldErrors = apiError.fields as FieldErrors<UserInput>;
            if (hasErrors(fieldErrors)) {
                setErrors(fieldErrors);
                focusFirstInvalidField(formRef.current);
            } else {
                setFormError(apiError.message);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const formId = "user-form";

    return (
        <Modal
            title={isEditing ? "Editar usuário" : "Novo usuário"}
            description="O cadastro não cria senha nem envia convite. Campos marcados com * são obrigatórios."
            onClose={onCancel}
            footer={
                <>
                    <button type="button" className="button button--secondary" onClick={onCancel}>
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form={formId}
                        className="button button--primary"
                        disabled={!hasCompanies || submitting}
                    >
                        {submitting ? "Salvando…" : isEditing ? "Salvar alterações" : "Cadastrar usuário"}
                    </button>
                </>
            }
        >
            {formError && (
                <div className="notice notice--error" role="alert">
                    <Icon name="info" />
                    <p>{formError}</p>
                </div>
            )}
            {!hasCompanies && (
                <div className="notice notice--warning" role="note">
                    <Icon name="info" />
                    <p>
                        Para cadastrar um usuário, primeiro cadastre uma empresa.{" "}
                        <Link to="/empresas" onClick={onCancel}>
                            Ir para Empresas
                        </Link>
                    </p>
                </div>
            )}
            <form id={formId} ref={formRef} className="form-grid" noValidate onSubmit={handleSubmit}>
                <div className="form-grid__full">
                    <TextField
                        label="Nome completo"
                        required
                        value={values.name}
                        onValueChange={(value) => setField("name", value)}
                        error={errors.name}
                        autoComplete="off"
                        data-autofocus
                    />
                </div>
                <div className="form-grid__full">
                    <TextField
                        label="E-mail"
                        type="email"
                        required
                        value={values.email}
                        onValueChange={(value) => setField("email", value)}
                        error={errors.email}
                        autoComplete="off"
                    />
                </div>
                <div className="form-grid__full">
                    <SelectField
                        label="Empresa"
                        required
                        value={values.companyId}
                        onValueChange={(value) => setField("companyId", value)}
                        options={companies.map((company) => ({ value: company.id, label: company.name }))}
                        placeholder={hasCompanies ? "Selecione uma empresa" : "Nenhuma empresa cadastrada"}
                        error={errors.companyId}
                        disabled={!hasCompanies}
                    />
                </div>
                <SelectField
                    label="Perfil de acesso"
                    value={values.role}
                    onValueChange={(value) => setField("role", value as RoleId)}
                    options={ROLE_OPTIONS}
                    hint="Apenas exibido; ainda não controla o acesso."
                />
                <SelectField
                    label="Situação"
                    value={values.status}
                    onValueChange={(value) => setField("status", value as RecordStatus)}
                    options={STATUS_OPTIONS}
                />
            </form>
        </Modal>
    );
}
