# Glosario de nombres de ejercicios en español

Este glosario es la fuente humana mantenible para `frontend/src/exercise-names/es.js`. El archivo del frontend se genera; no se edita a mano.

## Convenciones

- Se usa terminología habitual de fuerza: `pull-up` → **dominada**, `row` → **remo**, `dip` → **fondos** y `deadlift` → **peso muerto**.
- **Press** se conserva cuando es el uso habitual en español de entrenamiento.
- Se preservan nombres propios y siglas de equipamiento: **Smith**, **EZ**, **TRX**, **BOSU** y **SkiErg**. La normalización canoniza los tokens completos `ez` y `bosu` aunque aparezcan en el medio del nombre o entre paréntesis, sin tocar fragmentos de otras palabras.
- Los nombres se almacenan en estilo oración, sin espacios sobrantes ni puntuación terminal.
- Un override por ID tiene prioridad cuando una traducción automática pierde un calificador o produce un término no usado en entrenamiento.

## Revisión dirigida

Antes de regenerar o aceptar un cambio, revisar:

- Ejercicios del plan demo.
- Levantamientos principales y sus variantes: press de banca, sentadilla, peso muerto, remo y dominadas.
- Primera página de la biblioteca.
- Cualquier entrada señalada por el validador de formato o por feedback funcional.

La primera revisión dirigida corrigió las variantes de dominada, flexión y fondos que aparecían en la primera página, además de los levantamientos principales incluidos en los overrides.

La revisión del plan demo confirmó y fijó: `remo inclinado con barra` (`0027`), `remo sentado en polea con cuerda` (`1323`) y `extensión de tríceps en polea (barra en V)` (`0241`). El resto de los IDs del plan se revisa como conjunto en el slice; esta lista registra únicamente las correcciones necesarias.
