# Recorrido ordenado — evidencia 2.6.1-review.1

[Ver el video móvil completo con sonido real](DecidoBien-flujo-2.6.1.mp4). [Diagnóstico y correcciones](../FLUJO_2_6_1.md).

Grabación de Chromium en 390 × 844, unos 39 segundos, con identidad ficticia. Es una demostración acelerada de interacciones, no la duración de la capacitación ni una prueba con trabajadores. Código grabado: `82fe375d0e36993365a41362a6d4b5bf9f228df8`, árbol limpio, rama `implementation/correa-phaser-demo`, release `2.6.1-review.1`, huella pública `d903e9099f971e16`, caché `decidobien-v16-flow`. El commit posterior incorpora únicamente evidencia y documentación. [Diagnóstico al grabar](runtime-recording.json).

| Momento | Celular | Escritorio |
| --- | --- | --- |
| Inicio | [Inicio](390-inicio.png) | [Inicio](1366-inicio.png) |
| Preparación | [Nombre y destino](390-nombre.png) | [Nombre y destino](1366-nombre.png) |
| Contexto/Observa | [Paso 1](390-contexto.png) | [Paso 1](1366-contexto.png) |
| Explora | [Paso 2](390-explora.png) | [Paso 2](1366-explora.png) |
| Decide | [Paso 3](390-decide.png) | [Paso 3](1366-decide.png) |
| Descubre | [Paso 4](390-descubre.png) | [Paso 4](1366-descubre.png) |
| Aplica | [Paso 5](390-aplica.png) | [Paso 5](1366-aplica.png) |
| Retomar evaluación | [Destino explícito](390-retomar-evaluacion.png) | [Destino explícito](1366-retomar-evaluacion.png) |
| Evaluación | [Paso 6](390-evaluacion.png) | [Paso 6](1366-evaluacion.png) |
| Resultado | [Paso 7 y cierre](390-resultado.png) | [Paso 7 y cierre](1366-resultado.png) |

Las capturas de esta tabla proceden de `tests/flow-browser.py`, que además recorre salidas y recuperaciones. El video sigue la secuencia principal sin las pruebas repetidas de salir y volver. No se eliminaron etapas para grabarlo.

## Comprobaciones ejecutadas

- `npm test`: cinco archivos de pruebas aprobados, incluido el orden y los destinos del flujo.
- [Flujo y recuperación](flow-checks.json): dos tamaños, teclado, salida/retorno en Observa, Explora y Decide; evaluación sin respuesta, nombre ausente en pregunta 2, respuestas confirmadas recuperadas, resultado offline y reinicio únicamente por elección explícita.
- [Regresión de siete rutas](browser-review-run.log): cuatro tamaños y las tres decisiones; confirmación, evaluación separada, PDF de borrador y offline.
- [Ocho tamaños/rotación](decision-layout-run.log), [entrada accesible](welcome-browser-run.log) y [cuatro estados de Explora](explore-browser-run.log).
- [Movimiento, audio y estado reducido](motion-checks.json): tres rutas sin errores; evaluación neutra y resultado recuperado offline. [Grabación](recording-run.log).
- [Auditoría adicional](audit-mission-run.log): dos rutas completas con catorce estados, texto, HTML y [árbol AX](recorrido-actual.json). No equivale a probar un lector de pantalla real.
- [Seis migraciones históricas](migration-browser-run.log), incluida 2.6.0 → 2.6.1: respuestas confirmadas conservadas y recuperación explícita de evaluación.
- [Actualizador](update-codespace-run.log): commit de código limpio en un clon de prueba; conserva main, commits y cambios locales. No demuestra la versión del Codespace del usuario.
- [Navegador y seguridad local](security-browser-run.log) · [Superficie HTTP](server-security-run.log).
- [Contenido, originales y política idénticos a la base](contenido-conservado.json) · [Informes estructurados](comprobaciones.json).

Las pruebas offline bloquean la red. Chromium puede seguir notificando `navigator.onLine === true`; se comprueba el rótulo del certificado según esa señal y se conserva la limitación de prueba física. No se implementa sincronización empresarial. La validación preventiva, el piloto con personas nuevas/trabajadores y los dispositivos físicos siguen pendientes por separado.
