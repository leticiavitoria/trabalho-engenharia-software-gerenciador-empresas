import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { INITIAL_PERMISSIONS } from "../../shared/demo/fixtures";
import { PERMISSIONS, ROLES } from "../../shared/demo/labels";
import { goTo, renderApp } from "../../test/renderApp";

function cell(permissionLabel: string, roleName: string) {
    return screen.getByRole("button", { name: new RegExp(`^(Ativar|Desativar) ${permissionLabel} para ${roleName}$`) });
}

describe("Permissões", () => {
    it("PER-T01: all 21 values match the seed matrix", async () => {
        await renderApp("/permissoes");
        for (const permission of PERMISSIONS) {
            expect(screen.getByRole("rowheader", { name: permission.label })).toBeInTheDocument();
            for (const role of ROLES) {
                const enabled = INITIAL_PERMISSIONS[permission.id][role.id];
                const button = cell(permission.label, role.name);
                expect(button).toHaveAttribute("aria-pressed", String(enabled));
                expect(button).toHaveAccessibleName(
                    `${enabled ? "Desativar" : "Ativar"} ${permission.label} para ${role.name}`,
                );
            }
        }
        for (const role of ROLES) {
            expect(screen.getByRole("columnheader", { name: role.name })).toBeInTheDocument();
        }
    });

    it("PER-T02 / PER-T05: activating one cell changes only that cell and shows feedback", async () => {
        const { user } = await renderApp("/permissoes");
        const target = cell("Excluir empresas", "Editor");
        target.focus();
        await user.keyboard("{Enter}");

        expect(target).toHaveAttribute("aria-pressed", "true");
        expect(target).toHaveAccessibleName("Desativar Excluir empresas para Editor");
        expect(target).toHaveTextContent("Permitido");
        expect(screen.getByRole("status")).toHaveTextContent(/Excluir empresas.*ativada/);
        expect(cell("Excluir empresas", "Visualizador")).toHaveAttribute("aria-pressed", "false");
        expect(cell("Editar empresas", "Editor")).toHaveAttribute("aria-pressed", "true");

        const editorCard = screen.getByRole("heading", { level: 2, name: "Editor" }).closest("li")!;
        expect(within(editorCard).getByText(/5 de 7 funcionalidades/)).toBeInTheDocument();

        await user.keyboard(" ");
        expect(target).toHaveAttribute("aria-pressed", "false");
    });

    it("PER-T03 / PER-T04: changes persist across navigation and do not touch user roles", async () => {
        const { user } = await renderApp("/permissoes");
        await user.click(cell("Gerenciar usuários", "Visualizador"));

        await goTo(user, "Usuários");
        expect(screen.getByRole("button", { name: "Novo usuário" })).toBeEnabled();
        const beatriz = screen.getByRole("rowheader", { name: "Beatriz Souza" }).closest("tr")!;
        expect(beatriz).toHaveTextContent("Visualizador");

        await goTo(user, "Empresas");
        expect(screen.getByRole("button", { name: "Nova empresa" })).toBeEnabled();

        await goTo(user, "Permissões");
        expect(cell("Gerenciar usuários", "Visualizador")).toHaveAttribute("aria-pressed", "true");
    });
});
