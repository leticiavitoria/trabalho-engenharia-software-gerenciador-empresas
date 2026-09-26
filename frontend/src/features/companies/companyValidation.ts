import type { CompanyInput } from "../../shared/data/types";
import { isValidEmail, type FieldErrors } from "../../shared/utils/validation";

export function validateCompany(values: CompanyInput): FieldErrors<CompanyInput> {
    const errors: FieldErrors<CompanyInput> = {};
    if (!values.name.trim()) errors.name = "Informe o nome da empresa.";
    if (!values.cnpj.trim()) errors.cnpj = "Informe o CNPJ fictício.";
    if (!values.sector.trim()) errors.sector = "Informe o segmento.";
    if (!values.city.trim()) errors.city = "Informe a cidade e a UF.";
    if (!values.email.trim()) errors.email = "Informe o e-mail de contato.";
    else if (!isValidEmail(values.email)) errors.email = "Informe um e-mail válido, como nome@empresa.com.";
    return errors;
}
