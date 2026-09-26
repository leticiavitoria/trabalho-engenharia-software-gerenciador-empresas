import axios from "axios";
import { toApiError } from "./apiError";

export const httpClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Toda falha chega às telas como ApiError, com mensagem pronta para exibição.
httpClient.interceptors.response.use(undefined, (error: unknown) => Promise.reject(toApiError(error)));
