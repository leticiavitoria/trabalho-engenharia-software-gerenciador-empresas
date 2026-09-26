import { AxiosError, AxiosHeaders } from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, toApiError } from "./apiError";
import { httpDataApi, type CompanyDto, type UserDto } from "./dataApi";
import { httpClient } from "./httpClient";

const COMPANY_DTO: CompanyDto = {
    id: 7,
    name: "Nova Era",
    cnpj: "00.000.000/0007-07",
    sector: "Educação",
    city: "Natal / RN",
    status: "active",
    email: "contato@novaera.exemplo",
    phone: null,
    createdAt: "2026-09-26",
};

const USER_DTO: UserDto = {
    id: 9,
    name: "Paula Nunes",
    email: "paula@aurora.exemplo",
    companyId: 7,
    role: "editor",
    status: "pending",
    lastAccess: null,
};

function mockResponse<T>(data: T) {
    return { data, status: 200, statusText: "OK", headers: {}, config: { headers: new AxiosHeaders() } };
}

afterEach(() => vi.restoreAllMocks());

describe("httpDataApi", () => {
    it("API-002: lists companies converting numeric ids and null phones", async () => {
        const get = vi.spyOn(httpClient, "get").mockResolvedValue(mockResponse([COMPANY_DTO]));

        const [company] = await httpDataApi.listCompanies();

        expect(get).toHaveBeenCalledWith("/api/companies");
        expect(company).toEqual({ ...COMPANY_DTO, id: "7", phone: undefined });
        expect(company).not.toHaveProperty("phone");
    });

    it("API-002: sends company payloads with an explicit null phone", async () => {
        const put = vi.spyOn(httpClient, "put").mockResolvedValue(mockResponse(COMPANY_DTO));
        const input = {
            name: "Nova Era",
            cnpj: "00.000.000/0007-07",
            sector: "Educação",
            city: "Natal / RN",
            status: "active" as const,
            email: "contato@novaera.exemplo",
        };

        await httpDataApi.updateCompany("7", input);

        expect(put).toHaveBeenCalledWith("/api/companies/7", { ...input, phone: null });
    });

    it("API-002: creates users sending the company id as a number", async () => {
        const post = vi.spyOn(httpClient, "post").mockResolvedValue(mockResponse(USER_DTO));

        const user = await httpDataApi.createUser({
            name: "Paula Nunes",
            email: "paula@aurora.exemplo",
            companyId: "7",
            role: "editor",
            status: "pending",
        });

        expect(post).toHaveBeenCalledWith("/api/users", expect.objectContaining({ companyId: 7 }));
        expect(user).toEqual({ ...USER_DTO, id: "9", companyId: "7" });
    });

    it("API-002: deletes and updates permissions on their resource URLs", async () => {
        const del = vi.spyOn(httpClient, "delete").mockResolvedValue(mockResponse(""));
        const put = vi.spyOn(httpClient, "put").mockResolvedValue(mockResponse({}));

        await httpDataApi.deleteUser("9");
        await httpDataApi.setPermission("companies.delete", "editor", true);

        expect(del).toHaveBeenCalledWith("/api/users/9");
        expect(put).toHaveBeenCalledWith("/api/permissions/companies.delete/roles/editor", { enabled: true });
    });

    it("API-002: reads only the matrix from the permissions payload", async () => {
        const matrix = { "companies.view": { admin: true, editor: true, viewer: true } };
        vi.spyOn(httpClient, "get").mockResolvedValue(mockResponse({ roles: [], permissions: [], matrix }));

        await expect(httpDataApi.getPermissions()).resolves.toEqual(matrix);
    });
});

describe("toApiError", () => {
    it("API-004: keeps the server message and field errors", () => {
        const error = new AxiosError("Request failed", "ERR_BAD_REQUEST", undefined, undefined, {
            ...mockResponse({ message: "CNPJ já cadastrado.", fields: { cnpj: "Já existe uma empresa com este CNPJ." } }),
            status: 409,
        });

        const apiError = toApiError(error);

        expect(apiError).toBeInstanceOf(ApiError);
        expect(apiError).toMatchObject({
            status: 409,
            message: "CNPJ já cadastrado.",
            fields: { cnpj: "Já existe uma empresa com este CNPJ." },
        });
    });

    it("API-005: explains when the server cannot be reached", () => {
        const apiError = toApiError(new AxiosError("Network Error", "ERR_NETWORK"));

        expect(apiError.status).toBeNull();
        expect(apiError.message).toMatch(/Não foi possível conectar ao servidor/);
    });
});
