# Entrega correctiva A1–A5 — 2.7.0-review.1

Base auditada `0def89f`, rama `implementation/correa-phaser-demo`. Julisa autorizó el paquete integrado antes de implementarlo. Esta entrega termina la corrección de desarrollo de la primera misión; no presenta como aprobados el equipo real, la capacitación o un sistema empresarial de registros.

## Resultado por bloque

| Bloque autorizado | Implementación | Verificación |
| --- | --- | --- |
| A1 Guardado e identidad | Autoridad separada, migración única, generación/revisión/dueño, Web Locks, cierre durable, cambio de participante explícito. Borrador del formulario en memoria al cambiar preferencias. Confirmaciones se muestran después de guardar. | Pruebas unitarias de concurrencia y QA independiente: edición perdida, pestañas obsoletas, cierre, toma de control, nuevo participante y escrituras legacy. |
| A2 Escena y acceso | Área de cámara medida desde DOM; guía y acciones fuera del área interactiva. Visor sin superposición. Explicación breve y detalle completo, sin scroll interno oculto. Imagen completa inicial en Explora. Descripción neutral y estados equivalentes; diálogos, foco, cabecera estrecha y error horizontal corregidos. | Puntero real ida/vuelta a todos los focos; cinco tamaños y tres decisiones; Tab real, AX, error y campo, detalle y offline. |
| A3 Actualizador | Preflight antes de parar y recuperación con HEAD/comando reconocido ante fallo posterior, sin descartar datos o reaplicar stash. Entrada y script de recuperación versionados para impedir reutilizar un recuperador HTTP histórico que borraba cachés ajenas por prefijo. | Clones aislados: éxito, colisión con servidor activo, proceso desconocido, divergencia, candidato inválido, Git pendiente y fallo posterior al arranque. |
| A4 Coherencia | Ejemplo hipotético visible; rótulo de retomar; dos devoluciones aprobadas; mensaje offline sin cola ficticia; aviso de PDF en Descargas. Guía por estado, original atento al explicar cualquier decisión. | Comparación literal: solo versión de contenido, síntesis Observa y dos devoluciones; preguntas, alternativas, respuestas correctas, zonas, imágenes y política sin cambios. |
| A5 Candidata y QA | Una candidata, pruebas dirigidas contra fallos de la base y regresión afectada; versión verificable y evidencia de ruta real. | Catorce casos independientes; resultados y límites junto a video/capturas. |

[Video del recorrido completo](correctiva-2.7/DecidoBien-2.7-recorrido.mp4) · [QA independiente](correctiva-2.7/qa/INFORME_QA_INDEPENDIENTE.md) · [Resultados](correctiva-2.7/accepted-checks.json) · [Capturas y comprobaciones](correctiva-2.7/README.md).

## Límites explícitos

- La autoridad de estado impide que un bundle anterior restaure progreso después de migrar/cerrar. No puede borrar la interfaz o memoria de JavaScript antiguo que no incluía ese mecanismo; cerrar/actualizar esas pestañas antes de entregar una tablet.
- Sin almacenamiento/Web Locks, el guardado no recurre a una comparación no atómica: muestra recuperación. Requiere HTTPS o localhost y navegador compatible. No hay autenticación basada en el nombre o token.
- En horizontal 844×390 y en 360×640, las cuatro acciones de Decide y el visor quedan visibles sin scroll inicial ni superposición. Las ampliaciones opcionales del texto usan el desplazamiento normal del documento. No se declara validado el gesto de scroll en un teléfono físico.
- QA es Chromium automatizado con datos ficticios. No se ejecutaron trabajadores, lectores de pantalla reales, Safari/iOS o dispositivos físicos. El video de unos segundos no acredita una sesión humana de 30 minutos ni retención.
- El servidor sigue siendo de revisión. LocalStorage/JSON, PDF y resultado local pueden inspeccionarse/manipularse; no son registro empresarial. Criterio/servidor/folio/sincronización quedan sin implementar y sin emisión.
- La revisión normativa no acredita legalmente esta capacitación. Datos institucionales, marco vigente, equipo/tarea/control/roles reales y mapa requieren revisión humana. Se mantienen las exclusiones temáticas acordadas.

## Conservado

DecidoBien — Manos que cuidan, Comenzar misión, logo y archivos originales de Kuky, paleta y encuadre inspección/historieta; una misión y objetivo futuro de seis sin inventarlas; Phaser acotado a cámara/selección; condiciones y límites preventivos; separación práctica/evaluación, confirmación, silencio, movimiento reducido y recursos offline. La consulta no se envía ni cambia el estado del equipo.

El contenido pasa de `2.1-interaccion-1` a `2.1-interaccion-2` únicamente por las correcciones aprobadas. El estado migrado identifica su revisión anterior; los IDs y la corrección de respuestas son idénticos, sin recalificar el intento. Antes de futuras revisiones semánticas debe definirse una migración explícita, no reutilizar IDs para reinterpretar respuestas.

## Pendientes separados

1. Prevención y responsable técnico: identificación del equipo/tarea, geometría/acceso, condiciones/método, roles y cotejo de imagen/mapa. No se modificó el detector para aparentar precisión.
2. Aprendizaje y relator: matriz de evidencia, guion orientativo de 30 minutos, revisión del instrumento si se autoriza y piloto con persona nueva/trabajador. Finalizar 0/3 no se convierte en bug o umbral nuevo.
3. Privacidad/empresa: finalidad, responsable, acceso, conservación y criterio de constancia antes de datos reales. No se añaden datos personales o consentimiento genérico.
4. Operación: verificación del Codespace concreto y plataforma empresarial futura. El entorno actual no prueba esa instancia.
