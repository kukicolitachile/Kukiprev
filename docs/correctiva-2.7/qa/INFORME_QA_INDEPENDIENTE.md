# QA independiente de la entrega correctiva

**Resultado: PASS independiente en los 14 casos automatizados definidos.** Evidencia consolidada: [accepted-checks.json](accepted-checks.json). Se conservan también los resultados originales y las repeticiones, incluidos los fallos de expectativas del propio harness; no se han convertido registros fallidos en aprobaciones.

Candidata comprobada en `http://127.0.0.1:4173`: **2.7.0-review.1**, huella pública final **`4676a4426acebc39`**. La revalidación final informa HEAD `f4d9fbf465a575b3a2bc8089b9bdb9183eee2e62`, rama `implementation/correa-phaser-demo`, **árbol modificado**: el HEAD por sí solo no identifica el contenido final. Esta QA no creó commits ni administró el servicio 4173.

Los 12 casos anteriores pasaron sobre `2f1321a289e11d4c`. Una regresión más amplia de coordinación detectó después un defecto real en Decide al rotar a horizontal. La única modificación pública posterior fue cambiar una fila de grid de `minmax(180px,1fr)` a `minmax(0,1fr)` dentro de `orientation:landscape` y `max-height:600px`. Se retuvieron los diez casos independientes de retrato o escritorio de altura mayor a 600 px; se repitieron los dos horizontales afectados y se añadió la rotación, con huella `43fdbabc3b611da1`. Una segunda corrección específica de `.comic-shot` en retrato de altura máxima 720 px reduce a 140 px la fila de escena y su mínimo. Esta QA añadió Decide 360×640 y repitió el visor horizontal sobre `73a6a0ff4f16e403`. El último ajuste aproxima el encuadre de Decide cuando su área es corta y amplía el retrato; no cambia Explora, focos, detector, textos o guardado. Se repiten únicamente Decide 360×640 y la rotación a 844×390 sobre la huella final `4676a4426acebc39`; los otros doce alcances conservan sus resultados y runtimes originales. [accepted-checks.json](accepted-checks.json) conserva el runtime y archivo original por caso, sin presentar toda la batería como reejecutada sobre el mismo hash.

## Regresiones que discriminan la corrección

La base exportada `0def89f` en el fixture propio 4186, versión 2.6.1-review.1 y huella `d903e9099f971e16`, falla en las tres causas documentadas: campos vaciados al cambiar movimiento; centro del foco 0 cubierto por `.demo-response` después de seleccionar otro en 1366×768; recorrido cerrado que vuelve a guardar intentos `1 → 0 → 1` desde otra pestaña. El control 390×844 pasa. Véanse [línea base](LINEA_BASE.md) y [datos originales](baseline/checks.json).

En la candidata pasan esas mismas regresiones con lectura de la autoridad independiente del KEY legado. El cierre invalida la copia obsoleta y borra su identidad de sesión. Una escritura simulada posterior de estado obsoleto en el KEY legado deja la autoridad cerrada idéntica byte por byte. Esto verifica que una versión anterior no puede resucitar la autoridad; no afirma que su interfaz antigua muestre guardas que no implementaba.

## Casos ejecutados

| Caso | Entrada y tamaño | Resultado |
| --- | --- | --- |
| UX01-partial-name-settings | Campos parciales, Ajustes, cambiar movimiento, cerrar; 390×844 | PASS: ambos campos conservados; nombre ausente de localStorage. |
| JG01-all-foci-1366 | Clic en centro físico de focos `1→0→2→1→2→0`; 1366×768 | PASS: el elemento alcanzado y el foco almacenado coinciden en cada acción. |
| JG01-all-foci-390 | Toque real en centros, misma secuencia; 390×844 | PASS. |
| SG01-AR01-stale-close | Dos pestañas, cierre en B, interacción obsoleta y escritura KEY legado desde A | PASS: estado cerrado, sin resurrección ni identidad anterior. |
| A1-owner-transfer-new-person | Dos pestañas, «Continuar aquí», avance reciente, nuevo participante con confirmación | PASS: se conserva el avance reciente y la persona nueva comienza sin respuestas ni intentos heredados. |
| AC-dialogs-state-description | Tab real al ajuste, lista equivalente de Explora/Descubre/Aplica, descripción neutral; 1366×768 | PASS: estados explorado/seleccionado/incluido, nombres de diálogo y foco visible contrastado. |
| AC-844-horizontal-whitespace | Nombre y apellido con espacios, enviar; 844×390 | PASS: error visible dentro del viewport, aria-invalid y aria-describedby en ambos campos. |
| AC-320-header | Inicio y Ajustes; 320×640 | PASS: ajuste dentro del ancho y sin desbordamiento horizontal. |
| A2-detail-390 | Imagen inicial completa, toque no correcto por lista, hallazgo, visor y CTA; 390×844 | PASS: sin marcador DOM ni detalle previo, sin intersecciones, sin scroll interno del texto, CTA alcanzado por su centro. |
| A2-detail-1366 | Misma comprobación; 1366×768 | PASS. |
| A2-detail-844-horizontal | Misma comprobación; 844×390 | PASS final sin scroll; visor, imagen y CTA completos. |
| A2-decide-rotation-844 | Decide en 390×844 → rotación a 844×390, centros reales de selección y confirmación | PASS: cuatro botones de al menos 44 px dentro del viewport, sin scroll. |
| A2-decide-phone-360 | Decide en 360×640, centros reales de selección y confirmación | PASS: cuatro botones ≥44 px dentro del viewport, cara íntegra sin intersecciones y sin scroll. |
| A3-evaluation-zero-offline-keyboard | Ruta completa con Tab/Enter, confirmar respuestas, recargas, 0/3, offline y regreso online; 1366×768 | PASS: evaluación separada, sin señales de acierto temprano, confirmadas conservadas y finalización sin aprobación impuesta. |

