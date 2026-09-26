import { useContext } from "react";
import { DataContext } from "./dataContext";

export function useAppData() {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error("useAppData deve ser usado dentro de <DataProvider>.");
    }
    return context;
}
