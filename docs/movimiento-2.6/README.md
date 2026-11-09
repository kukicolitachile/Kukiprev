# Evidencia de la misión — 2.6.0-review.1

[Ver el recorrido móvil completo con sonido real](DecidoBien-recorrido-2.6.mp4).

Grabación de Chromium, 390 × 844, aproximadamente 39 segundos, H.264/AAC. Recorre Inicio, identificación ficticia, Contexto, Explora, Decide, Descubre, Aplica, Evaluación y Resultado. Es una demostración acelerada de las interacciones; no representa la duración de una sesión guiada de 30 minutos ni una prueba de retención. El sonido se activa durante la grabación mediante los ajustes. No hay pista musical añadida.

Código de aplicación grabado: **`ce7e87bf77fff21d760694488d011933a8d31a23`**, rama **`implementation/correa-phaser-demo`**, huella pública **`927b4d18aff0ed5d`**, caché **`decidobien-v15-motion`**. Los commits posteriores de evidencia/documentación no cambian esa huella. El commit final publicado puede consultarse en GitHub y en «Comprobar versión, servidor y caché» de la instancia actualizada.

## Capturas

| Momento | Celular | Escritorio |
| --- | --- | --- |
| Inicio y nombre | [Inicio](inicio.png) · [Nombre](nombre.png) | Incluidos en el registro del recorrido |
| Contexto | [Contexto](contexto.png) | Incluido en el registro del recorrido |
| Explora: entrada | [Sin marcas](explora-entrada.png) | [Sin marcas](actual-1900-explora-entrada.png) |
| Explora: otro intento | [Intento](explora-intento.png) | [Intento](actual-1900-explora-otro.png) |
| Explora: pista solicitada | [Pista textual](actual-390-explora-pista.png) | [Pista textual](actual-1900-explora-pista.png) |
| Explora: hallazgo | [Visor y detalle](hallazgo.png) | [Visor y detalle](actual-1900-explora-hallazgo.png) |
| Decide | [Historieta](decide.png) | [Historieta](actual-1900-decide.png) |
| Descubre | [Focos sobre la escena](descubre.png) · [Otro detalle](descubre-detalle.png) | [Focos sobre la escena](actual-1900-descubre.png) |
| Aplica | [Preguntas en el entorno](aplica.png) · [Consulta preparada](consulta.png) | [Preguntas en el entorno](actual-1900-aplica.png) |
| Evaluación y resultado | [Evaluación](evaluacion.png) · [Resultado](resultado.png) | Incluidos en el registro del recorrido |

Para comparar la composición anterior, véanse [Descubre anterior](../auditoria-explora/evidencias/antes-390-descubre.png) y [Aplica anterior](../auditoria-explora/evidencias/antes-390-aplica.png), capturados en la auditoría de `c4aa98c`. Se conservan como evidencia histórica; no se presentan como capturas de la nueva versión.

## Comprobaciones ejecutadas

- `npm test`: cuatro archivos de pruebas, cuatro aprobados.
- [Tres recorridos de movimiento](motion-checks.json): normal con audio, reducido, offline desde el comienzo y recuperación del resultado; todos sin errores de página. Se midieron cambios reales de zoom; sin efectos infinitos ni reproducción en reposo. La evaluación usa selección/confirmación neutras sin animaciones de acierto.
- [Siete rutas de regresión](browser-review-run.log): cuatro tamaños, teclado, las tres decisiones, devolución posterior a confirmar, recuperación de respuestas, PDF de borrador y offline.
- [Ocho tamaños y rotación](decision-layout-run.log): rostro sin recorte/cobertura; controles de teclado.
- [Bienvenida](welcome-browser-run.log): cuatro tamaños, inicio con Tab/Enter y conservación del avance al pedir identificación.
- [Cuatro estados de Explora](explore-browser-run.log): celular/escritorio, toque y alternativa accesible, pista textual y offline.
- [Recorrido adicional completo](audit-mission-run.log): dos tamaños, catorce capturas por ruta, recuperación de cada respuesta, PDF y resultado offline. [Texto, HTML, árbol AX y estados capturados](recorrido-actual.json). Un árbol AX no equivale a probar un lector de pantalla real.
- [Migraciones históricas](migration-browser-run.log): cinco rutas, incluyendo `24bb4af`, demo.1 y `c4aa98c`; respuestas, intentos y cachés ajenas conservados.
- [Actualizador](update-codespace-run.log): sirve el commit fijado en un clon de prueba limpio y conserva cambios, main y procesos desconocidos. No es una prueba del Codespace del usuario.
- [Resumen de comprobaciones estructuradas](comprobaciones.json), [contenido e imágenes idénticos a la base](contenido-conservado.json) y [seguridad](../SEGURIDAD_2_6.md).

`runtime-during-evidence.json` se obtuvo después de añadir los artefactos sin seguimiento, por eso indica `modified: true`. Su hash de fuentes coincide con el código grabado; no se usa como evidencia de un árbol limpio. El informe del actualizador contiene la ejecución limpia del código comprometido.

## Lo que esta entrega no valida

Los movimientos son de interfaz: encuadre, visor, resaltado, entrada de controles, respuesta al toque y cierre. **No hay movimiento mecánico validado representado.** La ilustración, los recortes y la resolución del primer plano son los originales; no se ha recreado una nueva maquinaria o ilustración de alta resolución.

Pendientes independientes: validación preventiva del equipo/roles/puntos y devolución `ev3-c` señalada en la auditoría; piloto con personas nuevas y trabajadores; dispositivos físicos, Safari/iOS y lector de pantalla; criterio de certificado y servidor empresarial; seguridad de esa infraestructura; actualización y comprobación del Codespace del usuario. La etiqueta de certificado offline con un evento real del dispositivo requiere prueba física; el bloqueo de red automatizado no reprodujo `navigator.onLine === false` en las dos rutas adicionales. No se declara emisión, sincronización, aprobación interna o acreditación legal.
