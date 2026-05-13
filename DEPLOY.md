# Deploy — Informes Metso

App local Node/Express + SQLite + frontend estatico. Estos archivos preparan el deploy a Render / Railway / VPS sin tocar la logica del backend.

## Archivos incluidos

- `render.yaml` — blueprint para Render con disco persistente de 1 GB montado en `/var/data`.
- `Procfile` — comando `web: npm start` para Railway / Heroku-like.
- `.node-version` — pin de Node 20.18.0 (LTS).

## Variable importante: DATA_DIR

El `render.yaml` define `DATA_DIR=/var/data`. Hoy `server.js` guarda `informes.db` junto al codigo (`path.join(__dirname, "informes.db")`), lo que en Render seria un disco efimero (se pierde en cada redeploy).

✅ **Cambio `DATA_DIR` ya aplicado** en `server.js:9-11`. La app respeta `DATA_DIR` si existe, o usa `__dirname` (local).

## Opcion A — VPS (recomendado sin tocar backend)

1. Provisiona Ubuntu 22.04+ con Node 20.
2. Instala `git`, clona el repo.
3. `npm install --omit=dev`.
4. Levanta con `pm2 start server.js --name informes-metso`.
5. Pon nginx delante con HTTPS (certbot).

Datos importantes:
- `informes.db` se crea automaticamente en el directorio del proyecto.
- Hacer respaldo periodico de `informes.db`, `informes.db-wal`, `informes.db-shm`.

## Opcion B — Render con disco persistente

1. Push del repo a GitHub.
2. En Render: New → Blueprint → seleccionar el repo (detecta `render.yaml`).
3. Render crea un disco persistente de 1 GB en `/var/data`.
4. **Aplicar antes el ajuste de `DATA_DIR` en `server.js`** (ver arriba), si no la BD vivira en disco efimero.

## Opcion C — Railway

1. `railway login && railway init`.
2. `railway up`.
3. Anadir volumen persistente desde el dashboard y montarlo en una ruta (ej. `/data`).
4. Definir `DATA_DIR=/data` en variables.
5. Aplicar el cambio minimo en `server.js`.

## Subir datos locales a produccion (opcional)

```bash
scp informes.db usuario@servidor:/ruta/del/proyecto/
```

En Render usa el panel "Shell" para subir/descargar archivos del disco.

## Comprobacion local previa

```bash
npm install
npm run check
npm start
# Abrir http://localhost:3000
```
