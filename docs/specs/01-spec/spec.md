# Spec 01 — Entrega confiable de medios de ejercicios

## 1. Resumen general

openGym dispone de 1.324 imágenes JPG y 1.324 animaciones GIF correctamente referenciadas por el catálogo de ejercicios, pero los medios no están disponibles en los dos entornos afectados: el artefacto de Vercel no los publica y el servidor de desarrollo de Vite depende de un servicio de medios externo que no se inicia con `npm run dev`.

Esta iniciativa hará que el build web de Vercel use el CDN versionado que ya utiliza el build móvil, validará el cambio en preview antes de producción y dejará un procedimiento local reproducible para servir los medios. No modifica el catálogo, los datos de usuarios ni el comportamiento intencional de los ejercicios personalizados.

## 2. Objetivo

Conseguir que las imágenes y animaciones de los ejercicios incluidos carguen de forma confiable en Vercel y durante el desarrollo local, con una configuración reproducible, validaciones dirigidas y rollback explícito.

## 3. Contexto

- El frontend construye las URLs mediante `VITE_IMG_BASE` y `VITE_GIF_BASE`; sin variables usa `img/` y `gif/`.
- Vite redirige `/img` y `/gif` a `MEDIA_TARGET`, cuyo valor predeterminado es `http://127.0.0.1:8888`.
- Docker monta `media/img` y `media/gif` dentro de nginx y no presenta el mismo problema cuando la composición está activa.
- Vercel publica únicamente `frontend/dist` y excluye `media/` mediante `.vercelignore`.
- El build móvil ya usa jsDelivr con una revisión inmutable del dataset.
- El diagnóstico confirmó que los 2.648 archivos existen, son válidos y coinciden exactamente con las referencias del catálogo.

## 4. Problema u oportunidad que se aborda

La aplicación renderiza elementos `<img>` con rutas válidas, pero los servidores que reciben esas rutas no siempre tienen un origen de medios disponible. En desarrollo, las peticiones devuelven `502` cuando no existe un servidor en el puerto 8888. En el artefacto de Vercel, las mismas rutas devuelven `404` porque las carpetas no forman parte del output publicado.

La oportunidad es separar de forma explícita la estrategia de medios por entorno: CDN público para Vercel, montaje local para Docker y procedimiento reproducible para desarrollo con Vite.

## 5. Alcance

- Crear un build específico y determinista para Vercel con bases CDN versionadas.
- Configurar Vercel para ejecutar ese build sin incluir los 137 MB de medios locales.
- Validar JPG, GIF, cambio de animación a imagen fija y respuestas HTTP en un deployment preview.
- Promover a producción únicamente el preview validado.
- Incorporar una guarda de regresión mínima sobre la configuración de medios.
- Proporcionar un procedimiento local canónico para que `MEDIA_TARGET` tenga un servidor de medios disponible.
- Documentar triggers y pasos de rollback.

## 6. Fuera de alcance

- Permitir subir imágenes o videos a ejercicios personalizados.
- Cambiar el dataset, sus nombres de archivo o el catálogo de ejercicios.
- Incluir `media/` dentro de `frontend/dist` o del artefacto de Vercel.
- Rediseñar el componente `Media` o las pantallas que lo consumen.
- Modificar autenticación, API, persistencia o datos de usuarios.
- Cambiar la arquitectura de Docker o del build móvil.
- Garantizar caché offline de medios CDN mientras esa expectativa permanezca sin definir.
- Ejecutar regresión completa, pruebas de carga, seguridad o aplicaciones nativas.

## 7. Actores involucrados

- Usuario web que consulta la biblioteca y el detalle de ejercicios.
- Desarrollador que ejecuta el frontend localmente.
- Responsable de revisar y promover deployments de Vercel.
- Vercel como host de la aplicación web.
- jsDelivr y el repositorio versionado del dataset como origen externo de medios.

## 8. Requerimientos funcionales

1. **RF-01:** El build de Vercel debe generar URLs absolutas y HTTPS para las imágenes y GIF del dataset.
2. **RF-02:** Las URLs deben apuntar a una revisión inmutable del dataset, no a una rama mutable como `main`.
3. **RF-03:** La biblioteca debe mostrar miniaturas de ejercicios incluidos sin errores `404` o `502`.
4. **RF-04:** El detalle de un ejercicio incluido debe reproducir su GIF y permitir alternar a la imagen JPG.
5. **RF-05:** El cambio debe validarse en un deployment preview antes de promoverse a producción.
6. **RF-06:** Debe existir una validación mínima que detecte si el build de Vercel deja de incorporar las bases CDN.
7. **RF-07:** El desarrollo local debe disponer de un procedimiento canónico para servir `media/` en el destino configurado por `MEDIA_TARGET`.
8. **RF-08:** Los ejercicios personalizados deben continuar sin imagen ni animación, de acuerdo con el comportamiento actual.

## 9. Requerimientos no funcionales

1. **RNF-01:** Las respuestas de muestra deben ser `200` y declarar un tipo MIME de imagen compatible.
2. **RNF-02:** La configuración CDN debe ser pública, reproducible y no depender de secretos.
3. **RNF-03:** El build de Vercel no debe incorporar los archivos locales de `media/`.
4. **RNF-04:** La solución no debe alterar los builds por defecto, Docker o móvil fuera de lo expresamente indicado.
5. **RNF-05:** Las pruebas deben ser dirigidas al riesgo real: configuración de build y disponibilidad de un JPG y un GIF.
6. **RNF-06:** El rollback debe poder realizarse promoviendo un deployment anterior o revirtiendo el cambio de build.

