import { screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { bodyRows, goTo, renderApp } from "../../test/renderApp";

describe("Usuários", () => {
    it("USR-T01: six users paginate as five plus one", async () => {
        const { user } = await renderApp("/usuarios");
        expect(bodyRows()).toHaveLength(5);
        expect(screen.getByText("Mostrando 1–5 de 6")).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Próxima página" }));
        expect(bodyRows()).toHaveLength(1);
    });

    it("USR-T02: company search combines with the status filter", async () => {
        const { user } = await renderApp("/usuarios");
        await user.type(screen.getByLabelText("Buscar usuários"), "aurora");
        await user.selectOptions(screen.getByLabelText("Situação"), "active");
        const rows = bodyRows();
        expect(rows).toHaveLength(1);
        expect(within(rows[0]).getByRole("rowheader")).toHaveTextContent("Mariana Alves");
        expect(screen.getByLabelText("Situação")).toHaveValue("active");

        await user.selectOptions(screen.getByLabelText("Situação"), "pending");
        expect(screen.getByText(/Nenhum usuário encontrado/)).toBeInTheDocument();
    });

    it("USR-T03: invalid email or missing name creates nothing", async () => {
        const { user } = await renderApp("/usuarios");
        await user.click(screen.getByRole("button", { name: "Novo usuário" }));
        const dialog = screen.getByRole("dialog", { name: "Novo usuário" });
        await user.type(within(dialog).getByLabelText(/^E-mail/), "sem-arroba");
        await user.selectOptions(within(dialog).getByLabelText(/Empresa/), "Verde Campo");
        await user.click(within(dialog).getByRole("button", { name: "Cadastrar usuário" }));

        expect(within(dialog).getByText("Informe o nome completo.")).toBeInTheDocument();
        expect(within(dialog).getByText(/Informe um e-mail válido/)).toBeInTheDocument();
        await waitFor(() => expect(within(dialog).getByLabelText(/Nome completo/)).toHaveFocus());
        await user.click(within(dialog).getByRole("button", { name: "Cancelar" }));
        expect(screen.getByText(/^6 usuários cadastrados/)).toBeInTheDocument();
    });

    it("USR-T04 / USR-T05: new user shows 'Nunca acessou' and edits persist across routes", async () => {
        const { user } = await renderApp("/usuarios");
        await user.click(screen.getByRole("button", { name: "Novo usuário" }));
        const dialog = screen.getByRole("dialog", { name: "Novo usuário" });
        await user.type(within(dialog).getByLabelText(/Nome completo/), "Paula Nunes");
        await user.type(within(dialog).getByLabelText(/^E-mail/), "paula@aurora.exemplo");
        await user.selectOptions(within(dialog).getByLabelText(/Empresa/), "Aurora Tecnologia");
        await user.selectOptions(within(dialog).getByLabelText(/Perfil de acesso/), "Editor");
        await user.selectOptions(within(dialog).getByLabelText(/Situação/), "Pendente");
        await user.click(within(dialog).getByRole("button", { name: "Cadastrar usuário" }));
        expect(screen.getByRole("status")).toHaveTextContent(/Nenhuma senha ou convite foi enviado/);

        await user.click(screen.getByRole("button", { name: "Página 2" }));
        await user.click(screen.getByRole("button", { name: "Ver detalhes de Paula Nunes" }));
        const details = screen.getByRole("dialog", { name: "Paula Nunes" });
        expect(details).toHaveTextContent("Aurora Tecnologia");
        expect(details).toHaveTextContent("Editor");
        expect(details).toHaveTextContent("Pendente");
        expect(details).toHaveTextContent("Nunca acessou");

        await user.click(within(details).getByRole("button", { name: "Editar usuário" }));
        const form = screen.getByRole("dialog", { name: "Editar usuário" });
        await user.selectOptions(within(form).getByLabelText(/Empresa/), "Verde Campo");
        await user.selectOptions(within(form).getByLabelText(/Perfil de acesso/), "Administrador");
        await user.click(within(form).getByRole("button", { name: "Salvar alterações" }));

        await goTo(user, "Empresas");
        const verde = screen.getByRole("rowheader", { name: "Verde Campo" }).closest("tr")!;
        expect(within(verde).getAllByRole("cell")[4]).toHaveTextContent("2");

        await goTo(user, "Usuários");
        await user.click(screen.getByRole("button", { name: "Página 2" }));
        const row = screen.getByRole("rowheader", { name: "Paula Nunes" }).closest("tr")!;
        expect(row).toHaveTextContent("Verde Campo");
        expect(row).toHaveTextContent("Administrador");
        expect(row).toHaveTextContent("Nunca acessou");
    });

    it("USR-T06 / OV-T03: deleting a pending user updates overview and company counts", async () => {
        const { user } = await renderApp("/usuarios");
        await user.click(screen.getByRole("button", { name: "Ver detalhes de Beatriz Souza" }));
        await user.click(screen.getByRole("button", { name: "Excluir usuário" }));
        const confirm = screen.getByRole("alertdialog", { name: "Excluir “Beatriz Souza”?" });
        await user.click(within(confirm).getByRole("button", { name: "Excluir usuário" }));
        expect(screen.getByText(/^5 usuários cadastrados/)).toBeInTheDocument();

        await goTo(user, "Visão geral");
        const metrics = screen.getByRole("list", { name: "Indicadores" });
        expect(within(metrics).getByText("Usuários cadastrados").nextElementSibling).toHaveTextContent("5");
        expect(within(metrics).getByText("Aguardando aprovação").nextElementSibling).toHaveTextContent("1");

        await goTo(user, "Empresas");
        const norte = screen.getByRole("rowheader", { name: "Norte Logística" }).closest("tr")!;
        expect(within(norte).getAllByRole("cell")[4]).toHaveTextContent("0");
    });

    it("USR-T07: without companies the form explains the next step", async () => {
        const { user } = await renderApp("/empresas");
        for (let i = 0; i < 6; i++) {
            await user.click(screen.getAllByRole("button", { name: /^Ver detalhes de / })[0]);
            await user.click(screen.getByRole("button", { name: "Excluir empresa" }));
            await user.click(
                within(screen.getByRole("alertdialog")).getByRole("button", { name: "Excluir empresa" }),
            );
        }
        expect(screen.getByText(/Nenhuma empresa cadastrada/)).toBeInTheDocument();

        await goTo(user, "Usuários");
        expect(screen.getByText(/Nenhum usuário cadastrado/)).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Novo usuário" }));
        const dialog = screen.getByRole("dialog", { name: "Novo usuário" });
        expect(within(dialog).getByText(/primeiro cadastre uma empresa/)).toBeInTheDocument();
        expect(within(dialog).getByRole("link", { name: "Ir para Empresas" })).toHaveAttribute("href", "/empresas");
        expect(within(dialog).getByRole("button", { name: "Cadastrar usuário" })).toBeDisabled();
    });
});
