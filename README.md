# DecidoBien — Manos que cuidan

PWA de capacitación guiada, **2.4.0-review.1**, rama `implementation/correa-interactiva-2.4`, desarrollada desde la base `24bb4af`. Una misión completa de correa transportadora con interacción sobre la escena. **Borrador para validación preventiva**, sin acreditación empresarial ni instrucciones de intervención.

Se mantienen logo, Kuky, paleta, títulos y recursos originales. Solo la correa está disponible; el objetivo de seis misiones y los casos reservados permanecen pendientes. La ilustración es conceptual.

## Abrir y comprobar

Con Node y Python 3, sin dependencias npm:

```sh
npm start
```

En Codespaces abre **Puertos → 4173 → Abrir en el navegador**. Utiliza el servidor incluido: limita los archivos públicos y fija su raíz al proyecto. El Codespace del usuario y el entorno de desarrollo son instancias distintas; publicar una rama no actualiza por sí solo la instancia.

```sh
npm run diagnose
```

Muestra release, commit, rama, cambios pendientes, raíz y huella de recursos públicos. La respuesta de `/__runtime.json` identifica el proceso que realmente responde, sin mostrar su carpeta. En la app: **Revisión técnica → Comprobar versión, servidor y caché**.

## Actualizar el Codespace desde Git

Confirma la respuesta en curso si corresponde y cierra otras pestañas del ejercicio. En una terminal nueva, dentro del repositorio:

```sh
cd /workspaces/Kukiprev
git fetch origin refs/heads/implementation/correa-interactiva-2.4:refs/remotes/origin/implementation/correa-interactiva-2.4
git show origin/implementation/correa-interactiva-2.4:scripts/update-codespace.sh > /tmp/decidobien-update.sh
bash /tmp/decidobien-update.sh
```

El script conserva commits locales; guarda modificaciones y archivos sin seguimiento en un stash identificado; nunca lo aplica automáticamente sobre la revisión. Los archivos ignorados no se sobrescriben si generan conflicto. Solo permite avanzar la rama local sin descartar commits. `main` no se modifica. Se detiene ante un proceso no reconocido en 4173 o una divergencia Git. No utiliza paquetes ni otra copia de aplicación.

El comando final deja `npm start` activo. Abre la misma URL reenviada de 4173, en el mismo navegador y perfil, con `/recovery.html`. Pulsa **Actualizar recursos conservando el avance**. No borres los datos del sitio. La caché actual es `decidobien-v9-context`; el diagnóstico debe coincidir con el SHA remoto y release `2.4.0-review.1`.

Los cambios anteriores quedan en `git stash list`, identificados con su rama de origen. No hagas `stash pop` sobre esta revisión sin examinar y resolver esos cambios. El script no hace reset, clean, borrado de stash ni publicación. La configuración de Codespaces inicia el servidor de esta misma carpeta al arrancar.

## Qué hace el participante

Inicio explorable sin puntaje y **Comenzar misión** siempre disponible. **Observa → Explora → Decide → Descubre → Aplica** mantiene la escena como superficie de interacción. Las acciones se eligen junto a persona, materiales y banda; requieren confirmación. La explicación posterior destaca relaciones sin animar maquinaria. En Aplica se prepara una consulta sobre método, condiciones o responsables, y se conserva para conversar con el relator. No se envía un aviso real.

La evaluación es independiente: tres preguntas, sin pistas o corrección anticipada, respuestas confirmadas guardadas y resultado al cierre. El puntaje demuestra comprensión del borrador; no acredita asistencia o aprobación.

Los 30 minutos son el alcance del módulo guiado con conversación y evaluación, no la duración de la demostración grabada. No hay esperas obligatorias, rankings ni premios por rapidez.

## Accesibilidad, audio y offline

Todos los objetivos de la escena tienen botones y una lista equivalente en diálogo, utilizables con teclado. Kuky acompaña con frases breves. Ajustes agrupa sonido, pausa de efectos y ayuda. Cuatro WAV locales se activan por acción del usuario; silenciar detiene su reproducción. El movimiento reducido del sistema y la preferencia local desactivan las animaciones.

La primera descarga requiere conexión. Espera «Lista sin conexión» y luego puede completarse el recorrido offline. La actualización es explícita y preserva el progreso guardado; no recupera selecciones que una versión antigua nunca guardó.

Ajustes permite **Cerrar recorrido en esta tablet**, con confirmación antes de borrar únicamente el avance actual. Cancelar lo conserva. No es autenticación, cierre de sesión empresarial ni garantía de borrar información heredada u otros datos del navegador.

## Seguridad y validación pendiente

El repositorio es público: sus respuestas y materiales son inspeccionables. La corrección offline y `localStorage` pueden modificarse; no se oculta esa limitación. No se solicitan identidades ni se construyó un backend de empresa. Las constancias verificables requieren identidad, autorización y validación en servidor.

El servidor no expone `.git`, documentos, scripts, pruebas o casos reservados. Rechaza enlaces simbólicos, traversal y métodos de escritura. La auditoría describe pruebas, correcciones y configuración que no pudo comprobarse: [auditoría de seguridad](docs/AUDITORIA_SEGURIDAD_2_4.md).

Siguen pendientes equipo/geometría, tarea/anomalía, accesos/controles, método, roles/comunicación, organización, protección personal por tarea y fuentes. No se recomiendan guantes de forma general frente al atrapamiento; informar no confirma una condición resuelta y ver el equipo detenido no demuestra seguridad para intervenir. Autoclave, vidrio y químicos se conservan para otros módulos.

[Implementación y capturas](docs/IMPLEMENTACION_2_4.md). Los documentos anteriores se conservan como historial de desarrollo.

## Comprobaciones reproducibles

```sh
npm test
python3 tests/browser-review.py
python3 tests/welcome-browser.py
python3 tests/experience-browser.py
python3 tests/server-security.py
python3 tests/security-browser.py
python3 scripts/security-audit.py
```

Las pruebas de navegador requieren Playwright de Python y Chromium en `/usr/bin/chromium`, con `npm start` activo. Cubren ruta completa, teclado, movimiento reducido, audio/silencio, persistencia, consultas, evaluación y offline en 360×800, 390×844, 768×1024 y 1365×1000. No sustituyen el piloto con trabajadores o los dispositivos reales.

Para migraciones, en otra terminal de pruebas inicia `python3 tests/migration-proxy.py`, luego ejecuta `python3 tests/migration-browser.py`. Ese fixture histórico usa solo un origen local aislado y no es un procedimiento de actualización de la app.

Para grabar video y la salida real Web Audio, sin banda sonora añadida:

```sh
DECIDOBIEN_RECORD=1 DECIDOBIEN_DEMO_DIR=/ruta/salida python3 tests/experience-browser.py
```

La grabación necesita el ffmpeg de Playwright. La validación de retención, la aprobación preventiva y la revisión de configuración privada bloqueada permanecen separadas de estas comprobaciones técnicas.
