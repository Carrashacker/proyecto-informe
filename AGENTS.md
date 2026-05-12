# AGENTS.md

- Proyecto actual: app local Node/Express con frontend en `index.html`, `styles.css`, `app.js` y backend en `server.js`.
- Comandos: instalar con `npm install`; ejecutar con `npm start`; verificar sintaxis con `npm run check`.
- La app se abre en `http://localhost:3000`; no abrir `index.html` directo porque el frontend usa API.
- Base de datos SQLite local en `informes.db`, creada automaticamente por `server.js`; no borrar porque contiene informes guardados.
- Login inicial en `/api/login`: usuario `admin`, contrasena `admin123`.
- El modulo funcional es `Trabajos de mantencion`: se divide en `selectiva` y `colectiva`; cada planta tiene mantenciones precargadas, emergentes y mejoras.
- Mantencion de equipos viene de `maintenance_templates`; por semana solo se actualiza fecha, OT, observaciones y fotos en `maintenance_records`.
- Emergentes y mejoras son multiples por semana/planta y se guardan en `activity_records`; las fotos se almacenan como data URLs.
- `Termografias bombas`, `Seguimiento plan semanal` y `Aforos` son placeholders porque vendran desde otros documentos.
- No generar codigo ni cambios no solicitados; avanzar el proyecto por partes solicitadas.
-  siempre reinicia el nodo despues hacer todas las modificaciones a  script
- cada 2 hrs de trabajo realizar respaldo de archivos de importancia, para recuperación total de codigo