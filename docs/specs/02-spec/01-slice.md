# 01-slice — Catálogo español en biblioteca y detalle

## 1. Nombre del slice

Catálogo español en biblioteca y detalle.

## 2. Objetivo del slice

Habilitar la resolución central de nombres en español y demostrarla de punta a punta en la biblioteca y el detalle de ejercicios.

## 3. Problema puntual que resuelve

Aunque la aplicación esté en español, la biblioteca, el detalle y el texto alternativo siguen leyendo `ex.n` y muestran el nombre canónico en inglés. Además, la búsqueda sólo compara el nombre inglés.

## 4. Valor observable que entrega

Una persona puede cambiar de inglés a español, ver nombres traducidos en biblioteca y detalle, buscar el mismo ejercicio por su nombre español o inglés y volver a inglés sin recargar ni modificar sus datos.

## 5. Alcance específico

Crear el pack español y su validación, integrarlo al ciclo de idioma y aplicar el resolver a biblioteca, detalle, búsqueda, duplicados y texto alternativo.

## 6. Qué incluye

- Pack versionado de nombres españoles por ID.
- Glosario o convenciones terminológicas documentadas junto al proceso de creación.
- Validador de cobertura, IDs y valores.
- Carga diferida e independiente del pack.
- Resolver central `nameFor(ex)`.
- Protección contra resultados fuera de orden al cambiar rápidamente de idioma.
- Nombre localizado en biblioteca y detalle.
- Texto alternativo localizado en `Media`.
- Búsqueda por español e inglés sin sensibilidad a mayúsculas o diacríticos.
- Validación de duplicados contra nombre visible y canónico.
- Pruebas unitarias y smoke dirigido de estas superficies.

## 7. Qué no incluye

- Selector de ejercicios usado en planificación.
- Rutinas, entrenamiento, historial o estadísticas.
- Plan imprimible.
- Traducciones de nombres a otros idiomas.
- Matching CSV por nombres españoles.
- Traducción de ejercicios personalizados.
- Traducción dinámica en producción.

## 8. Actores involucrados

- Persona que navega la biblioteca en español.
- Persona que busca o crea un ejercicio personalizado.
- Desarrollador responsable del catálogo y del i18n.
- Reviewer funcional de la traducción.

## 9. Precondiciones

- `EXDB` contiene IDs únicos y nombres canónicos.
- El selector de idioma español ya existe.
- El mecanismo `setLang` y la suscripción `useLang` están operativos.
- Se dispone de una fuente o proceso acordado para producir el catálogo español.

## 10. Entradas necesarias

- `frontend/src/lib/exercises-data.js`.
- `frontend/src/lib/i18n.js`.
- `frontend/src/lib/exercises.js`.
- `frontend/src/views/Library.jsx`.
- Secciones de detalle y creación de ejercicios en `frontend/src/sheets.jsx`.
- `frontend/src/components/Media.jsx`.
- Traducciones españolas y glosario terminológico.

## 11. Flujo operativo paso a paso

1. Construir el mapa español usando el ID de `EXDB` como clave.
2. Ejecutar el validador y exigir igualdad exacta entre IDs del pack y `EXDB`.
3. Registrar el pack con `import.meta.glob` sin incorporarlo al bundle inicial inglés.
4. Cargar UI, instrucciones y nombres con fallbacks independientes.
5. Aplicar una carga sólo cuando todavía corresponda al último idioma solicitado y notificar una vez.
6. Resolver nombres incluidos con `nameFor(ex)` y devolver `ex.n` para inglés, personalizados o fallbacks.
7. Reemplazar los nombres visibles de biblioteca, detalle y `Media`.
8. Normalizar consulta, nombre visible y nombre canónico para la búsqueda.
9. Usar ambas formas al comprobar duplicados de ejercicios personalizados.
10. Ejecutar pruebas unitarias, validador, suite existente, build y smoke EN → ES → EN.

## 12. Salidas esperadas

