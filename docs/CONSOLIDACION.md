# Consolidación de DecidoBien — Manos que cuidan

Entrega de desarrollo: **2.3.0-review.1**, 6 de noviembre de 2026. Estado de contenido: **borrador revisable**, sin aprobación preventiva. Se conserva una sola misión de correa y el módulo guiado previsto de 30 minutos.

## Diagnóstico y dirección ejecutada

La versión en trabajo introdujo clasificación de frases en “Descubre”. Ocultaba la escena, exigía otra forma de interacción y acumulaba tarjetas, etiquetas, mensajes flotantes y marcos. El participante dejaba de mirar la tarea. Además, el inicio y la misión usaban controles separados de audio y movimiento; un estilo de pulsación podía desplazar los puntos de bienvenida y dificultar el toque.

Se retiró esa clasificación y su componente. La misma escena permanece durante observación, exploración, decisión, explicación y aplicación. “Descubre” resuelve el patrón: foco y tres puntos sobre la ilustración; cada selección cambia el detalle explicado, el contorno y el estado explorado. El primer detalle mostrado cuenta como visto, sin exigir un clic redundante. Los otros dos conectan acumulación y condiciones no verificables. El detalle sobre controles no identifica un resguardo inexistente: explica que la imagen no permite verificarlos.

Kuky se integra junto a la escena, sin panel flotante adicional. Hay un indicador compacto y una acción principal por momento; cuando no puede usarse se explica qué falta. Sonido, movimiento y ayuda están en un diálogo de ajustes. Se reconstruyó la hoja de estilos para retirar composiciones acumuladas. No se añadieron dependencias ni nuevos archivos audiovisuales de la app.

## Auditoría priorizada

| Área | Qué existe realmente | Qué falta | Acción concreta | Prioridad | Dependencia |
| --- | --- | --- | --- | --- | --- |
| Experiencia | Inicio y misión completa con interacción sobre escena; evaluación y resultado | Verificar comprensión, motivación y duración real | Piloto guiado con personal de planta/laboratorio | Alta | Participantes y relator |
| Prevención | Ejemplo hipotético, límites del rol y ocho pendientes visibles | Correspondencia con equipo, tarea, controles, método y responsabilidades reales | Revisión documentada del contenido y de los puntos interactivos | Bloquea aprobación | Prevención y responsables técnicos |
| Versión | Release, SHA, huella del servidor, raíz fija y recuperación de PWA | Confirmar la instancia concreta de Codespaces | Contrastar `/__runtime.json`, `npm run diagnose` y recuperación en ese origen | Alta | Acceso a la instancia |
| Offline y acceso | Caché acotada, audio local, teclado, movimiento reducido y progreso recuperable | Safari/iOS, tablets reales y tecnologías de asistencia | Prueba en dispositivos de empresa y piloto accesible | Alta antes de uso real | Dispositivos y usuarios |
| Seguridad | Lista de archivos públicos, CSP, sin listado de carpetas; prueba de inspección del cliente | Roles, autenticación y registros confiables | Diseñar servidor y permisos antes de datos personales/constancias | Bloquea registro empresarial | Reglas y arquitectura empresarial |
| Privacidad | No se solicitan identidades; progreso local de demostración | Aislamiento en tablets compartidas, retención, bases de tratamiento | Definir política y cierre de sesión antes de identificar participantes | Bloquea datos reales | Empresa, prevención y revisión jurídica |

## Recorrido terminado en desarrollo

**Inicio → Observa → Explora → Decide → Descubre → Aplica → Evaluación → Resultado.** Se puede omitir la exploración de bienvenida, estudiar aparte y retomar respuestas confirmadas. La práctica admite pistas y revisión; la evaluación no muestra focos, pistas, Kuky ni señales de corrección antes del cierre.

La lectura y clasificación separadas de “Descubre” se reemplazaron por explorar tres relaciones en su contexto visual. Los párrafos de límites, resguardos y método continúan bajo “¿Por qué?”. En el resultado se conservan preguntas para conversar con el relator. No se construyeron funciones de investigación o seguimiento.

Los encuadres, contornos, cambios de foco, reacciones de Kuky y sonidos representan **interfaz**. **No hay animaciones mecánicas validadas ni simulación de funcionamiento.** La ilustración es un ejemplo pendiente de cotejo; no enseña una operación del equipo. La mano vendada permanece como recurso conservado, no como castigo automático ni consecuencia inevitable de una elección.

## Versión servida y Codespaces

