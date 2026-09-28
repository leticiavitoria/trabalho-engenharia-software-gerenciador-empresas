import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
    cleanup();
    localStorage.clear();
});

// O jsdom não implementa showModal/close nem o Escape nativo de <dialog>.
if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
        this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
        if (!this.hasAttribute("open")) return;
        this.removeAttribute("open");
        this.dispatchEvent(new Event("close"));
    };
    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        const dialogs = document.querySelectorAll<HTMLDialogElement>("dialog[open]");
        const top = dialogs[dialogs.length - 1];
        if (top && top.dispatchEvent(new Event("cancel", { cancelable: true }))) top.close();
    });
}

if (!window.matchMedia) {
    window.matchMedia = (query: string) =>
        ({
            matches: false,
            media: query,
            onchange: null,
            addEventListener: () => {},
            removeEventListener: () => {},
            addListener: () => {},
            removeListener: () => {},
            dispatchEvent: () => false,
        }) as MediaQueryList;
}
