# Movimiento integrado — DecidoBien 2.6.0-review.1

Base comprobada al comenzar: `implementation/correa-phaser-demo`, `ab954ddb527fb754411a25874bab1e59235e8f79`, release 2.5.0-demo.3, árbol limpio. La usuaria aceptó avanzar con la dirección propuesta tras revisar su video de referencia de 15 segundos. Esta entrega aplica una sola dirección de movimiento al primer caso; no cambia eslóganes, contenido educativo, criterio de corrección ni equipo representado.

## Qué se tomó de la referencia

Tipografía y composición que se presentan de forma breve, cambios con aceleración/frenado, peso perceptible al seleccionar y construcción progresiva del cierre. Implementación propia con Phaser, CSS y Web Animations locales, sin dependencias nuevas. Las formas abstractas, logotipos y gráficos del video no se importan como recursos del curso. El ritmo de la actividad lo controla el participante.

| Momento | Acción y respuesta implementadas |
| --- | --- |
| Inicio | La escena responde a un toque con una observación neutra de entorno/materiales/persona, reutilizando los textos de la bienvenida anterior. Hay lista equivalente por teclado. No identifica el peligro, suma puntos o exige completar esa exploración. Comenzar misión permanece disponible. |
| Identificación | Entrada breve de la tarjeta, campos existentes y transición al contexto. No se anima letra por letra ni se demora la aparición del texto. |
| Contexto | Misma escena y rol existentes; entrada corta de consigna, guía y acción. |
| Explora | Se conserva la corrección de `ab954dd`: escena completa, ningún candidato señalado, pista textual. Cada toque recibe una respuesta neutra en su propio punto. Solo el hallazgo abre el visor; el acercamiento acelera y frena suavemente. |
| Decide | La cámara cambia el encuadre y el primer plano aparece con un fundido corto. Las tres alternativas conservan tamaño, texto y confirmación. La selección responde igual para todas. Su nombre accesible incluye el rótulo visible y la alternativa existente. |
| Descubre | Los tres focos vuelven a estar sobre sus elementos en la imagen. Seleccionarlos cambia explicación, resalte y estado explorado. Ya no se usa la bandeja numérica separada de la escena. Las listas accesibles y la misma condición para avanzar se conservan. |
| Aplica | Se mantiene la escena Phaser y se reutilizan las preguntas/posiciones de `inquiries()` en coordenadas originales de la imagen. La respuesta y la consulta son las existentes. El estado sigue «Por aclarar»; confirmar no envía un aviso ni representa una reparación. |
| Evaluación | Se desmonta el juego de práctica. Tres preguntas con sus mismas alternativas, recuperación y confirmación neutra. No se animan opciones según acierto ni se reproduce un sonido de corrección anticipada. |
| Resultado | Progreso de siete momentos completo, distintivo de recorrido y expresión feliz original de Kuky con la pregunta de transferencia existente. El resultado y la advertencia de no acreditación están visibles de inmediato. No es una aprobación o certificado empresarial. |

El progreso representa los siete momentos de **una misión**, no seis misiones terminadas ni 30 minutos acreditados. La identidad del encabezado se conserva también en evaluación y resultado.

## Cómo se controla el movimiento

- Efectos finitos: respuesta al pulsar de 110 ms; entrada de interfaz de 160–320 ms; cámara de 320–360 ms; cierre de hasta 450 ms. Ninguna actividad avanza al finalizar una animación.
- Se evita borrar el canvas al reinsertarlo con el mismo tamaño y se espera al primer render real para indicar escena lista. La cámara no reinicia su acercamiento por una selección o ajuste ajenos al encuadre.
- Pausar efectos y la preferencia de movimiento reducido dejan inmediatamente un estado estático legible. Las animaciones Web se cancelan; los efectos de cámara y aparición se resuelven sin movimiento.
- Sonidos existentes, locales, opcionales y silenciables. No hay reproducción automática. El silencio no oculta información.
- Las piezas, materiales, manos y controles del equipo no se animan. Los movimientos son cámara, aparición de un primer plano, marcadores y controles de interfaz. No hay una mecánica del equipo validada que se esté simulando.

## Contenido, geometría y registro

No se edita `assets/correa-revision.json`, `assets/escenarios.json`, la ilustración, los PNG originales de Kuky, `scene-layers.js`, el mapa del detector o su margen existente. Las coordenadas de preguntas de Aplica proceden directamente de `inquiries()` y `geometry`, no de una nueva característica del equipo.

Se mantienen identidad en la pestaña, evaluación local, PDF de borrador y política de certificado. Julisa todavía debe definir el criterio de emisión; no hay servidor de registro, folio verificable ni sincronización empresarial. El progreso del navegador sigue siendo modificable y no acredita asistencia o aprobación.

## Evidencia y comprobaciones

[Video móvil de Inicio a Resultado](movimiento-2.6/DecidoBien-recorrido-2.6.mp4). [Inicio](movimiento-2.6/inicio.png) · [Decide](movimiento-2.6/decide.png) · [Descubre](movimiento-2.6/descubre.png) · [Aplica](movimiento-2.6/aplica.png) · [Resultado](movimiento-2.6/resultado.png).

`tests/motion-browser.py` comprueba el recorrido completo normal, reducido y offline; observación de variaciones reales del zoom; efectos finitos y ausencia de repetición en reposo; siete momentos; reacción opcional de bienvenida sin intentos; focos sobre la imagen; consulta sin envío; evaluación con los mismos sonidos neutros para respuestas distintas; cierre y recuperación offline. Graba el video de Chromium y captura la salida real Web Audio.

Se ejecutan también las regresiones de las tres decisiones, cuatro estados de Explora, entrada con teclado, ocho tamaños/cambio de orientación, recuperación histórica y superficie pública. Los informes y la huella de fuentes de la grabación se guardan junto al video. Las grabaciones usan una identidad ficticia.

[Índice de evidencia y límites de las pruebas](movimiento-2.6/README.md). [Revisión de seguridad de esta entrega](SEGURIDAD_2_6.md).

**Pendientes separados:** aprobación preventiva del caso y sus puntos, revisión de la devolución `ev3-c` ya señalada en la auditoría, lector de pantalla real, Safari/iOS y dispositivos físicos, piloto con trabajadores/personas nuevas, seguridad y registro empresarial y Codespace del usuario. Esta entrega no valida retención ni declara el sistema listo para una acreditación legal.

La composición anterior de Inicio/Descubre y la relación etiqueta visible/nombre accesible de Decide se corrigen bajo la nueva autorización. Las demás observaciones de la auditoría se mantienen: no se reescribe su evidencia histórica ni se declara validado un punto técnico pendiente.
