import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { bodyRows, goTo, renderApp } from "../../test/renderApp";

function metricValue(label: string) {
    const metrics = screen.getByRole("list", { name: "Indicadores" });
    return within(metrics).getByText(label).nextElementSibling?.textContent;
}

describe("Visão geral", () => {
    it("OV-T01: summary cards match the fixtures", async () => {
        await renderApp("/");
        expect(metricValue("Total de empresas")).toBe("6");
        expect(metricValue("Empresas ativas")).toBe("4");
        expect(metricValue("Usuários cadastrados")).toBe("6");
        expect(metricValue("Aguardando aprovação")).toBe("2");
        expect(bodyRows()).toHaveLength(4);
        expect(screen.getByRole("heading", { name: "Movimentações de exemplo" })).toBeInTheDocument();
    });

    it("OV-T02: a new pending company updates counts and the recent list", async () => {
        const { user } = await renderApp("/empresas");
        await user.click(screen.getByRole("button", { name: "Nova empresa" }));
        const dialog = screen.getByRole("dialog", { name: "Nova empresa" });
        await user.type(within(dialog).getByLabelText(/Nome da empresa/), "Rio Claro");
        await user.type(within(dialog).getByLabelText(/CNPJ fictício/), "00.000.000/0008-08");
        await user.type(within(dialog).getByLabelText(/Segmento/), "Energia");
        await user.type(within(dialog).getByLabelText(/Cidade \/ UF/), "Vitória / ES");
        await user.selectOptions(within(dialog).getByLabelText(/Situação/), "Pendente");
        await user.type(within(dialog).getByLabelText(/E-mail de contato/), "contato@rioclaro.exemplo");
        await user.click(within(dialog).getByRole("button", { name: "Cadastrar empresa" }));

        await goTo(user, "Visão geral");
        expect(metricValue("Total de empresas")).toBe("7");
        expect(metricValue("Empresas ativas")).toBe("4");
        expect(metricValue("Aguardando aprovação")).toBe("3");
        expect(within(bodyRows()[0]).getByRole("rowheader")).toHaveTextContent("Rio Claro");
        expect(bodyRows()).toHaveLength(4);
    });

    it("OV-T04: with no companies, the card shows an empty state and 0", async () => {
        const { user } = await renderApp("/empresas");
        for (let i = 0; i < 6; i++) {
            await user.click(screen.getAllByRole("button", { name: /^Ver detalhes de / })[0]);
            await user.click(screen.getByRole("button", { name: "Excluir empresa" }));
            await user.click(
                within(screen.getByRole("alertdialog")).getByRole("button", { name: "Excluir empresa" }),
            );
        }
        await goTo(user, "Visão geral");
        expect(metricValue("Total de empresas")).toBe("0");
        expect(metricValue("Usuários cadastrados")).toBe("0");
        expect(screen.getByText(/Nenhuma empresa cadastrada até o momento/)).toBeInTheDocument();
        expect(screen.queryByRole("table")).not.toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Ver todas" })).toHaveAttribute("href", "/empresas");
    });

    it("OV-T05: recent company details match the Empresas record", async () => {
        const { user } = await renderApp("/");
        await user.click(screen.getByRole("button", { name: "Ver detalhes de Norte Logística" }));
        const details = screen.getByRole("dialog", { name: "Norte Logística" });
        expect(details).toHaveTextContent("00.000.000/0003-03");
        expect(details).toHaveTextContent("Manaus / AM");
        expect(details).toHaveTextContent("1 usuário");
        await user.click(within(details).getByRole("button", { name: "Fechar" }));
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

        await user.click(screen.getByRole("link", { name: "Ver todas" }));
        expect(screen.getByRole("heading", { level: 1, name: "Empresas" })).toBeInTheDocument();
    });
});
