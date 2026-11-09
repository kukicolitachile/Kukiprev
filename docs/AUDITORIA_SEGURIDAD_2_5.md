# Revisión de seguridad — demo 2.5

Fecha: 9 de noviembre de 2026. Alcance: cambios desde `2f8275d`, servidor local, navegador Chromium, nuevas dependencias distribuidas, datos locales y regresión de recuperación. Es una revisión acotada de la demo, no una auditoría de producción ni una declaración de cumplimiento legal.

| Superficie | Comprobación y resultado | Límite |
| --- | --- | --- |
| Identificación | Nombre y apellido con longitudes acotadas, normalización Unicode y rechazo de campos malformados. Salida HTML escapada; entrada con marcado no se ejecuta. Nombre fuera de URLs, solicitudes y progreso en `localStorage` | `sessionStorage` no es un almacén seguro ni aislamiento empresarial; cerrar pestaña/cerrar recorrido reduce persistencia. El nombre reaparece en el PDF descargado y su archivo depende del dispositivo |
| Certificados | Política sin criterio aprobado; no emite certificado empresarial. PDF marcado borrador; no folio local. Offline muestra pendiente | Falta servidor autorizado, registro confiable, folio, verificación pública, retención y sincronización. Un cliente manipulable no acredita identidad o aprobación |
| Dependencias | Phaser 3.90.0 y pdf-lib 1.17.1 fijos, lockfile, archivos locales y licencias. `npm audit --omit=dev`: 0 vulnerabilidades conocidas en la consulta | No demuestra ausencia de fallos desconocidos ni sustituye una auditoría exhaustiva del código de las bibliotecas |
| CSP | Sin `unsafe-eval` ni scripts inline. Phaser usa imágenes HTML locales para evitar URLs blob de imágenes. Prueba de script inline inyectado: bloqueado | `style-src 'unsafe-inline'` sigue necesario para coordenadas de controles; no se habilita en scripts |
| Servidor | `.git`, documentos, pruebas, archivos privados/casos reservados y traversal rechazados. Symlinks rechazados. Métodos de escritura 405, errores sin reflejar entrada, HEAD sin cuerpo, cabeceras restrictivas | Servidor de revisión Python sin autenticación ni registro empresarial; Codespaces termina HTTPS fuera de este proceso |
| Offline/actualización | Bundle local con Phaser/PDF/audio y solo caso disponible; documentos y casos reservados fuera de la caché. Recuperación conserva respuestas y cachés ajenas | Todo recurso descargado es inspeccionable. Las respuestas del JSON y los resultados locales pueden modificarse |
| Tablets | Cierre confirmado borra el avance actual y nombre de la pestaña; cancelar conserva progreso y claves ajenas | No borra PDFs descargados, otras pestañas, sesiones del navegador ni datos heredados; no es cierre de sesión empresarial o borrado forense |
| Credenciales | Escaneo por patrones del historial/ref/reflog accesible y árbol de trabajo: sin candidatos detectados | Omite binarios/grandes, historia remota inaccesible y credenciales fuera de Git; no demuestra ausencia universal |

La comprobación de caché midió 39 recursos y 2.46 MB aproximadamente. La medición de Chromium local no representa rendimiento garantizado de teléfonos reales. No hay analítica, CDN o fuentes remotas. Los únicos datos de identidad utilizados en pruebas/capturas son ficticios.

## Pendientes de seguridad separados

No se han verificado controles privados de GitHub (colaboradores, protecciones, secret scanning y auditoría de accesos), la configuración real del Codespace ni infraestructura de la empresa. El acceso Git para recuperar/publicar esta rama no demuestra esos controles. No se hizo pentest contra esos servicios.

No se declara el futuro sistema de certificados seguro: aún no existe el servidor de registro y emisión. Requiere autenticación/autorización, resultados confiables, folios, integridad, política de retención, tratamiento de datos y controles de tablets compartidas. La validación preventiva y el piloto con trabajadores son pendientes distintos de esta revisión técnica.

## Reproducir

`npm test`, `npm audit --omit=dev`, `python3 tests/server-security.py`, `python3 tests/security-browser.py`, `python3 tests/welcome-browser.py`, `python3 scripts/security-audit.py`. Para probar actualizaciones históricas: fixture `tests/migration-proxy.py` y `tests/migration-browser.py`. Las pruebas activas apuntan a localhost/fixtures, no a producción.
