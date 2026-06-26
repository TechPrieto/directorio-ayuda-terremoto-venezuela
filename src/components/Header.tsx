import Link from "next/link";

export function Header() {
  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <Link className="brand" href="/">
          <span className="brand-mark">VE</span>
          <span className="brand-text">Directorio de ayuda</span>
        </Link>
        <nav className="nav-actions" aria-label="Navegación principal">
          <Link className="nav-link" href="/#directorio">
            Directorio
          </Link>
          <Link className="nav-link" href="/verificacion">
            Verificación
          </Link>
          <Link className="button-secondary" href="/registrar">
            Registrar enlace
          </Link>
        </nav>
      </div>
    </header>
  );
}
