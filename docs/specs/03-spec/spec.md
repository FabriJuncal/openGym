# Spec 03 — Hardening de nombres de ejercicios en español

## Estado actual y derivación

**Estado: COMPLETADO.** La verificación posterior al cierre inicial encontró dos hallazgos en `03-slice`; H-01 y H-02 fueron corregidos desde sus fuentes mantenibles, regenerados y verificados.

- `01-slice` y `02-slice`: sin hallazgos pendientes en la revisión realizada. No requieren reimplementación.
- `03-slice`: completado. Los tres nombres del plan demo se corrigen mediante overrides y la normalización preserva `EZ` y `BOSU` como tokens completos.
- Evidencia de cierre: 12 archivos / 206 tests aprobados, catálogo `1324/1324`, dos regeneraciones consecutivas con el mismo SHA-1 (`525b9d69f3942e24d0087eca7e6bc0fe8eb452f5`), build exitoso y `git diff --check` limpio. El aviso de tamaño de chunk sigue fuera de alcance.
- Smoke dirigido: EN → ES → EN en biblioteca/búsqueda, detalle y rutina Pull Day; los nombres corregidos se vieron en español, el `alt` del medio coincidió con el título, la captura móvil fue legible y la consola registró 0 errores y 0 warnings.

## 1. Resumen general

El Spec 02 incorporó nombres de ejercicios en español, búsqueda bilingüe y resolución centralizada mediante `nameFor(ex)`. La implementación principal funciona y cubre las superficies previstas, pero la verificación final detectó tres brechas: el resolver falla si recibe un ejercicio no resoluble mientras el pack español está activo, el validador no demuestra todos sus casos negativos —en particular IDs duplicados— y el catálogo contiene traducciones automáticas poco naturales sin un glosario versionado que permita mantenerlas de forma consistente.

Esta iniciativa cierra esas brechas sin modificar IDs, contratos de persistencia, cálculos, rutinas, historial ni formatos compartidos. El resultado será un resolver tolerante a datos incompletos, una validación estructural comprobable y un catálogo español con convenciones explícitas y revisión dirigida.

## 2. Objetivo

Completar el hardening técnico y terminológico de los nombres localizados para que todas las superficies mantengan un fallback seguro, el catálogo pueda rechazarse automáticamente ante defectos estructurales y las traducciones visibles sean consistentes y comprensibles.

## 3. Contexto

- `frontend/src/lib/i18n.js` carga el pack español bajo demanda y expone `nameFor(ex)`.
- Biblioteca, planificación, entrenamiento, historial, estadísticas, mensajes, texto alternativo e impresión ya consumen el resolver central.
- El catálogo versionado contiene 1.324 entradas y el comando `npm run check:exercise-names` confirma cobertura completa.
- La suite existente finaliza con 198 pruebas aprobadas y el build de Vite es exitoso.
- Con español activo, `nameFor(undefined)` produce `TypeError` al leer `ex.id`.
- El validador actual comprueba faltantes, extras y valores vacíos sobre el objeto importado, pero una clave duplicada puede sobrescribirse antes de ser inspeccionada.
- El catálogo fue generado con traducción automática y cinco overrides embebidos; no existe un glosario versionado.
- El smoke visual detectó nombres poco naturales, puntuación terminal inconsistente y variaciones de capitalización.

## 4. Problema u oportunidad que se aborda

La experiencia nominal funciona para datos válidos, pero un ID obsoleto o no resoluble puede romper una vista precisamente cuando se intenta aplicar el fallback. A su vez, el validador entrega confianza parcial porque no prueba todos los defectos que el contrato documental promete detectar. Finalmente, algunas traducciones son formalmente no vacías pero no resultan nombres de ejercicios adecuados en español.

La oportunidad es cerrar el Spec 02 con garantías explícitas: tolerancia a entradas incompletas, validaciones negativas reproducibles y un proceso de mantenimiento terminológico que no dependa de editar manualmente el artefacto generado.

## 5. Alcance

- Hacer que `nameFor(ex)` tolere `null`, `undefined`, IDs desconocidos y snapshots disponibles.
- Garantizar que los ejercicios personalizados nunca consulten el pack localizado.
- Aplicar fallback seguro en historial, PR, 1RM y cualquier consumidor que resuelva un ID mediante `EXIDX`.
- Separar la lógica de validación del catálogo para poder probarla con fixtures.
- Detectar faltantes, extras, vacíos y IDs duplicados antes de perder información por conversión a objeto.
- Mantener un comando CLI con exit code y reporte reproducibles.
- Versionar un glosario español y un conjunto mantenible de overrides.
- Normalizar espacios, capitalización convencional y puntuación terminal al regenerar el catálogo.
- Corregir las traducciones incorrectas identificadas durante el smoke.
- Realizar una revisión humana dirigida sobre los ejercicios relevantes y los nombres señalados automáticamente.
- Ejecutar pruebas unitarias, cobertura del catálogo, build y smoke EN → ES → EN de los flujos afectados.

