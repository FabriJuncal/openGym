# 03-slice — Calidad terminológica y cierre transversal

**Estado actual: COMPLETADO.** H-01 y H-02 se corrigieron desde las fuentes mantenibles, se regeneró el catálogo y la evidencia de cierre está en la sección 21.

## 1. Nombre del slice

Calidad terminológica y cierre transversal.

## 2. Objetivo del slice

Regenerar el catálogo español con convenciones mantenibles, corregir las traducciones incorrectas conocidas y demostrar el recorrido EN → ES → EN en todas las superficies nominales afectadas.

## 3. Problema puntual que resuelve

El problema original incluía traducciones como “Tocadores alternos del talón”, “arquero se levanta” e “inmersión en el pecho”, además de puntuación y capitalización inconsistentes y ausencia de glosario separado. Esos ejemplos ya fueron corregidos y el glosario y los overrides ya existen. La revisión posterior detectó traducciones incorrectas restantes en el plan demo y siglas que incumplen las convenciones; se detallan en la sección 21.

## 4. Valor observable que entrega

Una persona encuentra nombres reconocibles y consistentes en español en biblioteca, planificación, entrenamiento y progreso. Un desarrollador puede regenerar el pack sin perder las decisiones terminológicas ya revisadas.

## 5. Alcance específico

Versionar fuentes terminológicas mantenibles, normalizar el resultado generado, revisar un conjunto dirigido, corregir defectos conocidos y ejecutar el cierre transversal del Spec 03.

## 6. Qué incluye

- Glosario español versionado.
- Overrides separados del generador.
- Reglas documentadas de términos, puntuación, espacios y capitalización.
- Corrección de ejemplos incorrectos identificados.
- Revisión del plan demo, levantamientos principales, primera página del catálogo y nombres señalados automáticamente.
- Regeneración y validación completa del pack.
- Smoke desktop y móvil EN → ES → EN.
- Verificación de carga diferida y ausencia de cambios persistidos.

## 7. Qué no incluye

- Revisión humana individual de los 1.324 nombres.
- Traducciones a otros idiomas.
- Traducción runtime.
- Cambios de diseño o layout generales.
- Matching CSV por español.
- Cambios de nombres personalizados.
- Optimización general de chunks no relacionados.

## 8. Actores involucrados

- Persona que consulta ejercicios en español.
- Desarrollador que regenera el catálogo.
- Reviewer funcional familiarizado con terminología de entrenamiento.
- QA que realiza el smoke dirigido.

## 9. Precondiciones

- `01-slice` aplicado y probado.
- `02-slice` aplicado y capaz de rechazar packs inválidos.
- Generador actual operativo.
- Plan demo disponible para revisión funcional.
- Servidor de medios local disponible para el smoke.

## 10. Entradas necesarias

- `scripts/build-exercise-names.mjs`.
- Pack `frontend/src/exercise-names/es.js`.
- Nombres canónicos de `EXDB`.
- Lista de errores detectados en smoke.
- Plan y datos demo.
- Convenciones acordadas de español de entrenamiento.

## 11. Flujo operativo paso a paso

1. Crear el glosario y documentar convenciones de nombres.
2. Extraer los overrides a una fuente versionada separada.
3. Definir normalización automática de espacios y puntuación.
4. Preservar siglas y nombres propios mediante reglas o overrides.
5. Corregir los ejemplos incorrectos conocidos.
6. Regenerar el pack y revisar su diff.
7. Ejecutar el validador estructural del `02-slice`.
8. Revisar manualmente el conjunto dirigido y resolver hallazgos relevantes.
9. Ejecutar tests completos y build.
10. Realizar smoke EN → ES → EN en desktop y viewport móvil.

## 12. Salidas esperadas

- Glosario y overrides mantenibles.
- Catálogo regenerado sin defectos estructurales.
- Nombres conocidos corregidos.
- Reporte limpio de normalización.
- Evidencia de suite, build y smoke transversal.
- Pack español todavía separado del bundle inicial inglés.

## 13. Reglas de negocio aplicables

- Términos habituales de fuerza tienen prioridad sobre traducciones literales.
- `pull-up` se expresa como dominada y `row` como remo según sus variantes.
- `dip` se expresa como fondos cuando describe el ejercicio de empuje.
- `deadlift` se expresa como peso muerto.
- `press` se conserva cuando es el término habitual en español de entrenamiento.
- Smith, EZ y otras siglas o nombres propios conservan su forma acordada.
- Los nombres no terminan en punto y no contienen espacios sobrantes.
- Las decisiones revisadas viven en glosario u overrides, no en ediciones manuales del generado.
- Nombres iguales para IDs distintos siguen siendo válidos.

## 14. Validaciones

