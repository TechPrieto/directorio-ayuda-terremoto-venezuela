"use client";

import { FormEvent, useState } from "react";

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
        <label htmlFor="url">Enlace de la página</label>
        <input
          id="url"
          name="url"
          type="url"
          required
          inputMode="url"
          autoComplete="url"
          placeholder="https://ejemplo.com"
        />
      </div>
      <p className="form-help">
        Pegas el enlace. El sistema valida que esté online, lee la página y
        detecta nombre, categoría, resumen y etiquetas automáticamente.
      </p>
      {result ? (
        <div className={`form-result ${result.ok ? "success" : "error"}`}>
          {result.message}
        </div>
      ) : null}
      <button className="button" disabled={submitting} type="submit">
        {submitting ? "Validando y clasificando..." : "Registrar enlace"}
      </button>
    </form>
  );
}
