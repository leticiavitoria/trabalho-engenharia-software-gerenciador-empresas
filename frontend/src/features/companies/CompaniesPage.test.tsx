import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { bodyRows, goTo, renderApp } from "../../test/renderApp";

async function openCompanyForm(user: Awaited<ReturnType<typeof renderApp>>["user"]) {
    await user.click(screen.getByRole("button", { name: "Nova empresa" }));
    return screen.getByRole("dialog", { name: "Nova empresa" });
}

describe("Empresas", () => {
    it("COM-T01: six companies paginate as five plus one", async () => {
        const { user } = await renderApp("/empresas");
        expect(bodyRows()).toHaveLength(5);
        expect(screen.getByText("Mostrando 1–5 de 6")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Página anterior" })).toBeDisabled();

        await user.click(screen.getByRole("button", { name: "Próxima página" }));
        expect(bodyRows()).toHaveLength(1);
        expect(screen.getByText("Mostrando 6–6 de 6")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Próxima página" })).toBeDisabled();
        expect(screen.getByRole("button", { name: "Página 2" })).toHaveAttribute("aria-current", "page");
    });

    it("COM-T02: search and status combine and reset to page one", async () => {
        const { user } = await renderApp("/empresas");
        await user.click(screen.getByRole("button", { name: "Página 2" }));

        await user.type(screen.getByLabelText("Buscar empresas"), "o");
        expect(screen.getByRole("button", { name: "Página 1" })).toHaveAttribute("aria-current", "page");

        await user.selectOptions(screen.getByLabelText("Situação"), "active");
        const names = bodyRows().map((row) => within(row).getByRole("rowheader").textContent);
        expect(names).toEqual(["Aurora Tecnologia", "Verde Campo", "Studio Forma", "Ponto Saúde"]);

        await user.clear(screen.getByLabelText("Buscar empresas"));
        await user.type(screen.getByLabelText("Buscar empresas"), "LOGÍSTICA");
        expect(screen.getByText(/Nenhuma empresa encontrada/)).toBeInTheDocument();
        expect(screen.getByText("Mostrando 0 de 0")).toBeInTheDocument();

        await user.selectOptions(screen.getByLabelText("Situação"), "all");
        expect(bodyRows()).toHaveLength(1);
        expect(screen.getByRole("rowheader", { name: "Norte Logística" })).toBeInTheDocument();
    });

    it("COM-T03: invalid data blocks the mutation and keeps the form open", async () => {
        const { user } = await renderApp("/empresas");
        const dialog = await openCompanyForm(user);
        await user.type(within(dialog).getByLabelText(/Nome da empresa/), "Empresa Teste");
        await user.type(within(dialog).getByLabelText(/E-mail de contato/), "email-invalido");
        await user.click(within(dialog).getByRole("button", { name: "Cadastrar empresa" }));

        expect(screen.getByRole("dialog", { name: "Nova empresa" })).toBeInTheDocument();
        expect(within(dialog).getByText("Informe o CNPJ fictício.")).toBeInTheDocument();
        expect(within(dialog).getByText(/Informe um e-mail válido/)).toBeInTheDocument();
        expect(within(dialog).getByLabelText(/E-mail de contato/)).toHaveAttribute("aria-invalid", "true");

        await user.click(within(dialog).getByRole("button", { name: "Cancelar" }));
        expect(screen.getByText("6 empresas cadastradas.")).toBeInTheDocument();
    });

    it("COM-T04: create then edit keeps the record and updates every view", async () => {
        const { user } = await renderApp("/empresas");
        const dialog = await openCompanyForm(user);
        await user.type(within(dialog).getByLabelText(/Nome da empresa/), "Nova Era");
        await user.type(within(dialog).getByLabelText(/CNPJ fictício/), "00.000.000/0007-07");
        await user.type(within(dialog).getByLabelText(/Segmento/), "Educação");
        await user.type(within(dialog).getByLabelText(/Cidade \/ UF/), "Natal / RN");
        await user.type(within(dialog).getByLabelText(/E-mail de contato/), "contato@novaera.exemplo");
        await user.click(within(dialog).getByRole("button", { name: "Cadastrar empresa" }));

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(screen.getByRole("status")).toHaveTextContent(/cadastrada com sucesso/);
        expect(screen.getByText("7 empresas cadastradas.")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Página 2" }));
        await user.click(screen.getByRole("button", { name: "Ver detalhes de Nova Era" }));
        const details = screen.getByRole("dialog", { name: "Nova Era" });
        expect(within(details).getByText("Ativa")).toBeInTheDocument();
        const createdAt = within(details).getByText("Data de cadastro").nextElementSibling?.textContent;

        await user.click(within(details).getByRole("button", { name: "Editar dados" }));
        const form = screen.getByRole("dialog", { name: "Editar empresa" });
        const name = within(form).getByLabelText(/Nome da empresa/);
        expect(name).toHaveValue("Nova Era");
        await user.clear(name);
        await user.type(name, "Nova Era Educação");
        await user.click(within(form).getByRole("button", { name: "Salvar alterações" }));

        expect(screen.getByText("7 empresas cadastradas.")).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Ver detalhes de Nova Era Educação" }));
        const updated = screen.getByRole("dialog", { name: "Nova Era Educação" });
        expect(within(updated).getByText("Data de cadastro").nextElementSibling).toHaveTextContent(createdAt!);
        await user.keyboard("{Escape}");

        await goTo(user, "Visão geral");
        expect(screen.getByRole("rowheader", { name: "Nova Era Educação" })).toBeInTheDocument();
    });

    it("COM-T05: delete cancel keeps data; confirm cascades to users and overview", async () => {
        const { user } = await renderApp("/empresas");
        await user.click(screen.getByRole("button", { name: "Ver detalhes de Aurora Tecnologia" }));
        await user.click(screen.getByRole("button", { name: "Excluir empresa" }));
        const confirm = screen.getByRole("alertdialog", { name: "Excluir “Aurora Tecnologia”?" });
        expect(confirm).toHaveTextContent("1 usuário vinculado a esta empresa também será removido.");

        await user.click(within(confirm).getByRole("button", { name: "Cancelar" }));
        expect(screen.getByText("6 empresas cadastradas.")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Ver detalhes de Aurora Tecnologia" }));
        await user.click(screen.getByRole("button", { name: "Excluir empresa" }));
        await user.click(
            within(screen.getByRole("alertdialog")).getByRole("button", { name: "Excluir empresa" }),
        );
        expect(screen.getByText("5 empresas cadastradas.")).toBeInTheDocument();
        expect(screen.queryByRole("rowheader", { name: "Aurora Tecnologia" })).not.toBeInTheDocument();

        await goTo(user, "Usuários");
        expect(screen.queryByText("Mariana Alves")).not.toBeInTheDocument();
        expect(screen.getByText(/^5 usuários cadastrados/)).toBeInTheDocument();

        await goTo(user, "Visão geral");
        const metrics = screen.getByRole("list", { name: "Indicadores" });
        expect(within(metrics).getByText("Total de empresas").nextElementSibling).toHaveTextContent("5");
        expect(within(metrics).getByText("Usuários cadastrados").nextElementSibling).toHaveTextContent("5");
    });

    it("COM-T06: deleting the last filtered record shows the empty state", async () => {
        const { user } = await renderApp("/empresas");
        await user.selectOptions(screen.getByLabelText("Situação"), "inactive");
        expect(bodyRows()).toHaveLength(1);

        await user.click(screen.getByRole("button", { name: "Ver detalhes de Costa & Mar" }));
        await user.click(screen.getByRole("button", { name: "Excluir empresa" }));
        await user.click(
            within(screen.getByRole("alertdialog")).getByRole("button", { name: "Excluir empresa" }),
        );

        expect(screen.getByText(/Nenhuma empresa encontrada/)).toBeInTheDocument();
        expect(screen.getByText("Mostrando 0 de 0")).toBeInTheDocument();
    });

    it("COM-004: details dialog closes with Escape and restores focus", async () => {
        const { user } = await renderApp("/empresas");
        const trigger = screen.getByRole("button", { name: "Ver detalhes de Verde Campo" });
        await user.click(trigger);
        const details = screen.getByRole("dialog", { name: "Verde Campo" });
        expect(within(details).getByText("(62) 0000-0002")).toBeInTheDocument();

        await user.keyboard("{Escape}");
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(trigger).toHaveFocus();
    });
});
