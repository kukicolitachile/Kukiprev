# DecidoBien — Manos que cuidan

**2.6.1-review.1**, rama `implementation/correa-phaser-demo`, corrección de flujo desde `9b19f10`. Una misión de correa con escena persistente desde Contexto hasta Aplica, movimiento controlado por acciones, progreso de siete momentos y evaluación separada hasta Resultado. Mantiene nombre, logo, Kuky, textos y criterios del ejercicio. **Borrador pendiente de validación preventiva**, sin emisión empresarial.

[Corrección del flujo y recuperación: alcance, pruebas y video](docs/FLUJO_2_6_1.md). [Movimiento y recorrido anteriores: alcance, pruebas y video](docs/MOVIMIENTO_2_6.md). [Auditoría histórica y requisitos contrastados](docs/AUDITORIA_MISION_Y_EXPLORA.md).

## Abrir

```sh
npm start
```

Solo requiere Python 3 para servir la app (Node permite usar los comandos npm). Phaser 3.90.0 y pdf-lib 1.17.1 se distribuyen localmente en `vendor/`, con sus licencias. No se requieren descargas npm ni CDN para jugar; `npm ci` permite reconstruir/verificar las dependencias de desarrollo.

En Codespaces: **Puertos → 4173 → Abrir en el navegador**. El Codespace del usuario y este entorno son instancias distintas. Publicar esta rama no actualiza automáticamente su instancia.

## Actualizar el Codespace conservando cambios y progreso

Confirma las respuestas en curso y cierra otras pestañas del ejercicio. En una terminal nueva:

```sh
cd /workspaces/Kukiprev
git fetch origin refs/heads/implementation/correa-phaser-demo:refs/remotes/origin/implementation/correa-phaser-demo
git show origin/implementation/correa-phaser-demo:scripts/update-codespace.sh > /tmp/decidobien-update.sh
bash /tmp/decidobien-update.sh
```

El script preserva commits locales, guarda cambios registrados y archivos sin seguimiento en un stash identificado con su rama de origen, y no lo reaplica automáticamente. No sobrescribe archivos ignorados que colisionen, no descarta divergencias y no modifica `main`. Solo reinicia un servidor reconocido de este proyecto en 4173; se detiene ante un proceso desconocido. Los cambios anteriores pueden revisarse con `git stash list`; no aplicar `stash pop` sobre esta revisión sin examinarlos.

Abre **la misma dirección reenviada y perfil del navegador**, agregando `/recovery.html`. Pulsa **Actualizar recursos conservando el avance**. No borres los datos del sitio. El diagnóstico debe mostrar release `2.6.1-review.1`, rama `implementation/correa-phaser-demo`, el SHA de GitHub y caché `decidobien-v16-flow`.

En cualquier momento: **Revisión técnica → Comprobar versión, servidor y caché**. En terminal, `npm run diagnose`. La app mantiene las respuestas confirmadas anteriores. Si falta la identificación de esta pestaña, la pide antes de recuperar la actividad; no reinicia la evaluación.

## Qué cambió

El inicio responde a explorar la planta, por toque o con una lista accesible, sin puntaje ni intentos de práctica. Comenzar misión sigue disponible. Una transición breve conduce a nombre/apellido y luego al contexto con el rol existente.

**Observa → Explora → Decide → Descubre → Aplica** utiliza una misma superficie Phaser. En Explora no hay marcas iniciales: el toque recibe una respuesta neutra y la pista es textual. El visor y el acercamiento aparecen después del hallazgo. Decide cambia al encuadre de historieta; las tres acciones tienen igual peso, se seleccionan y se confirman. Descubre permite tocar los elementos explicados sobre la imagen. Aplica conserva las preguntas existentes de método, condiciones y responsables, y prepara una consulta sin enviarla ni cambiar el equipo.

Un indicador con «Paso N de 7», nombre y siguiente etapa conecta los cinco momentos con Evaluación y Resultado. Salir al inicio conserva un punto de retorno explícito, incluso antes de confirmar la primera respuesta de evaluación. La identificación indica el destino antes de continuar. El resultado tiene un cierre principal; consulta, respuestas y certificado quedan como detalles opcionales. Reiniciar un recorrido terminado o repetir la evaluación requiere elegir expresamente el reemplazo del avance. La evaluación mantiene tres preguntas sin pistas ni señales correctivas; selección y confirmación son neutras. El cierre muestra el avance completo de esta misión y a Kuky con una expresión original. El distintivo representa completar el recorrido, no aprobar una capacitación ni emitir un certificado.