- Pack español completo y lazy-loaded.
- Validador ejecutable con exit code significativo.
- API `nameFor(ex)` centralizada.
- Biblioteca y detalle localizados.
- Búsqueda bilingüe y tolerante a diacríticos.
- Texto alternativo localizado.
- Evidencia automática y manual del cambio de idioma.

## 13. Reglas de negocio aplicables

- El ID, no el nombre, selecciona una traducción.
- Inglés es el dato canónico y fallback.
- El pack debe cubrir el 100 % de `EXDB`; el fallback no justifica faltantes en el artefacto.
- Los ejercicios personalizados no consultan el pack y conservan su nombre.
- UI, instrucciones y nombres usan fallbacks independientes.
- Sólo la última selección de idioma puede modificar los recursos activos.
- La búsqueda acepta el nombre localizado y el canónico.

## 14. Validaciones

- El validador termina correctamente con cobertura exacta de todos los IDs de `EXDB`.
- El validador falla ante un ID faltante, extra, duplicado o un nombre vacío.
- `nameFor` devuelve español para un ejercicio incluido con idioma `es`.
- `nameFor` devuelve inglés con idioma `en` o ante ausencia runtime del pack.
- `nameFor` conserva nombres personalizados y placeholders desconocidos.
- Una falla del pack de nombres conserva la UI y las instrucciones españolas disponibles.
- Cambios rápidos ES → EN no dejan recursos españoles activos bajo idioma inglés.
- La búsqueda encuentra por español, inglés y versión sin acento.
- El bundle inicial inglés no incluye el contenido completo del pack español.

## 15. Manejo de errores o edge cases

- Si el pack no puede cargarse, mostrar `ex.n`, conservar los otros recursos localizados y no romper la pantalla.
- Si cambia `EXDB`, el validador bloquea el cierre hasta alinear el pack.
- Si dos nombres localizados son iguales, ambos continúan diferenciados por ID y pueden aparecer en resultados.
- Si el ejercicio es personalizado, no inferir una traducción aunque su nombre coincida con uno incluido.
- Si una carga anterior termina después de otra más nueva, descartar el resultado anterior.
- Si la consulta no contiene caracteres útiles después de normalizar, conservar el comportamiento de búsqueda vacía.

## 16. Criterios de aceptación

1. El pack español contiene una entrada no vacía para cada ID actual de `EXDB` y ninguna adicional.
2. La validación del pack falla con exit code distinto de cero ante cualquier diferencia.
3. Al seleccionar español, biblioteca y detalle muestran el nombre español sin recargar la página.
4. Al volver a inglés, ambas superficies muestran nuevamente `ex.n`.
5. Un ejercicio personalizado mantiene exactamente el mismo nombre en inglés y español.
6. Se encuentra un ejercicio por su nombre español, su nombre inglés y una consulta equivalente sin diacríticos.
7. El texto `alt` de una imagen coincide con el nombre visible.
8. Un fallo simulado del pack de nombres conserva las traducciones de UI e instrucciones y usa el nombre inglés.
9. El pack español se carga de forma diferida.
10. Suite existente y build finalizan correctamente.

## 17. Dependencias técnicas, funcionales o externas

- Vite y `import.meta.glob`.
- React `useSyncExternalStore` a través de `useLang`.
- `EXDB`, `EXIDX` y ejercicios personalizados.
- Vitest.
- Traducciones españolas versionadas y su glosario.

## 18. Depende de slices

Ninguno.

## 19. Riesgos / decisiones abiertas

- Inconsistencia terminológica entre variantes de ejercicios.
- Desalineación futura entre `EXDB` y el pack.
- Carrera entre imports asíncronos de idiomas.
- Nombres españoles extensos en filas móviles.

## 20. Pendientes / preguntas abiertas

- Definir durante la implementación el formato mínimo del glosario versionado.
- Confirmar una muestra funcional de ejercicios comunes y variantes parecidas antes de cerrar el slice.
