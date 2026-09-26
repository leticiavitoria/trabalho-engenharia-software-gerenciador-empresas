import { isAxiosError } from "axios";

const NETWORK_ERROR_MESSAGE = "Não foi possível conectar ao servidor. Verifique se o backend está em execução.";
const UNEXPECTED_ERROR_MESSAGE = "Ocorreu um erro inesperado. Tente novamente.";

/** Erro devolvido pela API, já com a mensagem em português e os erros por campo. */
export class ApiError extends Error {
    readonly status: number | null;
    readonly fields: Record<string, string>;

    constructor(message: string, status: number | null = null, fields: Record<string, string> = {}) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.fields = fields;
    }
}

interface ApiErrorBody {
    message?: string;
    fields?: Record<string, string>;
}

export function toApiError(error: unknown): ApiError {
    if (error instanceof ApiError) return error;
    if (isAxiosError<ApiErrorBody>(error)) {
        if (!error.response) return new ApiError(NETWORK_ERROR_MESSAGE);
        const { status, data } = error.response;
        return new ApiError(data?.message ?? UNEXPECTED_ERROR_MESSAGE, status, data?.fields ?? {});
    }
    return new ApiError(UNEXPECTED_ERROR_MESSAGE);
}
