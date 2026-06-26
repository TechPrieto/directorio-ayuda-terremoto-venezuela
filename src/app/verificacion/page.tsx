import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function VerificationPage() {
  return (
    <div className="site-shell">
      <Header />
      <main className="container section">
        <section className="panel">
          <p className="eyebrow">Transparencia</p>
          <h1>Estados y verificación</h1>
          <p>
            Este directorio no es una fuente oficial. Su trabajo es organizar
            enlaces útiles y mostrar señales técnicas para que las personas
            decidan mejor antes de abrir o compartir una página.
          </p>
        </section>
        <section className="section">
          <div className="resource-grid">
            <article className="panel">
              <h2>Operativo</h2>
              <p>
                El sitio respondió técnicamente y cargó contenido visible. No
                significa que sea oficial, seguro o actualizado.
              </p>
            </article>
            <article className="panel">
              <h2>No oficial</h2>
              <p>
                Estado por defecto para enlaces comunitarios. Requiere revisión
                humana antes de subir a comunitario o verificado.
              </p>
            </article>
            <article className="panel">
              <h2>Verificado</h2>
              <p>
                Recurso revisado manualmente con evidencia pública, contacto
                identificable o respaldo institucional/comunitario suficiente.
              </p>
            </article>
          </div>
        </section>
        <section className="notice">
          No guardamos reportes, nombres, cédulas, direcciones, datos de
          pacientes ni datos de personas desaparecidas. Los clicks se usan solo
          como señal anónima de uso del directorio.
        </section>
      </main>
      <Footer />
    </div>
  );
}
