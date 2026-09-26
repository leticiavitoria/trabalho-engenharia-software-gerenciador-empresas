import { screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../shared/services/apiError";
import { createFakeApi } from "../test/fakeApi";
import { bodyRows, goTo, renderApp, waitForDataLoaded } from "../test/renderApp";

const OFFLINE = new ApiError("Não foi possível conectar ao servidor. Verifique se o backend está em execução.");

describe("integração com a API", () => {
    it("API-T01: a failed initial load shows the error and retrying loads the data", async () => {
        const api = createFakeApi();
        const listCompanies = vi.fn(api.listCompanies);
        listCompanies.mockRejectedValueOnce(OFFLINE);
        const { user } = await renderApp("/empresas", { ...api, listCompanies });

        expect(screen.getByRole("heading", { level: 1, name: "Não foi possível carregar os dados" })).toBeInTheDocument();
        expect(screen.getByText(/Verifique se o backend está em execução/)).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Tentar novamente" }));
        await waitForDataLoaded();

        expect(screen.getByRole("heading", { level: 1, name: "Empresas" })).toBeInTheDocument();
        expect(bodyRows()).toHaveLength(5);
    });

    it("API-T02: server field errors stay in the form and nothing changes", async () => {
        const createCompany = vi.fn().mockRejectedValue(
            new ApiError("CNPJ já cadastrado.", 409, { cnpj: "Já existe uma empresa com este CNPJ." }),
        );
        const { user } = await renderApp("/empresas", createFakeApi({ createCompany }));

        await user.click(screen.getByRole("button", { name: "Nova empresa" }));
        const dialog = screen.getByRole("dialog", { name: "Nova empresa" });
        await user.type(within(dialog).getByLabelText(/Nome da empresa/), "Aurora Clone");
        await user.type(within(dialog).getByLabelText(/CNPJ fictício/), "00.000.000/0001-01");
        await user.type(within(dialog).getByLabelText(/Segmento/), "Tecnologia");
        await user.type(within(dialog).getByLabelText(/Cidade \/ UF/), "Santos / SP");
        await user.type(within(dialog).getByLabelText(/E-mail de contato/), "contato@clone.exemplo");
        await user.click(within(dialog).getByRole("button", { name: "Cadastrar empresa" }));

        expect(createCompany).toHaveBeenCalledOnce();
        expect(await within(dialog).findByText("Já existe uma empresa com este CNPJ.")).toBeInTheDocument();
        expect(within(dialog).getByLabelText(/CNPJ fictício/)).toHaveAttribute("aria-invalid", "true");
        expect(screen.getByText("6 empresas cadastradas.")).toBeInTheDocument();
    });

    it("API-T03: a failure without field errors is shown inside the form", async () => {
        const updateUser = vi.fn().mockRejectedValue(OFFLINE);
        const { user } = await renderApp("/usuarios", createFakeApi({ updateUser }));

        await user.click(screen.getByRole("button", { name: "Ver detalhes de Rafael Lima" }));
        await user.click(screen.getByRole("button", { name: "Editar usuário" }));
        const form = screen.getByRole("dialog", { name: "Editar usuário" });
        await user.selectOptions(within(form).getByLabelText(/Perfil de acesso/), "Administrador");
        await user.click(within(form).getByRole("button", { name: "Salvar alterações" }));

        expect(await within(form).findByRole("alert")).toHaveTextContent(/Não foi possível conectar ao servidor/);
        expect(within(form).getByRole("button", { name: "Salvar alterações" })).toBeEnabled();
        await user.click(within(form).getByRole("button", { name: "Cancelar" }));
        const row = screen.getByRole("rowheader", { name: "Rafael Lima" }).closest("tr")!;
        expect(row).toHaveTextContent("Editor");
    });

    it("API-T04: a failed deletion keeps the record and reports the error", async () => {
        const deleteCompany = vi.fn().mockRejectedValue(new ApiError("Empresa não encontrada.", 404));
        const { user } = await renderApp("/empresas", createFakeApi({ deleteCompany }));

        await user.click(screen.getByRole("button", { name: "Ver detalhes de Verde Campo" }));
        await user.click(screen.getByRole("button", { name: "Excluir empresa" }));
        await user.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Excluir empresa" }));

        expect(await screen.findByText("Empresa não encontrada.")).toBeInTheDocument();
        expect(screen.getByText("6 empresas cadastradas.")).toBeInTheDocument();
        await goTo(user, "Usuários");
        expect(screen.getByRole("rowheader", { name: "Rafael Lima" })).toBeInTheDocument();
    });

    it("API-T05: a failed permission change reverts the cell", async () => {
        const setPermission = vi.fn().mockRejectedValue(OFFLINE);
        const { user } = await renderApp("/permissoes", createFakeApi({ setPermission }));
        const cell = screen.getByRole("button", { name: "Ativar Excluir empresas para Editor" });

        await user.click(cell);

        expect(setPermission).toHaveBeenCalledWith("companies.delete", "editor", true);
        expect(await screen.findByText(/Não foi possível alterar “Excluir empresas”/)).toBeInTheDocument();
        expect(cell).toHaveAttribute("aria-pressed", "false");
    });

    it("API-T06: successful changes are sent to the API", async () => {
        const api = createFakeApi();
        const { user } = await renderApp("/permissoes", api);

        await user.click(screen.getByRole("button", { name: "Ativar Gerenciar usuários para Editor" }));

        expect(await screen.findByText(/A configuração foi salva/)).toBeInTheDocument();
        expect((await api.getPermissions())["users.manage"].editor).toBe(true);
    });
});