- Cero IDs faltantes, extras, vacíos o duplicados.
- Cero nombres con espacios iniciales o finales.
- Cero nombres con puntuación terminal no permitida.
- Los nombres conocidos incorrectos ya no aparecen en el pack.
- El plan demo y los levantamientos principales usan términos acordados.
- Búsqueda encuentra un ejercicio por español, inglés y texto sin diacríticos.
- Texto alternativo coincide con el nombre visible.
- Personalizados permanecen idénticos en EN y ES.
- El chunk español continúa separado del bundle inicial.
- El smoke final no registra errores de consola con el servidor de medios activo.

## 15. Manejo de errores o edge cases

- Una regla automática afecta una sigla o nombre propio: agregar excepción explícita y prueba.
- La traducción externa cambia entre regeneraciones: conservar las decisiones mediante overrides y revisar el diff.
- Dos variantes quedan con el mismo nombre: mantenerlas por ID y revisar sólo si la pérdida del calificador genera ambigüedad real.
- Un nombre largo desborda en móvil: ajustar el texto mediante terminología concisa o aplicar la política visual ya existente sin rediseñar.
- El servidor de medios no está activo: iniciar la dependencia antes de evaluar errores de consola de imágenes.

## 16. Criterios de aceptación

1. Existe un glosario versionado con las convenciones mínimas del spec.
2. Los overrides están separados del generador y son la fuente de las correcciones humanas.
3. El catálogo generado pasa todos los casos estructurales del validador.
4. No quedan nombres con puntuación terminal o espacios sobrantes.
5. Los errores terminológicos conocidos están corregidos.
6. La revisión dirigida cubre plan demo, levantamientos principales, primera página y hallazgos automáticos.
7. Biblioteca, detalle, selector, rutina, impresión, entrenamiento, historial, PR, 1RM y estadísticas muestran nombres coherentes en español.
8. Cambiar nuevamente a inglés restaura nombres canónicos sin modificar datos.
9. El viewport móvil revisado mantiene legibles los nombres largos seleccionados.
10. `npm run check:exercise-names`, suite completa y build terminan correctamente.
11. El smoke final registra cero errores de consola atribuibles a la aplicación con todas sus dependencias locales iniciadas.

## 17. Dependencias técnicas, funcionales o externas

- `01-slice` y `02-slice`.
- Generador y pack español.
- Vite y Vitest.
- Modo demo y servidor local de medios.
- Fuente externa de traducción sólo durante regeneración, si continúa utilizándose.
- Revisión humana dirigida.

## 18. Depende de slices

- `01-slice` — Fallback seguro para nombres no resolubles.
- `02-slice` — Validador estructural comprobable.

## 19. Riesgos / decisiones abiertas

- Aplicar reglas lingüísticas demasiado generales puede degradar nombres correctos; cualquier automatismo debe acompañarse de diff y revisión dirigida.
- El alcance lingüístico puede crecer indefinidamente; el cierre se limita al conjunto acordado y a defectos detectables con impacto real.
- La API de traducción es una herramienta de generación, no una fuente estable ni una dependencia de producción.
- El rollback consiste en revertir catálogo, glosario y generador al commit anterior; no hay datos de usuario que recuperar.

## 20. Pendientes / preguntas abiertas

- Ubicación resuelta: `scripts/exercise-names/es-glossary.mjs` y `scripts/exercise-names/es-glossary.md`.
- Registrar en el PR final el conjunto revisado y cualquier término deliberadamente conservado en inglés.

## 21. Tarea de corrección para derivar

### Objetivo y alcance de la corrección

H-01 y H-02 se completaron sin reabrir los slices 1 y 2 ni ampliar la revisión a los 1.324 nombres. No se cambiaron IDs, persistencia, nombres personalizados, otros idiomas o layout.

La última revisión ejecutó `npm test` (11 archivos, 203 tests aprobados), `npm run check:exercise-names` (`1324/1324`), `npm run build` (exitoso con aviso de tamaño de chunk ya conocido) y `git diff --check` (limpio). Fue una revisión de código, catálogo y pruebas; no repitió el smoke de navegador del cierre inicial. La suite no detectó los dos defectos siguientes.

### H-01 — Terminología incorrecta en ejercicios del plan demo

- Tipo: OBLIGATORIA. Impacto: Medio. Confianza: Alta. Estado: RESUELTO.
- Corrección aplicada: los tres valores se agregaron a `OVERRIDES` en `scripts/exercise-names/es-glossary.mjs` y se regeneró `frontend/src/exercise-names/es.js`.
- Prevención: `frontend/src/lib/i18n.test.js` valida el valor del pack y el resultado de `nameFor` para los tres IDs con español activo.

