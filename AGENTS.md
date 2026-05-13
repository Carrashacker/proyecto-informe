# AGENTS.md

## Proyecto

- App local Node/Express; entrypoint backend `server.js`; frontend sin build en `index.html`, `styles.css`, `app.js` y `activity-tag-selector.js`.
- Abrir siempre por `http://localhost:3000`; no abrir `index.html` directo porque el frontend depende de `/api/*` y de inyecciones hechas por `server.js`.
- `server.js` sirve archivos estaticos desde la raiz y tambien renderiza `/` e `/index.html` inyectando usuarios y catalogo de flujos en el HTML.

## Comandos

- Instalar dependencias Node: `npm install`.
- Instalar dependencias Python para Excel: `python3 -m pip install -r requirements.txt`.
- Ejecutar app: `npm start`.
- Verificacion disponible: `npm run check` (`node --check server.js && node --check app.js && node --check activity-tag-selector.js`). No hay suite de tests configurada.
- Tras modificar scripts JS, reiniciar el proceso Node si esta corriendo para cargar cambios del backend; el frontend usa query strings/versiones para evitar cache.

## Datos Locales

- `informes.db` es SQLite local creado por `server.js` y esta ignorado por git; no borrarlo ni regenerarlo porque contiene informes guardados.
- Login inicial sembrado por `seedUsers()`: usuario `admin`, contrasena `admin123`.
- Fotos de mantenciones, emergentes y mejoras se guardan como data URLs en SQLite; `express.json` esta configurado con limite `80mb`.

## Modulos Y Flujo

- `Trabajos de mantencion` se separa por planta `selectiva` y `colectiva`; mantenciones fijas salen de `maintenance_templates` y los cambios semanales van a `maintenance_records` con `UNIQUE(week, template_id)`.
- Emergentes y mejoras son multiples por semana/planta y se guardan en `activity_records` con `activity_type` (`emergente` o `mejora`).
- Semanas de informe usan formato `W-XX`; el plan semanal usa ano operacional fijo `2026` y semanas calculadas desde miercoles en `operationalWeekWednesday()`.
- Permisos de edicion dependen del creador de la semana y del rol; pasar `username` en endpoints que calculan `canEdit` o eliminan/actualizan semana.
- `Ecuaciones` usa `flows_catalog.js` en backend, pero `app.js` tambien tiene un `EMBEDDED_FLOW_CATALOG`; si cambia el catalogo, mantener ambos sincronizados o ajustar la fuente unica.
- El selector jerarquico de TAG para actividades vive en `activity-tag-selector.js`, separado de `app.js`.

## Archivos Externos

- `plan.xlsx` es fuente del Plan semanal; `/api/weekly-plan` llama `python3 plan_parser.py plan.xlsx <week-start>` y requiere `openpyxl` instalado fuera de npm.
- Termografias exporta a Excel en `bomba16/Control de temperaturas bombas colectivas.xlsx` y `bomba16/Control de temperatura bombas selectiva.xlsx` usando `python3 thermography_export.py`; no mover esos archivos sin actualizar rutas.
- `flows_parser.py` solo ayuda a extraer `flujos.xlsx`; la app en ejecucion usa `flows_catalog.js` y el catalogo embebido del frontend.
- Los PDF de informes se generan con `pdfkit` y se escriben en la raiz como `Informe_<week>_<planta>_<timestamp>.pdf`.

## Convenciones De Trabajo

- Avanzar por partes solicitadas; no reescribir modulos completos ni generar cambios no pedidos.
- Antes de cambios grandes, crear respaldo de archivos importantes en `backups/`; durante sesiones largas, respaldar aproximadamente cada 2 horas.
- Si se cambia `app.js`, `styles.css` o `activity-tag-selector.js`, revisar los query strings en `index.html` y el badge `METSO_VERSION` en `app.js` para evitar confusion por cache.
