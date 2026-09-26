import { describe, expect, it } from "vitest";
import { INITIAL_COMPANIES, INITIAL_USERS } from "../../test/fixtures";
import { computeOverviewMetrics, selectRecentCompanies } from "./overviewMetrics";

describe("overview metrics", () => {
    it("OV-T01: fixtures produce 6, 4, 6 and 2", () => {
        expect(computeOverviewMetrics(INITIAL_COMPANIES, INITIAL_USERS)).toEqual({
            totalCompanies: 6,
            activeCompanies: 4,
            totalUsers: 6,
            pendingRecords: 2,
        });
    });

    it("OV-T04: empty collections produce zeros", () => {
        expect(computeOverviewMetrics([], [])).toEqual({
            totalCompanies: 0,
            activeCompanies: 0,
            totalUsers: 0,
            pendingRecords: 0,
        });
        expect(selectRecentCompanies([])).toEqual([]);
    });

    it("OV-003: recent companies are the four newest, newest first", () => {
        expect(selectRecentCompanies(INITIAL_COMPANIES).map((company) => company.name)).toEqual([
            "Ponto Saúde",
            "Costa & Mar",
            "Studio Forma",
            "Norte Logística",
        ]);
    });
});
