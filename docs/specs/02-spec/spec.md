# Spec 02 — Nombres de ejercicios localizados al español

## 1. Resumen general

openGym traduce la interfaz y las instrucciones de los ejercicios cuando una persona selecciona español, pero continúa mostrando los nombres del catálogo en inglés. La causa es que todos los consumidores leen directamente `ex.n` y la fuente upstream sólo ofrece un campo `name` canónico; sus campos multilingües corresponden únicamente a las instrucciones.

Esta iniciativa incorporará un catálogo versionado de nombres en español, cargado bajo demanda, y una única función para resolver el nombre visible. El cambio cubrirá biblioteca, planificación, entrenamiento, historial, estadísticas, mensajes, PDF y texto alternativo, sin modificar IDs, nombres canónicos, rutinas, entrenamientos ni formatos de intercambio.

## 2. Objetivo

Hacer que los ejercicios incluidos cambien su nombre visible entre inglés y español al cambiar el idioma de la aplicación, preservando la compatibilidad de los datos existentes y permitiendo buscar por ambos nombres.

## 3. Contexto

- `frontend/src/lib/i18n.js` carga de forma diferida los diccionarios de UI y los packs de instrucciones.
- `instrFor(ex)` ya resuelve instrucciones por ID y usa el inglés como fallback.
- El nombre canónico en inglés vive en `EXDB` como `ex.n`.
- La fuente upstream contiene 1.324 ejercicios, un único campo `name` y traducciones de instrucciones, pero no nombres localizados.
- Biblioteca, selectores, rutinas, entrenamiento, historial, estadísticas, impresión y `Media` consumen actualmente `ex.n` de forma directa.
- Los ejercicios personalizados guardan un nombre escrito por la persona y no deben traducirse.
- Los IDs son la identidad estable de los ejercicios incluidos en rutinas e historial.

## 4. Problema u oportunidad que se aborda

Al seleccionar español, la interfaz y las instrucciones cambian de idioma, pero los nombres de los ejercicios siguen en inglés. Esto produce una experiencia parcialmente traducida y dificulta encontrar ejercicios por su denominación habitual en español.

La oportunidad es separar el nombre canónico usado por los datos del nombre localizado usado por la presentación. Esa separación permite traducir sin migraciones y habilita futuros packs de nombres sin dispersar lógica por los componentes.

## 5. Alcance

- Crear y versionar un pack completo de nombres en español indexado por ID de ejercicio.
- Validar automáticamente cobertura, IDs y valores del pack.
- Cargar el pack español bajo demanda junto con el idioma seleccionado.
- Incorporar un resolver central `nameFor(ex)` con fallback seguro al nombre canónico.
- Localizar los nombres visibles en biblioteca, detalle, selector, rutinas, entrenamiento, historial, estadísticas, mensajes, resumen de PR y plan imprimible.
- Usar el nombre localizado como texto alternativo de las imágenes.
- Permitir búsqueda por nombre español e inglés, ignorando mayúsculas y diacríticos.
- Ordenar las listas visibles afectadas por el nombre localizado.
- Preservar sin traducción los nombres de ejercicios personalizados y snapshots históricos de ejercicios eliminados.
- Mantener estables los IDs y formatos actuales de persistencia, importación y exportación.
- Documentar el comportamiento y el procedimiento para agregar futuros packs.

## 6. Fuera de alcance

- Traducir nombres a idiomas distintos de español en esta iniciativa.
- Traducir nombres dinámicamente en el navegador o depender de una API de traducción en producción.
- Traducir automáticamente ejercicios personalizados.
- Cambiar nombres canónicos en `EXDB` o regenerar el catálogo base.
- Modificar IDs, esquemas de estado, rutinas o entrenamientos guardados.
- Cambiar el algoritmo de matching de importaciones CSV para aceptar nombres en español.
- Traducir descripciones libres, nombres de rutinas u otros metadatos no contemplados.
- Rediseñar las pantallas afectadas.
- Crear una suite end-to-end nueva, ejecutar regresión general o realizar pruebas de carga o seguridad.

## 7. Actores involucrados

- Persona que usa openGym en español.
- Persona que alterna entre inglés y español.
- Persona que creó ejercicios personalizados.
- Desarrollador responsable del catálogo y de los packs de idioma.
- Reviewer funcional de las traducciones y de las superficies visibles.

## 8. Requerimientos funcionales

