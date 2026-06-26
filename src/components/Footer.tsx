import Link from "next/link";

export function Footer() {
  return (
    <>
      <footer className="footer">
        <div className="container footer-inner">
          <p>
            Directorio comunitario. No sustituye a autoridades, servicios de
            emergencia ni verificación directa.
          </p>
          <p>
            <Link href="/verificacion">Criterios de verificación</Link>
          </p>
        </div>
      </footer>
      <nav className="bottom-nav" aria-label="Accesos rápidos">
        <Link href="/">Inicio</Link>
        <Link href="/#directorio">Ayuda</Link>
        <Link href="/registrar">Registrar</Link>
      </nav>
    </>
  );
}
