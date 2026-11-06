# DecidoBien · Manos que cuidan

PWA de capacitación guiada. Esta entrega contiene **una primera versión revisable del caso de la correa transportadora**, con estudio, práctica y evaluación de comprensión. No es contenido técnicamente aprobado, un procedimiento de intervención ni una constancia de capacitación.

Se conserva la identidad teal/blanco/gris, Kuky y las doce ilustraciones existentes. El módulo mantiene un alcance de diseño de **30 minutos** y el objetivo de **seis misiones de atrapamiento**. Solo la correa está disponible para revisión; no se simula que las otras cinco estén completas.

## Desarrollo y Codespaces

Sin dependencias npm, backend ni credenciales; Node y Python 3 deben estar disponibles. En GitHub: **Code → Codespaces → Create codespace on main**. La configuración intenta iniciar el servidor y reenviar el puerto 4173. Si hace falta iniciarlo manualmente, desde la carpeta del proyecto:

```sh
npm start
```

Luego abre **Puertos → 4173 → Abrir en el navegador**. Codespaces sirve para revisar; no es el alojamiento permanente de un registro empresarial.

Cada tarea de nube ya está aislada: utiliza el checkout existente. No crees worktrees salvo solicitud explícita.

## Qué revisar

1. Inicio: condición de borrador, alcance de 30 minutos y mapa honesto de misiones.
2. Estudio: una observación por pantalla, ilustración y detalle bajo demanda.
3. Práctica: Observa → Explora → Decide → Descubre → Aplica. Pistas solicitadas, decisión concreta, confirmación y explicaciones visuales; información insuficiente cuando se propone una tarea no definida.
4. Evaluación: tres preguntas sin pistas ni navegación de aprendizaje durante el intento; selección y confirmación separadas. Respuestas confirmadas guardadas y recuperables. Corrección al finalizar, sin umbral empresarial de aprobación.
5. Revisión técnica: ocho asuntos pendientes, con las funciones que deben aclararlos; no hay botón de aprobación.

La interfaz no solicita datos de trabajadores. El progreso del borrador se guarda en una clave nueva de almacenamiento local y no se convierte el puntaje anterior en una aprobación. Volver al inicio conserva decisiones y respuestas; repetir la evaluación inicia una nueva práctica local y no crea un historial empresarial.

## Contenidos y materiales conservados

- `assets/correa-revision.json`: contenido de la secuencia actual, pendientes y coordenadas de la ilustración genérica.
- `assets/escenarios.json`: material heredado con redacción corregida y estados explícitos. Encartonadora y tableteadora pendientes de revisión; autoclave, vidrio y químicos reservados para otros módulos. Referencias heredadas no verificadas y excluidas del respaldo aprobado.
- `assets/escenas`: se conservan las seis bases y las seis consecuencias. No se redibujó equipo ni protección sin referencias reales. Las zonas de la correa representan un ejemplo y no una validación geométrica de una máquina real.
- `docs/CASO_CORREA_REVISION.md`: alcance y guía de revisión.

No hay funciones de investigación, reporte de terreno o seguimiento de mejoras. Las preguntas de reflexión son parte del aprendizaje. Registro empresarial, relator sincronizado y constancias verificables continúan como propuestas, sin datos reales ni simulación de acreditación.

## Validación

```sh
npm test
node model.test.js
node content.test.js
```

Las pruebas verifican recuperación de decisiones, validación del avance, resultados sin umbral de aprobación, contenidos y conservación de los activos. Las pruebas de navegador reproducibles están en `tests/browser-review.py`; requieren Playwright de Python y Chromium disponibles:

```sh
python3 tests/browser-review.py
```

Con el servidor activo en el puerto 4173, comprueban secuencia, recarga, persistencia, revisión y funcionamiento offline. La primera visita requiere conexión. Espera «Lista sin conexión» antes de probar el modo offline.

## PWA y actualizaciones

Manifest y service worker usan rutas relativas. La caché de esta entrega es `decidobien-v5-experience`. Incrementa su versión al publicar una actualización. Si se abre una versión anterior desde una caché existente, espera la actualización del service worker y recarga. No se asume que una sesión de aprendizaje cambie de versión a mitad de un intento.

Para uso fuera de desarrollo, hospeda los recursos estáticos en HTTPS. El almacenamiento del navegador no es un registro empresarial ni una prueba de asistencia.

## Validación técnica pendiente

Confirmar equipo y movimiento, tarea/anomalía, accesos y controles, método, roles y canal de comunicación, organización, protección personal pertinente y fuentes aplicables. Hasta entonces el caso enseña reconocimiento de exposición y límites de la información; no enseña a intervenir la correa. Ninguna referencia normativa específica se muestra como aprobada.

## Interacción visual

El inicio muestra título, frase y accesos a sesión, estudio y práctica. El acceso a sesión explica que los códigos y el registro empresarial aún no están implementados. No hay tarjetas de misiones vacías.

La imagen solo recibe resaltados después de confirmar la decisión o al solicitar una pista; no se simula movimiento de la máquina. El recorrido de resaltados es opcional, pausado/repetible y tiene controles estáticos. Con movimiento reducido no se reproduce. La ampliación de la ilustración usa un diálogo accesible.

Los 30 minutos siguen siendo el alcance planificado de la capacitación guiada completa, incluidas conversación y evaluación. No se agregan esperas ni animaciones obligatorias. Las funciones administrativas y las decisiones pendientes están en Revisión técnica; el indicador de borrador permanece visible.

## Respuesta audiovisual

La misión incluye contornos de elementos explorados, avisos transitorios de la interfaz, un recorrido de cinco momentos y una comparación entre acumulación observada y aviso realizado. Los avisos no son alarmas del equipo. No se animan piezas ni materiales: no hay un movimiento mecánico validado para representar.

El audio está desactivado al abrir la página y solo se inicia al pulsar «Activar sonido». Cuatro WAV locales distinguen selección, confirmación, información nueva y cierre. Al silenciar se detienen los sonidos activos. Cada información sonora tiene respuesta visual equivalente. En evaluación, los sonidos de selección y confirmación son iguales para todas las respuestas; no revelan corrección.

«Pausar efectos» detiene el recorrido de resaltados y activa la presentación estática. Respeta movimiento reducido del sistema y conserva la preferencia local de movimiento. Kuky usa tres expresiones del material aportado, con intervenciones breves que se pueden cerrar.

Prueba adicional de audio, silencio, preferencias y recursos offline:

```sh
python3 tests/experience-browser.py
```

La opción `DECIDOBIEN_RECORD=1` graba video con Playwright y audio de la salida Web Audio de la app. Requiere el ffmpeg compatible de Playwright y un navegador Chromium; no añade sonidos externos a la demostración. Las comprobaciones de reproducción no demuestran por sí solas mayor retención: eso debe observarse en el piloto con participantes.
