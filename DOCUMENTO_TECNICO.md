# Documento técnico — PWA Actividades Académicas

## 1. Descripción

Aplicación web progresiva para registrar tareas, exámenes y proyectos escolares. Funciona sin conexión, es instalable y se actualiza mediante Service Worker.

## 2. Herramientas y tecnologías

| Elemento | Detalle |
|---|---|
| Frontend | HTML5, CSS3, JavaScript sin frameworks; Terser minifica el script para producción |
| Almacenamiento | `localStorage`, clave `actividades.v1` |
| Servicio remoto | `https://dummyjson.com/quotes/random`, consultado con `fetch`; el Service Worker lo guarda en caché y `public/data/consejos.json` sirve de respaldo local |
| PWA | Web App Manifest + Service Worker + Cache Storage + Notifications API |
| Servidor local | Node.js (módulo `http` nativo), **puerto 4000** |
| Pruebas | Chrome DevTools (Application, Network, Lighthouse) |
| Control de versiones | Git / GitHub |
| Hospedaje | Vercel; repositorio `https://github.com/alexblake25/actividad14` |

## 3. Estructura del proyecto

```
pwa-actividades/
├── server.js                 Servidor estático (puerto 4000)
├── package.json
├── vercel.json              Build y carpeta de publicación de Vercel
├── .gitignore               Excluye dependencias y configuración local
├── PLAN_DE_PRUEBAS.md
├── DOCUMENTO_TECNICO.md
├── evidencias/              Reportes Lighthouse y capturas de la publicación
├── tools/gen_icons.py        Generador de iconos PNG
└── public/
    ├── index.html
    ├── styles.css
    ├── app.js                Fuente legible: router, CRUD, notificaciones
    ├── app.min.js            JavaScript minificado para producción (generado)
    ├── sw.js                 Service Worker
    ├── manifest.webmanifest
    ├── data/consejos.json
    └── icons/ (192, 512, maskable-512)
```

## 4. Ejecución local (puerto 4000)

```bash
node server.js
# → http://localhost:4000
```

El puerto es 4000 por defecto; se puede cambiar con la variable `PORT` (necesario en algunos hospedajes que asignan el puerto). Tras modificar `public/app.js`, ejecutar `npm install` una vez y `npm run build` para regenerar `public/app.min.js`.
El servidor local envía una política de caché de una semana para JavaScript y CSS; el Service Worker fuerza una descarga nueva de los recursos al instalar una versión, para no reutilizar una copia HTTP obsoleta.
La hoja de estilos se aplica mediante una hoja normal de CSS para evitar cambios de diseño después del primer renderizado. El script de la aplicación usa `defer`.

## 5. Parámetros de configuración

**Manifest** (`public/manifest.webmanifest`): `name` "Actividades Académicas", `short_name` "Actividades", `start_url` `./index.html`, `scope` `./`, `display` `standalone`, `theme_color` `#1e5bd8`, `background_color` `#f4f6fb`, íconos 192, 512 y maskable 512.

**Service Worker** (`public/sw.js`):
- Caché `actividades-<VERSION>`; precarga de todos los archivos de la app.
- Solicitudes GET del mismo origen: guarda respuestas exitosas en Cache Storage y las reutiliza sin conexión; cuando ya hay una copia, la entrega de inmediato y la actualiza en segundo plano.
- Navegación: red primero, guarda la respuesta y usa `index.html` en caché como respaldo sin conexión.
- API pública `https://dummyjson.com/quotes/random`: guarda y reutiliza su respuesta; las demás solicitudes a otros orígenes no se almacenan. No se guardan respuestas fallidas, `private`, `no-store` ni solicitudes con encabezado `Authorization`.
- Los datos de actividades se guardan en `localStorage`, no en caché de solicitudes, y sobreviven las actualizaciones del Service Worker.
- `activate` elimina cachés de versiones anteriores.
- No usa `skipWaiting()` automático: la app muestra un banner y envía el mensaje `SKIP_WAITING` cuando el usuario pulsa **Actualizar**; al cambiar el controlador la página recarga.

**Rutas relativas:** todas las URLs (`sw.js`, manifest, íconos, datos) son relativas, por lo que la app funciona también en subrutas como GitHub Pages (`usuario.github.io/repositorio/`).

## 6. Publicación

La carpeta que se publica es **`public/`**. Es un sitio estático: el hospedaje no necesita Node.

### Netlify
1. Subir el proyecto a GitHub.
2. Netlify → *Add new site* → *Import an existing project* → elegir el repositorio.
3. **Build command:** `npm run build`. **Publish directory:** `public`.
4. El archivo `public/_headers` configura caché de una semana para JS/CSS y evita caché del Service Worker y manifest.
5. *Deploy*. La URL queda como `https://<nombre>.netlify.app` (HTTPS automático).

### Vercel (servicio seleccionado)
El proyecto `actividad14-wvpb` está vinculado al repositorio `https://github.com/alexblake25/actividad14`, rama `main`. URL de producción: `https://actividad14-wvpb.vercel.app`. El panel de Vercel muestra el despliegue de producción en estado **Ready**. El archivo `vercel.json` define **Build command:** `npm run build`, **Output Directory:** `public` y **Framework Preset:** Other (sin framework). Vercel proporciona HTTPS automáticamente.

Los reportes Lighthouse de producción, en móvil y escritorio, se guardan en `evidencias/lighthouse-production-mobile.report.html` y `evidencias/lighthouse-production-desktop.report.html`. Las capturas del panel de Vercel y de la PWA publicada están en `evidencias/`.

### GitHub Pages
1. Ejecuta `npm install` y `npm run build`, y publica el contenido de `public/`.
2. Como Pages solo ofrece la raíz o `/docs`, copia el contenido de `public/` a una carpeta `docs/` (o usa una rama `gh-pages`) y selecciónala.
3. La URL será `https://<usuario>.github.io/<repositorio>/`.

## 7. Flujo de actualización

1. Modificar el proyecto (p. ej. `TEXTO_BIENVENIDA` y `APP_VERSION` en `app.js`).
2. Cambiar `VERSION` en `sw.js` (`v1` → `v2`). Sin este cambio el navegador no detecta una nueva versión.
3. `git commit` y `git push`; el hospedaje publica automáticamente.
4. Al abrir la app instalada aparece el banner de actualización; al aceptarlo se activa el nuevo Service Worker.
5. Los datos de `localStorage` no se tocan, por lo que se conservan.

## 8. Evidencias a adjuntar

- Repositorio GitHub: ______________________
- URL pública: ______________________
- Capturas: publicación en el hospedaje, ícono de instalación, app instalada, banner de actualización, app actualizada con datos conservados.
- Reportes Lighthouse (antes y después de las mejoras).
- Plan de pruebas con resultados (`PLAN_DE_PRUEBAS.md`).
