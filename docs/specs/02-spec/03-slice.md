# 03-slice — Nombres localizados en entrenamiento y progreso

## 1. Nombre del slice

Nombres localizados en entrenamiento y progreso.

## 2. Objetivo del slice

Completar la localización de nombres en el entrenamiento activo, historial, resúmenes y estadísticas, y cerrar la iniciativa con documentación y regresión dirigida.

## 3. Problema puntual que resuelve

Sin este slice, las superficies usadas durante y después de entrenar continuarían mostrando nombres ingleses o mezclando idiomas, y las estadísticas seguirían ordenando y etiquetando por `EXIDX[id].n`.

## 4. Valor observable que entrega

Una persona entrena, revisa una sesión, consulta sus PR y navega el progreso de ejercicios con nombres consistentes en español; al volver a inglés, todo el recorrido retorna al nombre canónico sin alterar el historial.

## 5. Alcance específico

Aplicar `nameFor(ex)` a entrenamiento, detalles históricos, finalización y estadísticas; adaptar el orden visible y completar documentación y verificación transversal del spec.

## 6. Qué incluye

- Nombre del ejercicio en la tarjeta de entrenamiento activo.
- Mensajes de ejercicio completado y confirmación de peso.
- Detalle de entrenamientos históricos.
- Resumen final, PR y mejor 1RM estimado.
- Selector y ordenamiento de progreso por nombre localizado.
- Fallback de snapshots históricos de ejercicios personalizados eliminados.
- Revisión dirigida de nombres largos en viewport móvil.
- Actualización de README o documentación afectada.
- Búsqueda final de usos visuales directos de `ex.n` que deban usar `nameFor`.
- Suite existente, build y smoke transversal final.

## 7. Qué no incluye

- Cambios en cálculos de entrenamiento, volumen, PR, 1RM o progresión.
- Migraciones o reescritura de entrenamientos históricos.
- Traducción de nombres personalizados guardados.
- Cambios al matching CSV.
- Nuevos gráficos o rediseño de estadísticas.
- Nuevas traducciones fuera de español.
- Suite end-to-end nueva o regresión de módulos no relacionados.

## 8. Actores involucrados

- Persona que realiza un entrenamiento.
- Persona que consulta historial y estadísticas.
- Persona con ejercicios personalizados activos o eliminados.
- Desarrollador implementador.
- Reviewer funcional del recorrido completo.

## 9. Precondiciones

- `01-slice` implementado y validado.
- `02-slice` implementado para realizar el cierre transversal de la iniciativa.
- `nameFor(ex)` disponible y reactivo al cambio de idioma.
- Existe historial de prueba con ejercicios incluidos y personalizados.

## 10. Entradas necesarias

- `frontend/src/views/Workout.jsx`.
- `frontend/src/views/Stats.jsx`.
- Secciones de historial, peso superior y finalización en `frontend/src/sheets.jsx`.
- `EXIDX`, `exOr` y snapshots `e.n` de historial.
- `nameFor(ex)` y locale activo.
- README y comentarios de documentación que describen el soporte de idiomas.

## 11. Flujo operativo paso a paso

1. Resolver con `nameFor` el ejercicio actual del entrenamiento.
2. Aplicar el mismo nombre a detalles, acciones de completado y confirmación de peso.
3. Resolver por `EXIDX` los ejercicios incluidos del historial y conservar `e.n` para snapshots sin entrada resoluble.
4. Usar `nameFor` en resúmenes de PR y mejor 1RM estimado.
5. Construir las opciones de estadísticas con nombre localizado.
6. Ordenar el selector de progreso con `localeCompare` y el locale activo sin cambiar sus valores ID.
7. Buscar usos visuales directos restantes de nombres canónicos y sustituir sólo los de presentación.
8. Actualizar la documentación para describir nombres españoles y fallback inglés.
9. Ejecutar pruebas dirigidas y smoke EN → ES → EN en entrenamiento, historial y estadísticas.
10. Ejecutar la suite completa existente y el build.

## 12. Salidas esperadas

- Entrenamiento activo con nombres localizados.
- Historial y resúmenes con fallback correcto.
- PR y 1RM estimado etiquetados en español.
- Selector de estadísticas localizado y ordenado por locale.
- Datos históricos intactos.
- Documentación alineada con el comportamiento final.
- Evidencia de regresión dirigida y build exitoso.

