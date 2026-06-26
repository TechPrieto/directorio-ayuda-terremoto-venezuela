import { Directory } from "@/components/Directory";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { InstallApp } from "@/components/InstallApp";
import { RegisterForm } from "@/components/RegisterForm";
import { categoryLabels } from "@/lib/seed-resources";
import { listResources } from "@/lib/store";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://directorio-paginas-ayuda-venezuela.vercel.app";

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
          <div className="hero-status-grid" aria-label="Estado del directorio">
            <div className="hero-status">
              <span>{resources.length}</span>
              <p>páginas cargadas</p>
            </div>
            <div className="hero-status">
              <span>{operational}</span>
              <p>operativas</p>
            </div>
            <InstallApp />
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

        <Directory
          resources={resources}
          categoryLabels={categoryLabels}
          shareUrl={SITE_URL}
        />

        <section className="container section" id="registrar-rapido">
          <div className="register-cta">
            <div className="register-cta-copy">
              <h2>¿Conoces una página que no está aquí?</h2>
              <p>
                Si hay una plataforma de ayuda que no aparece en el directorio,
                agrégala pegando su enlace. El sistema valida que esté online,
                lee la página y crea la tarjeta automáticamente.
              </p>
            </div>
            <RegisterForm />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
