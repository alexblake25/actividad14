# PWA Actividades Académicas

PWA para administrar tareas, exámenes y proyectos escolares (Actividad 14). El consejo se consulta desde una API pública y cuenta con respaldo en caché y JSON local.

## Ejecutar

```bash
node server.js
```

Abre http://localhost:4000 (puerto 4000 por defecto; cambia con `PORT`).

El servidor usa módulos nativos de Node. Para regenerar el JavaScript minificado después de editar `public/app.js`, ejecuta `npm install` y `npm run build`.

## Documentación

- `PLAN_DE_PRUEBAS.md`: plan de pruebas y resultados registrados hasta el momento.
- `DOCUMENTO_TECNICO.md`: herramientas, servicios y parámetros de configuración.

## Publicar

El proyecto está publicado en Vercel: [https://actividad14-wvpb.vercel.app](https://actividad14-wvpb.vercel.app). El despliegue está vinculado al repositorio `https://github.com/alexblake25/actividad14`. El archivo `vercel.json` configura `npm run build` y `public` como carpeta de publicación; Vercel proporciona HTTPS automáticamente.

## Evidencias

- [Reporte Lighthouse de producción móvil](evidencias/lighthouse-production-mobile.report.html)
- [Reporte Lighthouse de producción escritorio](evidencias/lighthouse-production-desktop.report.html)
- [Captura del proyecto publicado en Vercel](evidencias/publicacion-vercel.png)
- [Captura de la PWA pública](evidencias/pwa-publicada.png)
- [Captura de datos antes de actualizar la PWA](evidencias/datos-antes-actualizacion.png)
- [Captura del aviso de actualización](evidencias/actualizacion-disponible.png)
- [Captura de la PWA actualizada](evidencias/actualizacion-aplicada.png)
- [Captura de la versión 1.2.1](evidencias/version-actualizada.png)
- [Plan de pruebas y resultados](PLAN_DE_PRUEBAS.md)

**Pendiente para cerrar la evidencia de instalación:** abre la URL pública en Edge, selecciona **Configuración y más → Aplicaciones → Instalar este sitio como una aplicación**, y guarda una captura de la app abierta desde Inicio. El repositorio incluye la PWA instalable, pero esta instalación no se completó durante la sesión.
