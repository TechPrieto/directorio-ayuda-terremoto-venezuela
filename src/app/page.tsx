import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ResourceCard } from "@/components/ResourceCard";
import { categoryLabels } from "@/lib/seed-resources";
import { listResources } from "@/lib/store";

export const dynamic = "force-dynamic";

function anchorFor(category: string) {
  return category
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default async function Home() {
  const resources = await listResources();
  const groups = categoryLabels
    .map((category) => ({
      category,
      resources: resources.filter((resource) => resource.category === category),
    }))
    .filter((group) => group.resources.length > 0);
  const operational = resources.filter(
    (resource) => resource.status === "operational",
  ).length;

  return (
    <div className="site-shell">
      <Header />
      <main>
        <section className="container hero">
          <span className="eyebrow">Directorio comunitario · no oficial</span>
          <h1>
            Directorio de Páginas de Ayuda en Relación al Terremoto en Venezuela
          </h1>
          <p className="hero-copy">
            Encuentra rápido páginas para reportar, buscar personas, ubicar
            refugios, centros de acopio, apoyo médico, transporte y otros
            recursos publicados por la comunidad.
          </p>
          <div className="hero-actions">
            <a className="button" href="#necesito-ayuda">
              Necesito ayuda
            </a>
            <a className="button-secondary" href="#directorio">
              Ver directorio
            </a>
            <Link className="button-quiet" href="/registrar">
              Registrar enlace
            </Link>
          </div>
          <div className="notice">
            <strong>Importante:</strong>{" "}
            este portal reúne enlaces de ayuda. La
            etiqueta &quot;Operativo&quot; solo confirma que una página carga
            técnicamente; no confirma que sea oficial, segura o actualizada.
          </div>
        </section>

        <section className="container section" id="necesito-ayuda">
          <div className="section-header">
            <div>
              <h2>Elige lo que necesitas</h2>
            </div>
            <p>
              Cada botón te lleva a las tarjetas disponibles para esa necesidad.
              Hay {resources.length} recursos cargados y {operational} están
              marcados como operativos.
            </p>
          </div>
          <div className="need-grid">
            {groups.map((group) => (
              <a
                className="need-chip"
                href={`#${anchorFor(group.category)}`}
                key={group.category}
              >
                <span>{group.category}</span>
                <span aria-hidden="true">→</span>
              </a>
            ))}
          </div>
        </section>

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
          {groups.map((group) => (
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
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}
