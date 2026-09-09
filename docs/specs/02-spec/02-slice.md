# 02-slice — Nombres localizados en planificación

## 1. Nombre del slice

Nombres localizados en planificación.

## 2. Objetivo del slice

Extender el nombre español centralizado a la selección y configuración de ejercicios, las rutinas y el plan imprimible, sin cambiar los datos compartidos o persistidos.

## 3. Problema puntual que resuelve

Después de localizar biblioteca y detalle, el selector de ejercicios, las rutinas, los mensajes de planificación y el PDF continuarían mostrando `ex.n` en inglés, generando inconsistencias dentro del mismo flujo.

## 4. Valor observable que entrega

Una persona puede buscar, seleccionar, agregar, configurar y revisar ejercicios de una rutina en español, y generar un plan imprimible con esos nombres, mientras el archivo compartido conserva su formato actual.

## 5. Alcance específico

Aplicar `nameFor(ex)` y la búsqueda bilingüe a todas las superficies del flujo de planificación, incluyendo el HTML imprimible, preservando IDs y serialización.

## 6. Qué incluye

- Selector de ejercicios y su buscador.
- Ordenamiento visible del selector por nombre localizado cuando corresponda.
- Hoja para agregar un ejercicio a una rutina.
- Mensajes y toasts de agregado, configuración y eliminación.
- Lista y configuración de ejercicios de una rutina.
- Nombre del ejercicio en el plan imprimible/PDF.
- Validación de que los bundles compartidos no incorporen nombres localizados de ejercicios incluidos.
- Smoke dirigido del flujo de planificación EN → ES → EN.

## 7. Qué no incluye

- Entrenamiento activo.
- Historial de entrenamientos.
- Estadísticas o resúmenes de PR.
- Cambios al formato `opengym_plan`.
- Traducción de nombres de rutinas.
- Traducción adicional de body parts, equipo o descripciones.
- Matching de importaciones CSV por español.

## 8. Actores involucrados

- Persona que crea o edita una rutina.
- Persona que comparte o imprime un plan.
- Persona que importa un plan existente.
- Desarrollador implementador.

## 9. Precondiciones

- `01-slice` implementado y validado.
- `nameFor(ex)` disponible.
- Helper de búsqueda bilingüe disponible o definido por el primer slice.
- El formato vigente de planes compartidos se mantiene como contrato.

## 10. Entradas necesarias

- `frontend/src/sheets.jsx`.
- `frontend/src/views/RoutineEdit.jsx`.
- `frontend/src/lib/plan-share.js`.
- `nameFor(ex)` y normalización de búsqueda del `01-slice`.
- Rutinas y ejercicios personalizados del store.

## 11. Flujo operativo paso a paso

1. Abrir el selector de ejercicios desde una rutina con idioma español.
2. Aplicar la búsqueda bilingüe y mostrar cada resultado mediante `nameFor(ex)`.
3. Usar el nombre localizado en la hoja y el toast de agregado.
4. Mostrar el nombre localizado al listar y configurar ejercicios de la rutina.
5. Usar el nombre localizado en confirmaciones que sólo presentan datos al usuario.
6. Resolver nombres por ID al generar el HTML imprimible.
7. Mantener `buildPlanBundle`, `parsePlan` y `mergePlan` sin nombres localizados para ejercicios incluidos.
8. Verificar vuelta a inglés, ejercicio personalizado y ejercicio no resoluble.
9. Ejecutar pruebas dirigidas, suite existente, build y smoke del flujo.

## 12. Salidas esperadas

- Selector y buscador de planificación localizados.
- Rutinas y hojas de configuración con nombres españoles.
- Mensajes y toasts coherentes con el idioma.
- PDF o vista imprimible con nombres españoles.
- Bundle compartido compatible y sin datos localizados adicionales.
- Evidencia del flujo EN → ES → EN.

## 13. Reglas de negocio aplicables

- Las rutinas continúan guardando el ID y la configuración, no el nombre localizado.
- Los ejercicios incluidos del bundle compartido se identifican sólo por ID.
- Los ejercicios personalizados conservan y comparten su propio campo `n`.
- La importación de un plan existente no depende del idioma activo.
- Los placeholders no resolubles deben seguir siendo visibles y removibles.
- El PDF refleja el idioma activo al momento de generarse.

## 14. Validaciones

- El selector encuentra un ejercicio por nombre español e inglés.
- Los resultados muestran nombre español con idioma `es` y canónico con `en`.
- Agregar un ejercicio produce título y toast con el nombre visible correcto.
- Rutina y configuración muestran el mismo nombre para un mismo ID.
- Un ejercicio personalizado mantiene su nombre original.
- Un ID no resoluble muestra el placeholder existente sin romper la rutina.
- El HTML imprimible contiene el nombre localizado y lo escapa correctamente.
- Un bundle construido antes y después del cambio mantiene el mismo contrato para ejercicios incluidos.
- Un plan existente puede parsearse y fusionarse sin depender del idioma.

## 15. Manejo de errores o edge cases

- Si falta una traducción en runtime, todas las superficies usan el nombre canónico.
- Si el ejercicio es personalizado, el selector, la rutina y el PDF usan su nombre guardado.
- Si el ID no puede resolverse, se conserva el fallback visible actual.
- Si un nombre contiene caracteres que requieren escape HTML, el PDF no debe interpretarlos como markup.
- Si dos traducciones visibles coinciden, la selección y configuración continúan ligadas al ID elegido.

## 16. Criterios de aceptación

1. Con idioma español, selector, agregado, rutina y configuración muestran nombres españoles de ejercicios incluidos.
2. El selector encuentra un ejercicio usando su nombre español o inglés.
3. Títulos, confirmaciones y toasts del flujo usan el mismo nombre visible.
4. El plan imprimible generado en español contiene nombres españoles correctamente escapados.
5. Al volver a inglés, las mismas superficies muestran los nombres canónicos.
6. Los ejercicios personalizados no cambian de nombre.
7. Rutinas, bundles compartidos e importaciones no incorporan ni requieren nombres localizados para ejercicios incluidos.
8. Un ejercicio no resoluble sigue siendo visible y removible.
9. Suite existente y build finalizan correctamente.

## 17. Dependencias técnicas, funcionales o externas

- `nameFor(ex)` y búsqueda normalizada del `01-slice`.
- Store de rutinas y ejercicios personalizados.
- `EXIDX` y `exOr`.
- Generador HTML de `plan-share.js`.
- Vitest y build de Vite.

## 18. Depende de slices

- `01-slice` — Catálogo español en biblioteca y detalle.

## 19. Riesgos / decisiones abiertas

- Mutar accidentalmente la serialización al sustituir nombres visibles.
- Dejar una superficie secundaria del flujo usando `ex.n`.
- Introducir HTML no escapado al imprimir una traducción.
- Nombres extensos en la fila de rutina o en el PDF.

## 20. Pendientes / preguntas abiertas

- Ninguno bloqueante.
- La traducción de otros metadatos del PDF permanece fuera de alcance.