## 6. Fuera de alcance

- Agregar nombres localizados para idiomas distintos de español.
- Cambiar los nombres canónicos en inglés de `EXDB`.
- Modificar IDs, esquemas de datos, rutinas, entrenamientos o historial guardado.
- Traducir ejercicios personalizados.
- Aceptar nombres españoles en importaciones CSV.
- Traducir dinámicamente en el navegador o depender de una API durante runtime.
- Auditar manualmente uno por uno los 1.324 nombres si no fueron señalados por las reglas o la revisión dirigida.
- Rediseñar las pantallas que muestran nombres.
- Agregar pruebas generales de rendimiento, seguridad o regresión de módulos no relacionados.

## 7. Actores involucrados

- Persona que utiliza openGym en español.
- Persona con historial antiguo, importado o con ejercicios eliminados.
- Persona que creó ejercicios personalizados.
- Desarrollador responsable del resolver, catálogo y validador.
- Reviewer funcional de terminología de entrenamiento en español.

## 8. Requerimientos funcionales

1. **RF-01:** `nameFor(null)` y `nameFor(undefined)` deben devolver una cadena vacía sin lanzar excepciones.
2. **RF-02:** Un ejercicio incluido debe usar el nombre español por ID cuando el idioma activo sea español.
3. **RF-03:** Un ejercicio incluido sin traducción runtime debe usar su nombre canónico.
4. **RF-04:** Un ejercicio personalizado debe conservar exactamente su nombre y no consultar el pack, incluso ante una colisión accidental de ID.
5. **RF-05:** Un snapshot histórico resoluble debe usar el nombre del idioma activo; uno no resoluble debe conservar `e.n` o mostrar su ID.
6. **RF-06:** Los resúmenes de PR y 1RM deben tolerar IDs desconocidos y mostrar un fallback visible.
7. **RF-07:** El validador debe aceptar el catálogo correcto y rechazar faltantes, extras, vacíos y duplicados.
8. **RF-08:** Cada error del validador debe identificar su categoría y los IDs involucrados.
9. **RF-09:** El catálogo debe generarse usando un glosario y overrides versionados, sin edición manual del archivo generado.
10. **RF-10:** Los nombres generados no deben contener espacios sobrantes ni puntuación terminal impropia de una etiqueta.
11. **RF-11:** Cambiar EN → ES → EN debe actualizar las etiquetas sin modificar datos persistidos ni el flujo activo.

## 9. Requerimientos no funcionales

1. **RNF-01:** La corrección no debe cambiar contratos de persistencia, importación, exportación o planes compartidos.
2. **RNF-02:** El resolver debe ser determinista y no realizar solicitudes de red.
3. **RNF-03:** El validador debe poder probarse con fixtures aislados sin modificar el catálogo real.
4. **RNF-04:** El comando del validador debe terminar con `0` para un pack válido y con un código distinto de `0` para cualquier defecto estructural.
5. **RNF-05:** El pack español debe seguir cargándose de forma diferida.
6. **RNF-06:** La generación puede usar una fuente externa de traducción sólo como herramienta de mantenimiento; la aplicación desplegada no debe depender de ella.
7. **RNF-07:** Las convenciones terminológicas deben quedar documentadas y ser reutilizables en futuras regeneraciones.
8. **RNF-08:** Las pruebas y la regresión deben limitarse a nombres localizados y sus consumidores directos.

## 10. Reglas de negocio

1. El ID continúa siendo la identidad estable de un ejercicio incluido.
2. Inglés continúa siendo el nombre canónico y el fallback para ejercicios incluidos.
3. Un ejercicio personalizado conserva su nombre antes de cualquier intento de localización.
4. Un snapshot histórico tiene prioridad como fallback cuando el ejercicio ya no puede resolverse.
5. Si no existen ejercicio ni snapshot, el consumidor debe mostrar el ID o su placeholder actual.
6. El pack español debe contener exactamente una entrada no vacía por cada ID de `EXDB`.
7. Un ID duplicado es inválido aunque el objeto final aparente tener cobertura completa.
8. Los nombres visibles no se persisten para ejercicios incluidos.
9. El archivo generado no se edita a mano; glosario, overrides y reglas de normalización son las fuentes mantenibles.
10. Se permiten nombres traducidos iguales cuando representan ejercicios distintos; la identidad sigue siendo el ID.
11. La revisión lingüística requerida es dirigida: plan demo, levantamientos principales, primera página del catálogo y todos los casos señalados por validaciones automáticas.

## 11. Flujo general

1. El resolver recibe un ejercicio, snapshot o valor ausente.
2. Si no existe entrada, devuelve una cadena vacía para que el consumidor aplique su fallback de ID.
3. Si es personalizado, devuelve el nombre guardado sin consultar el pack.
4. Si es incluido y existe traducción para el idioma activo, devuelve el nombre localizado.
5. Si la traducción no existe, devuelve el nombre canónico o snapshot disponible.
6. El generador obtiene nombres base, aplica normalización, glosario y overrides, y produce el artefacto versionado.
7. El validador analiza las entradas antes de convertirlas en mapa, detecta defectos estructurales y emite un reporte accionable.
8. La suite valida casos positivos y negativos y el smoke confirma el resultado en las superficies visibles.

