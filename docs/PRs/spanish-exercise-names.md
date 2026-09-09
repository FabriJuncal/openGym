# [N/A] Slice: nombres de ejercicios en español

## Resumen

Localiza los nombres de los 1.324 ejercicios incorporados cuando la aplicación usa español, sin cambiar IDs, datos persistidos ni nombres personalizados. La búsqueda reconoce español, inglés y texto sin diacríticos; todas las superficies visibles usan el resolver centralizado y el catálogo queda validado y mantenible.

El cambio incluye fallbacks seguros para historial y PRs, un validador estructural del catálogo, glosario y overrides versionados, y correcciones terminológicas del plan demo.

## Tipo de cambio

- [x] 🚀 Feature
- [x] 🐛 Bugfix
- [x] 📝 Documentación
- [ ] ♻️ Refactor
- [ ] ⚡ Performance
- [ ] 🔒 Security
- [x] 🧪 Tests

## Slice Definition

### Objetivo

Mostrar nombres de ejercicios reconocibles en español al cambiar el idioma, manteniendo inglés como nombre canónico y garantizando fallbacks para datos históricos o incompletos.

### Incluye

- [x] Pack español diferido con 1.324 nombres y resolver `nameFor`.
- [x] Búsqueda bilingüe, superficies visibles y texto alternativo localizados.
- [x] Fallback para ejercicios ausentes, snapshots y personalizados.
- [x] Validador de catálogo para faltantes, extras, vacíos, duplicados, espacios y puntuación.
- [x] Glosario, overrides, generación determinista y correcciones del plan demo.

### Excluye

- [ ] Traducción de ejercicios personalizados o de otros idiomas.
- [ ] Cambios de IDs, persistencia, importación CSV o layout general.
- [ ] Auditoría humana individual de los 1.324 nombres.

## Checklist

### Código

- [x] Tests agregados/actualizados.
- [ ] Lint pasa sin errores — el repositorio no define un script de lint.
- [ ] Types sin errores — el repositorio no define chequeo de tipos.
- [x] Build pasa correctamente.

### Documentación

- [x] README actualizado.
- [x] Specs y slices actualizados.
- [ ] CHANGELOG actualizado — no aplica.

### Despliegue

- [ ] Migraciones creadas — no aplica.
- [ ] Variables de entorno documentadas — no aplica.
- [ ] Notas de despliegue agregadas — no aplican cambios de infraestructura.

## Cómo Probar (DETTALLADO - OBLIGATORIO)

> **⚠️ IMPORTANTE:** Esta sección debe ser tan detallada que cualquier miembro del equipo pueda probar el feature sin ayuda adicional.

### Precondiciones

- Node y las dependencias de `frontend` instaladas.
- El directorio `media/` disponible si se verifican miniaturas y animaciones locales.

1. **Validar el catálogo y las pruebas:**

   ```bash
   cd frontend
   npm run check:exercise-names
   npm test
   npm run build
   ```

   El chequeo debe informar `Spanish exercise names valid: 1324/1324`. La suite debe finalizar con 12 archivos y 206 tests aprobados; el build debe terminar correctamente.

2. **Verificar una regeneración determinista:**

   ```bash
   node scripts/build-exercise-names.mjs --from-current
   shasum frontend/src/exercise-names/es.js
   node scripts/build-exercise-names.mjs --from-current
   shasum frontend/src/exercise-names/es.js
   ```

   Ambos hashes deben coincidir. El catálogo generado no se edita manualmente.

3. **Verificar el flujo visible:**

   En una terminal:

   ```bash
   cd frontend
   npm run dev:media
   ```

   En otra terminal:

   ```bash
   cd frontend
   VITE_DEMO=1 npm run dev
   ```

   Abrir Ajustes y cambiar de inglés a español. En Ejercicios buscar `remo inclinado con barra`, abrir el detalle y confirmar que el título y el texto alternativo de la imagen coinciden. En Plan abrir Pull Day y confirmar `remo inclinado con barra` y `remo sentado en polea con cuerda`. Cambiar nuevamente a inglés y confirmar que reaparecen los nombres canónicos.

4. **Verificar móvil:**

   Con el idioma español activo, usar un viewport de 390 × 844 y comprobar que los nombres de Pull Day siguen legibles y no se superponen.

## Evidencia ejecutada

- `npm run check:exercise-names`: 1324/1324 válido.
- `npm test`: 12 archivos y 206 tests aprobados.
- `npm run build`: exitoso.
- Dos regeneraciones consecutivas: SHA-1 `525b9d69f3942e24d0087eca7e6bc0fe8eb452f5`.
- Smoke EN → ES → EN de biblioteca/búsqueda, detalle y rutina Pull Day; viewport móvil revisado; consola con 0 errores y 0 warnings.

## Riesgos y rollback

- El pack español es un artefacto generado. Cambios terminológicos deben hacerse en el glosario u overrides y regenerar el archivo.
- El build conserva un warning conocido de tamaño de chunk que queda fuera de este alcance.
- Rollback: revertir el commit completo; no hay migraciones ni datos de usuario que recuperar.
