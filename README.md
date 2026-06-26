# Directorio de Páginas de Ayuda en Relación al Terremoto en Venezuela

MVP mobile-first para centralizar enlaces comunitarios de ayuda, validar si los sitios están operativos, medir clicks anónimos y desplegar en Vercel.

La app es PWA instalable: incluye `manifest.webmanifest`, service worker, pantalla offline y cache básico del shell para que las personas puedan tener el directorio a la mano en el teléfono.

## Desarrollo

```bash
npm run dev
```

## Producción

Deploy recomendado: Vercel.

Variables opcionales para persistencia real:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`
- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL` opcional; default `claude-haiku-4-5-20251001`
- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL` opcional; default `openrouter/free`

Si Supabase no está configurado, la app usa datos seed y fallback local. En Vercel ese fallback vive en `/tmp`, por lo que sirve solo como prueba temporal; configurar Supabase para que los registros nuevos sean persistentes globalmente.

## Rutas

- `/` directorio
- `/registrar` registro automático de enlaces
- `/verificacion` criterios de estado y confianza
- `/go/[resourceId]` redirect medido
- `/api/resources` API de recursos
- `/api/health-check` endpoint de monitoreo. En Vercel Hobby queda diario; con Vercel Pro o scheduler externo puede correr cada 12 horas.

Los recursos externos se abren en pestaña nueva mediante `/go/[resourceId]` para no cerrar el directorio.

El registro público pide solo una URL. El backend valida que el sitio esté online, extrae título/descripción/texto visible y clasifica la tarjeta con Anthropic Haiku; si falla, usa OpenRouter; si tampoco está disponible, usa una heurística local.

## Base de datos

El esquema inicial vive en `supabase-schema.sql`.
