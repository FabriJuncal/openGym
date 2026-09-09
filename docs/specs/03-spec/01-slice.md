# 01-slice — Fallback seguro para nombres no resolubles

## 1. Nombre del slice

Fallback seguro para nombres no resolubles.

## 2. Objetivo del slice

Evitar excepciones y conservar un nombre visible cuando la aplicación recibe ejercicios ausentes, IDs obsoletos, snapshots históricos o ejercicios personalizados con el idioma español activo.

## 3. Problema puntual que resuelve

`nameFor(ex)` intenta acceder a `ex.id` cuando el pack español está cargado. Si `ex` es `null` o `undefined`, lanza `TypeError`. Consumidores como los resúmenes de PR y 1RM resuelven IDs mediante `EXIDX[id]`, por lo que un ID desconocido puede romper la vista en vez de mostrar el fallback previsto.

## 4. Valor observable que entrega

Una persona puede abrir historial, PR, 1RM y entrenamiento en español aun cuando exista un ID no resoluble; la pantalla sigue operativa y muestra el snapshot o ID disponible. Los ejercicios personalizados conservan exactamente su nombre.

## 5. Alcance específico

Endurecer el resolver central y sus consumidores directos para soportar entradas ausentes sin modificar el modelo de datos ni la lógica de cálculo.

## 6. Qué incluye

- Guard clause para `null` y `undefined`.
- Prioridad explícita para nombres personalizados.
- Fallback localizado, canónico, snapshot o vacío.
- Fallback visible por ID en PR y 1RM.
- Validación de historial con ejercicio resoluble, snapshot y entrada desconocida.
- Pruebas unitarias y smoke dirigido con español activo.

## 7. Qué no incluye

- Cambiar el contenido del catálogo español.
- Modificar cálculos de PR, 1RM, volumen o progresión.
- Migrar historial o corregir IDs guardados.
- Cambiar importaciones CSV o planes compartidos.
- Agregar nuevos idiomas.

## 8. Actores involucrados

- Persona con historial antiguo o datos importados.
- Persona con ejercicios personalizados activos o eliminados.
- Desarrollador del resolver y consumidores de progreso.

## 9. Precondiciones

- Spec 02 implementado.
- `nameFor(ex)` disponible y usado por las superficies visibles.
- Pack español cargable mediante `setLang('es')`.

## 10. Entradas necesarias

- `frontend/src/lib/i18n.js`.
- `frontend/src/lib/i18n.test.js`.
- Resúmenes e historial en `frontend/src/sheets.jsx`.
- Ejercicio incluido, personalizado, snapshot, ID desconocido, `null` y `undefined`.

## 11. Flujo operativo paso a paso

1. Definir el orden de resolución en `nameFor`.
2. Retornar vacío inmediatamente si no existe ejercicio.
3. Retornar `ex.n` inmediatamente si el ejercicio es personalizado.
4. Consultar el pack sólo para ejercicios incluidos con ID.
5. Usar `ex.n` como fallback canónico o de snapshot.
6. Revisar consumidores que pasan `EXIDX[id]` y asegurar fallback visible por ID.
7. Agregar casos unitarios para cada forma de entrada.
8. Ejecutar tests dirigidos y smoke de historial, PR y entrenamiento.

## 12. Salidas esperadas

- Resolver total que no lanza por ausencia de entrada.
- Personalizados inmunes a colisiones accidentales con IDs incluidos.
- Historial, PR y 1RM con fallback visible.
- Pruebas reproducibles del comportamiento en español e inglés.

## 13. Reglas de negocio aplicables

- Personalizado tiene prioridad sobre el pack localizado.
- El ID permanece como identidad, nunca el nombre visible.
- Español usa el pack sólo para ejercicios incluidos resolubles.
- El snapshot histórico se conserva cuando el ejercicio ya no existe.
- Si no existe nombre, el consumidor muestra el ID o placeholder vigente.
- No se persiste el nombre localizado.

## 14. Validaciones

- `nameFor(undefined)` devuelve `''` con español activo.
- `nameFor(null)` devuelve `''` con español activo.
- Un ejercicio incluido devuelve español en `es` e inglés en `en`.
- Un objeto desconocido con `n` devuelve ese snapshot.
- Un personalizado con ID coincidente con un incluido conserva su nombre propio.
- PR y 1RM con ID desconocido muestran el ID sin excepción.
- Historial con ejercicio eliminado conserva `e.n`.
- La carrera ES → EN continúa resolviendo al último idioma solicitado.

## 15. Manejo de errores o edge cases

- Entrada sin `id` pero con `n`: usar `n`.
- Entrada con `id` pero sin nombre ni traducción: devolver vacío para que el consumidor muestre el ID.
- Personalizado con nombre vacío: conservar el comportamiento de placeholder vigente, sin consultar el pack.
- ID obsoleto dentro de una lista de PR: mostrar el ID y continuar con los demás elementos.
- Pack español ausente: usar nombre canónico o snapshot.

## 16. Criterios de aceptación

1. Ninguna llamada a `nameFor` lanza por recibir `null` o `undefined`.
2. Los ejercicios personalizados nunca usan el nombre de un ejercicio incluido aunque compartan ID accidentalmente.
3. Un ejercicio incluido resoluble sigue alternando correctamente entre español e inglés.
4. Un snapshot histórico no resoluble conserva su nombre guardado.
5. PR y 1RM muestran el ID cuando `EXIDX[id]` no existe.
6. Las pruebas unitarias cubren todos los fallbacks anteriores.
7. El smoke dirigido finaliza sin errores de consola.
8. Persistencia, cálculos y formatos compartidos permanecen sin cambios.

## 17. Dependencias técnicas, funcionales o externas

- `nameFor`, `setLang` y el pack español.
- `EXIDX` y snapshots históricos.
- Vitest y modo demo para smoke.
- No requiere dependencias externas nuevas.

## 18. Depende de slices

- Ninguno dentro del Spec 03.
- Depende funcionalmente de la implementación completa del Spec 02.

## 19. Riesgos / decisiones abiertas

- Retornar vacío sin ajustar consumidores puede ocultar un ID; por eso PR, 1RM e historial se validan en el mismo slice.
- Alterar la prioridad del personalizado podría traducir datos del usuario; la prioridad se fija con un test de colisión.
- El cambio toca un resolver compartido, por lo que se ejecuta la suite completa aunque la modificación sea pequeña.

## 20. Pendientes / preguntas abiertas

- Ninguno bloqueante.
- La limpieza o migración de IDs históricos inválidos permanece fuera de alcance.
