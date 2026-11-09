# Revisión de seguridad — 2.6.0-review.1

9 de noviembre de 2026. Revisión acotada del código y servidor local; continúa la [auditoría anterior](AUDITORIA_SEGURIDAD_2_5.md). No es una auditoría de producción, una certificación legal o una prueba contra el Codespace.

| Comprobación ejecutada | Resultado y evidencia |
| --- | --- |
| Dependencias fijadas | `npm audit --omit=dev --json`: 0 vulnerabilidades conocidas, sin cambiar dependencias. Phaser 3.90.0 y pdf-lib 1.17.1. |
| Patrones de credenciales | `scripts/security-audit.py`: 262 blobs de texto históricos revisados, 85 binarios/grandes omitidos; sin candidatos. También se recorrió el árbol de trabajo textual. No cubre historia inaccesible, configuración fuera del repositorio o todos los metadatos binarios. |
| Superficie HTTP | `.git`, documentos, scripts, casos reservados, directorios y traversal rechazados; métodos de escritura, symlinks y cabeceras comprobados. [Informe](movimiento-2.6/server-security-run.log). |
| Navegador | CSP bloquea scripts inline; entradas y almacenamiento malformados se recuperan; cierre explícito acotado; nombre fuera del progreso y solicitudes. [Informe](movimiento-2.6/security-browser-run.log). |
| Caché | 40 recursos, 2.481.582 bytes; incluye el nuevo CSS local y excluye documentos/casos reservados. No se agregaron servicios externos. |
| Actualización | [Prueba del actualizador](movimiento-2.6/update-codespace-run.log): conserva commits locales de main, cambios en stash, archivos ignorados en colisión y procesos desconocidos. [Migración histórica](movimiento-2.6/migration-browser-run.log): conserva respuestas y cachés ajenas. |
| Resultado y certificado | Los resultados locales siguen siendo manipulables; no son evidencia empresarial confiable. Política y PDF de borrador sin cambios. No existe folio local, registro empresarial ni envío de consultas. |

El cambio de movimiento no añade entradas de red, analítica, autenticación, permisos del dispositivo o dependencias. El código de audio sigue siendo local y su activación depende del usuario.

Quedan pendientes por separado la revisión de infraestructura/controles privados de GitHub y Codespaces, dispositivos físicos y lectores de pantalla reales, y la seguridad del futuro servidor de identidad, registros y certificados. No se ha realizado un pentest de esos servicios. La validación preventiva y el piloto con trabajadores tampoco quedan resueltos por estas pruebas técnicas.

La prueba automatizada offline verifica carga, recorrido y recuperación con la red bloqueada. En las dos capturas adicionales del recorrido, Chromium notificó `navigator.onLine === true` a pesar del bloqueo de red de Playwright; por ello el rótulo del certificado fue «Criterio de emisión pendiente de Julisa». Esa prueba **no acredita** la detección de desconexión del dispositivo. La rama `pending_sync` sí tiene prueba unitaria; queda pendiente comprobar el evento real sin red en teléfono/tablet. No hay una sincronización empresarial implementada.
