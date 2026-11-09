# Primera demo Phaser — 2.5.0-demo.1

Base exacta: `2f8275d1d171098a3f66208804628cf36c2deeb0`. Rama de trabajo: `implementation/correa-phaser-demo`. No se modifica la rama anterior ni `main`.

## Entrega para revisar jugando

**Inicio → nombre y apellido → contexto → explorar → decidir → confirmar.** Escena dominante en móvil, barra compacta, encuadres de historieta y bandeja de tres acciones. La referencia aprobada orienta composición y controles; no se interpreta su maquinaria como un equipo validado ni se sustituye la geometría del escenario.

- `phaser-scene.js`: Phaser local, render Canvas, cámara general y cámara secundaria de acercamiento; retorno al plano general. Sin física, rotación de piezas ni traslación de materiales.
- `scene-layers.js`: cuatro capas por máscaras de píxeles del original. En exploración se recomponen en coordenadas originales. En Decide se usa un recorte ampliado de la misma operaria como primer plano. El cambio de tamaño es un cambio de encuadre, no un desplazamiento de la persona en el proceso.
- `phaser-board.js`: controles HTML accesibles superpuestos a la escena, equivalentes por lista, mensajes literales del contenido existente y alternativa elegida visible antes de confirmar.
- `participant.js`: identificación acotada a la pestaña, normalización Unicode, límites y salida escapada. No agrega nombre al progreso persistente ni envía un registro empresarial.
- `certificate.js`: preparación local de PDF marcado como borrador, revisión del nombre y estados pendientes. Sin emisión oficial, firma, folio inventado o servidor simulado.

El JSON educativo, logo, archivos originales de Kuky y la ilustración se conservan sin modificaciones respecto de `2f8275d`. No se añaden escenarios ni movimientos mecánicos. Los temas excluidos no se incorporan. Los límites del rol y las explicaciones existentes siguen vigentes: comunicar no demuestra que una condición haya sido corregida.

## Qué se puede comprobar

1. Comenzar siempre disponible; pedir nombre y apellido sin formulario administrativo adicional.
2. Contexto y rol sobre la planta; una señal neutra sobre los estuches permite tocar y descubrir.
3. Acercamiento del detalle tocado, marca de observado y retorno al plano general. Las zonas usan la geometría original. No se destaca la respuesta correcta antes del intento.
4. Decide cambia el plano: primer plano de la operaria, la misma planta detrás y tres acciones con el mismo tamaño.
5. Seleccionar es distinto de confirmar. Antes de confirmar aparece literalmente la alternativa; después aparece su devolución original sobre la escena.
6. Lista accesible equivalente, teclado, sonido silenciable y cámara instantánea con movimiento reducido.

Descubre se adapta a la escena, con los focos originales y detalle bajo demanda. Aplica, evaluación y resultado siguen disponibles y se comprueban para evitar regresiones; su extensión completa al nuevo tratamiento visual no es el alcance de esta primera demo. Se mantiene el marco de módulo guiado de 30 minutos, sin tiempos de espera obligatorios ni simulación de duración en la grabación.

## Evidencias

[Video del recorrido móvil](demo-2.5/DecidoBien-demo-correa-2.5.mp4) · [Explora](demo-2.5/explora.png) · [Decide](demo-2.5/decide.png). Las evidencias están en `docs/demo-2.5/`. La grabación muestra la aplicación real a 390×844, un nombre ficticio de demostración, sonido activado por acción y confirmación. No es una animación promocional. El montaje solo sincroniza la pista de Web Audio capturada y convierte a MP4.

Pruebas automáticas: siete recorridos completos de regresión (cuatro tamaños con teclado/offline y tres decisiones táctiles), PDF, recuperación y equivalencia exacta de la composición en capas. El informe audiovisual registra audio/silencio, movimiento reducido y escena/audio offline. La migración histórica conserva respuestas, progreso antiguo y caché ajena.

**No se realizó una prueba con una persona que nunca haya visto DecidoBien.** La automatización comprueba la disponibilidad y el recorrido; no permite afirmar comprensión espontánea, retención ni facilidad de uso real. La validación preventiva, ese piloto y las pruebas en teléfonos/tablets físicos permanecen separados.

## Certificación pendiente

Julisa debe confirmar criterio y umbral, si aplica. Prevención debe validar el material. La empresa debe disponer de identificación/autorización, registro de resultado validado en servidor y folio consultable. Falta implementar ese backend y su sincronización/retención. Hasta entonces solo hay vista previa marcada de borrador, con nombre, módulo y fecha. La condición offline se expresa como pendiente y nunca como emisión empresarial.

## Instancias

El entorno probado sirve el código de esta rama con `npm start`, puerto 4173. No se ha verificado el Codespace `scaling-happiness-xr99457w97r7f69pw`; una publicación Git no prueba qué versión sirve. README contiene una sola secuencia de actualización segura y comprobación de runtime/caché.