El teclado se mueve con Tab real y activa con Enter; no se usa `focus()` programático del harness. Los focos se prueban con eventos físicos de puntero/toque y `elementFromPoint`, sin `force=True`. Cada caso usa un contexto aislado y nombres ficticios. Los diálogos comprobados son Ajustes, lista de escena, explicación de consulta, cierre de recorrido, nueva persona, salida de evaluación y repetición.

## Visor y orientación corta

La proyección de los extremos `(0,0)` y `(941,1672)` está íntegra dentro de la región de escena antes del intento en los tres tamaños. En el resultado final 844×390 esa región termina en `y=388`, dentro del viewport; no hay marcador DOM ni detalle antes del intento.

El visor horizontal final mide `x=14, y=180.1875, w=480, h=195.8125`: termina en `y=376`, **sin desplazamiento**. Las intersecciones con consigna, progreso, guía, acciones y cámara son **0**; el panel de respuesta no tiene scroll interno oculto. El centro de «Decidir» recibe BUTTON y avanza a Decide.

Después de girar de 390×844 a 844×390, las tres opciones miden aproximadamente `99.33×69` en `y=235.609375`. Confirmar mide `318×44.890625` en `y=336.109375` y termina en `381`, dentro del viewport. Los cuatro centros alcanzan su propio botón. Toques reales seleccionan y confirman, y avanzan a Descubre, con `scrollY=0`.

En 360×640 las opciones miden aproximadamente `101.33×82` en `y=473.34375`. Confirmar mide `332×44.890625` en `y=587.84375` y termina en `632.734375`, dentro de 640 px. Los cuatro centros alcanzan su propio botón; selección y confirmación mediante toque real avanzan a Descubre sin scroll. La cara de la operaria queda dentro del viewport y no interseca cabecera, consigna, guía ni acciones. [Captura actual del teléfono](candidate-framing-final/decide-phone-360x640.png).

Medidas, runtime y capturas finales del teléfono y rotación: [candidate-framing-final/checks.json](candidate-framing-final/checks.json). La cara medida en 360×640 ocupa `77.33×54.78` en `x=165.29, y=298.57`, íntegra y sin intersecciones. El visor conserva la comprobación de [candidate-phone-final/checks.json](candidate-phone-final/checks.json), puesto que el último ajuste no afecta a Explora. Los reportes anteriores conservan la evolución de las comprobaciones; la necesidad previa de desplazar 39 px para el visor ya no describe la candidata final. La prueba amplia que descubrió el fallo de Decide pertenece a coordinación; esta revisión aporta su confirmación independiente después de la corrección.

## Alcance y límites

Esta suite cubre los fallos UX-01, JG-01, SG-01/AR-01 y las comprobaciones indicadas de formulario, accesibilidad, evaluación y offline. A4/actualizador dispone de una verificación separada de su responsable; esta suite no lo ejecutó ni presenta sus resultados como propios.

Chromium automatizado no acredita una prueba con personas, comprensión, lector de pantalla real, tablet/teléfono físico ni Safari/iOS. Tampoco certifica el equipo industrial, precisión técnica del mapa, aprobación preventiva o emisión empresarial. No se añaden umbrales por 0/3 ni se modifican preguntas, mapa, producto o pruebas existentes para obtener un aprobado.
