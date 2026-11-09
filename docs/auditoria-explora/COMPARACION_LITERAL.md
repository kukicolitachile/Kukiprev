# Comparación literal G1 → G6

`c49aa3e` → `c4aa98c`; el JSON no cambió desde `573c7e8`. Los textos de esta entrega no se reescriben. La aprobación de la síntesis y de la secuencia se identifica en J2; la revisión de coherencia pedagógica pendiente se distingue en la auditoría.

| Campo | c49aa3e | c4aa98c |
| --- | --- | --- |
| `.evaluacion[0].alternativas[0].texto` | Falta información para decidir con seguridad: deben aclararse el método, las condiciones requeridas del equipo y las responsabilidades para esa tarea. | Falta información para decidir con seguridad. |
| `.evaluacion[0].alternativas[1].texto` | La ausencia de movimiento visible es suficiente para comenzar la retirada. | Puedo retirar los estuches si no se mueve. |
| `.evaluacion[0].alternativas[2].texto` | La práctica en esta aplicación ya confirma que puedo realizar la tarea real. | El ejercicio me autoriza a intervenir. |
| `.evaluacion[0].pregunta` | En una revisión se propone retirar los estuches porque la correa parece detenida. No se ha confirmado cómo debe hacerse ni quién debe realizarlo. ¿Qué conclusión está respaldada? | La correa parece detenida. El método de retirada es desconocido. ¿Qué concluyes? |
| `.evaluacion[1].alternativas[0].texto` | Solo sabemos que se comunicó. Falta confirmar cómo se atendió la condición y qué debe estar resuelto antes de continuar la tarea. | Se comunicó; falta confirmar cómo se atendió. |
| `.evaluacion[1].alternativas[1].texto` | El peligro quedó eliminado porque otra persona ya sabe lo que ocurre. | El peligro quedó eliminado. |
| `.evaluacion[1].alternativas[2].texto` | Podemos suponer que la tarea está resuelta aunque no exista confirmación. | La tarea ya puede continuar. |
| `.evaluacion[1].pregunta` | La anomalía ya fue comunicada. ¿Qué podemos afirmar con esa información, sin añadir supuestos? | La anomalía fue comunicada. ¿Qué sabes con certeza? |
| `.evaluacion[2].alternativas[0].texto` | Revisar por qué se acumula material, cómo se puede alcanzar el movimiento, qué controles y método corresponden y cómo se organiza la respuesta a la anomalía. | Causa, acceso al peligro, controles y método. |
| `.evaluacion[2].alternativas[1].texto` | Pedir más atención sin revisar las condiciones del equipo ni la tarea. | Solo la atención de quien opera. |
| `.evaluacion[2].alternativas[2].texto` | Dar por conocido el motivo del atasco porque aparece en una ilustración. | Solo la rapidez para retirar los estuches. |
| `.evaluacion[2].pregunta` | Para reducir la necesidad de aproximar las manos cuando se acumula material, ¿qué revisión orienta mejor el aprendizaje al proceso? | El material se acumula repetidamente. ¿Qué conviene revisar? |
| `.interaccion.aplica.alternativas[0].correcta` | — (campo nuevo) | True |
| `.interaccion.aplica.alternativas[0].feedback` | — (campo nuevo) | Hay que aclarar método, condiciones del equipo y responsabilidades con prevención y los responsables técnicos. El caso no enseña a retirar estuches. |
| `.interaccion.aplica.alternativas[0].id` | — (campo nuevo) | ap-a |
| `.interaccion.aplica.alternativas[0].texto` | — (campo nuevo) | Falta información para decidir con seguridad. |
| `.interaccion.aplica.alternativas[1].correcta` | — (campo nuevo) | False |
| `.interaccion.aplica.alternativas[1].feedback` | — (campo nuevo) | La detención visible no demuestra condiciones seguras para intervenir. Faltan método y responsabilidades definidos. |
| `.interaccion.aplica.alternativas[1].id` | — (campo nuevo) | ap-b |
| `.interaccion.aplica.alternativas[1].texto` | — (campo nuevo) | Basta con comprobar que no se mueve. |
| `.interaccion.aplica.alternativas[2].correcta` | — (campo nuevo) | False |
| `.interaccion.aplica.alternativas[2].feedback` | — (campo nuevo) | La presencia de otra persona no resuelve el acceso al peligro. Deben aclararse las condiciones de la tarea. |
| `.interaccion.aplica.alternativas[2].id` | — (campo nuevo) | ap-c |
| `.interaccion.aplica.alternativas[2].texto` | — (campo nuevo) | Puedo hacerlo si otra persona está mirando. |
| `.interaccion.aplica.consigna` | — (campo nuevo) | Te proponen retirar estuches. ¿Qué debes aclarar? |
| `.interaccion.aplica.contexto` | — (campo nuevo) | El método y las responsabilidades de esa tarea no están definidos. |
| `.interaccion.decide` | — (campo nuevo) | La acumulación continúa. ¿Qué haces desde tu rol? |
| `.interaccion.descubre` | — (campo nuevo) | ¿Qué condiciones explican la exposición? |
| `.interaccion.explora` | — (campo nuevo) | ¿Dónde podría quedar atrapada una mano? |
| `.interaccion.focos[0].texto` | — (campo nuevo) | El ejemplo representa un encuentro entre banda y polea. Debe comprobarse cómo puede acceder una mano. |
| `.interaccion.focos[0].titulo` | — (campo nuevo) | Acceso al movimiento |
| `.interaccion.focos[0].zona` | — (campo nuevo) | zona-a |
| `.interaccion.focos[1].texto` | — (campo nuevo) | La acumulación puede motivar la aproximación. Su causa y el método de respuesta no están confirmados. |
| `.interaccion.focos[1].titulo` | — (campo nuevo) | La tarea que lleva a acercarse |
| `.interaccion.focos[1].zona` | — (campo nuevo) | zona-c |
| `.interaccion.focos[2].texto` | — (campo nuevo) | La imagen no permite verificar resguardos, método ni responsabilidades. Avisar no confirma que el peligro esté resuelto. |
| `.interaccion.focos[2].titulo` | — (campo nuevo) | Controles y método |
| `.interaccion.focos[2].zona` | — (campo nuevo) | zona-b |
| `.interaccion.observa` | — (campo nuevo) | La correa avanza a tirones. Se acumulan estuches. |
| `.interaccion.rol_breve` | — (campo nuevo) | Tu rol: reconocer y comunicar; no realizar ajustes ni desatascos. |
| `.practica.alternativas[0].feedback` | La escena no confirma el método, los controles, el estado requerido del equipo ni quién puede realizar la tarea. Prevención y los responsables técnicos del proceso deben aclarar estos puntos según sus funciones. Comunicar permite gestionar la anomalía; no demuestra que el peligro haya desaparecido. | Comunicar gestiona la anomalía, pero no elimina el peligro. Mantener las manos fuera del acceso representado no autoriza otra tarea. Falta validar la respuesta del proceso. |
| `.practica.alternativas[0].texto` | Falta información para decidir con seguridad. No intento retirar los estuches; comunico la anomalía y solicito aclarar las condiciones de esta tarea. | Comunico la anomalía sin acceder a la zona peligrosa. |
| `.practica.alternativas[1].feedback` | Comunicar no impide físicamente el acceso al movimiento ni confirma que la tarea pueda realizarse. La condición que permite la exposición continúa sin resolverse en la información del ejemplo. No corresponde intentar la retirada. | La exposición aparece al acceder al movimiento para resolver la acumulación. Deben revisarse acceso, controles y método; una lesión es una consecuencia posible, no inevitable. |
| `.practica.alternativas[1].texto` | Con avisar a otra persona basta para poder retirar la acumulación con la mano. | Retiro los estuches con la mano. |
| `.practica.alternativas[2].feedback` | Una detención visible no demuestra condiciones seguras para intervenir ni define tu función. En este caso no se dispone de información validada para enseñar ajustes o desatascos. Deben aclararse el método, las condiciones del equipo y las responsabilidades antes de plantear esa tarea. | La detención visible no demuestra una condición segura para intervenir. Este rol no incluye ajustes; el método y las responsabilidades siguen pendientes. |
| `.practica.alternativas[2].texto` | Si la correa deja de moverse a simple vista, ya puedo acomodar la banda. | Acomodo la banda si parece detenida. |
| `.practica.pregunta` | Antes de intentar retirar la acumulación, ¿qué conclusión permite la información disponible? | La acumulación continúa. ¿Qué haces desde tu rol? |
| `.practica.zonas[0].descripcion` | Zona de encuentro entre la banda y la polea del extremo | Banda junto a la polea del extremo |
| `.practica.zonas[1].descripcion` | Tramo plano de la banda, separado del extremo | Tramo central de la banda |
| `.practica.zonas[2].descripcion` | Estuches acumulados sobre la banda | Estuches acumulados |
| `.version` | 2.0-revision-1 | 2.1-interaccion-1 |
