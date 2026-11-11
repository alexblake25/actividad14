# Plan de pruebas — PWA Actividades Académicas

## Parte 1. Preparación y planificación de pruebas

**Aplicación seleccionada:** Actividades Académicas v1.1.0, la PWA de este proyecto.
**URL local:** http://localhost:4000 · **URL pública:** https://actividad14-wvpb.vercel.app
**Navegador de auditoría:** Microsoft Edge 157.0.4341.42 · **Lighthouse:** 13.6.0 (Mobile y Desktop)
**Fecha de auditoría:** 07/11/2026 **Integrantes:** ______________________

> Ejecuta cada procedimiento y registra el resultado observado. No marques una prueba como aprobada o no aprobada antes de ejecutarla; mientras esté pendiente, deja esas columnas sin llenar.

## Funcionalidades principales identificadas

| Área | Funcionalidad |
|---|---|
| Navegación | Rutas por hash: Inicio, Actividades, Ajustes |
| Formularios | Alta y edición de actividades con validación |
| Almacenamiento local | `localStorage` (clave `actividades.v1`) |
| Servicio remoto | API pública `https://dummyjson.com/quotes/random`; respaldo offline con Cache Storage y `data/consejos.json` local |
| Notificaciones | Permiso, notificación de prueba, aviso de entregas vencidas |
| Offline | Service Worker con precaché y respaldo sin conexión |
| Instalación / actualización | Manifest, `beforeinstallprompt`, banner de actualización |

## 1. Pruebas funcionales

| ID | Funcionalidad | Procedimiento | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|
| F-01 | Validación del formulario | En Actividades, pulsar **Guardar** con todo vacío | Aparecen mensajes de error en título, materia; no se guarda nada | Se mostraron los errores de título y materia; la actividad no se guardó. | Aprobado |
| F-02 | Título corto | Escribir "ab" como título y guardar | Error "al menos 3 caracteres" | Se mostró "El título debe tener al menos 3 caracteres."; no se registró la actividad. | Aprobado |
| F-03 | Registro | Llenar todos los campos válidos y guardar | Aparece la tarjeta en la lista y el aviso "Actividad registrada" | Se registró "Prueba funcional PWA" (materia: Calidad) y apareció el aviso esperado. | Aprobado |
| F-04 | Consulta / búsqueda | Escribir parte del título o materia en **Buscar** | La lista se filtra en tiempo real | Al buscar "Calidad", se mostró la actividad registrada. | Aprobado |
| F-05 | Filtro por estado | Elegir "Hechas" en **Mostrar** | Solo se ven las actividades hechas | Al seleccionar "Hechas" se mostró la actividad marcada como hecha. | Aprobado |
| F-06 | Edición | Pulsar **Editar**, cambiar título, **Guardar cambios** | El título cambia en la lista y el formulario vuelve a modo "Nueva" | El título cambió a "Actividad editada", se mostró el aviso de actualización y el formulario volvió a "Nueva actividad". | Aprobado |
| F-07 | Marcar hecha | Pulsar **Marcar hecha** | Título tachado, estado "Hecha"; el botón cambia a **Reabrir** | El estado cambió a "Hecha" y el botón cambió a "Reabrir". | Aprobado |
| F-08 | Eliminación | Pulsar **Eliminar** y aceptar el diálogo | La actividad desaparece de la lista | Se aceptó la confirmación; la actividad desapareció y se mostró "Actividad eliminada". | Aprobado |
| F-09 | Cancelar eliminación | Pulsar **Eliminar** y cancelar | La actividad permanece | Al cancelar el diálogo, la actividad permaneció en la lista. | Aprobado |
| F-10 | Persistencia | Registrar una actividad y recargar la página (F5) | La actividad sigue ahí | Tras recargar, "Auditoría editada" permaneció en la lista. | Aprobado |
| F-11 | Entrega vencida | Registrar una actividad con fecha pasada | Se muestra la fecha en rojo con "(vencida)"; el contador de Inicio la cuenta | Con fecha 01/01/2020 se mostró "(vencida)" en la tarjeta; Inicio contó 1 actividad vencida. | Aprobado |
| F-12 | Navegación | Usar la barra inferior: Inicio → Actividades → Ajustes → Inicio | Cada pantalla se muestra y el ícono activo cambia | Se recorrieron Inicio, Actividades y Ajustes; cada vista se mostró y el enlace de la pantalla actual quedó activo. | Aprobado |
| F-13 | Botón atrás | Después de navegar, usar el botón atrás del navegador | Regresa a la pantalla previa | Después de pasar por Ajustes, el botón atrás regresó a Actividades. | Aprobado |
| F-14 | Servicio remoto | Abrir Inicio con conexión | "Consejo del día" muestra una cita de la API | Se consultó la API DummyJSON; Inicio mostró una cita y autor. | Aprobado |
| F-15 | Notificaciones | En Ajustes: **Activar notificaciones** y **Enviar notificación de prueba** | Se solicita permiso y aparece la notificación | En un perfil de prueba aislado de Edge se concedió permiso, se pulsó **Enviar notificación de prueba** y el Service Worker reportó una notificación. El permiso del perfil habitual sigue denegado. | Aprobado en perfil aislado |