## 13. Reglas de negocio aplicables

- Las entradas históricas continúan identificándose por ID.
- Un ejercicio incluido resoluble usa el nombre del idioma activo aunque el entrenamiento sea anterior.
- Un ejercicio personalizado eliminado usa el snapshot `e.n` almacenado y no se traduce.
- Los cálculos y valores seleccionados de estadísticas continúan usando ID.
- Cambiar el nombre visible o su orden no cambia PR, 1RM, volumen ni progresión.
- El orden localizado se aplica sólo donde la lista ya se ordena por nombre.

## 14. Validaciones

- El ejercicio activo cambia de inglés a español y vuelve a inglés sin reiniciar el entrenamiento.
- Mensajes de completado y confirmación muestran el mismo nombre que la tarjeta activa.
- Un entrenamiento histórico con ejercicio incluido muestra el nombre del idioma actual.
- Un snapshot de personalizado eliminado conserva su nombre guardado.
- Los resúmenes de PR y 1RM usan el nombre localizado sin alterar los cálculos.
- Las opciones de progreso conservan `value=id` y cambian sólo su etiqueta.
- El orden de estadísticas coincide con `localeCompare` del nombre visible.
- Un nombre largo sigue siendo legible en la superficie móvil más restringida revisada.
- No quedan usos directos de `ex.n` o `EXIDX[id].n` en superficies visuales incluidas; se conservan los usos canónicos de importación, persistencia y snapshots.
- README y documentación no afirman que los nombres siempre permanecen en inglés.

## 15. Manejo de errores o edge cases

- Si un ID de historial resuelve a un ejercicio incluido pero falta el pack runtime, usar el nombre canónico.
- Si el ID ya no resuelve y existe `e.n`, mostrar el snapshot.
- Si no existe ejercicio ni snapshot, mostrar el ID o placeholder actual sin romper el detalle.
- Si cambia el idioma mientras una hoja o resumen está abierto, el contenido debe re-renderizarse con el último idioma.
- Si dos nombres localizados son iguales, las opciones mantienen valores ID distintos.
- Si el ejercicio seleccionado en estadísticas cambia de posición al ordenar, conservar la selección por ID.

## 16. Criterios de aceptación

1. Entrenamiento activo, mensajes de completado y confirmaciones muestran nombres españoles con idioma `es`.
2. Detalle histórico, resumen final, PR y 1RM estimado muestran el nombre localizado de ejercicios incluidos.
3. Un ejercicio personalizado activo o eliminado conserva su nombre original.
4. El selector de progreso muestra y ordena nombres según el idioma activo, manteniendo IDs como valores.
5. Cambiar ES → EN durante el flujo actualiza las etiquetas sin modificar la sesión ni el historial.
6. Cálculos de sets, volumen, PR, 1RM y progresión conservan los mismos resultados.
7. Los usos canónicos de importación, persistencia y snapshots no se sustituyen por nombres localizados.
8. La documentación describe el soporte español y el fallback inglés.
9. El smoke transversal cubre biblioteca, detalle, rutina, entrenamiento, historial y estadísticas.
10. Suite existente y build finalizan correctamente.

## 17. Dependencias técnicas, funcionales o externas

- `nameFor(ex)` del `01-slice`.
- Flujo de planificación localizado del `02-slice` para el cierre transversal.
- Store de entrenamiento e historial.
- `EXIDX`, `exOr`, cálculos de PR y 1RM existentes.
- `localeCompare` del navegador.
- Vitest y build de Vite.

## 18. Depende de slices

- `01-slice` — Catálogo español en biblioteca y detalle.
- `02-slice` — Nombres localizados en planificación, para ejecutar el cierre integral en orden.

## 19. Riesgos / decisiones abiertas

- Confundir el nombre visible con el snapshot histórico al resolver ejercicios eliminados.
- Alterar el valor seleccionado al reordenar estadísticas.
- Dejar mensajes secundarios en inglés por un uso directo de `ex.n`.
- Truncamiento de nombres españoles largos en entrenamiento móvil.

## 20. Pendientes / preguntas abiertas

- Ninguno bloqueante.
- El reconocimiento de nombres españoles en importaciones permanece como posible iniciativa posterior.