## 10. Reglas de negocio

1. Sólo los ejercicios incluidos con propiedades `img` y `gif` tienen medios del dataset.
2. Los ejercicios personalizados permanecen sin animación y no forman parte de esta iniciativa.
3. Vercel usa CDN; Docker conserva rutas del mismo origen respaldadas por sus volúmenes.
4. La revisión del CDN debe coincidir con la que ya usa el build móvil, salvo decisión explícita y validada de actualizarla.
5. Un deployment no se considera válido si el documento principal carga pero las peticiones de medios fallan.
6. Las observaciones opcionales de la revisión —caché offline y reducción del alcance de pruebas— no bloquean la corrección principal.

## 11. Flujo general

1. Validar un JPG y un GIF representativos en el CDN versionado.
2. Construir el frontend con variables de base CDN específicas para Vercel.
3. Generar un deployment preview.
4. Verificar biblioteca, detalle, alternancia GIF/JPG y red HTTP.
5. Ejecutar la guarda de regresión dirigida.
6. Promover el preview validado a producción.
7. Verificar nuevamente una imagen y un GIF en producción.
8. En desarrollo local, iniciar o configurar el servidor de medios antes de navegar la biblioteca.

## 12. Entradas y salidas relevantes

### Entradas

- Revisión inmutable del dataset actualmente usada por `build:mobile`.
- Nombres `img` y `gif` del catálogo.
- Variables `VITE_IMG_BASE`, `VITE_GIF_BASE` y `MEDIA_TARGET`.
- Configuración de build y despliegue de Vercel.
- Directorios locales `media/img` y `media/gif`.

### Salidas

- Bundle de Vercel con bases CDN incorporadas.
- Preview validado y deployment productivo funcional.
- Evidencia HTTP de un JPG y un GIF.
- Guarda de regresión acotada.
- Procedimiento local reproducible.

## 13. Dependencias

- Vite y su sustitución de variables `VITE_*` durante el build.
- Vercel y el flujo existente de preview/promoción.
- jsDelivr.
- Repositorio `hasaneyldrm/exercises-dataset` en la revisión fijada.
- Archivos locales de `media/` para desarrollo y Docker.
- Navegador con soporte de imágenes JPG y GIF.

## 14. Riesgos, restricciones o consideraciones

- **Disponibilidad externa:** Vercel dependerá de jsDelivr para los medios; se mitiga con revisión inmutable y validación previa.
- **Configuración perdida:** un cambio futuro podría volver a ejecutar el build genérico; se mitiga con una guarda que inspeccione la configuración resultante.
- **Caché offline:** el service worker actual ignora recursos cross-origin. La corrección online no debe ampliarse silenciosamente para resolverlo.
- **Desarrollo local:** documentar un comando que no exista o dependa de software no declarado dejaría el `502` sin resolver; el procedimiento elegido debe probarse desde un checkout válido.
- **Rollback limitado:** volver al deployment anterior restaura el estado previo, incluido el fallo de medios. El rollback protege el resto de la aplicación, no constituye una solución alternativa para los medios.
- **Restricción de alcance:** no se incorporarán 137 MB al artefacto de Vercel.

## 15. Estrategia de slicing

La iniciativa se divide en tres slices verticales y verificables:

1. Resolver y demostrar la entrega de medios en un preview de Vercel.
2. Añadir la guarda mínima, promover el preview y confirmar producción con rollback disponible.
3. Resolver de forma independiente el flujo de medios durante el desarrollo local.

El comportamiento offline queda como decisión abierta porque fue clasificado como observación opcional y no es necesario para corregir la indisponibilidad actual.

## 16. Roadmap de slices

| Orden | Slice | Resultado observable | Dependencias |
|---|---|---|---|
| 1 | `01-slice` — Build CDN de Vercel y preview | Las miniaturas y el GIF funcionan en un preview | Ninguna |
| 2 | `02-slice` — Guarda dirigida y rollout de producción | Producción sirve los medios y existe rollback verificable | `01-slice` |
| 3 | `03-slice` — Medios en desarrollo local | La biblioteca local carga medios sin `502` siguiendo un procedimiento canónico | Ninguna; se ejecuta después para priorizar producción |

## 17. Supuestos, pendientes y preguntas abiertas

- **Supuesto:** Vercel es el entorno productivo afectado y se mantendrá como host web.
- **Supuesto:** la revisión CDN usada por `build:mobile` contiene los mismos nombres presentes en el catálogo; el primer slice debe confirmarlo con muestras antes de modificar el build.
- **Pendiente:** disponer de una URL de preview y de producción para las verificaciones HTTP.
- **Resuelto:** el `03-slice` usa el helper versionado `frontend/scripts/serve-media.mjs`, invocado con `npm run dev:media`, para no añadir dependencias externas.
- **Pregunta abierta no bloqueante:** ¿los medios deben quedar disponibles offline en la PWA web? Si la respuesta es afirmativa, se documentará como una iniciativa posterior o ampliación explícita.