**Respaldo del servicio remoto:** si la API falla, la app intenta usar `data/consejos.json`; sin red y sin una respuesta remota cacheada, el Service Worker también permite ese respaldo local.

## 2. Pruebas offline (Chrome DevTools)

Preparación: abrir la app con conexión una vez; DevTools → Application → Service Workers (estado *activated*) y Cache Storage (`actividades-v10`).

| ID | Funcionalidad | Procedimiento | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|
| O-01 | Service Worker registrado | Application → Service Workers | Aparece `sw.js` activado | El Service Worker estaba en estado `activated`. | Aprobado |
| O-02 | Precaché | Application → Cache Storage | Se ven los recursos precargados y las respuestas GET de la app en `actividades-v10` | Cache Storage mostró los 9 recursos precargados más solicitudes GET ejecutadas durante el uso; se confirmó una única caché activa `actividades-v10`. | Aprobado |
| O-03 | Apertura offline | Network → **Offline**, abrir la app | La app abre normalmente; insignia "Sin conexión" | Con la emulación offline documentada previamente, la app abrió desde caché. El 11/11/2026 se volvió a verificar con el servidor local detenido: el Service Worker controló la página y cargó Inicio y Actividades desde caché. El navegador conservó el indicador "En línea", por lo que ese indicador no se considera validado en esta ejecución. | Aprobado (carga en caché) |
| O-04 | CRUD offline | Offline: registrar, editar y eliminar actividades | Todo funciona y se conserva al recargar | La prueba manual previa registró, editó y eliminó una actividad sin red. En la repetición automatizada del 11/11/2026, con el servidor local detenido, se registró una actividad y persistió después de recargar; se retiró el dato temporal al finalizar. | Aprobado |
| O-05 | Navegación offline | Offline: recorrer las tres pantallas | Todas se muestran | Inicio, Ajustes y Actividades se mostraron con la insignia "Sin conexión". | Aprobado |
| O-06 | Consejo offline | Offline: abrir Inicio | La API cacheada o el JSON local sirve el consejo, sin error en pantalla | En Edge sin conexión, Inicio mostró el consejo local/cacheado con la indicación "guardado sin conexión"; al restablecer la red, una cita de la API se mostró y quedó en caché. | Aprobado |
| O-07 | Reconexión | Desactivar Offline | Insignia vuelve a "En línea" y aviso "Conexión restablecida" | Al restablecer la conexión, el estado cambió a "En línea" y apareció el aviso "Conexión restablecida". | Aprobado |
| O-08 | Caché de solicitudes GET | Con red, solicitar un recurso del mismo origen y el consejo; revisar Cache Storage y probarlos sin conexión | Se guardan las respuestas GET exitosas del mismo origen y el consejo público; respuestas fallidas, privadas o `no-store` no se almacenan | En v10, una solicitud GET adicional a `styles.css?runtime-cache-test=1` y la respuesta pública del consejo aparecieron en Cache Storage. Al simular offline, CSS y API cacheados respondieron HTTP 200. | Aprobado |

