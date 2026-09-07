# [N/A] Slice: entrega confiable de medios de ejercicios

## Resumen

Corrige la entrega de imágenes y animaciones de ejercicios en Vercel usando el CDN versionado del dataset. Añade una guarda del bundle para evitar que vuelvan rutas relativas no publicadas y un servidor local de medios para el desarrollo con Vite.

## Tipo de cambio

- [ ] 🚀 Feature
- [x] 🐛 Bugfix
- [x] 📝 Documentación
- [ ] ♻️ Refactor
- [ ] ⚡ Performance
- [ ] 🔒 Security
- [x] 🧪 Tests

## Slice Definition

### Objetivo

Servir JPG y GIF de ejercicios correctamente en Vercel y en el entorno local sin copiar los medios al bundle de producción.

### Incluye

- [x] Build de Vercel con bases jsDelivr fijadas por commit.
- [x] Guarda que verifica las bases CDN y la ausencia de medios copiados.
- [x] Servidor local `npm run dev:media` y documentación de uso.
- [x] Specs y slices de implementación actualizados.

### Excluye

- [ ] Caché offline de medios CDN.
- [ ] Subida de medios para ejercicios personalizados.
- [ ] Cambios de Docker, API, datos o aplicaciones nativas.

## Checklist

### Código

- [x] Tests agregados/actualizados — guarda de build `verify:vercel-media`.
- [ ] Lint pasa sin errores — el repositorio no define un script de lint.
- [ ] Types sin errores — el repositorio no define chequeo de tipos.
- [x] Build pasa correctamente — `npm run build:vercel`.

### Documentación

- [ ] README actualizado — no aplica.
- [x] Docs de API actualizadas (si aplica) — no aplica; se actualizó `CONTRIBUTING.md`.
- [ ] CHANGELOG actualizado (si aplica) — no aplica.

### Despliegue

- [ ] Migraciones creadas (si aplica) — no aplica.
- [x] Variables de entorno documentadas — `MEDIA_PORT` y `MEDIA_TARGET` están documentadas.
- [x] Notas de despliegue agregadas — el build de Vercel usa `build:vercel`.

## Cómo Probar (DETTALLADO - OBLIGATORIO)

> **⚠️ IMPORTANTE:** Esta sección debe ser tan detallada que cualquier miembro del equipo pueda probar el feature sin ayuda adicional.

### Precondiciones

- Node y dependencias de `frontend` instaladas.
- `media/img` y `media/gif` disponibles para la prueba local.
- Para validar Vercel, acceso al proyecto vinculado.

1. **Variables de entorno:**

   ```bash
   # Valores por defecto; sólo son necesarios si se usa otro puerto local.
   MEDIA_PORT=8888
   MEDIA_TARGET=http://127.0.0.1:8888
   ```

2. **Validar el build de Vercel:**

   ```bash
   cd frontend
   npm run build:vercel
   ```

   Debe finalizar con: `Vercel media build points to the pinned CDN; local media was not copied.`

3. **Validar medios en desarrollo local:**

   En una terminal:

   ```bash
   cd frontend
   npm run dev:media
   ```

   En otra terminal:

   ```bash
   cd frontend
   npm run dev
   ```

   Abrir la biblioteca, confirmar que las miniaturas cargan, abrir un ejercicio incluido y tocar su GIF para cambiarlo al JPG.

4. **Validar producción o preview:**

   Abrir la biblioteca del deployment, comprobar una miniatura y el GIF del detalle en DevTools. Las URLs deben empezar con el CDN jsDelivr versionado y no con `/img/` o `/gif/` en el dominio de Vercel.

## Evidencia ejecutada

- `npm test`: 192 tests pasaron.
- `npm run build:vercel`: pasó local y en Vercel.
- Muestra CDN JPG/GIF: `200`, `image/jpeg` y `image/gif`.
- Smoke local y productivo: 40 miniaturas sin roturas; GIF y alternancia a JPG correctos.

## Riesgos y rollback

- Los medios web dependen de jsDelivr; se usa una revisión inmutable y una guarda de build.
- La PWA web no cachea actualmente medios cross-origin para uso offline; queda fuera de este cambio.
- Rollback: promover el deployment productivo anterior de Vercel si la verificación post-release falla.
