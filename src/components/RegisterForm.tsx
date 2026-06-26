"use client";

import { FormEvent, useState } from "react";
import { categoryLabels } from "@/lib/seed-resources";

type Result = {
  ok: boolean;
  message: string;
};

export function RegisterForm() {
  const [result, setResult] = useState<Result | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setResult(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    const response = await fetch("/api/resources", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await response.json();

    setResult({
      ok: response.ok,
      message: body.message ?? body.error ?? "No se pudo procesar el enlace.",
    });
    setSubmitting(false);

    if (response.ok && !body.duplicate) {
      form.reset();
    }
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="name">Nombre de la página</label>
        <input id="name" name="name" required minLength={2} />
      </div>
      <div className="field">
        <label htmlFor="url">URL</label>
        <input
          id="url"
          name="url"
          type="url"
          required
          placeholder="https://..."
        />
      </div>
      <div className="field">
        <label htmlFor="category">Categoría</label>
        <select id="category" name="category" required>
          {categoryLabels.map((category) => (
            <option value={category} key={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="summary">Qué hace</label>
        <textarea
          id="summary"
          name="summary"
          required
          minLength={12}
          maxLength={220}
          placeholder="Explica en una frase cómo ayuda esta página."
        />
      </div>
      <div className="field">
        <label htmlFor="zone">Zona o cobertura</label>
        <input id="zone" name="zone" placeholder="Venezuela, Caracas, etc." />
      </div>
      <div className="field">
        <label htmlFor="contact">Contacto responsable</label>
        <input
          id="contact"
          name="contact"
          placeholder="Email, Instagram, WhatsApp o nombre"
        />
      </div>
      <div className="field">
        <label htmlFor="trustClaim">Tipo de recurso</label>
        <select id="trustClaim" name="trustClaim" defaultValue="community">
          <option value="community">Comunitario / voluntario</option>
          <option value="official">Dice ser oficial</option>
          <option value="unknown">No estoy seguro</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="evidence">Evidencia opcional</label>
        <input
          id="evidence"
          name="evidence"
          placeholder="Instagram, fuente pública o referencia"
        />
      </div>
      {result ? (
        <div className={`form-result ${result.ok ? "success" : "error"}`}>
          {result.message}
        </div>
      ) : null}
      <button className="button" disabled={submitting} type="submit">
        {submitting ? "Validando sitio..." : "Registrar y validar"}
      </button>
    </form>
  );
}