1. **RF-01:** Al seleccionar español, cada ejercicio incluido debe mostrar el nombre español asociado a su ID.
2. **RF-02:** Al volver a inglés, el mismo ejercicio debe mostrar su nombre canónico `ex.n`.
3. **RF-03:** Si una traducción no puede resolverse en runtime, debe mostrarse `ex.n` sin romper la pantalla.
4. **RF-04:** Los ejercicios personalizados deben conservar exactamente el nombre definido por la persona en todos los idiomas.
5. **RF-05:** La biblioteca y el selector deben encontrar ejercicios por su nombre español y por su nombre inglés.
6. **RF-06:** La búsqueda de nombres debe ignorar mayúsculas, minúsculas y diacríticos.
7. **RF-07:** Las listas cuyo orden depende del nombre del ejercicio deben ordenarse por el nombre visible y el locale activo.
8. **RF-08:** Detalles, rutinas, entrenamiento, historial, estadísticas, mensajes, PR y PDF deben usar el mismo resolver central.
9. **RF-09:** El texto alternativo de los medios debe usar el nombre visible.
10. **RF-10:** Los mensajes de duplicado de ejercicios personalizados deben considerar tanto el nombre visible como el canónico.
11. **RF-11:** Un error al cargar el pack de nombres no debe impedir la carga de las traducciones de UI o instrucciones.
12. **RF-12:** Un cambio rápido de idioma no debe permitir que una carga anterior sobrescriba el último idioma seleccionado.

## 9. Requerimientos no funcionales

1. **RNF-01:** El pack español debe cargarse de forma diferida y no formar parte del bundle inicial en inglés.
2. **RNF-02:** El pack versionado debe cubrir el 100 % de los IDs incluidos en `EXDB`; la validación debe fallar con exit code distinto de cero ante faltantes, extras o valores vacíos.
3. **RNF-03:** La resolución del nombre debe ser determinista y no realizar peticiones de red en runtime.
4. **RNF-04:** UI, instrucciones y nombres deben notificarse como un único cambio visual coherente.
5. **RNF-05:** El fallback de un recurso debe ser independiente: un fallo del pack de nombres no debe descartar un diccionario o pack de instrucciones válido.
6. **RNF-06:** El cambio no debe modificar el formato ni el contenido persistido para ejercicios incluidos.
7. **RNF-07:** Los nombres largos deben conservar legibilidad en las superficies móviles más restringidas sin introducir un rediseño.
8. **RNF-08:** Las pruebas deben limitarse a la lógica modificada y a una regresión dirigida de los flujos que muestran nombres.

## 10. Reglas de negocio

1. El ID es la identidad estable de un ejercicio incluido; el nombre visible nunca se usa como identificador.
2. Inglés permanece como nombre canónico y fallback de runtime.
3. Español es el único pack nuevo comprometido por este spec.
4. El pack español debe tener exactamente una entrada válida por cada ID de `EXDB` antes de considerarse completo.
5. El fallback no habilita aprobar un pack incompleto; sólo evita fallos de runtime ante errores de carga o inconsistencias inesperadas.
6. Un ejercicio personalizado conserva su nombre original y no consulta el pack de nombres incluidos.
7. Un snapshot histórico de un ejercicio personalizado eliminado conserva el nombre guardado en la entrada.
8. Búsqueda y ordenamiento operan sobre nombres visibles, pero pueden consultar también el nombre canónico.
9. Importaciones CSV continúan usando el índice canónico y sus aliases actuales.
10. Los planes compartidos continúan serializando IDs de ejercicios incluidos y nombres sólo para ejercicios personalizados.
11. Las traducciones se almacenan como artefacto versionado; no se traducen en cada sesión.

## 11. Flujo general

1. La persona selecciona español en Settings.
2. El sistema solicita en paralelo los recursos aplicables de UI, instrucciones y nombres.
3. Al completar la selección vigente, actualiza el estado de idioma una sola vez.
4. Cada superficie obtiene el nombre visible mediante `nameFor(ex)`.
5. Los ejercicios incluidos muestran la entrada española por ID; los personalizados conservan `ex.n`.
6. Biblioteca y selector comparan la consulta normalizada con el nombre español y el canónico.
7. Rutinas, entrenamiento, historial, estadísticas, mensajes y PDF reutilizan la misma resolución.
8. Al volver a inglés, `nameFor(ex)` retorna el nombre canónico sin modificar ningún dato guardado.

## 12. Entradas y salidas relevantes

### Entradas

