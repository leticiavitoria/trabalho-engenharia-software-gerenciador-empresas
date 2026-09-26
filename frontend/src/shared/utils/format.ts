/** Converte AAAA-MM-DD em DD/MM/AAAA sem passar por fuso horário. */
export function formatDate(isoDate: string): string {
    const [year, month, day] = isoDate.split("-");
    return day && month && year ? `${day}/${month}/${year}` : isoDate;
}

const DATE_TIME_FORMAT = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

/** Converte um instante ISO 8601 em DD/MM/AAAA, HH:MM no fuso do navegador. */
export function formatDateTime(isoDateTime: string): string {
    const date = new Date(isoDateTime);
    return Number.isNaN(date.getTime()) ? isoDateTime : DATE_TIME_FORMAT.format(date);
}

export function pluralize(count: number, singular: string, plural: string): string {
    return `${count} ${count === 1 ? singular : plural}`;
}

/** Normaliza texto para busca sem diferenciar maiúsculas nem acentos. */
export function normalizeSearch(text: string): string {
    return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

export function matchesSearch(query: string, fields: string[]): boolean {
    const normalizedQuery = normalizeSearch(query);
    if (!normalizedQuery) return true;
    return fields.some((field) => normalizeSearch(field).includes(normalizedQuery));
}