## 3. Pruebas de rendimiento y calidad (Lighthouse)

DevTools → Lighthouse → Navigation, Mobile (y luego Desktop), categorías: Performance, Accessibility, Best practices, SEO. Usar ventana de incógnito.

| ID | Indicador | Procedimiento | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|
| L-01 | Performance | Ejecutar auditoría | ≥ 90 | Lighthouse 13.6.0, producción v11: Mobile 90/100; Desktop 96/100 en repetición. Se está verificando una mejora adicional de estabilidad visual en v12. | Repetir con v12 |
| L-02 | Accessibility | Ejecutar auditoría | ≥ 90 | Lighthouse 13.6.0, producción v11: Mobile 100/100; Desktop 100/100. | Aprobado en producción |
| L-03 | Best practices | Ejecutar auditoría | ≥ 90; verificar también HTTPS en producción | Lighthouse 13.6.0, producción v11: Mobile 100/100; Desktop 100/100. La URL pública responde por HTTPS. | Aprobado en producción |
| L-04 | SEO | Ejecutar auditoría | ≥ 90 | Lighthouse 13.6.0, producción v11: Mobile 100/100; Desktop 100/100. | Aprobado en producción |
| L-05 | Instalable | Application → Manifest → "Installability" | Sin errores | | |

### Oportunidades de mejora (mínimo 3)

Las mediciones anteriores del 07/11/2026 se conservan como historial. El 11/11/2026 se ejecutó Lighthouse 13.6.0 contra la URL pública; los reportes v11 identificaron CLS variable y se corrigió la carga de CSS para verificar una medición final en v12.

| # | Hallazgo | Corrección aplicada | Antes | Después |
|---|---|---|---|---|
| 1 | `app.js` aparecía como recurso que bloqueaba el renderizado inicial. | Se difirió la carga del JavaScript de producción (`app.min.js`) con `defer`; el Service Worker sigue precargando el archivo para uso offline. | Lighthouse listó JS y CSS como recursos de renderizado bloqueante. | JS diferido; la CSS restante fue cambiada a precarga asíncrona con fallback `<noscript>`. |
| 2 | `app.js` y `styles.css` tenían vida útil de caché HTTP de 0 segundos. | Se configuró caché de una semana para JavaScript y CSS en el servidor y en `public/_headers`; el Service Worker usa `cache: 'reload'` durante la instalación para evitar precargar copias HTTP obsoletas. | 0 segundos de vida útil reportada. | 604800 segundos (una semana); el insight de Lighthouse aún recomienda una vida útil mayor. |
| 3 | JavaScript sin minificar: Lighthouse estimó 4 KiB de ahorro. | Se agregó un build reproducible con Terser: `npm run build` genera `public/app.min.js` desde `public/app.js`. | En la medición inicial: 15701 bytes; alerta de JavaScript sin minificar (ahorro estimado: 4 KiB). | Bundle v8: fuente 16994 bytes y minificado 13829 bytes (3165 bytes menos). La alerta desapareció en la auditoría anterior a v8; falta confirmarlo en la auditoría actual. |
| 4 | CLS inestable (0.332 Mobile y 0.481 Desktop en una auditoría de producción v11). | Se cambió la CSS asíncrona por una hoja de estilos normal para que la pantalla tenga su diseño antes del primer renderizado. | Lighthouse reportó cambios de diseño entre ejecuciones. | Pendiente de repetir Lighthouse sobre v12. |

Los reportes HTML de producción están en `evidencias/lighthouse-production-mobile.report.html` y `evidencias/lighthouse-production-desktop.report.html`. La captura del estado publicado en Vercel y la página PWA están en `evidencias/publicacion-vercel.png` y `evidencias/pwa-publicada.png`. La captura de los datos antes de la actualización está en `evidencias/datos-antes-actualizacion.png`.

