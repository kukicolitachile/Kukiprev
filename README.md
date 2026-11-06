# DecidoBien — Manos que cuidan

PWA de capacitación guiada, versión **2.3.0-review.1**. Una misión completa de correa transportadora, disponible como **borrador para revisión preventiva**. Conserva Kuky, la paleta y los recursos existentes. No enseña una intervención ni acredita capacitación empresarial.

## Ejecutar y comprobar la versión

Con Node y Python 3 disponibles, sin dependencias npm:

```sh
npm start
```

En Codespaces abre **Puertos → 4173 → Abrir en el navegador**. La configuración intenta iniciar `server.py` automáticamente. Su raíz se fija al proyecto, independientemente de la carpeta de ejecución. No publiques el repositorio completo con un servidor genérico: el servidor incluido limita los archivos públicos.

```sh
npm run diagnose
```

Muestra release, rama, commit, cambios locales, huella de recursos y carpeta servida. En el navegador, **Revisión técnica → Comprobar versión, servidor y caché** abre `/recovery.html`. El endpoint `/__runtime.json` permite contrastar el proceso que realmente responde con el diagnóstico del checkout. Si ambos difieren, hay otra carpeta o proceso servido. Si difiere solo la pantalla, revisa la caché.

La recuperación actualiza únicamente los recursos estáticos de la app; conserva almacenamiento local y respuestas confirmadas. No fuerza una actualización durante la evaluación. No puede recuperar selecciones que una versión anterior nunca guardó. La caché actual es `decidobien-v8-scene`; al cambiar los recursos debe versionarse.

## Recorrido consolidado

- Inicio: “Manos que cuidan”, escena explorable sin puntaje y **Comenzar misión** siempre disponible. Capacitación y estudio son accesos secundarios.
- Observa: contexto hipotético y rol disponible bajo demanda.
- Explora: tocar elementos o usar su lista accesible. No hay resalto revelador antes del intento; pista opcional.
- Decide: una elección desde el rol, sin abandonar la escena. Seleccionar y confirmar son acciones separadas.
- Descubre: tres relaciones vinculadas a la misma ilustración. El primer detalle ya está explicado; tocar los otros cambia foco y explicación. No hay clasificación de frases ni pantalla que esconda la escena.
- Aplica: reconocer qué información falta ante una tarea no definida, con devolución y posibilidad de revisar.
- Evaluación: tres preguntas sobrias, sin pistas ni devolución correctiva antes del resultado. Respuestas confirmadas recuperables.
- Resultado: revisar la comprensión y llevar preguntas sobre tarea, método y responsables a la conversación guiada.

Kuky acompaña junto a la escena. **Ajustes** agrupa sonido, movimiento y ayuda. Audio desactivado al abrir; cuatro WAV locales se activan por una acción del usuario. Silenciar detiene las fuentes activas. Movimiento reducido respeta la preferencia del sistema y permite completar todas las actividades. Los efectos son recursos de interfaz: no se animan poleas, banda ni materiales.

Los 30 minutos corresponden al módulo guiado con observación, decisiones, conversación y evaluación. No hay temporizadores, esperas obligatorias, rankings ni premios por velocidad. La duración real y la retención requieren un piloto.

## Offline y límites

La primera descarga requiere conexión. Espera “Lista sin conexión” antes de desconectar. La bienvenida, estudio, práctica, evaluación demostrativa, sonidos y revisión técnica quedan disponibles localmente.

No se solicitan datos personales. El progreso guardado en `localStorage` es inspeccionable y modificable. Volver al inicio conserva el avance; repetir evaluación reemplaza ese intento local. Una tablet compartida no ofrece aislamiento de identidades en esta versión.

El código, las imágenes y las respuestas descargadas para evaluación offline pueden inspeccionarse. No son registros confiables de empresa. Identidad, permisos por rol, registro servidor, retención y constancias verificables siguen pendientes; no están simulados.

## Contenido conservado y pendientes

`assets/correa-revision.json` es el único caso activo. Mantiene ocho asuntos de validación con responsables: equipo/geometría, tarea/anomalía, accesos/controles, método, roles/comunicación, organización, protección personal pertinente y fuentes. No se recomiendan guantes de manera general ante atrapamiento. Comunicar una anomalía no confirma que el peligro esté resuelto; ver el equipo detenido tampoco demuestra una condición segura para intervenir.

Las doce ilustraciones y el archivo heredado `assets/escenarios.json` se conservan en el repositorio. El servidor y la caché solo distribuyen el caso activo; autoclave, vidrio y químicos permanecen reservados para otros módulos. El objetivo futuro de seis misiones no se representa como seis misiones disponibles.

No hay contenido aprobado ni respaldo normativo específico validado. Registro empresarial, constancias, investigación y seguimiento siguen fuera de esta entrega.

## Verificación reproducible

```sh
npm test
python3 tests/browser-review.py
python3 tests/welcome-browser.py
python3 tests/experience-browser.py
python3 tests/security-browser.py
python3 scripts/security-audit.py
```

Las pruebas de navegador requieren Playwright de Python y Chromium en `/usr/bin/chromium`, con el servidor activo. Verifican ruta completa, coordenadas de interacción, teclado, movimiento reducido, decisiones erróneas sin castigo, audio real/silencio, evaluación sin pistas, persistencia y offline. Tamaños 360×800, 390×844, 768×1024 y 1365×1000. No sustituyen pruebas con dispositivos reales ni participantes.

Para reproducir una PWA antigua en un origen local aislado (nunca producción), inicia en otra terminal:

```sh
python3 tests/migration-proxy.py
```

Luego ejecuta:

```sh
python3 tests/migration-browser.py
```

Usa los commits históricos a590956 y 844bc05, el puerto local 4175 y carpetas temporales. No modifica el checkout ni reinicia evaluaciones.

`DECIDOBIEN_RECORD=1 DECIDOBIEN_DEMO_DIR=/ruta/salida python3 tests/experience-browser.py` graba la apertura y misión completa, captura la salida real Web Audio y genera datos para sincronizarla. Requiere ffmpeg disponible para Playwright. No añade banda sonora externa.

Consulta [el informe de consolidación](docs/CONSOLIDACION.md). Los documentos y demostraciones anteriores se conservan como historial; la descripción de esta entrega es la de este README y ese informe.
