import { categoryLabels } from "./seed-resources";
import type { ClassifiedResource, ValidationResult } from "./types";

type RawClassification = Partial<Omit<ClassifiedResource, "source">>;

function cleanJson(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const raw = fenced ?? text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in model response.");
  }
  return raw.slice(start, end + 1);
}

function normalizeClassification(
  raw: RawClassification,
  validation: ValidationResult,
  source: ClassifiedResource["source"],
): ClassifiedResource {
  const category = categoryLabels.includes(raw.category ?? "")
    ? raw.category ?? "Centros de acopio"
    : inferCategory(`${validation.pageTitle ?? ""} ${validation.pageText ?? ""}`);

  return {
    name:
      raw.name?.trim().slice(0, 80) ||
      validation.pageTitle?.trim().slice(0, 80) ||
      new URL(validation.normalizedUrl).hostname.replace(/^www\./, ""),
    category,
    summary:
      raw.summary?.trim().slice(0, 180) ||
      validation.pageDescription?.trim().slice(0, 180) ||
      "Página comunitaria relacionada con ayuda por el terremoto en Venezuela.",
    zone: raw.zone?.trim().slice(0, 60) || "Venezuela",
    tags: Array.isArray(raw.tags)
      ? raw.tags.map(String).map((tag) => tag.trim()).filter(Boolean).slice(0, 4)
      : ["No oficial", "Nuevo recurso"],
    confidence:
      typeof raw.confidence === "number"
        ? Math.max(0, Math.min(1, raw.confidence))
        : source === "heuristic"
          ? 0.45
          : 0.7,
    source,
  };
}

function inferCategory(text: string) {
  const value = text.toLowerCase();
  const checks: Array<[string, string[]]> = [
    ["Personas desaparecidas", ["desaparecid", "busca", "persona"]],
    ["Logística y transporte", ["grua", "grúa", "gruero", "transporte", "logística", "logistica", "traslado", "movilidad"]],
    ["Daños estructurales", ["daño", "estructura", "vivienda", "edificio"]],
    ["Rescate y apoyo presencial", ["rescate", "voluntario", "brigada"]],
    ["Inspección de habitabilidad", ["habitable", "ingenier", "inspección"]],
    ["Centros de acopio", ["acopio", "donación", "donacion", "donaciones", "centro de ayuda", "punto de ayuda"]],
    ["Insumos por zona", ["insumos", "requeridos", "necesitan"]],
    ["Alimentación", ["aliment", "comida", "agua"]],
    ["Refugios y alojamiento", ["refugio", "alojamiento", "zona segura"]],
    ["Pacientes en hospitales", ["paciente", "hospital", "clínica"]],
    ["Mascotas", ["mascota", "perro", "gato", "huella"]],
    ["Apoyo médico y psicológico", ["médico", "medico", "psicol", "emergencia"]],
  ];

  return checks.find(([, words]) => words.some((word) => value.includes(word)))?.[0] ?? "Centros de acopio";
}

function buildPrompt(validation: ValidationResult) {
  return `Clasifica esta página para un directorio comunitario de ayuda por el terremoto en Venezuela.

Devuelve SOLO JSON válido con esta forma:
{
  "name": "nombre corto de la página",
  "category": "una de las categorías permitidas",
  "summary": "qué resuelve en máximo 160 caracteres",
  "zone": "zona o Venezuela",
  "tags": ["2 a 4 etiquetas cortas"],
  "confidence": 0.0
}

Categorías permitidas:
${categoryLabels.map((category) => `- ${category}`).join("\n")}

Reglas de clasificación:
- Usa "Logística y transporte" para grúas, traslados, movilidad, transporte, rutas, envíos o coordinación logística.
- Usa "Centros de acopio" solo cuando el objetivo principal sea recibir, ubicar o coordinar donaciones, puntos de acopio o insumos.
- La palabra "ayuda" por sí sola no implica "Centros de acopio"; prioriza la función real de la página.
- Si una página puede servir a varias categorías, escoge la categoría principal más específica.

URL: ${validation.normalizedUrl}
Título: ${validation.pageTitle ?? "No disponible"}
Descripción: ${validation.pageDescription ?? "No disponible"}
Texto visible:
${validation.pageText?.slice(0, 3500) ?? "No disponible"}`;
}

async function classifyWithAnthropic(validation: ValidationResult) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY missing.");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001",
      max_tokens: 500,
      temperature: 0,
      messages: [{ role: "user", content: buildPrompt(validation) }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic failed: ${response.status}`);
  }

  const body = await response.json();
  const text = body.content?.find((item: { type: string }) => item.type === "text")?.text;
  if (!text) throw new Error("Anthropic returned no text.");
  return normalizeClassification(JSON.parse(cleanJson(text)), validation, "anthropic");
}

async function classifyWithOpenRouter(validation: ValidationResult) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY missing.");

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
      "http-referer": process.env.NEXT_PUBLIC_SITE_URL ?? "https://directorio-ayuda-terremoto-venezuel.vercel.app",
      "x-title": "Directorio Ayuda Terremoto Venezuela",
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL ?? "google/gemma-4-26b-a4b-it:free",
      temperature: 0,
      messages: [{ role: "user", content: buildPrompt(validation) }],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter failed: ${response.status}`);
  }

  const body = await response.json();
  const text = body.choices?.[0]?.message?.content;
  if (!text) throw new Error("OpenRouter returned no text.");
  return normalizeClassification(JSON.parse(cleanJson(text)), validation, "openrouter");
}

function classifyHeuristically(validation: ValidationResult): ClassifiedResource {
  const combined = `${validation.pageTitle ?? ""} ${validation.pageDescription ?? ""} ${validation.pageText ?? ""}`;
  const category = inferCategory(combined);
  return normalizeClassification(
    {
      name: validation.pageTitle ?? new URL(validation.normalizedUrl).hostname.replace(/^www\./, ""),
      category,
      summary:
        validation.pageDescription ??
        "Página comunitaria relacionada con ayuda por el terremoto en Venezuela.",
      zone: "Venezuela",
      tags: ["No oficial", "Nuevo recurso"],
      confidence: 0.45,
    },
    validation,
    "heuristic",
  );
}

export async function classifyResource(validation: ValidationResult) {
  try {
    return await classifyWithAnthropic(validation);
  } catch {
    try {
      return await classifyWithOpenRouter(validation);
    } catch {
      return classifyHeuristically(validation);
    }
  }
}
