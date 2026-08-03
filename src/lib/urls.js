export function withBase(path, base = import.meta.env.BASE_URL || "/") {
  const cleanBase = base.endsWith("/") ? base : `${base}/`;
  return `${cleanBase}${path.replace(/^\//, "")}`;
}
