import type { Resource } from "@/lib/types";

const statusLabel = {
  operational: "Operativo",
  degraded: "Con problemas",
  down: "Caído",
};

const trustLabel = {
  unofficial: "No oficial",
  community: "Comunitario",
  verified: "Verificado",
};

// Tags que son acciones (ya viven en los botones) o duplican el estado:
// no deben aparecer como etiqueta porque confunden y no aportan.
const hiddenTags = new Set(["reportar", "operativo", "con problemas", "caido"]);

function usageLabel(resource: Resource) {
  if (resource.clicks24h >= 25) return "Alto uso hoy";
  if (resource.clicks24h > 0) return "Usado recientemente";
  if (resource.clicks7d > 0) return "Uso esta semana";
  return "Sin uso reciente";
}

function ShareIcon() {
  return (
    <svg className="btn-icon" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.945C.16 5.335 5.495 0 12.057 0c3.18 0 6.167 1.24 8.413 3.488a11.82 11.82 0 0 1 3.48 8.413c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.683-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}

function ReportIcon() {
  return (
    <svg
      className="btn-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}

export function ResourceCard({ resource }: { resource: Resource }) {
  const tags = resource.tags.filter(
    (tag) => !hiddenTags.has(tag.trim().toLowerCase()),
  );

  return (
    <article className="card">
      <div className="card-head">
        <h4>{resource.name}</h4>
        <span
          className="status-pill"
          aria-label={`Estado: ${statusLabel[resource.status]}`}
        >
          <span className={`dot status-${resource.status}`} aria-hidden="true" />
          {statusLabel[resource.status]}
        </span>
      </div>
      <p>{resource.summary}</p>
      <div className="tag-row">
        <span className="tag">{trustLabel[resource.trust]}</span>
        {tags.slice(0, 3).map((tag) => (
          <span className="tag" key={tag}>
            {tag}
          </span>
        ))}
      </div>
      <div className="meta-list">
        <span>
          <strong>Zona:</strong> {resource.zone}
        </span>
        <span>
          <strong>Uso:</strong> {usageLabel(resource)}
        </span>
        <span>
          <strong>Revisión:</strong>{" "}
          {resource.lastCheckedAt
            ? new Intl.DateTimeFormat("es", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(resource.lastCheckedAt))
            : "pendiente"}
        </span>
      </div>
      <div className="card-actions">
        <a
          className="button"
          href={`/go/${resource.id}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Abrir ${resource.name}`}
        >
          Abrir
        </a>
        <a
          className="button-quiet"
          href={`https://wa.me/?text=${encodeURIComponent(
            `${resource.name} (${resource.category}) — ${resource.summary} ${resource.url}`,
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Compartir ${resource.name} por WhatsApp`}
        >
          <ShareIcon />
          Compartir
        </a>
        <a
          className="button-quiet"
          href={`mailto:?subject=Revisar recurso ${encodeURIComponent(
            resource.name,
          )}&body=${encodeURIComponent(resource.url)}`}
          aria-label={`Reportar un problema con ${resource.name}`}
        >
          <ReportIcon />
          Reportar
        </a>
      </div>
    </article>
  );
}
