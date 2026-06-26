import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { RegisterForm } from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="site-shell">
      <Header />
      <main className="container section">
        <div className="form-shell">
          <aside className="panel">
            <p className="eyebrow">Registro automático</p>
            <h1>Registrar una página de ayuda</h1>
            <p>
              El sistema revisa si el sitio está online, responde correctamente
              y no parece una página vacía o caída. Si pasa, se publica como{" "}
              <strong>No oficial + Operativo</strong>.
            </p>
            <p>
              La revisión técnica no confirma que una página sea oficial. Para
              entender los estados, revisa{" "}
              <Link href="/verificacion">criterios de verificación</Link>.
            </p>
          </aside>
          <section className="panel">
            <RegisterForm />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
