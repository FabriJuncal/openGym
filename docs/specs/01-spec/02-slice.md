# 02-slice — Guarda dirigida y rollout de producción

## 1. Nombre del slice

Guarda dirigida y rollout de producción.

## 2. Objetivo del slice

Prevenir la pérdida accidental de la configuración CDN y llevar a producción el preview validado con verificación y rollback definidos.

## 3. Problema puntual que resuelve

Un preview funcional no corrige producción por sí solo y un cambio futuro del comando de build podría restaurar silenciosamente las rutas relativas rotas.

## 4. Valor observable que entrega

Los usuarios de producción ven la miniatura y la animación de los ejercicios, y el equipo dispone de una comprobación acotada que detecta la regresión principal.

## 5. Alcance específico

Agregar una guarda mínima sobre el build de Vercel, ejecutar validación final del preview, promoverlo y realizar un smoke test productivo.

## 6. Qué incluye

- Comprobación automatizable `frontend/scripts/check-vercel-media.mjs` de que el build de Vercel incorpora ambas bases CDN.
- Ejecución del build específico como gate.
- Confirmación final del preview aprobado.
- Promoción mediante el flujo existente de Vercel.
- Smoke test productivo sobre un JPG y un GIF.
- Criterios de activación y comprobación del rollback.

## 7. Qué no incluye

- Tests HTTP de los 1.324 JPG y 1.324 GIF.
- Regresión funcional completa.
- Pruebas de rendimiento, carga o seguridad.
- Cambios a ejercicios, API, datos, Docker o aplicaciones nativas.
- Monitoreo permanente o incorporación de una plataforma de observabilidad.

## 8. Actores involucrados

- Desarrollador implementador.
- Reviewer o responsable de release.
- Vercel.
- Usuario web de producción.

## 9. Precondiciones

- `01-slice` aceptado.
- Preview accesible y validado.
- Permiso para promover a producción.
- Deployment anterior identificable para rollback.

## 10. Entradas necesarias

- Artefacto o commit validado en el preview.
- Comando `build:vercel`.
- URL del preview.
- URL de producción.
- Un ejercicio de muestra con JPG y GIF.
- Identificador del deployment productivo anterior.

## 11. Flujo operativo paso a paso

1. Implementar una guarda dirigida que falle si falta alguna base CDN en el build de Vercel.
2. Ejecutar `npm --prefix frontend run build:vercel` y la guarda.
3. Repetir en preview el smoke de miniatura, GIF y alternancia a JPG.
4. Registrar el deployment anterior como objetivo de rollback.
5. Promover el preview validado mediante el flujo existente.
6. Comprobar en producción un JPG, un GIF y el flujo visual inmediato.
7. Si falla un criterio obligatorio, ejecutar el rollback.
8. Confirmar que el rollback restaura el resto de la aplicación al deployment anterior.

## 12. Salidas esperadas

- Guarda dirigida de configuración de medios.
- Evidencia de build exitoso.
- Deployment productivo promovido.
- Evidencia de smoke productivo.
- Referencia y procedimiento de rollback.

## 13. Reglas de negocio aplicables

- Sólo se promueve el mismo artefacto o commit validado en preview.
- Un HTML con status `200` no basta: los dos formatos de medio deben cargar.
- La guarda valida configuración, no disponibilidad exhaustiva del dataset.
- Un fallo de medios verificado inmediatamente después de promover activa rollback si no puede corregirse de forma segura dentro del mismo deployment.
- Volver al deployment anterior protege la aplicación, aunque recupere el fallo de medios conocido.

## 14. Validaciones

- La guarda detecta la ausencia de `VITE_IMG_BASE` o `VITE_GIF_BASE` en el resultado esperado.
- El build específico termina con exit code 0.
- El preview sigue cumpliendo los criterios del `01-slice`.
- Producción responde `200` para el JPG y el GIF seleccionados.
- La biblioteca y el detalle renderizan esos recursos con dimensión natural mayor que cero.
- No aparecen errores `404`, `502`, CORS o mixed-content en el flujo validado.

## 15. Manejo de errores o edge cases

- Si la guarda falla, no promover hasta corregir la configuración.
- Si preview y producción difieren, comparar commit, variables efectivas y artefacto antes de reintentar.
- Si jsDelivr falla antes de la promoción, detener el rollout sin modificar producción.
- Si el deployment rompe flujos no relacionados de forma evidente, ejecutar rollback aunque los medios funcionen.
- Si sólo falla la caché offline, registrar el resultado contra la pregunta abierta; no bloquear este slice salvo que offline se declare requisito.

## 16. Criterios de aceptación

1. Existe una guarda acotada que detecta la pérdida de cualquiera de las dos bases CDN del build de Vercel.
2. El build y la guarda terminan correctamente antes de promover.
3. Se identifica el deployment anterior antes del rollout.
4. El commit o artefacto validado en preview es el promovido.
5. En producción, un JPG y un GIF responden `200` y se renderizan.
6. La alternancia GIF/JPG funciona en el detalle.
7. El procedimiento de rollback está registrado y tiene un criterio de éxito verificable.

## 17. Dependencias técnicas, funcionales o externas

- Resultado del `01-slice`.
- Flujo de deployments y promociones de Vercel.
- jsDelivr.
- Comando de build del frontend.
- Script `frontend/scripts/check-vercel-media.mjs` para la guarda dirigida.

## 18. Depende de slices

- `01-slice`.

## 19. Riesgos / decisiones abiertas

- Una guarda demasiado acoplada a nombres de chunks sería frágil; debe comprobar la propiedad estable mínima.
- El rollback restaura el estado anterior, no una segunda fuente funcional de medios.
- La disponibilidad externa puede variar entre preview y producción.

## 20. Pendientes / preguntas abiertas

- Registrar la URL productiva y el identificador del deployment anterior en la evidencia de ejecución, no en archivos con secretos.
