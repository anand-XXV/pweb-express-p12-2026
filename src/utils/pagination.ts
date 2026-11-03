export function getPagination(pageInput?: string, limitInput?: string) {
  const page = Math.max(1, Number.parseInt(pageInput ?? "1", 10) || 1);
  const limit = Math.max(1, Number.parseInt(limitInput ?? "10", 10) || 10);
  return { page, limit, skip: (page - 1) * limit };
}
