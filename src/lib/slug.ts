export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function idFromNameAndUrl(name: string, url: string) {
  const host = new URL(url).hostname.replace(/^www\./, "");
  return slugify(`${name}-${host}`);
}
