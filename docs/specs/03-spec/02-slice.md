# 02-slice — Validador estructural comprobable

## 1. Nombre del slice

Validador estructural comprobable.

## 2. Objetivo del slice

Convertir las reglas estructurales del catálogo español en validaciones automatizadas que acepten el pack correcto y rechacen faltantes, extras, vacíos y duplicados con evidencia reproducible.

## 3. Problema puntual que resuelve

El CLI actual importa el pack como objeto. Las claves duplicadas ya fueron sobrescritas en ese punto, por lo que no puede demostrar el rechazo de duplicados exigido por el contrato. Tampoco existen fixtures negativos que prueben los exit codes y reportes de cada categoría.

## 4. Valor observable que entrega

Un desarrollador puede ejecutar un único comando y confiar en que cualquier desalineación estructural del catálogo detendrá el flujo con un reporte que indica exactamente qué IDs deben corregirse.

## 5. Alcance específico

Separar validación y CLI, conservar la cobertura del pack real e incorporar pruebas negativas aisladas que no editen el catálogo versionado.

## 6. Qué incluye

- Función pura de validación.
- Representación o lectura fuente que preserve IDs duplicados.
- Reporte por categorías: `missing`, `extra`, `empty`, `duplicate`.
- Exit code `0` para pack válido y distinto de `0` para inválidos.
- Fixtures o datos inline mínimos para cada caso negativo.
- Integración con `npm run check:exercise-names`.

## 7. Qué no incluye

- Evaluar calidad lingüística o corrección semántica.
- Exigir unicidad de nombres traducidos.
- Regenerar traducciones.
- Cambiar carga diferida o resolución runtime.
- Integrar un nuevo servicio de CI si no existe actualmente.

## 8. Actores involucrados

- Desarrollador que genera o revisa el catálogo.
- Reviewer que necesita evidencia de cobertura.
- Flujo local o CI que ejecuta scripts de verificación.

## 9. Precondiciones

- `EXDB` contiene IDs únicos.
- Existe un catálogo español versionado.
- `npm run check:exercise-names` está definido.
- Vitest o el runner de pruebas existente puede ejecutar la lógica aislada.

## 10. Entradas necesarias

- `scripts/check-exercise-names.mjs`.
- `frontend/src/exercise-names/es.js` o su representación fuente equivalente.
- `frontend/src/lib/exercises-data.js`.
- Fixtures válidos e inválidos.

## 11. Flujo operativo paso a paso

1. Extraer una función que reciba IDs esperados y entradas localizadas.
2. Elegir una entrada que conserve el orden y los duplicados antes de crear el mapa runtime.
3. Calcular faltantes, extras, vacíos y duplicados.
4. Devolver un resultado estructurado sin llamar a `process.exit` desde la función pura.
5. Mantener el CLI como adaptador que imprime el resultado y define el exit code.
6. Crear casos de prueba mínimos para cada categoría.
7. Ejecutar los casos negativos y confirmar que no modifican `es.js`.
8. Ejecutar el comando sobre el catálogo real y confirmar cobertura `1324/1324`.

## 12. Salidas esperadas

- Lógica de validación importable y testeable.
- CLI compatible con el comando existente.
- Reporte completo con las cuatro categorías.
- Pruebas negativas que demuestran los exit codes o estado inválido.
- Catálogo real validado sin cambios accidentales.

## 13. Reglas de negocio aplicables

- Debe existir exactamente una entrada no vacía por cada ID de `EXDB`.
- Un nombre traducido puede repetirse entre IDs distintos.
- Un ID repetido en la fuente es inválido aunque el mapa final tenga cobertura.
- Un valor no string o compuesto sólo por espacios es vacío.
- El validador no corrige automáticamente el catálogo.
- Los errores deben ser accionables y deterministas.

## 14. Validaciones

- Fixture válido: sin errores.
- ID faltante: aparece en `missing`.
- ID extra: aparece en `extra`.
- String vacío, espacios o valor no string: aparece en `empty`.
- ID repetido: aparece en `duplicate`.
- Dos IDs distintos con el mismo nombre: continúan siendo válidos.
- El CLI retorna `0` para válido y distinto de `0` para inválido.
- El catálogo real informa `1324/1324`.

## 15. Manejo de errores o edge cases

- Fuente ilegible o sintácticamente inválida: terminar con error explícito, no reportar cobertura válida.
- Entrada sin ID: tratar como extra o error estructural identificable.
- Duplicado con valores distintos: reportar el ID una vez en `duplicate`.
- Varias categorías simultáneas: informar todas en una sola ejecución.
- Nombre duplicado entre ejercicios distintos: no marcar como error.

## 16. Criterios de aceptación

1. La lógica de validación puede probarse sin mutar el catálogo real.
2. Los casos válido, faltante, extra, vacío y duplicado están automatizados.
3. Un duplicado es detectado antes de convertirse en objeto.
4. El reporte identifica categoría e IDs afectados.
5. El CLI mantiene `npm run check:exercise-names` como interfaz estable.
6. El pack real devuelve exit code `0` y `1324/1324`.
7. Todos los fixtures inválidos producen estado o exit code no exitoso.
8. La suite existente y el build continúan pasando.

## 17. Dependencias técnicas, funcionales o externas

- Node.js ESM.
- `EXDB`.
- Script y pack existentes.
- Runner de tests actual.
- No requiere red ni dependencias externas nuevas.

## 18. Depende de slices

- Ninguno dentro del Spec 03.
- Puede ejecutarse después de `01-slice` por prioridad, pero no depende técnicamente de él.

## 19. Riesgos / decisiones abiertas

- Parsear el JavaScript generado con una expresión frágil puede producir falsos resultados; se prefiere una representación explícita de entradas o un formato determinista documentado.
- Cambiar el formato del pack podría afectar la carga dinámica; si se hace, debe conservarse el export default consumido por runtime.
- Añadir dependencias de parsing sería desproporcionado salvo que el formato actual no permita una solución simple.

## 20. Pendientes / preguntas abiertas

- Decidir durante la implementación entre exportar una lista de entradas o validar el formato fuente generado de manera determinista.
- Ninguna decisión de negocio pendiente.
