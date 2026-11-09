# DecidoBien — Manos que cuidan

**2.5.0-demo.1**, rama `implementation/correa-phaser-demo`, creada exactamente desde `2f8275d` de `implementation/correa-interactiva-2.4`. Primera entrega jugable: **Comenzar misión → Nombre y apellido → Contexto → Explora → Decide → confirmar**. La escena es conceptual y el contenido sigue siendo un borrador pendiente de validación preventiva.

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

Abre **la misma dirección reenviada y perfil del navegador**, agregando `/recovery.html`. Pulsa **Actualizar recursos conservando el avance**. No borres los datos del sitio. El diagnóstico debe mostrar release `2.5.0-demo.1`, rama `implementation/correa-phaser-demo`, el SHA de GitHub y caché `decidobien-v12-phaser`.

En cualquier momento: **Revisión técnica → Comprobar versión, servidor y caché**. En terminal, `npm run diagnose`. La app mantiene las respuestas confirmadas anteriores. Si falta la identificación de esta pestaña, la pide antes de recuperar la actividad; no reinicia la evaluación.

## Qué cambió

Escena a pantalla completa, barra compacta, azul profundo/turquesa, logo y Kuky originales. La ilustración original se separa en cuatro máscaras: fondo, correa, cajas y operaria. Phaser controla selección, cámara de detalle y encuadre de historieta. La recomposición es idéntica al original; no se anima la mecánica.

El contexto presenta el rol existente. Un botón discreto sobre los estuches permite entrar directamente a explorar. Se puede ampliar un detalle y volver al plano general. Las alternativas **Comunicar, Retirar y Ajustar** tienen igual peso visual; seleccionar muestra el texto original de la alternativa. La explicación aparece después de confirmar.

Descubre mantiene la escena y los focos existentes. Aplica, evaluación y resultado conservan sus actividades anteriores; no se presentan como una extensión ya terminada de toda la referencia visual. Preparar una consulta no la envía ni cambia el estado del equipo. La evaluación sigue separada, sin pistas y con recuperación de respuestas confirmadas.

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
DECIDOBIEN_RECORD=1 DECIDOBIEN_DEMO_DIR=/ruta/salida python3 tests/experience-browser.py
```

La captura de video requiere el ffmpeg de Playwright; se combina el audio grabado con el video respetando `offset.json`.

[Implementación, alcance y evidencias](docs/IMPLEMENTACION_PHASER_2_5.md). [Revisión de seguridad actual](docs/AUDITORIA_SEGURIDAD_2_5.md). Los documentos 2.4 y anteriores son historial, no el estado actual.

Pendientes separados: **validación preventiva del equipo y contenido**, **prueba con trabajadores/personas nuevas**, **dispositivos reales**, **Codespace del usuario** y **seguridad empresarial del futuro backend**. No se declara aprobación técnica, acreditación ni cumplimiento normativo a partir de esta demo.