| ID | Nombre canónico | Valor actual incorrecto | Corrección esperada |
|---|---|---|---|
| `0027` | `barbell bent over row` | barra inclinada sobre remo | remo inclinado con barra |
| `1323` | `cable rope seated row` | cable cuerda fila sentada | remo sentado en polea con cuerda |
| `0241` | `cable triceps pushdown (v-bar)` | flexión de tríceps con cable (barra en V) | extensión de tríceps en polea (barra en V) |

IDs del plan demo: `0025`, `0047`, `0426`, `0334`, `0241`, `0251`, `2330`, `0027`, `1323`, `0031`, `0313`, `0043`, `0085`, `0739`, `0585`, `0586`, `0605`. Esta lista delimita el conjunto; no implica que todos sus nombres sean incorrectos. No rehacer las correcciones previas ya verificadas.

### H-02 — Siglas que incumplen el glosario

- Tipo: OBLIGATORIA. Impacto: Bajo. Confianza: Alta. Estado: RESUELTO.
- Corrección aplicada: `normalizeExerciseName` canoniza `EZ` y `BOSU` como tokens completos en cualquier posición. `properPrefixes` continúa preservando `Smith`, `TRX` y `SkiErg` cuando abren el nombre.
- Prevención: `frontend/src/lib/exercise-name-glossary.test.js` cubre las siglas al inicio, en el medio y entre paréntesis; también cubre nombres propios y fragmentos no sustituibles. El catálogo regenerado contiene cero tokens independientes `ez` o `bosu` en minúscula.

### Archivos para trabajar

- `scripts/exercise-names/es-glossary.mjs`: overrides y normalización.
- `scripts/exercise-names/es-glossary.md`: convenciones y registro del conjunto revisado.
- `frontend/src/exercise-names/es.js`: salida generada, no editar a mano.
- `frontend/src/lib/i18n.test.js`: comprobaciones de los nombres corregidos en el pack y su resolución por idioma.
- Test focalizado de `normalizeExerciseName` dentro del runner Vitest existente: agregar o extender según corresponda.
- `scripts/build-exercise-names.mjs`: reutilizar `--from-current`; modificar solo si la corrección lo necesita.

### Ejecución y comprobaciones

1. Agregar los tres overrides de H-01 y la normalización acotada de H-02. Registrar el resultado de revisar los IDs del demo en el glosario.
2. Agregar pruebas que fallen con el estado actual: valores esperados para `0027`, `1323`, `0241`; `EZ`/`BOSU` al inicio, en el medio y entre paréntesis; preservación de nombres propios ya correctos y ausencia de reemplazos dentro de otras palabras.
3. Desde la raíz, ejecutar `node scripts/build-exercise-names.mjs --from-current`. Revisar el diff y confirmar que solo cambian nombres previstos y que permanecen los 1.324 IDs. Una segunda ejecución debe producir el mismo contenido.
4. Desde `frontend/`, ejecutar `npm run check:exercise-names`, `npm test` y `npm run build`; guardar comandos, resultados y códigos de salida. Desde la raíz, ejecutar `git diff --check`.
5. Hacer un smoke dirigido EN → ES → EN con los nombres corregidos: biblioteca/búsqueda, detalle y rutina demo. Revisar en móvil la legibilidad de los nombres cambiados. Si se revisan medios, iniciar `npm run dev:media`. Registrar el resultado y cualquier error de consola atribuible al cambio. No repetir toda la regresión transversal por estas correcciones de contenido.
6. Actualizar el estado de H-01/H-02 y del slice solo después de cumplir la aceptación. Registrar la evidencia en esta sección y su equivalente JSON; conservar la evidencia anterior como antecedente, no presentarla como prueba de la nueva corrección.

### Evidencia y criterio de cierre

- Dos ejecuciones de `node scripts/build-exercise-names.mjs --from-current` produjeron el mismo SHA-1: `525b9d69f3942e24d0087eca7e6bc0fe8eb452f5`.
- `npm run check:exercise-names`: `1324/1324` válido.
- `npm test`: 12 archivos y 206 tests aprobados.
- `npm run build`: exitoso; el warning conocido de tamaño de chunk no bloquea.
- `git diff --check`: limpio.
- Smoke dirigido EN → ES → EN: búsqueda y detalle de `remo inclinado con barra`, con título e imagen `alt` coincidentes; rutina Pull Day con `remo inclinado con barra` y `remo sentado en polea con cuerda`; vista móvil 390×844 legible; consola con 0 errores y 0 warnings usando el servidor local de medios.

**Evidencia de la corrección: COMPLETA.** H-01 y H-02 están cerrados; una revisión futura debe limitarse a información nueva o a riesgos introducidos por cambios posteriores.