Las entradas, pulsaciones, encuadres y cambios de foco son finitos y de interfaz; se pueden desactivar. No hay avance automático, cuenta regresiva o movimiento mecánico. Se conservan el alcance de módulo guiado de 30 minutos y el objetivo futuro de seis misiones, sin inventar las cinco restantes.

## Identificación y certificado

Nombre y apellido se guardan en `sessionStorage` de la pestaña; no se incluyen en el progreso de `localStorage`, URLs ni solicitudes empresariales. Pueden corregirse desde el resultado. Ajustes permite cerrar el recorrido con confirmación y elimina la identificación de la pestaña y el avance actual; conserva otras claves. No hay autenticación ni aislamiento entre personas del mismo perfil.

`certificate-policy.json` deja el criterio pendiente de Julisa: `completion` o `minimum_score` (0–100). La emisión también requiere validación preventiva y registro/folio en un servidor empresarial. **Ese servidor aún no está implementado**. No se genera un folio local ni se convierte el puntaje del navegador en evidencia confiable.

Se puede descargar una **vista previa PDF**, con nombre, módulo, fecha y marca visible de borrador sin emisión empresarial. Offline, el resultado indica **Certificado pendiente de sincronización**; no existe aún una cola empresarial de sincronización. La vista previa es una imagen dentro del PDF y no es un certificado PDF etiquetado accesible; el resultado web conserva su equivalente textual.

## Accesibilidad, audio y offline

Controles por teclado y lista equivalente a tocar la escena; foco visible, mensajes de estado y selección sin arrastre. Ajustes agrupa sonido opcional y pausa de efectos. Las animaciones de cámara respetan la preferencia de movimiento reducido. Ningún sonido comunica por sí solo una respuesta. Cuatro WAV locales; sin audio automático.

La primera descarga requiere conexión; espera «Lista sin conexión». Después se puede completar y recuperar el recorrido offline. La actualización de caché preserva el progreso. En tablets compartidas debe cerrarse el recorrido antes de otra persona; el cierre no es borrado forense ni cierre empresarial.

## Comprobaciones

```sh
npm test
python3 tests/browser-review.py
python3 tests/welcome-browser.py
python3 tests/decision-layout.py
python3 tests/explore-browser.py
python3 tests/motion-browser.py
python3 tests/flow-browser.py
python3 tests/audit-mission.py
python3 tests/experience-browser.py
python3 tests/server-security.py
python3 tests/security-browser.py
python3 tests/update-codespace.py
python3 scripts/security-audit.py
npm audit --omit=dev
```

Pruebas de navegador: Python Playwright, Chromium en `/usr/bin/chromium` y `npm start` activo. Prueban 360×800, 390×844, 768×1024 y 844×390, teclado, las tres decisiones, offline, PDF de borrador y evaluación. Para migración histórica: `python3 tests/migration-proxy.py` y, en otra terminal, `python3 tests/migration-browser.py`. Este fixture es exclusivamente de pruebas, no otra forma de servir la app al usuario.

Grabación con la salida real de Web Audio:

```sh
DECIDOBIEN_RECORD=1 DECIDOBIEN_MOTION_DIR=/ruta/salida python3 tests/motion-browser.py
```

La captura de video requiere el ffmpeg de Playwright; se combina el audio grabado con el video respetando `offset.json`.

[Implementación anterior, alcance y evidencias](docs/IMPLEMENTACION_PHASER_2_5.md). [Revisión de seguridad de esta entrega](docs/SEGURIDAD_2_6.md). La corrección actual es 2.6.1-review.1; las evidencias 2.6.0 y anteriores documentan versiones anteriores.

Pendientes separados: **validación preventiva del equipo y contenido**, **prueba con trabajadores/personas nuevas**, **dispositivos reales**, **Codespace del usuario** y **seguridad empresarial del futuro backend**. No se declara aprobación técnica, acreditación ni cumplimiento normativo a partir de esta demo.
