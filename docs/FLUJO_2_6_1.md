# Flujo corregido — DecidoBien 2.6.1-review.1

Base: `9b19f10`, rama `implementation/correa-phaser-demo`. Esta entrega responde a la pérdida de orden reportada por Julisa. Conserva la dirección visual y el contenido; corrige navegación, orientación y cierre. No agrega una nueva mecánica de juego.

## Problemas comprobados en la base

| Problema | Evidencia en `9b19f10` | Corrección |
| --- | --- | --- |
| «Comenzar misión» podía abrir una etapa avanzada sin anunciarlo | `startPractice()` asignaba siempre `identityReturn='practice'`; `enterMission()` reutilizaba `journey.stage` | Antes de continuar se muestra el destino exacto del avance conservado. Nombre/apellido indica si se entra al contexto o se retoma una etapa/pregunta. |
| Salir de evaluación perdía la referencia de esa pantalla | `navigate('home')` reemplazaba `state.view`; no existía un punto de retorno. Con cero respuestas no podía inferirse la evaluación | `resumeView` conserva el punto de retorno, incluso antes de la primera respuesta. Las respuestas anteriores siguen en la misma clave de progreso. |
| El contexto tenía dos salidas que parecían actividades distintas | Un marcador «+» de la escena y el botón principal llamaban ambos a `phase('explore')` | Se retira el marcador. El contexto avanza únicamente mediante «Explorar la escena». |
| No se entendían los puntos de progreso ni qué seguía | El nombre solo estaba en el encabezado; la fila mostraba siete círculos sin texto visible | «Paso N de 7 · nombre» y «Después: siguiente etapa», con el mismo orden en práctica, evaluación y resultado. El indicador no es un menú que permita saltar requisitos. |
| Resultado parecía otro documento y no tenía un cierre inmediato | Contenido de transferencia, respuestas y certificado precedían a la acción final | Se conserva el marco de la misión y se ofrece «Finalizar misión». Consulta, revisión y certificado quedan disponibles bajo títulos desplegables claros. |
| Repetir evaluación borraba respuestas al primer clic | El manejador reiniciaba `state.evaluation` inmediatamente | Se explica el reemplazo y se permite conservar el resultado. Una misión completada distingue revisar resultado de comenzar un nuevo recorrido. |

El logo ahora vuelve al inicio de la aplicación de forma explícita. En evaluación utiliza la salida confirmada que conserva las respuestas, en vez de recargar la pantalla actual con un enlace de aspecto ambiguo.

## Secuencia única

**Inicio → Nombre y apellido → Contexto/Observa → Explora → Decide → Descubre → Aplica → Evaluación → Resultado.**

Identificación es preparación previa; los siete pasos comienzan en Observa y terminan en Resultado. La evaluación mantiene tres preguntas, confirmación y recuperación sin pistas ni señales de acierto durante el intento. Preparar la consulta no la envía ni modifica una condición del equipo.

`canAdvance()` comprueba el orden y el requisito de la actividad anterior: hallazgo, decisión confirmada, detalles revisados y consulta preparada. No hay avance automático por tiempo, animación, acierto o toque en el contexto. Cada paso conserva una acción principal.

No se modifican los JSON educativos, respuestas correctas, retroalimentaciones, preguntas, zonas del detector, la ilustración, el logo, los archivos de Kuky ni la política de certificados. El caso y la ilustración siguen pendientes de validación preventiva.

## Retomar sin perder respuestas

Salir conserva `resumeView`. Volver al inicio no elimina intentos, selección pendiente o respuestas confirmadas. Si falta el nombre de la pestaña se solicita y se anuncia exactamente la etapa/pregunta recuperada. En una misión terminada el resultado permanece disponible; reemplazarlo requiere escoger explícitamente una nueva misión. No se implementa un registro empresarial o archivo histórico de intentos.

En un progreso antiguo sin respuestas y guardado en Inicio, la versión anterior no registró si ya se había abierto la evaluación. Ese dato perdido no se puede reconstruir: se informa la etapa de práctica efectivamente guardada. Desde esta versión el punto de retorno sí se registra. No se borra progreso para resolver esa ambigüedad.

## Evidencia

[Video móvil del recorrido](flujo-2.6.1/DecidoBien-flujo-2.6.1.mp4). [Nombre](flujo-2.6.1/390-nombre.png) · [Contexto](flujo-2.6.1/390-contexto.png) · [Decide](flujo-2.6.1/390-decide.png) · [Retomar evaluación](flujo-2.6.1/390-retomar-evaluacion.png) · [Resultado](flujo-2.6.1/390-resultado.png).

`flow.test.js` prueba destinos antiguos y nuevos, evaluación sin respuesta al salir al inicio, resultado completo y transiciones con requisitos. `tests/flow-browser.py` recorre la misión con teclado en celular y escritorio; sale y retoma Contexto, Explora y Decide; retoma evaluación antes de responder; recupera la segunda pregunta sin nombre; confirma y recarga respuestas; cancela reinicios; corrige identificación; vuelve al resultado offline y comienza una nueva misión por elección explícita.

Las regresiones existentes se ajustan al único botón de salida del contexto y a la apertura explícita de detalles opcionales. Las pruebas de red bloqueada se distinguen de la señal `navigator.onLine` del navegador; no equivalen a una prueba física de desconexión ni de sincronización empresarial.

La versión se consulta en Ajustes. Caché `decidobien-v16-flow`; la recuperación conserva respuestas y elimina únicamente cachés antiguas conocidas. No se cambia la rama de trabajo ni `main`.

## Pendientes separados

La claridad se ha comprobado con recorridos automatizados y capturas; todavía requiere una prueba con una persona nueva y trabajadores. Siguen pendientes validación preventiva, dispositivos físicos/lectores de pantalla, infraestructura y emisión empresarial, y el Codespace del usuario. La revisión local no valida estos ámbitos ni demuestra mejora de retención.
