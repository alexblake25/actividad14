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

El despliegue seleccionado es Vercel, vinculado al repositorio `https://github.com/alexblake25/actividad14`. El archivo `vercel.json` configura `npm run build` y `public` como carpeta de publicación; Vercel usa HTTPS automáticamente.

## Evidencias

- [Reporte Lighthouse móvil](evidencias/lighthouse-mobile.report.html)
- [Reporte Lighthouse escritorio](evidencias/lighthouse-desktop.report.html)
- [Plan de pruebas y resultados](PLAN_DE_PRUEBAS.md)
