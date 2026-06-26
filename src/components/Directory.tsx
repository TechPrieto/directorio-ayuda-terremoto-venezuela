"use client";

import { useMemo, useState } from "react";
import { ResourceCard } from "@/components/ResourceCard";
import type { Resource } from "@/lib/types";

function anchorFor(category: string) {
  return category
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function Directory({
  resources,
  categoryLabels,
  shareUrl,
}: {
  resources: Resource[];
  categoryLabels: string[];
  shareUrl: string;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) {
      return resources;
    }
    return resources.filter((resource) => {
      const haystack = normalize(
        [
          resource.name,
          resource.summary,
          resource.category,
          resource.zone,
          resource.tags.join(" "),
        ].join(" "),
      );
      return haystack.includes(q);
    });
  }, [query, resources]);

  const groups = useMemo(
    () =>
      categoryLabels
        .map((category) => ({
          category,
          resources: filtered.filter(
            (resource) => resource.category === category,
          ),
        }))
        .filter((group) => group.resources.length > 0),
    [categoryLabels, filtered],
  );

  const shareDirectory = `https://wa.me/?text=${encodeURIComponent(
    `Directorio de páginas de ayuda por el terremoto en Venezuela: ${shareUrl}`,
  )}`;

  return (
    <section className="container section" id="directorio">
      <div className="section-header">
        <div>
          <h2>Directorio</h2>
        </div>
        <p>
          Los botones &quot;Abrir&quot; pasan por una ruta medida para saber qué
          recursos está usando la gente, sin guardar datos personales.
        </p>
      </div>

      <div className="directory-tools">
        <label className="search-field">
          <span className="sr-only">Buscar un recurso</span>
          <input
            type="search"
            inputMode="search"
            placeholder="Buscar: refugio, rescate, mascotas, acopio…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Buscar un recurso por necesidad"
          />
        </label>
        <a
          className="button-quiet share-all"
          href={shareDirectory}
          target="_blank"
          rel="noopener noreferrer"
        >
          Compartir directorio
        </a>
      </div>

      {groups.length === 0 ? (
        <p className="empty-state">
          No hay recursos que coincidan con &quot;{query}&quot;. Prueba con otra
          palabra o revisa todas las categorías.
        </p>
      ) : (
        groups.map((group) => (
          <div
            className="resource-group"
            id={anchorFor(group.category)}
            key={group.category}
          >
            <div className="resource-group-title">
              <h3>{group.category}</h3>
              <span className="resource-count">
                {group.resources.length} enlaces
              </span>
            </div>
            <div className="resource-grid">
              {group.resources.map((resource) => (
                <ResourceCard resource={resource} key={resource.id} />
              ))}
            </div>
          </div>
        ))
      )}
    </section>
  );
}
