# DecidoBien
PWA estática en español para practicar seis decisiones de prevención de riesgos. No requiere dependencias npm, backend ni credenciales.

## Desarrollo
En GitHub, abre **Code → Codespaces → Create codespace on main**. La configuración de `.devcontainer` inicia el servidor automáticamente y reenvía el puerto 4173. Abre **Ports → 4173 → Open in Browser** si no se abre una pestaña. El enlace dura mientras el Codespace esté activo; no es un despliegue permanente.

Con Node 24 y Python 3 disponibles:

```sh
cd /workspace/Kukiprev
npm start
```

Servidor en el puerto 4173. Ejecuta `npm test` para validar escenarios, puntaje y persistencia. Abre la aplicación, completa el recorrido y espera «Lista sin conexión» para comprobar la caché. En desarrollo, usa las herramientas del navegador para desregistrar el service worker si necesitas omitir la caché.

## Instalación y despliegue
Publica los archivos estáticos mediante HTTPS. El manifest y service worker usan rutas relativas y soportan un subdirectorio. El botón de instalación aparece en navegadores que ofrecen `beforeinstallprompt`; en iOS usa Compartir → Agregar a inicio. La primera carga requiere conexión. El progreso se almacena únicamente en el navegador/dispositivo; no se sincroniza ni se envía a servidores.

Al publicar cambios, actualiza la versión de CACHE en sw.js. No se garantiza funcionamiento offline hasta completar la precarga. Los procesos de desarrollo deben iniciarse nuevamente en cada entorno.

## Alcance y pendientes
Incluye bienvenida, búsqueda interactiva en tres zonas por escena, alternativas aleatorias, tiempo orientativo sin penalización, feedback, puntaje, medalla y revisión final. Conserva los contenidos del JSON de origen. Incluye doce ilustraciones originales en WebP (seis escenas base y seis consecuencias) en assets/escenas, precargadas para uso offline. Las consecuencias solo se muestran tras una decisión incorrecta. Las zonas están calibradas en porcentajes sobre las imágenes completas sin recorte en scenes.js y en assets/escenarios.json. Mantén ambos mapas sincronizados si cambias la composición. Los PNG originales de generación se conservan fuera del checkout en /workspace/generated_images. Las referencias normativas y recomendaciones del material fuente necesitan validación de un profesional de prevención antes de uso formativo real. La medalla no es una certificación.

Cada tarea de nube ya está aislada: utiliza este checkout; no crees worktrees salvo solicitud explícita.
