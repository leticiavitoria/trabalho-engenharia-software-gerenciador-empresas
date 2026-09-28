import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { goTo, mainNav, renderApp } from "../test/renderApp";
import { NAV_ITEMS } from "./navigation";

describe("navigation shell", () => {
    it.each(NAV_ITEMS)("NAV-T01: direct load of $path activates $label", async ({ path, label }) => {
        await renderApp(path);
        const current = within(mainNav())
            .getAllByRole("link")
            .filter((link) => link.getAttribute("aria-current") === "page");
        expect(current).toHaveLength(1);
        expect(current[0]).toHaveAccessibleName(label);
        const breadcrumb = screen.getByRole("navigation", { name: "Trilha de navegação" });
        const crumbs = within(breadcrumb).getAllByRole("listitem");
        expect(crumbs.map((crumb) => crumb.textContent)).toEqual(["Painel administrativo", label]);
        expect(crumbs[1]).toHaveAttribute("aria-current", "page");
        expect(screen.getByRole("heading", { level: 1, name: label })).toBeInTheDocument();
        expect(screen.getByRole("main")).toBeInTheDocument();
    });

    it("NAV-002 / NAV-004: menu navigation updates active state and focuses the heading", async () => {
        const { user } = await renderApp("/empresas");
        await goTo(user, "Usuários");
        const heading = screen.getByRole("heading", { level: 1, name: "Usuários" });
        expect(heading).toHaveFocus();
        expect(within(mainNav()).getByRole("link", { name: "Usuários" })).toHaveAttribute("aria-current", "page");
        expect(within(mainNav()).getByRole("link", { name: "Empresas" })).not.toHaveAttribute("aria-current");
    });

    it("NAV-T03: mobile menu toggle stays in sync with aria-expanded", async () => {
        const { user } = await renderApp("/");
        const button = screen.getByRole("button", { name: "Abrir menu" });
        expect(button).toHaveAttribute("aria-expanded", "false");

        await user.click(button);
        expect(button).toHaveAttribute("aria-expanded", "true");

        await user.keyboard("{Escape}");
        expect(button).toHaveAttribute("aria-expanded", "false");
        expect(button).toHaveFocus();

        await user.click(button);
        await goTo(user, "Permissões");
        expect(button).toHaveAttribute("aria-expanded", "false");
    });

    it("NAV-005: shell shows the logged-in company and user", async () => {
        await renderApp("/");
        const sidebar = screen.getByRole("complementary");
        expect(within(sidebar).getByText("Aurora Tecnologia")).toBeInTheDocument();
        expect(within(sidebar).getByText("João Sampaio")).toBeInTheDocument();
        expect(within(sidebar).getByText("Administrador")).toBeInTheDocument();
    });
});
