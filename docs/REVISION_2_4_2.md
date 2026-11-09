# Revisión de 2f8275d — correcciones 2.4.0-review.3

Se revisó el recorrido publicado, su código y el servidor real del entorno de desarrollo. GitHub coincidía con `2f8275d`, release `2.4.0-review.1`; no se verificó el Codespace del usuario.

| Hallazgo reproducido | Corrección |
| --- | --- |
| En 320×568 y 360×640, el mensaje de Kuky cubría parte de «Ajustar» | En retratos de poca altura, el guía ocupa su propia fila dentro de la misma escena. No se superpone a las acciones. Puede requerirse un desplazamiento vertical breve |
| En 844×390, el tablero conservaba una altura mínima pero calculaba la imagen desde una altura menor: quedaba pequeña con mucho espacio vacío | En horizontal de poca altura se distribuyen escena y respuesta en columnas dentro del mismo tablero, con medidas coherentes |
| En pantallas bajas, la confirmación recibía foco con teclado pero podía quedar fuera de la vista | Se desplaza lo mínimo para mostrar el control enfocado; no se desplaza la página si ya está visible |
| Al retirar un asunto, la devolución seguía usando «Asunto incluido» y el texto principal no anunciaba el estado | La respuesta accesible diferencia incluido/no incluido y la confirmación permanece deshabilitada cuando no queda ningún asunto |

Se conservaron la misión, el arte, el logo, Kuky, los títulos, los límites del rol y la evaluación. No se animó maquinaria ni se incorporaron nuevas tareas o controles técnicos.

## Verificación

- 20 pruebas de contenido/modelo.
- Ruta completa con teclado, offline, movimiento reducido y recuperación de la evaluación.
- Prueba de regresión en 320×568, 360×640, 390×844, 667×375, 844×390 y 1024×768: sin superposición entre guía/acciones o controles/área de respuesta; estado de selección anunciado y recuperado tras recargar.
- Audio activado, silencio y recursos offline.
- Pruebas de servidor y navegador de seguridad.
- Actualización desde la implementación publicada: respuestas confirmadas preservadas. La caché pasa a `decidobien-v11-focus`, sin borrar progreso ni cachés ajenas.

Comando específico: `python3 tests/layout-review.py`, con `npm start` activo. Los demás comandos siguen en README. Las capturas de comparación están en `revision-2.4.2/`.

## Pendientes sin cambio

Validación preventiva del equipo y proceso, piloto con trabajadores/dispositivos reales, revisión de configuración privada de GitHub bloqueada por la API y comprobación del Codespace. Las pruebas técnicas no aprueban el contenido ni convierten el resultado local en acreditación empresarial.

- Móvil: [antes](revision-2.4.2/antes-movil.png) · [después](revision-2.4.2/despues-movil.png).
- Horizontal: [antes](revision-2.4.2/antes-horizontal.png) · [después](revision-2.4.2/despues-horizontal.png).

`ecdc446` contiene las correcciones de composición y devolución; la revisión siguiente completa la visibilidad del foco con teclado. Se conservan ambas en el historial, sin reescribir commits.
