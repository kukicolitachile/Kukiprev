# Auditoría de seguridad — implementación 2.4

**Fecha:** 9 de noviembre de 2026. **Alcance realizado:** código, historial Git accesible, servidor de revisión, navegador, caché offline, persistencia y metadatos de acceso a GitHub. Las pruebas activas se ejecutaron únicamente sobre el servidor local y fixtures temporales. No se hizo una prueba de penetración contra GitHub, redes de empresa o el Codespace.

## Hallazgos y resolución

| Hallazgo | Riesgo y evidencia | Estado |
| --- | --- | --- |
| Repositorio público | El metadato web de GitHub confirma `repository_public=true`. Código, historial accesible, respuestas, escenas archivadas y documentación pueden descargarse, aunque el servidor no los distribuya todos | Confirmado. No se cambió visibilidad ni historial. Bloquea tratar ese material como confidencial |
| Corrección y progreso locales modificables | Se extrajo la clave de respuestas del JSON y se construyó un resultado local completo alterando `localStorage` | Confirmado. Resultado demostrativo y aviso de no acreditación. Bloquea registros y constancias confiables sin servidor |
| Exposición por enlaces simbólicos en archivos permitidos | Un nombre permitido podía apuntar a un archivo distinto | Corregido. Se rechazan symlinks en el archivo o sus directorios, incluidos destinos dentro de la raíz. Prueba temporal de acceso a una fixture privada |
| Respuestas de error y métodos no necesarios | El servidor base podía mostrar información de implementación y respuestas HTML genéricas | Corregido. Errores sin reflejar la solicitud, sin versión de Python; métodos de escritura devuelven 405 |
| Entradas guardadas excesivas o inválidas | La carga aceptaba una cadena sin límite previo a JSON.parse; había campos sin límites de longitud | Corregido. Límite de 64 KiB antes del parseo, límites de reflexión y validación de asuntos/identificadores. Payloads dañados no impiden abrir la app |
| Eliminación de cachés por prefijo demasiado amplio | La actualización podía borrar otro caché del mismo origen cuyo nombre empezara igual | Corregido. Solo se eliminan nombres conocidos de recursos estáticos anteriores; una caché ajena de prueba se conserva |
| Tablets compartidas | Otra persona del mismo perfil puede retomar o inspeccionar el avance | Cierre explícito y confirmado del ejercicio, con prueba de cancelación y borrado acotado. No hay aislamiento entre identidades, autenticación ni garantía de eliminar datos heredados |
| Cambios sin confirmar omitidos del diagnóstico | Solo se contaban modificaciones a archivos ya registrados | Corregido. El diagnóstico señala también archivos nuevos no ignorados; la huella identifica los recursos públicos y el commit identifica el código |

## Pruebas ejecutadas

- Rutas de archivos privados, `.git`, documentos, casos reservados y scripts: denegadas por HTTP.
- Traversal directo/codificado, rutas malformadas y enlaces simbólicos: rechazados sin exponer contenido privado de prueba.
- POST, PUT, DELETE, PATCH y OPTIONS: 405. HEAD no devuelve cuerpo.
- CSP: scripts del mismo origen, objetos y marcos deshabilitados, envío de formularios deshabilitado. Se probó que un script inline inyectado no ejecuta. `style-src 'unsafe-inline'` se conserva para coordenadas de las zonas; no se habilitó `unsafe-inline` en scripts ni `unsafe-eval`.
- Cabeceras de no sniff, política de referencia y permisos, y política de recursos del mismo origen.
- Recuperación de entradas corruptas/excesivas, IDs desconocidos y duplicados; contenido dinámico escapado y sin campos de identidad en el ejercicio.
- Actualización desde tres versiones, con una respuesta confirmada inalterada y recarga offline posterior. Caché ajena y claves ajenas preservadas.
- Borrado del avance solo tras confirmación del usuario; cancelación sin modificaciones.
- Inspección de recursos descargados y demostración de que un resultado local se puede falsificar. Esta limitación no se oculta con ofuscación o bloqueo del navegador.
- Escaneo por patrones de blobs de texto de referencias y reflogs accesibles, más árbol de trabajo: sin candidatos de credenciales en el alcance analizado. Se omiten binarios, blobs grandes e historial remoto inaccesible. No equivale a demostrar ausencia de todos los secretos.
- No hay dependencias npm de ejecución ni SDK de analítica, CDN, video remoto o backend de datos personales. El servidor usa Python estándar. Las herramientas de navegador son dependencias de pruebas, no se distribuyen como parte de la app.

Los resultados de rendimiento de Chromium local y el tamaño de caché son mediciones de laboratorio. La caché de la entrega contiene 28 recursos, aproximadamente 704 kB, sin documentos internos ni casos reservados. Todos los recursos que recibe el navegador siguen siendo inspeccionables.

## Acceso y controles no verificables

La API `api.github.com/repos/kukicolitachile/Kukiprev` devolvió **Forbidden** desde este entorno. La lectura de referencias y la publicación autorizada prueban acceso Git para esta operación; no prueban permisos administrativos ni una revisión completa de colaboradores y reglas.

No se pudieron verificar protecciones de ramas, colaboradores/roles, secret scanning, reglas organizacionales, auditoría de accesos ni la totalidad de la configuración privada de GitHub. Tampoco se verificó el Codespace concreto: la solicitud al puerto reenviado devuelve **403 del proxy**. No se atribuye a esos sistemas un estado seguro o inseguro sin evidencia.

No se modificaron permisos, visibilidad, colaboradores ni políticas de la organización. Estos puntos requieren acceso autorizado a esa configuración y constituyen un bloqueo real de esa parte de la auditoría, no una comprobación aprobada.

## Decisiones antes de un uso empresarial

1. Material genérico autorizado y práctica pueden funcionar offline. No puede mantenerse secreta una clave de respuestas descargada al dispositivo o publicada en el repositorio.
2. Identidad, roles de participante/relator/administración, autorización de resultados, trazabilidad, constancias verificables y retención requieren diseño y validación en servidor. No están implementados ni simulados aquí.
3. Tablets compartidas necesitan política de cierre, datos mínimos y aislamiento de identidad. El cierre local añadido mejora el uso de la demo, no sustituye esos controles ni es borrado forense.
4. No introducir datos reales de trabajadores ni información confidencial del proceso en este repositorio público o en esta demostración sin resolver acceso, tratamiento y conservación. No se declara cumplimiento normativo ni validez legal del módulo.
5. Validación preventiva y piloto con trabajadores se mantienen separados de esta revisión de seguridad.

## Reproducción

Con `npm start` activo: `python3 tests/server-security.py`, `python3 tests/security-browser.py` y `python3 scripts/security-audit.py`. Para migraciones, iniciar el fixture `tests/migration-proxy.py` y ejecutar `tests/migration-browser.py`. No se dirigen estos tests a una instancia productiva.
