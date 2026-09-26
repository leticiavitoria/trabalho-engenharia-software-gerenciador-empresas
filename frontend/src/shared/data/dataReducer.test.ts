import { describe, expect, it } from "vitest";
import { INITIAL_COMPANIES, INITIAL_PERMISSIONS, INITIAL_USERS } from "../../test/fixtures";
import { createInitialDataState, dataReducer, type DataState } from "./dataReducer";

const initial: DataState = {
    status: "ready",
    error: null,
    companies: INITIAL_COMPANIES,
    users: INITIAL_USERS,
    permissions: INITIAL_PERMISSIONS,
};

describe("dataReducer", () => {
    it("starts loading with empty collections and every permission disabled", () => {
        const state = createInitialDataState();
        expect(state).toMatchObject({ status: "loading", companies: [], users: [] });
        expect(Object.values(state.permissions).flatMap((row) => Object.values(row))).not.toContain(true);
    });

    it("load/success replaces the collections; load/failure keeps them and stores the message", () => {
        const loaded = dataReducer(createInitialDataState(), {
            type: "load/success",
            companies: INITIAL_COMPANIES,
            users: INITIAL_USERS,
            permissions: INITIAL_PERMISSIONS,
        });
        expect(loaded).toEqual(initial);

        const failed = dataReducer(loaded, { type: "load/failure", error: "Servidor indisponível." });
        expect(failed).toMatchObject({ status: "error", error: "Servidor indisponível." });
        expect(failed.companies).toBe(loaded.companies);
    });

    it("COM-005: company/update replaces the record with the server version", () => {
        const [aurora] = INITIAL_COMPANIES;
        const next = dataReducer(initial, { type: "company/update", company: { ...aurora, name: "Aurora Digital" } });
        expect(next.companies[0]).toEqual({ ...aurora, name: "Aurora Digital" });
        expect(next.companies).toHaveLength(INITIAL_COMPANIES.length);
    });

    it("COM-006: deleting a company removes its linked users only", () => {
        const next = dataReducer(initial, { type: "company/delete", id: "1" });
        expect(next.companies.map((company) => company.id)).not.toContain("1");
        expect(next.users.some((user) => user.companyId === "1")).toBe(false);
        expect(next.users).toHaveLength(INITIAL_USERS.length - 1);
    });

    it("USR-005: user/update replaces only the matching user", () => {
        const [first, second] = INITIAL_USERS;
        const next = dataReducer(initial, { type: "user/update", user: { ...first, companyId: "2" } });
        expect(next.users[0]).toEqual({ ...first, companyId: "2" });
        expect(next.users[1]).toBe(second);
    });

    it("PER-003 / PER-004: permission/set changes one cell and never touches user roles", () => {
        const next = dataReducer(initial, {
            type: "permission/set",
            permissionId: "companies.delete",
            roleId: "editor",
            enabled: true,
        });
        expect(next.permissions["companies.delete"]).toEqual({ admin: true, editor: true, viewer: false });
        expect({ ...next.permissions, "companies.delete": INITIAL_PERMISSIONS["companies.delete"] }).toEqual(
            INITIAL_PERMISSIONS,
        );
        expect(next.users).toBe(initial.users);
    });
});
