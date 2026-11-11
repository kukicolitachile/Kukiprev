# DecidoBien — Manos que cuidan · Entrega correctiva

Versión **2.7.0-review.1**, rama `implementation/correa-phaser-demo`. Código grabado limpio: `c0f209d6e743613a85a9083cfe6587336572ab9e`, huella pública `be8ab5576f3a94ca`. El commit posterior incorpora únicamente documentación y evidencia.

[Ver recorrido móvil completo, con sonido opcional (40 s)](DecidoBien-2.7-recorrido.mp4).

## Recorrido entregado

Inicio → Nombre y apellido → Contexto → Explora → Decide → Descubre → Aplica → Evaluación → Resultado. La consulta queda preparada, no enviada. El PDF es un borrador local; no acredita aprobación empresarial.

[Inicio](inicio.png) · [Identificación](nombre.png) · [Contexto](contexto.png) · [Explora sin marcas](explora-entrada.png) · [Otro intento](explora-intento.png) · [Hallazgo](hallazgo.png) · [Decide](decide.png) · [Descubre](descubre.png) · [Detalle](descubre-detalle.png) · [Aplica](aplica.png) · [Consulta](consulta.png) · [Evaluación](evaluacion.png) · [Resultado](resultado.png).

## Comprobaciones y trazabilidad

- [QA independiente: 14 casos aceptados](qa/INFORME_QA_INDEPENDIENTE.md), con capturas anteriores, posteriores y metadatos por ejecución. Las comprobaciones conservan su commit y huella reales; no se afirma que todas se ejecutaron sobre un único commit final. Tras ese QA, la recuperación versionada se comprobó mediante siete migraciones y tres recorridos finales.
- [Ocho tamaños y orientación](regresion/responsive-checks.json), teclado, árbol de accesibilidad automatizado, explicaciones completas y controles de escena.
- [Siete migraciones históricas](migration-final.log), progreso y cachés ajenas conservados; recuperación disponible offline.
- [Actualizador: siete escenarios](updater-final.log), preflight antes de parar, cambios locales preservados y recuperación ante fallo.
- [Recorrido final](video-run.log), normal, movimiento reducido y offline. [Sonido y movimiento](motion-checks.json). Video H.264/AAC, sin música añadida.
- [Regresión](regresion/), pruebas unitarias y de contenido; [comparación literal con la base](contenido-conservado.json). Se modificaron únicamente las cuatro hojas editoriales autorizadas. Imágenes, zonas y respuestas correctas conservadas.
- [Dependencias sin vulnerabilidades conocidas en la consulta](npm-audit.json) y [búsqueda de credenciales](credential-scan.json). Son controles de desarrollo, no certificación de seguridad. El resultado y PDF locales son manipulables y no sirven como registro empresarial verificable.
- [Versión durante la grabación](runtime-recording.json). La versión activa se consulta también desde Revisión técnica en la aplicación.

## Pendientes que esta entrega no sustituye

Validación preventiva de equipo, tarea, controles, roles e ilustración; piloto con trabajadores y relator; pruebas con lectores de pantalla reales y dispositivos físicos, incluido Safari/iOS; definición empresarial de registro, privacidad y emisión de certificados. No existe servidor empresarial, folio o cola de sincronización. No se ha comprobado el Codespace de Julisa: la evidencia corresponde al entorno de desarrollo.

[Informe de cierre y alcance A1–A5](../ENTREGA_CORRECTIVA_2_7.md).
