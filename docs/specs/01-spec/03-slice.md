# 03-slice — Medios en desarrollo local

## 1. Nombre del slice

Medios en desarrollo local.

## 2. Objetivo del slice

Proporcionar un procedimiento canónico y comprobado para que el frontend iniciado con Vite pueda servir las imágenes y GIF locales sin respuestas `502`.

## 3. Problema puntual que resuelve

`npm run dev` redirige `/img` y `/gif` a `MEDIA_TARGET`, pero no inicia el servidor esperado en `127.0.0.1:8888`. Tener los archivos dentro de `media/` no basta para hacerlos accesibles por HTTP.

## 4. Valor observable que entrega

Un desarrollador puede seguir un procedimiento documentado desde un checkout válido y ver las miniaturas y el GIF de detalle en el frontend local.

## 5. Alcance específico

Elegir, documentar y validar una única forma canónica de exponer `media/` al proxy de Vite durante el desarrollo local.

## 6. Qué incluye

- Definición del procedimiento local canónico.
- Documentación del orden de inicio y de `MEDIA_TARGET` cuando corresponda.
- Helper versionado `frontend/scripts/serve-media.mjs`, invocado con `npm run dev:media`.
- Smoke test local de un JPG, un GIF y el flujo visual inmediato.
- Mensaje de troubleshooting para `ECONNREFUSED`/`502`.

## 7. Qué no incluye

- Cambios al comportamiento productivo de Vercel.
- Copiar `media/` a `frontend/public` o `frontend/dist`.
- Reemplazar Docker como flujo de ejecución completo.
- Introducir orquestación compleja para dos procesos.
- Probar API, autenticación o persistencia local.
- Modificar el dataset.

## 8. Actores involucrados

- Desarrollador frontend.
- Contribuidor que prepara el entorno local.

## 9. Precondiciones

- Node y dependencias de frontend disponibles.
- Directorios `media/img` y `media/gif` poblados.
- Puerto del servidor de medios libre o `MEDIA_TARGET` configurado a otro destino.

## 10. Entradas necesarias

- `frontend/vite.config.js`.
- Scripts existentes de `frontend/package.json`.
- Documentación de desarrollo existente.
- Directorio `media/`.
- Helper versionado `frontend/scripts/serve-media.mjs` y script `dev:media`.

## 11. Flujo operativo paso a paso

1. Usar el helper versionado `npm run dev:media` para servir la raíz `media/`.
2. Documentar el comando canónico y su relación con `MEDIA_TARGET`.
3. Asegurar que el servidor escuche en el destino predeterminado o documentar `MEDIA_TARGET`.
4. Iniciar el servidor de medios.
5. Iniciar el frontend con `npm run dev`.
6. Solicitar directamente un JPG y un GIF a través de Vite.
7. Abrir la biblioteca y el detalle de un ejercicio.
8. Documentar la recuperación cuando el puerto esté ocupado o el servidor no esté activo.

## 12. Salidas esperadas

- Procedimiento local canónico y ejecutable.
- Helper mínimo versionado sin dependencias externas.
- Documentación de troubleshooting.
- Evidencia de respuestas `200` y MIME correctos a través de Vite.

## 13. Reglas de negocio aplicables

- La raíz servida debe ser `media/`, de modo que existan `/img/...` y `/gif/...`.
- El procedimiento no debe copiar 137 MB al bundle.
- Si se usa un destino distinto de `127.0.0.1:8888`, debe establecerse `MEDIA_TARGET` de forma explícita.
- Docker conserva su flujo actual y no depende de este procedimiento.
- No se exige iniciar la API para validar medios en modo invitado.

## 14. Validaciones

- Antes del servidor de medios, una muestra reproduce el `502` esperado.
- Después de seguir el procedimiento, el mismo JPG responde `200` y `image/jpeg` a través de Vite.
- El mismo GIF responde `200` y `image/gif` a través de Vite.
- La biblioteca muestra al menos una miniatura con dimensión natural mayor que cero.
- El detalle muestra el GIF y permite alternar al JPG.
- Al detener el servidor, el troubleshooting permite identificar `ECONNREFUSED` sin confundirlo con un archivo faltante.

## 15. Manejo de errores o edge cases

- Si el puerto 8888 está ocupado, identificar el proceso o configurar otro puerto junto con `MEDIA_TARGET`.
- Si `media/` está vacío, usar el mecanismo existente de descarga antes de iniciar el servidor.
- Si un archivo concreto devuelve `404` pero otros cargan, validar su nombre contra el catálogo.
- Si `/api/me` falla pero los medios responden `200`, tratarlo como una dependencia separada fuera de este slice.
- Evitar comandos dependientes de software no declarado sin documentar su instalación.

## 16. Criterios de aceptación

1. Existe un único procedimiento local recomendado y documentado.
2. El procedimiento parte de `media/` y no copia sus archivos al bundle.
3. Un JPG solicitado mediante Vite responde `200` y `image/jpeg`.
4. Un GIF solicitado mediante Vite responde `200` y `image/gif`.
5. Biblioteca, detalle y alternancia GIF/JPG funcionan localmente.
6. El caso de servidor apagado o puerto ocupado tiene una indicación concreta de diagnóstico.
7. Docker y los comandos de build existentes no cambian de comportamiento.

## 17. Dependencias técnicas, funcionales o externas

- Vite y su proxy de desarrollo.
- `MEDIA_TARGET`.
- Archivos locales bajo `media/`.
- Helper `frontend/scripts/serve-media.mjs` basado en Node estándar.

## 18. Depende de slices

Ninguno. Se implementa después de `02-slice` sólo por prioridad operativa.

## 19. Riesgos / decisiones abiertas

- Un comando basado en una herramienta no declarada podría no funcionar en un checkout limpio.
- Agregar dependencias sólo para servir archivos podría ser desproporcionado; debe preferirse la alternativa mínima reproducible.
- El puerto predeterminado puede estar ocupado en algunas máquinas.

## 20. Pendientes / preguntas abiertas

- El procedimiento se documenta en `CONTRIBUTING.md`; no quedan decisiones bloqueantes para este slice.
