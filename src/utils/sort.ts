export interface SortConfig {
  column: string | null;
  order: "asc" | "desc" | null;
}

const getSortValue = <T>(obj: T, path: string[]) =>
  path.reduce((acc, key) => {
    if (acc && typeof acc === "object" && acc !== null) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj as unknown);

const parseSortValue = <T>(v: T) => {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v.toLowerCase();
  if (v instanceof Date) return v.getTime();
  return v;
}

export const sort = <T>(dataToSort: T[], sortConfig: SortConfig): T[] => {
  if (!sortConfig.column || !sortConfig.order) return dataToSort;
  const { column, order } = sortConfig;
  return [...dataToSort].sort((a, b) => {
    const path = column.split(".")

    const rawA = getSortValue(a, path)
    const rawB = getSortValue(b, path)

    const valueA = parseSortValue(rawA)
    const valueB = parseSortValue(rawB)

    if (valueA > valueB) return order === "asc" ? 1 : -1;
    if (valueA < valueB) return order === "asc" ? -1 : 1;
    return 0;
  });
}
