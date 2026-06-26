import type { Resource } from "@/lib/types";

const statusLabel = {
  operational: "Operativo",
  degraded: "Con problemas",
  down: "No disponible",
};

const trustLabel = {
  unofficial: "No oficial",
  community: "Comunitario",
  verified: "Verificado",
};

function usageLabel(resource: Resource) {
  if (resource.clicks24h >= 25) return "Alto uso hoy";
  if (resource.clicks24h > 0) return "Usado recientemente";
  if (resource.clicks7d > 0) return "Uso esta semana";
  return "Sin uso reciente";
}

export function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <article className="card">
      <div className="card-head">
        <h4>{resource.name}</h4>
        <span
          className={`status-dot status-${resource.status}`}
          aria-label={`Estado: ${statusLabel[resource.status]}`}
          title={statusLabel[resource.status]}
        />
      </div>
      <p>{resource.summary}</p>
      <div className="tag-row">
        <span className="tag">{statusLabel[resource.status]}</span>
        <span className="tag">{trustLabel[resource.trust]}</span>
        {resource.tags.slice(0, 3).map((tag) => (
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
          Compartir
        </a>
        <a
          className="button-quiet"
          href={`mailto:?subject=Revisar recurso ${encodeURIComponent(
            resource.name,
          )}&body=${encodeURIComponent(resource.url)}`}
        >
          Reportar
        </a>
      </div>
    </article>
  );
}