## 4. Pruebas de compatibilidad

**Entorno disponible:** navegador integrado Chromium 150.0.7871.250 (Electron 43.7.7), Microsoft Edge 157.0.4341.42 en perfil aislado y vista móvil emulada (375×667). No se dispuso de un dispositivo físico. El 11/11/2026 se volvió a verificar con automatización el flujo de validación, alta, búsqueda, filtro, edición, eliminación y navegación en localhost; los datos de prueba se retiraron al terminar.

| ID | Navegador / dispositivo | Versión | Pantallas OK (Inicio / Actividades / Ajustes) | CRUD | Offline | Instalable | Estado |
|---|---|---|---|---|---|---|---|
| C-01 | Microsoft Edge escritorio | 157.0.4341.42 | Inicio, Actividades y Ajustes cargaron; script de producción cargado. | Registro, búsqueda, edición y eliminación aprobados. | No repetido. | No evaluado en esta prueba. | Aprobado |
| C-02 | Chromium móvil emulado (375×667) | 150.0.7871.250 | Las tres pantallas se mostraron; campos y barra de navegación caben en el ancho disponible. | Registro, búsqueda, edición y eliminación aprobados. | Ver apartado 2. | No evaluado en esta prueba. | Aprobado (emulación) |

Para una comprobación completa de compatibilidad entre navegadores, repetir estas pruebas en un segundo navegador independiente y/o un dispositivo físico.

## 5. Publicación, instalación y actualización

El servicio elegido es Vercel. El repositorio `https://github.com/alexblake25/actividad14` está conectado a `main`; Vercel muestra producción **Ready** en `https://actividad14-wvpb.vercel.app`. En local ya se comprobó una actualización anterior de 1.0.0 a 1.1.0. Para esta entrega se publica también la versión 1.2.0 / Service Worker v11 y se registra el resultado de conservación de datos en U-01 a U-03.

| ID | Funcionalidad | Procedimiento | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|
| P-01 | HTTPS | Abrir la URL pública | Candado en la barra; sin avisos de contenido mixto | `https://actividad14-wvpb.vercel.app` respondió HTTP 200; página, manifest y Service Worker cargaron sobre HTTPS. | Aprobado |
| P-02 | Funciones en producción | Repetir F-03, F-06, F-08, O-03 en la URL pública | Mismos resultados que en local | Se comprobó alta, edición, eliminación y persistencia de datos en la URL pública. | Aprobado |
| I-01 | Criterios de instalación | Ícono de instalar en la barra de direcciones o Ajustes → **Instalar aplicación** | El navegador ofrece instalar | | |
| I-02 | Nombre e ícono | Instalar la app | Se ve "Actividades" con el ícono azul de palomita | | |
| I-03 | App instalada | Abrir desde el escritorio / pantalla de inicio | Abre en ventana propia (standalone) y las pantallas funcionan | | |
| U-01 | Nueva versión | Cambiar texto, versión de app y versión del SW; publicar | Aparece el banner de actualización | En producción, el navegador detectó una nueva versión de SW; se publicó la app 1.2.0/SW v11 y el banner se mostró. Luego se prepara 1.2.1/SW v12 por la corrección CLS. | Aprobado en producción |
| U-02 | Aplicar actualización | Pulsar **Actualizar** | La app recarga con el nuevo texto y versión en Ajustes | El botón activó el Service Worker nuevo; Inicio mostró el nuevo texto y Ajustes indicó 1.2.0. | Aprobado en producción |
| U-03 | Datos conservados | Revisar la lista de actividades después de actualizar | Las actividades siguen intactas | "Dato a conservar en actualización" permaneció visible después de activar SW v11. Se validará también tras v12. | Aprobado en producción |
| U-04 | Caché antigua | Application → Cache Storage | Solo existe la caché de la versión activa | Al actualizar a v10, se eliminaron las cachés v8 y v9; quedó solo `actividades-v10` y los datos de actividades siguieron presentes. | Aprobado |
