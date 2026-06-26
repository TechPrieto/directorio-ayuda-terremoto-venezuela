# Directorio de Páginas de Ayuda en Relación al Terremoto en Venezuela

MVP mobile-first para centralizar enlaces comunitarios de ayuda, validar si los sitios están operativos, medir clicks anónimos y desplegar en Vercel.

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

Si Supabase no está configurado, la app usa datos seed y fallback local. En Vercel ese fallback vive en `/tmp`, por lo que sirve solo como prueba temporal; configurar Supabase para que los registros nuevos sean persistentes globalmente.

## Rutas

- `/` directorio
- `/registrar` registro automático de enlaces
- `/verificacion` criterios de estado y confianza
- `/go/[resourceId]` redirect medido
- `/api/resources` API de recursos
- `/api/health-check` endpoint de monitoreo. En Vercel Hobby queda diario; con Vercel Pro o scheduler externo puede correr cada 12 horas.

## Base de datos

El esquema inicial vive en `supabase-schema.sql`.
