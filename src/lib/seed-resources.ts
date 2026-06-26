import type { Resource } from "./types";

const now = new Date().toISOString();

export const categoryLabels = [
  "Personas desaparecidas",
  "Daños estructurales",
  "Rescate y apoyo presencial",
  "Inspección de habitabilidad",
  "Centros de acopio",
  "Insumos por zona",
  "Alimentación",
  "Refugios y alojamiento",
  "Pacientes en hospitales",
  "Mascotas",
  "Logística y transporte",
  "Apoyo médico y psicológico",
];

const baseResources = [
  ["venezuelareporta", "Venezuela Reporta", "https://venezuelareporta.org", "Personas desaparecidas", "Reporte y consulta de personas afectadas o desaparecidas.", "Reportar,Buscar"],
  ["venezuelatebusca", "Venezuela Te Busca", "https://venezuelatebusca.com", "Personas desaparecidas", "Búsqueda y registro de personas desaparecidas.", "Buscar,Reportar"],
  ["desaparecidos-terremoto-venezuela", "Desaparecidos Terremoto Venezuela", "https://desaparecidosterremotovenezuela.com", "Personas desaparecidas", "Página comunitaria para centralizar reportes de desaparecidos.", "Comunitario,Reportar"],
  ["terremoto-venezuela", "Terremoto Venezuela", "https://terremotovenezuela.com", "Daños estructurales", "Reporte de daños estructurales y situaciones de riesgo.", "Daños,Reporte"],
  ["tilinapp", "Tilin App", "https://tilinapp.com", "Daños estructurales", "Herramienta para reportes y coordinación de ayuda.", "Reporte,App"],
  ["centinela", "Centinela", "https://app.appcentinela.com/instalar", "Daños estructurales", "Instalación de app para reportar daños o solicitar inspección.", "Instalar,App"],
  ["rescate-ve", "Rescate VE", "https://rescate-ve.vercel.app", "Rescate y apoyo presencial", "Coordinación de apoyo presencial, rescate, logística y transporte.", "Rescate,Transporte,Voluntarios"],
  ["habitable", "Habitable", "https://habitable.lovable.app", "Inspección de habitabilidad", "Registro para inspección de habitabilidad por ingenieros.", "Ingenieros,Vivienda"],
  ["grupo-avila", "Grupo Ávila", "https://www.instagram.com/grupoavila.ve", "Inspección de habitabilidad", "Canal social de apoyo técnico para habitabilidad.", "Instagram,Ingenieros"],
  ["ayuda-para-venezuela", "Ayuda para Venezuela", "https://ayudaparavenezuela.com", "Centros de acopio", "Centros de acopio e insumos requeridos por zona.", "Acopio,Insumos,Zonas"],
  ["veneconnect-apoyo-terremoto", "Veneconnect Apoyo Terremoto", "https://www.veneconnect.com/apoyo-terremoto", "Centros de acopio", "Recursos y puntos de apoyo para la emergencia.", "Acopio,Ayuda"],
  ["tugruero", "Tu Gruero", "https://tugruero.com", "Centros de acopio", "Apoyo logístico y conexiones de transporte disponibles.", "Transporte,Logística"],
  ["zona-segura", "Zona Segura", "https://zonasegura.up.railway.app", "Refugios y alojamiento", "Ubicación de zonas seguras, refugios y puntos de apoyo.", "Mapa,Refugios"],
  ["refugios-venezuela", "Refugios Venezuela", "https://refugiosvenezuela.com", "Refugios y alojamiento", "Refugios, alojamiento y centros de alimentación.", "Refugios,Alimentación"],
  ["pacientes-terremoto-vzla", "Pacientes Terremoto VZLA", "https://pacientesterremotovzla.lovable.app", "Pacientes en hospitales", "Consulta y registro de pacientes en hospitales.", "Hospitales,Pacientes"],
  ["huellascan-terremoto", "Huellascan Terremoto", "https://www.huellascan.com/terremoto", "Mascotas", "Información de mascotas perdidas, encontradas o afectadas.", "Mascotas,Buscar"],
  ["nueveonce", "NueveOnce", "https://www.nueveonce.com", "Apoyo médico y psicológico", "Apoyo médico, psicológico y orientación de emergencia.", "Médico,Psicológico"],
  ["venemergencia", "Venemergencia", "https://venemergencia.com", "Apoyo médico y psicológico", "Servicios y orientación de atención médica de emergencia.", "Médico,Emergencia"],
] as const;

export const seedResources: Resource[] = baseResources.map(
  ([id, name, url, category, summary, tags]) => ({
    id,
    name,
    url,
    category,
    summary,
    zone: "Venezuela",
    tags: tags.split(","),
    status: "operational",
    trust: "unofficial",
    clicks24h: 0,
    clicks7d: 0,
    createdAt: now,
    lastCheckedAt: null,
    lastManualReviewAt: null,
    responseMs: null,
    failureReason: null,
    consecutiveFailures: 0,
  }),
);
