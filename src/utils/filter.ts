const getFilterValue = <T>(obj: T, path: string) => {
  return path.split(".").reduce<unknown>((acc, key) => (acc as Record<string, unknown> | undefined)?.[key], obj as unknown);
};

export const filter = <T>(dataToFilter: T[], searchQuery: string, field: string): T[] => {
  if (!searchQuery) return dataToFilter;

  const lowerQuery = searchQuery.toLowerCase();

  return dataToFilter.filter(item => {
    const value = getFilterValue<T>(item, field);

    if (value == null) return false;

    return String(value).toLowerCase().includes(lowerQuery);
  });
}