Se comprobó localmente el proceso en 4173, su raíz y diagnóstico HTTP. El diagnóstico distingue release, commit, rama, cambios sin confirmar y huella de archivos. El recibo final de versión se entrega junto a la grabación; no se confunde el commit base con código modificado.

La URL aportada de Codespaces no pudo inspeccionarse: el proxy de este entorno responde **CONNECT 403**. No se ha comprobado su rama, proceso, raíz ni versión del navegador, y no se ha actualizado esa instancia. Tampoco se publicaron cambios externos ni se cambió la visibilidad o el historial del repositorio.

Se reprodujo en un origen local aislado que una PWA antigua continúa mostrando “Comenzar recorrido” aun al cambiar la fuente del servidor. La recuperación explícita descarga recursos nuevos sin reutilizar caché HTTP, conserva claves de progreso y respuestas confirmadas, y permite volver a usarlos offline. Es un fallo reproducido, no una afirmación de que sea la única causa en el Codespace inaccesible.

Para esa instancia, contrastar el endpoint `/__runtime.json` con `npm run diagnose`. Comprobar el proceso que escucha 4173 y su carpeta si difieren. Después usar `/recovery.html` en el mismo origen. No basta una recarga: un servidor antiguo, otra carpeta y una PWA antigua requieren diagnósticos distintos.

## Seguridad y protección de datos

El servidor incluido no sirve `.git`, documentos internos, pruebas, scripts o casos archivados; no registra URLs que puedan contener parámetros privados. La CSP limita scripts a origen propio y deshabilita objetos incrustados; no es una autenticación ni una auditoría de penetración.

Todo recurso que se descarga al navegador, incluida la caché offline y las respuestas necesarias para corregir la demostración, puede inspeccionarse. Se comprobó que alterar `localStorage` puede cambiar el resultado local. Por eso no se emiten constancias verificables ni se considera asistencia o aprobación confiable. Ofuscar o impedir copiar no resolvería esa limitación.

Offline puede mantenerse el material genérico autorizado y la práctica. Una futura evaluación acreditable necesita identidad, autorizaciones por rol, validación de intentos y resultados en servidor, trazabilidad y comprobación de constancias. La captura offline de un intento, si se adopta, necesita una política explícita de sincronización e integridad; no queda implementada aquí. Las respuestas reservadas no deben descargarse como clave secreta al cliente.

Para tablets compartidas faltan aislamiento entre participantes y política de conservación/cierre. No se ha añadido un borrado rutinario ni se han eliminado progresos existentes. Antes de usar datos reales la empresa debe definir campos mínimos, acceso de participante/relator/administración, plazos y procedimientos de ejercicio de derechos, con revisión jurídica aplicable. Esta entrega no declara cumplimiento legal ni validez de capacitación obligatoria.

El escaneo local por patrones no encontró candidatos de alta confianza en el alcance analizado; no demuestra ausencia de todos los secretos. Visibilidad, permisos, ramas remotas y configuración privada del repositorio requieren inspección autenticada independiente.

## Comprobaciones y límites

Pruebas reproducibles documentadas en README: contenido y modelo; ruta completa con teclado; tamaños 360×800, 390×844, 768×1024 y 1365×1000; movimiento reducido; audio activado/silenciado; modo offline con recargas en explicación y evaluación; decisiones erróneas y revisión; recuperación desde dos versiones históricas; superficie pública y cabeceras.

Se captura audio desde la salida real Web Audio y video de Chromium, sin banda sonora añadida. La grabación muestra la interacción de revisión, no representa 30 minutos de sesión con relator. Las métricas locales y el tamaño de caché se entregan como medición de laboratorio, no garantía en redes y dispositivos reales.

No se midió todavía retención con trabajadores, no se probaron lectores de pantalla reales ni Safari/iOS, no hubo una auditoría de penetración completa y no se pudo verificar el Codespace concreto.

## Información real que bloquea aprobar el caso

1. Equipo y vistas suficientes para cotejar geometría, acceso y zona interactiva.
2. Tarea que se realiza, anomalía observada y datos documentados sobre causa/frecuencia.
3. Accesos, resguardos, dispositivos y medios previstos por diseño y por tarea.
4. Método vigente, límites del rol y condiciones requeridas; la intervención sigue fuera del caso.
5. Destinatario del aviso y responsables de revisar, responder y confirmar la condición antes de continuar.
6. Organización, supervisión y evaluación de protección personal por tarea, sin recomendación general frente al enganche.
7. Fuentes, versión, fecha y aprobación documentada de prevención.

Las otras cinco misiones permanecen como objetivo; no se inventaron casos para completar la cantidad.
