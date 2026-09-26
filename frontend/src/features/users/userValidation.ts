import type { Company, UserInput } from "../../shared/data/types";
import { isValidEmail, type FieldErrors } from "../../shared/utils/validation";

export function validateUser(values: UserInput, companies: Company[]): FieldErrors<UserInput> {
    const errors: FieldErrors<UserInput> = {};
    if (!values.name.trim()) errors.name = "Informe o nome completo.";
    if (!values.email.trim()) errors.email = "Informe o e-mail.";
    else if (!isValidEmail(values.email)) errors.email = "Informe um e-mail válido, como nome@empresa.com.";
    if (!companies.some((company) => company.id === values.companyId)) errors.companyId = "Selecione uma empresa.";
    return errors;
}
