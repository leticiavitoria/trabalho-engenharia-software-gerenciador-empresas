import { useRef, useState, type FormEvent } from "react";
import { SelectField, TextField } from "../../shared/components/Form/Field";
import { Icon } from "../../shared/components/Icon/Icon";
import { Modal } from "../../shared/components/Modal/Modal";
import { COMPANY_STATUS_LABELS, RECORD_STATUSES } from "../../shared/data/labels";
import type { Company, CompanyInput, RecordStatus } from "../../shared/data/types";
import { toApiError } from "../../shared/services/apiError";
import { focusFirstInvalidField } from "../../shared/utils/focus";
import { hasErrors, type FieldErrors } from "../../shared/utils/validation";
import { validateCompany } from "./companyValidation";

interface CompanyFormDialogProps {
    company?: Company;
    onCancel: () => void;
    /** Rejeitar a promessa mantém o formulário aberto e exibe o erro. */
    onSubmit: (input: CompanyInput) => Promise<void>;
}

const STATUS_OPTIONS = RECORD_STATUSES.map((status) => ({ value: status, label: COMPANY_STATUS_LABELS[status] }));

function toFormValues(company?: Company): CompanyInput {
    return {
        name: company?.name ?? "",
        cnpj: company?.cnpj ?? "",
        sector: company?.sector ?? "",
        city: company?.city ?? "",
        // Novo cadastro começa como ativo, como no protótipo.
        status: company?.status ?? "active",
        email: company?.email ?? "",
        phone: company?.phone ?? "",
    };
}

export function CompanyFormDialog({ company, onCancel, onSubmit }: CompanyFormDialogProps) {
    const [values, setValues] = useState<CompanyInput>(() => toFormValues(company));
    const [errors, setErrors] = useState<FieldErrors<CompanyInput>>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const isEditing = Boolean(company);

    const setField = <K extends keyof CompanyInput>(field: K, value: CompanyInput[K]) => {
        setValues((current) => ({ ...current, [field]: value }));
        if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (submitting) return;
        const nextErrors = validateCompany(values);
        if (hasErrors(nextErrors)) {
            setErrors(nextErrors);
            focusFirstInvalidField(formRef.current);
            return;
        }
        const trimmedPhone = values.phone?.trim();
        setFormError(null);
        setSubmitting(true);
        try {
            await onSubmit({
                name: values.name.trim(),
                cnpj: values.cnpj.trim(),
                sector: values.sector.trim(),
                city: values.city.trim(),
                status: values.status,
                email: values.email.trim(),
                phone: trimmedPhone || undefined,
            });
        } catch (error) {
            // Erros por campo do servidor (ex.: CNPJ duplicado) aparecem junto ao campo.
            const apiError = toApiError(error);
            const fieldErrors = apiError.fields as FieldErrors<CompanyInput>;
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

    const formId = "company-form";

    return (
        <Modal
            title={isEditing ? "Editar empresa" : "Nova empresa"}
            description="Campos marcados com * são obrigatórios."
            onClose={onCancel}
            footer={
                <>
                    <button type="button" className="button button--secondary" onClick={onCancel}>
                        Cancelar
                    </button>
                    <button type="submit" form={formId} className="button button--primary" disabled={submitting}>
                        {submitting ? "Salvando…" : isEditing ? "Salvar alterações" : "Cadastrar empresa"}
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
            <form id={formId} ref={formRef} className="form-grid" noValidate onSubmit={handleSubmit}>
                <div className="form-grid__full">
                    <TextField
                        label="Nome da empresa"
                        required
                        value={values.name}
                        onValueChange={(value) => setField("name", value)}
                        error={errors.name}
                        autoComplete="off"
                        data-autofocus
                    />
                </div>
                <TextField
                    label="CNPJ fictício"
                    required
                    value={values.cnpj}
                    onValueChange={(value) => setField("cnpj", value)}
                    error={errors.cnpj}
                    placeholder="00.000.000/0000-00"
                    hint="Apenas ilustrativo; não é validado na Receita Federal."
                    autoComplete="off"
                />
                <TextField
                    label="Segmento"
                    required
                    value={values.sector}
                    onValueChange={(value) => setField("sector", value)}
                    error={errors.sector}
                    autoComplete="off"
                />
                <TextField
                    label="Cidade / UF"
                    required
                    value={values.city}
                    onValueChange={(value) => setField("city", value)}
                    error={errors.city}
                    placeholder="São Paulo / SP"
                    autoComplete="off"
                />
                <SelectField
                    label="Situação"
                    value={values.status}
                    onValueChange={(value) => setField("status", value as RecordStatus)}
                    options={STATUS_OPTIONS}
                />
                <TextField
                    label="E-mail de contato"
                    type="email"
                    required
                    value={values.email}
                    onValueChange={(value) => setField("email", value)}
                    error={errors.email}
                    autoComplete="off"
                />
                <TextField
                    label="Telefone"
                    type="tel"
                    value={values.phone ?? ""}
                    onValueChange={(value) => setField("phone", value)}
                    placeholder="(00) 0000-0000"
                    autoComplete="off"
                />
            </form>
        </Modal>
    );
}
