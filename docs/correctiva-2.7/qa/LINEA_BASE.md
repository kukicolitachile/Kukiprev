# QA independiente — línea base correctiva

La suite `tests/acceptance-corrections.py` y su helper propio `tests/corrections_helpers.py` se añadieron sin modificar producto, pruebas existentes ni el servicio candidato 4173.

Se extrajo `0def89f778fe16fcac2fe9d3b6adcec0f92528ae` con `git archive` a `baseline-fixture` y se inició únicamente ese fixture en 4186. El servidor informa versión `2.6.1-review.1`, huella pública `d903e9099f971e16`, idéntica a la auditoría. La copia exportada carece de `.git`; por eso su diagnóstico indica commit no disponible y no se presenta como un checkout limpio.

Resultados en Chromium con contextos aislados y nombres ficticios:

- UX-01 falla: los dos campos parcialmente escritos quedan vacíos después de cambiar movimiento.
- JG-01 falla en 1366×768: tras elegir foco 1, el centro físico del foco 0 recibe `.demo-response`; el foco sigue en 1.
- El control 390×844 pasa con los seis toques de ida y vuelta por todos los focos.
- SG-01/AR-01 falla: intentos 1 → cierre 0 → pestaña obsoleta 1. Se resucita el avance.

`baseline/checks.json` contiene método, medidas y errores; las cuatro capturas acompañan el archivo. Los fallos esperados siguen registrados como fallos, sin convertirlos en aprobaciones. La suite continúa después de cada caso para mantener independientes las evidencias.

La candidata 4173 está pendiente de señal de integración. No se han realizado pruebas humanas, lector de pantalla real, dispositivos físicos ni Safari.
