export const filterByKey = <T, K extends keyof T>(
  prev: T[],
  next: T[],
  key: K
) => {
  const prevIds = new Set(prev.map(x => x[key]));
  const nextIds = new Set(next.map(x => x[key]));

  const added = next.filter(x => !prevIds.has(x[key]));
  const removed = prev.filter(x => !nextIds.has(x[key]));

  return { added, removed };
};