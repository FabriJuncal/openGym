# 01-slice — Build CDN de Vercel y validación en preview

## 1. Nombre del slice

Build CDN de Vercel y validación en preview.

## 2. Objetivo del slice

Producir un deployment preview de Vercel en el que las imágenes y animaciones de los ejercicios incluidos carguen desde el CDN versionado.

## 3. Problema puntual que resuelve

El build actual genera rutas `img/` y `gif/`, mientras que Vercel publica sólo `frontend/dist` y excluye `media/`. El resultado son respuestas `404` para los medios.

## 4. Valor observable que entrega

Una persona puede abrir la biblioteca en el preview, ver una miniatura, abrir el ejercicio y reproducir o pausar su animación sin errores de red de medios.

## 5. Alcance específico

Configurar un build exclusivo de Vercel con bases CDN, generar un preview y verificar el flujo visual y HTTP mínimo.

## 6. Qué incluye

- Validación previa de un JPG y un GIF en el CDN versionado.
- Script `build:vercel` separado del build genérico y del móvil.
- Actualización de Vercel para usar `build:vercel`.
- Conservación de `media/` fuera del artefacto.
- Build local equivalente y deployment preview.
- Smoke test manual dirigido sobre biblioteca y detalle.

## 7. Qué no incluye

- Promoción a producción.
- Nuevos medios o cambios al catálogo.
- Soporte de medios para ejercicios personalizados.
- Modificaciones a Docker, API o builds nativos.
- Cambios al service worker para caché cross-origin.
- Pruebas de los 1.324 recursos de manera individual.

## 8. Actores involucrados

- Desarrollador implementador.
- Reviewer del preview.
- Vercel.
- jsDelivr.
- Usuario de validación.

## 9. Precondiciones

- Dependencias de `frontend` instaladas.
- Proyecto vinculado con Vercel.
- Acceso para crear un deployment preview.
- Revisión CDN de `build:mobile` identificada.
- Al menos un ejercicio incluido con JPG y GIF conocido.

## 10. Entradas necesarias

- `frontend/package.json`.
- `vercel.json`.
- `frontend/src/lib/exercises.js`.
- URL base de imágenes y URL base de videos del CDN versionado.
- Nombre de un JPG y un GIF representativos del catálogo.

## 11. Flujo operativo paso a paso

1. Solicitar directamente un JPG y un GIF del CDN fijado.
2. Confirmar status `200`, HTTPS y MIME compatible.
3. Agregar `build:vercel` con `VITE_IMG_BASE` y `VITE_GIF_BASE`, sin activar `VITE_MOBILE`.
4. Configurar Vercel para ejecutar el nuevo script.
5. Ejecutar el build de Vercel localmente.
6. Confirmar que el bundle contiene las bases CDN y que `frontend/dist` no incorpora `media/`.
7. Crear un deployment preview.
8. Abrir la biblioteca y comprobar al menos una miniatura.
9. Abrir el detalle del mismo ejercicio y comprobar el GIF.
10. Alternar GIF/JPG y revisar las respuestas de red.

## 12. Salidas esperadas

- Script de build específico para Vercel.
- Configuración de Vercel alineada con el script.
- Bundle con URLs CDN absolutas.
- Deployment preview validado.
- Evidencia de status y MIME para un JPG y un GIF.

## 13. Reglas de negocio aplicables

- El CDN debe usar una revisión inmutable.
- Las bases deben terminar en `/` para concatenarse con los nombres del catálogo.
- El build de Vercel no debe activar el modo móvil.
- Los ejercicios personalizados siguen sin medios.
- `media/` permanece excluido del artefacto de Vercel.

## 14. Validaciones

- El JPG de muestra responde `200` y `image/jpeg`.
- El GIF de muestra responde `200` y `image/gif`.
- `npm --prefix frontend run build:vercel` termina con exit code 0.
- El resultado compilado referencia ambas bases CDN.
- El preview no solicita `/img/...` ni `/gif/...` al dominio de Vercel para ejercicios incluidos.
- Miniatura, GIF y JPG alternativo tienen dimensión natural mayor que cero.

## 15. Manejo de errores o edge cases

- Si una muestra CDN devuelve error, no se modifica el build hasta validar la revisión correcta.
- Si la base no termina en `/`, corregirla antes del preview para evitar URLs concatenadas inválidas.
- Si el preview conserva un bundle anterior, forzar un nuevo deployment y verificar el hash del asset cargado.
- Si sólo falla uno de los formatos, revisar por separado `VITE_IMG_BASE` y `VITE_GIF_BASE`.
- Los fallos de `/api/me` en un entorno sin API local no se confunden con fallos de medios.

## 16. Criterios de aceptación

1. Existe un build de Vercel separado que incorpora las dos bases CDN versionadas.
2. Vercel utiliza ese build para el preview.
3. Una miniatura JPG visible carga con status `200` y ancho natural mayor que cero.
4. El GIF del detalle carga con status `200` y ancho natural mayor que cero.
5. Al tocar la animación se muestra el JPG correspondiente.
6. No hay respuestas `404` o `502` para los medios verificados.
7. El artefacto no contiene copias de `media/img` o `media/gif`.

## 17. Dependencias técnicas, funcionales o externas

- Vite.
- Configuración de Vercel.
- jsDelivr.
- Revisión fijada de `hasaneyldrm/exercises-dataset`.
- Componente `Media` y helpers `imgSrc`/`gifSrc` existentes.

## 18. Depende de slices

Ninguno.

## 19. Riesgos / decisiones abiertas

- Dependencia de disponibilidad de jsDelivr.
- Un error en el nombre o barra final de las bases rompe todos los medios de ese tipo.
- La caché offline cross-origin no se resuelve en este slice.

## 20. Pendientes / preguntas abiertas

- Confirmar si el comportamiento offline se documentará posteriormente como un requerimiento independiente.