## 12. Entradas y salidas relevantes

### Entradas

- Ejercicio completo, snapshot histórico, ID desconocido, `null` o `undefined`.
- Idioma activo y pack español cargado.
- `EXDB` y `EXIDX`.
- Lista fuente de nombres localizados antes de convertirla en mapa.
- Glosario, reglas de normalización y overrides españoles.
- Fixtures válidos e inválidos del validador.

### Salidas

- Nombre localizado, canónico, personalizado, snapshot, ID o cadena vacía según corresponda.
- Catálogo español regenerado y consistente.
- Reporte de validación con cobertura y defectos por categoría.
- Pruebas reproducibles de casos positivos, negativos y fallback.
- Smoke sin errores de consola en los flujos afectados.

## 13. Dependencias

- Spec 02 y su implementación de nombres localizados.
- `frontend/src/lib/i18n.js`.
- `frontend/src/exercise-names/es.js`.
- Consumidores de historial, PR y 1RM en `frontend/src/sheets.jsx`.
- `scripts/build-exercise-names.mjs` y `scripts/check-exercise-names.mjs`.
- Vitest, Vite y el modo demo de openGym.
- Servidor local de medios para el smoke de biblioteca, detalle y entrenamiento.

## 14. Riesgos, restricciones o consideraciones

- **Fallback incompleto:** corregir sólo `nameFor` sin validar consumidores podría dejar IDs desconocidos invisibles; se mitiga con pruebas directas de historial, PR y 1RM.
- **Falso positivo del validador:** importar primero un objeto elimina evidencia de duplicados; se mitiga validando una representación ordenada de entradas o el artefacto fuente.
- **Sobre-normalización:** convertir automáticamente toda capitalización puede dañar nombres propios o siglas como Smith y EZ; se mitiga documentando excepciones y usando overrides.
- **Calidad lingüística subjetiva:** no todas las variantes tienen una única traducción; se mitiga con convenciones mínimas y revisión dirigida, sin exigir una auditoría total.
- **Regeneración no determinista:** una API externa puede cambiar resultados; se mitiga tratando glosario y overrides versionados como fuentes de estabilidad y revisando el diff generado.
- **Regresión de bundle:** el catálogo debe conservar su carga diferida después de reorganizar sus fuentes.
- **Advertencia de chunks:** el build actual muestra una advertencia no bloqueante de tamaño; no pertenece a este alcance mientras el pack español permanezca separado del bundle inicial.

## 15. Estrategia de slicing

La iniciativa se divide en tres slices correctivos, ordenados por reducción de riesgo. El primero elimina el crash de runtime y entrega fallback observable. El segundo convierte el contrato del validador en evidencia automática. El tercero mejora las fuentes terminológicas, regenera el catálogo y ejecuta el cierre funcional transversal.

Cada slice es independiente en su validación y evita cambios de persistencia. El rollback consiste en revertir el slice correspondiente; no se requieren migraciones ni recuperación de datos.

## 16. Roadmap de slices

| Orden | Slice | Resultado observable | Dependencias |
|---|---|---|---|
| 1 | `01-slice` — Fallback seguro para nombres no resolubles | Historial, PR y 1RM no se rompen ante entradas ausentes y los personalizados mantienen su nombre | Spec 02 |
| 2 | `02-slice` — Validador estructural comprobable | El CLI y sus pruebas rechazan faltantes, extras, vacíos y duplicados con reporte accionable | Spec 02 |
| 3 | `03-slice` — Calidad terminológica y cierre transversal | Catálogo regenerado con glosario, errores conocidos corregidos y smoke EN → ES → EN sin fallos | `01-slice`, `02-slice` |

## 17. Supuestos, pendientes y preguntas abiertas

- **Supuesto aprobado:** español es el único idioma cuyo catálogo nominal se corrige en este spec.
- **Supuesto aprobado:** no se exige revisión humana individual de los 1.324 nombres; se utiliza revisión dirigida y reglas automáticas.
- **Supuesto:** el archivo de overrides y el glosario pueden vivir junto a los scripts de generación siempre que no entren al bundle de runtime.
- **Decisión implementada:** el checker extrae IDs del texto fuente del pack generado antes de evaluar duplicados; la validación pura y el fixture negativo están disponibles.
- **Conjunto de revisión dirigido:** ejercicios de `frontend/src/lib/starter.js` (plan demo), levantamientos principales, primera página del catálogo y hallazgos automáticos. La lista de IDs del plan demo y las correcciones pendientes están registradas en la sección 21 de `03-slice.md`.
- **Pregunta abierta no bloqueante:** si en el futuro se reemplazará la traducción automática por una fuente humana o comunitaria; no cambia el cierre de este spec.