- Catálogo `EXDB` con ID y nombre canónico.
- Idioma seleccionado en `S.lang`.
- Pack versionado `{ [exerciseId]: nombreEnEspañol }`.
- Ejercicios personalizados de `S.customEx`.
- IDs de ejercicios presentes en rutinas, entrenamiento e historial.
- Consulta introducida en biblioteca o selector.

### Salidas

- Nombre localizado o fallback canónico para cada ejercicio.
- Resultados de búsqueda coincidentes por español o inglés.
- Listas ordenadas según el nombre visible.
- Mensajes, texto alternativo y PDF con nombres coherentes con el idioma.
- Persistencia y formatos de intercambio sin cambios.
- Reporte de validación del 100 % del pack español.

## 13. Dependencias

- `frontend/src/lib/i18n.js` y su mecanismo de suscripción.
- `frontend/src/lib/exercises.js` y el catálogo `EXDB`/`EXIDX`.
- `frontend/src/views/Library.jsx`, `RoutineEdit.jsx`, `Workout.jsx` y `Stats.jsx`.
- `frontend/src/sheets.jsx`, `frontend/src/components/Media.jsx` y `frontend/src/lib/plan-share.js`.
- Vite `import.meta.glob` para carga diferida.
- Vitest y los scripts de build existentes.
- Revisión humana o fuente acordada para producir los nombres españoles iniciales.

## 14. Riesgos, restricciones o consideraciones

- **Calidad terminológica:** 1.324 nombres pueden contener traducciones inconsistentes; se mitiga con glosario, cobertura automática y revisión dirigida de ejercicios comunes y variantes parecidas.
- **Pack incompleto o desalineado:** una actualización futura de `EXDB` puede introducir o retirar IDs; se mitiga haciendo fallar el validador ante cualquier diferencia.
- **Mutación accidental de datos:** guardar el nombre localizado rompería compatibilidad al cambiar de idioma; se mitiga centralizando la presentación en `nameFor` y conservando los contratos actuales.
- **Carrera entre cargas:** cambios rápidos de idioma pueden resolver fuera de orden; se mitiga aplicando recursos sólo si pertenecen a la selección vigente.
- **Fallo acoplado de recursos:** un import fallido no debe devolver toda la UI a inglés; cada pack requiere fallback independiente y una única notificación final.
- **Nombres extensos:** algunas traducciones españolas pueden ocupar más espacio; se requiere una comprobación dirigida en viewport móvil.
- **Restricción de fuente:** upstream no provee nombres localizados; el catálogo español debe mantenerse dentro del proyecto.

## 15. Estrategia de slicing

La iniciativa se divide en tres slices verticales:

1. Introducir el catálogo, el resolver y la primera experiencia completa en biblioteca y detalle, incluida búsqueda y accesibilidad.
2. Extender el nombre localizado a selección y planificación, preservando serialización y PDF.
3. Completar entrenamiento, historial y estadísticas, y cerrar documentación y regresión dirigida.

El primer slice contiene la base técnica porque la usa inmediatamente en un flujo visible y desbloquea los dos slices restantes.

## 16. Roadmap de slices

| Orden | Slice | Resultado observable | Dependencias |
|---|---|---|---|
| 1 | `01-slice` — Catálogo español en biblioteca y detalle | Al cambiar a español, biblioteca y detalle muestran nombres traducidos y permiten buscar en español o inglés | Ninguna |
| 2 | `02-slice` — Nombres localizados en planificación | Selector, rutinas, mensajes de planificación y PDF muestran el mismo nombre localizado sin cambiar el bundle compartido | `01-slice` |
| 3 | `03-slice` — Nombres localizados en entrenamiento y progreso | Entrenamiento, historial, PR y estadísticas cambian de idioma y ordenan correctamente | `01-slice`; `02-slice` para el cierre integral |

## 17. Supuestos, pendientes y preguntas abiertas

- **Supuesto aprobado:** el alcance inmediato es español e inglés; otros idiomas reutilizarán la arquitectura en iniciativas posteriores.
- **Supuesto:** los 1.324 IDs actuales de `EXDB` son el universo que debe cubrir el pack español.
- **Supuesto:** la revisión lingüística dirigida de ejercicios comunes y variantes similares es suficiente para este alcance; no se exige una auditoría humana individual de cada entrada.
- **Pendiente de implementación:** definir y versionar el glosario usado para generar o revisar el catálogo español.
- **Pendiente no bloqueante:** acordar el proceso de mantenimiento cuando cambie la versión del dataset upstream.
- **Pregunta abierta no bloqueante:** si futuras importaciones CSV deberán reconocer nombres españoles; no forma parte de este spec.
