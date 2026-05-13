const express = require("express");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const Database = require("better-sqlite3");

const app = express();
const port = process.env.PORT || 3000;
const db = new Database(path.join(__dirname, "informes.db"));
const PLAN_OPERATIONAL_YEAR = 2026;

const thermographyPumps = {
  colectiva: [
    { tag: "3311-PP-006", ubicacion: "Relave Scavenger" },
    { tag: "3311-PP-007", ubicacion: "Colas Fila 1" },
    { tag: "3311-PP-008", ubicacion: "Colas Fila 2" },
    { tag: "3311-PP-009", ubicacion: "Colas Fila 3" },
    { tag: "3511-PP-012", ubicacion: "Relave 1ra Limpieza" },
    { tag: "3311-PP-013", ubicacion: "Concentrado Fila 1" },
    { tag: "3311-PP-014", ubicacion: "Concentrado Fila 2" },
    { tag: "3311-PP-015", ubicacion: "Concentrado Fila 3" },
    { tag: "3511-PP-018", ubicacion: "Concentrado Scavenger" },
    { tag: "3511-PP-019", ubicacion: "Concentrado 1ra Limpieza" },
    { tag: "3511-PP-023", ubicacion: "Rechazo Courier Remolienda" },
  ],
  selectiva: [
    { tag: "3811-PP-620", ubicacion: "Concentrado primario Fila 2" },
    { tag: "3811-PP-621", ubicacion: "Concentrado primario Fila 1" },
    { tag: "3811-PP-622", ubicacion: "Cola primaria fila 2" },
    { tag: "3811-PP-623", ubicacion: "Cola primaria fila 1" },
    { tag: "3811-PP-624", ubicacion: "Concentrado pre primario" },
    { tag: "3811-PP-625", ubicacion: "Concentrado colectivo" },
    { tag: "3811-PP-626", ubicacion: "Concentrado primera limpieza" },
    { tag: "3811-PP-627", ubicacion: "Concentrado segunda limpieza" },
    { tag: "3811-PP-628", ubicacion: "Concentrado tercera limpieza" },
    { tag: "3811-PP-637", ubicacion: "Rechazo BX632" },
    { tag: "3811-PP-638", ubicacion: "Rechazo BX633" },
    { tag: "3811-PP-641", ubicacion: "Rechazo BX634" },
  ],
};

const templates = [
  {
    plant: "selectiva",
    equipment: "Multiplexores analizador de leyes",
    tag: "3811-ZM-601 / 3811-ZM-602",
    defaultOt: "3565579",
    description:
      "Mantencion a cajon estabilizador, valvulas de lavado, cajon de rechazos, panel VBS, sensores de nivel, pistones de muestreo, rejillas, aspersores y filtros de agua/aire.",
  },
  {
    plant: "selectiva",
    equipment: "Tableros VBS",
    tag: "3811-SA-006 / 007 / 008 / 009 / 012 / 023 / 028 / 031",
    defaultOt: "3565585",
    description: "Mantencion de conjuntos VBS asociados a cortadores de muestra de planta selectiva.",
  },
  {
    plant: "selectiva",
    equipment: "Valvulas VSA y bombas de recirculacion",
    tag: "3811-SA-031 / 006 / 007 / 008 / 009 / 023 / 028 / 012",
    defaultOt: "3565585",
    description: "Mantencion de conjuntos VSA y bombas de recirculacion asociadas a los flujos del Courier.",
  },
  {
    plant: "colectiva",
    equipment: "Analizadores Courier",
    tag: "3221-AZ-012 / 3311-AZ-031 / 3311-AZ-012 / 3511-AZ-002",
    defaultOt: "3565569 / 3565571 / 3565575 / 3565576",
    description:
      "Mantencion a multiplexores: cajon estabilizador, valvulas de lavado, cajon de rechazos, panel VBS, sensores, pistones, rejillas, aspersores, filtros y valvulas pinch.",
  },
  {
    plant: "colectiva",
    equipment: "PSI-500 Molienda",
    tag: "3221-AZ-011",
    defaultOt: "3565566",
    description: "Mantencion preventiva, limpieza de ventana, inspeccion diaria, limpieza de unidad de dilucion y rejilla.",
  },
  {
    plant: "colectiva",
    equipment: "PSI-500 Remolienda",
    tag: "3511-AZ-004",
    defaultOt: "3534997",
    description: "Mantencion preventiva, limpieza de ventana, inspeccion diaria, limpieza de unidad de dilucion y rejilla.",
  },
  {
    plant: "colectiva",
    equipment: "Cortadores primarios Linea 1, 2 y 3",
    tag: "3221-SA-011 / 3221-SA-021 / 3221-SA-031",
    defaultOt: "3565566",
    description: "Inspeccion de cortadores metalurgicos de alimentacion.",
  },
  {
    plant: "colectiva",
    equipment: "Cortador concentrado Bulk",
    tag: "3611-SA-002",
    defaultOt: "3565568",
    description: "Mantencion a cortador metalurgico de celdas y concentrado Bulk.",
  },
  {
    plant: "colectiva",
    equipment: "Cajas control VBS",
    tag: "3511-SA-012 / 3311-SA-011 / 3311-SA-021 / 3311-SA-031 / 3511-SA-013 / 3511-SA-011 / 3511-SA-014 / 3311-SA-012 / 3311-SA-022 / 3311-SA-032 / 3511-SA-002 / 3511-SA-004 / 3511-SA-006 / 3611-SA-002 / 3511-SA-008",
    defaultOt: "3565583",
    description: "Mantencion de cajas control VBS y limpieza de bombas de recirculacion.",
  },
  {
    plant: "colectiva",
    equipment: "Conjunto VSA",
    tag: "Cortadores de planta colectiva",
    defaultOt: "3565583",
    description: "Mantencion de conjuntos VSA y limpieza de bomba de recirculacion.",
  },
  {
    plant: "colectiva",
    equipment: "Cortador relave final",
    tag: "5511-SA-001",
    defaultOt: "3565582",
    description: "Mantencion a cortador metalurgico de muestra, limpieza de cuchillos, VBS y SCU.",
  },
];

db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS maintenance_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plant TEXT NOT NULL,
    equipment TEXT NOT NULL,
    tag TEXT NOT NULL,
    default_ot TEXT,
    description TEXT NOT NULL,
    sort_order INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS maintenance_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    week TEXT NOT NULL,
    template_id INTEGER NOT NULL,
    date TEXT,
    work_order TEXT,
    notes TEXT,
    photos TEXT NOT NULL DEFAULT '[]',
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(week, template_id),
    FOREIGN KEY(template_id) REFERENCES maintenance_templates(id)
  );

  CREATE TABLE IF NOT EXISTS activity_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    week TEXT NOT NULL,
    plant TEXT NOT NULL,
    activity_type TEXT NOT NULL,
    date TEXT NOT NULL,
    equipment TEXT NOT NULL,
    tag TEXT,
    work_order TEXT,
    work_order_sgscm TEXT,
    description TEXT NOT NULL,
    photos TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS thermography_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    planta TEXT NOT NULL,
    tag TEXT NOT NULL,
    ubicacion TEXT NOT NULL,
    fecha TEXT NOT NULL,
    v1 TEXT,
    v2 TEXT,
    v3 TEXT,
    v4 TEXT,
    observacion TEXT,
    UNIQUE(planta, tag, fecha)
  );

  CREATE INDEX IF NOT EXISTS idx_thermography_fecha ON thermography_records (fecha);

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL,
    password TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS report_weeks (
    week TEXT PRIMARY KEY,
    created_by TEXT NOT NULL,
    responsible TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS plan_status_records (
    week TEXT NOT NULL,
    row_key TEXT NOT NULL,
    status TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (week, row_key)
  );

  CREATE TABLE IF NOT EXISTS aforo_records (
    week TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS equation_offset_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    week TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    plant TEXT NOT NULL,
    tag_key TEXT NOT NULL,
    tag TEXT NOT NULL,
    equipment TEXT NOT NULL,
    flow TEXT NOT NULL,
    is_psi INTEGER NOT NULL DEFAULT 0,
    elements TEXT NOT NULL DEFAULT '[]',
    offset TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);
ensureMaintenanceCompletedColumn();
ensureActivityCompletedColumn();
ensureActivitySgscmColumn();
importThermographyHistory();
seedUsers();
seedTemplates();

app.use(express.json({ limit: "80mb" }));
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
  }
  if (req.path === "/" || /\.(html|js|css)$/i.test(req.path)) {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
  }
  next();
});

function escapeHtml(text) {
  return String(text == null ? "" : text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderIndexWithUsers(req, res) {
  let html;
  try {
    html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
  } catch {
    return res.status(500).send("No fue posible cargar la pagina.");
  }
  const userRows = db.prepare("SELECT username, role FROM users ORDER BY username ASC").all().map((user) => ({ ...user, cargo: displayCargo(user.role) }));
  const options = ['<option value="">-- Seleccione usuario --</option>']
    .concat(userRows.map((u) => `<option value="${escapeHtml(u.username)}">${escapeHtml(u.username)}</option>`))
    .join("");
  html = html.replace(
    /<select id="username"[^>]*>[\s\S]*?<\/select>/,
    `<select id="username" required>${options}</select>`,
  );
  const tagOptions = ['<option value="">-- Seleccione equipo --</option>']
    .concat(flowsCatalog.tags.map((t) => `<option value="${escapeHtml(t.key)}">${escapeHtml(t.display + (t.equipment ? " - " + t.equipment : ""))}</option>`))
    .join("");
  html = html.replace(
    /<select name="tagKey"[^>]*>[\s\S]*?<\/select>/,
    `<select name="tagKey" required onchange="window.metsoTagChange&&window.metsoTagChange(this.value)">${tagOptions}</select>`,
  );
  const initial = `<script>window.__INITIAL_USERS__=${JSON.stringify(userRows)};window.__INITIAL_FLOW_CATALOG__=${JSON.stringify(flowsCatalog)};</script>`;
  html = html.replace("</head>", `${initial}</head>`);
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
}

app.get("/", renderIndexWithUsers);
app.get("/index.html", renderIndexWithUsers);

const publicStatic = express.static(__dirname, { dotfiles: "ignore" });
app.use((req, res, next) => {
  const requestPath = req.path;
  if (requestPath.startsWith("/api/")) return next();
  const allowedStatic =
    requestPath === "/styles.css" ||
    requestPath === "/app.js" ||
    requestPath === "/activity-tag-selector.js" ||
    requestPath === "/logo.png" ||
    /^\/Informe_[^/]+\.pdf$/i.test(requestPath) ||
    /^\/(?:menu\/)?[^/]+\.(?:png|jpe?g|gif|webp|svg|ico)$/i.test(requestPath);
  if (!allowedStatic) {
    if (path.extname(requestPath)) return res.status(404).send("Not found");
    return next();
  }
  return publicStatic(req, res, next);
});

app.get("/api/users", (req, res) => {
  const users = db.prepare("SELECT username, full_name AS fullName, role FROM users ORDER BY full_name ASC").all()
    .map((user) => ({ ...user, cargo: displayCargo(user.role) }));
  res.json(users);
});

function displayCargo(value) {
  const cargo = clean(value).toLowerCase();
  if (cargo === "supervisor" || cargo === "administrador") return "Supervisor";
  if (cargo === "lider" || cargo === "líder") return "Lider";
  return "Operador mantenedor";
}

function normalizeCargo(value) {
  const cargo = clean(value);
  const allowed = ["Supervisor", "Lider", "Operador mantenedor"];
  return allowed.includes(cargo) ? cargo : "Operador mantenedor";
}

app.post("/api/users", (req, res) => {
  const username = clean(req.body.username);
  const password = clean(req.body.password);
  const fullName = clean(req.body.fullName) || username;
  const role = normalizeCargo(req.body.cargo || req.body.role);
  if (!username || !password) return res.status(400).json({ error: "Usuario y contrasena son obligatorios." });
  try {
    db.prepare("INSERT INTO users (username, full_name, role, password) VALUES (?, ?, ?, ?)").run(username, fullName, role, password);
    res.status(201).json({ username, fullName, role, cargo: role });
  } catch {
    res.status(409).json({ error: "El usuario ya existe." });
  }
});

app.put("/api/users/:username", (req, res) => {
  const currentUsername = clean(req.params.username);
  const username = clean(req.body.username);
  const password = clean(req.body.password);
  const fullName = clean(req.body.fullName) || username;
  const role = normalizeCargo(req.body.cargo || req.body.role);
  if (!currentUsername || !username || !password) return res.status(400).json({ error: "Usuario y contrasena son obligatorios." });
  try {
    const result = db
      .prepare("UPDATE users SET username = ?, full_name = ?, role = ?, password = ? WHERE username = ?")
      .run(username, fullName, role, password, currentUsername);
    if (result.changes === 0) return res.status(404).json({ error: "Usuario no encontrado." });
    db.prepare("UPDATE report_weeks SET created_by = ? WHERE created_by = ?").run(username, currentUsername);
    res.json({ username, fullName, role, cargo: role });
  } catch {
    res.status(409).json({ error: "El usuario ya existe." });
  }
});

app.delete("/api/users/:username", (req, res) => {
  const username = clean(req.params.username);
  if (!username) return res.status(400).json({ error: "Usuario obligatorio." });
  const total = db.prepare("SELECT COUNT(*) AS count FROM users").get().count;
  if (total <= 1) return res.status(400).json({ error: "No se puede eliminar el unico usuario disponible." });
  const result = db.prepare("DELETE FROM users WHERE username = ?").run(username);
  if (result.changes === 0) return res.status(404).json({ error: "Usuario no encontrado." });
  res.json({ success: true });
});

app.post("/api/login", (req, res) => {
  const username = clean(req.body.username);
  const password = clean(req.body.password);
  const user = db.prepare("SELECT username, full_name AS fullName, role, password FROM users WHERE username = ?").get(username);
  if (user && user.password === password) {
    return res.json({ ok: true, user: { username: user.username, fullName: user.fullName, role: user.role, cargo: displayCargo(user.role) }, week: currentWeek() });
  }
  if (user) return res.status(401).json({ error: "Contrasena erronea." });
  return res.status(401).json({ error: "Usuario no encontrado." });
});

app.get("/api/weeks", (req, res) => {
  syncReportWeeks();
  const username = clean(req.query.username);
  const rows = db.prepare("SELECT week, created_by AS createdBy, responsible, created_at AS createdAt FROM report_weeks ORDER BY created_at DESC").all();
  rows.forEach((row) => {
    row.canDelete = canDeleteWeek(row.week, username);
  });
  res.json(rows);
});

app.get("/api/report", (req, res) => {
  const week = clean(req.query.week || currentWeek());
  const username = clean(req.query.username);
  ensureReportWeek(week, username || "admin", false);
  res.json(buildWeeklyReport(week, username));
});

app.put("/api/report/meta", (req, res) => {
  const week = clean(req.body.week);
  const username = clean(req.body.username);
  if (!week) return res.status(400).json({ error: "Semana obligatoria." });
  const meta = getReportWeek(week);
  if (meta && !canEditWeek(week, username)) return res.status(403).json({ error: "Solo el creador o administrador puede modificar esta semana." });
  ensureReportWeek(week, username || "admin", false);
  res.json(buildWeeklyReport(week, username));
});

app.delete("/api/report/week", (req, res) => {
  const week = clean(req.query.week);
  const username = clean(req.query.username);
  const meta = getReportWeek(week);
  if (!meta) return res.status(404).json({ error: "Semana no encontrada." });
  if (!canDeleteWeek(week, username)) return res.status(403).json({ error: "Solo el creador o administrador puede eliminar esta semana." });
  const remove = db.transaction(() => {
    db.prepare("DELETE FROM maintenance_records WHERE week = ?").run(week);
    db.prepare("DELETE FROM activity_records WHERE week = ?").run(week);
    db.prepare("DELETE FROM plan_status_records WHERE week = ?").run(week);
    db.prepare("DELETE FROM aforo_records WHERE week = ?").run(week);
    db.prepare("DELETE FROM equation_offset_records WHERE week = ?").run(week);
    db.prepare("DELETE FROM report_weeks WHERE week = ?").run(week);
  });
  remove();
  res.json({ success: true });
});

app.get("/api/weekly-plan", (req, res) => {
  const week = clean(req.query.week || currentWeek());
  const username = clean(req.query.username);
  ensureReportWeek(week, username || "admin", false);
  try {
    res.json(buildWeeklyPlan(week, username));
  } catch (error) {
    res.status(500).json({ error: error.message || "No fue posible cargar plan semanal." });
  }
});

app.put("/api/weekly-plan/status", (req, res) => {
  const week = clean(req.body.week);
  const username = clean(req.body.username);
  const rowKey = clean(req.body.rowKey);
  const status = normalizePlanStatus(req.body.status);
  if (!week || !rowKey || !status) return res.status(400).json({ error: "Semana, fila y status son obligatorios." });
  if (!canEditWeek(week, username)) return res.status(403).json({ error: "Solo el creador puede modificar el plan semanal." });
  db.prepare(
    `INSERT INTO plan_status_records (week, row_key, status, updated_at)
     VALUES (?, ?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(week, row_key) DO UPDATE SET status = excluded.status, updated_at = CURRENT_TIMESTAMP`,
  ).run(week, rowKey, status);
  res.json({ success: true, rowKey, status });
});

app.get("/api/aforos", (req, res) => {
  const week = clean(req.query.week || currentWeek());
  const username = clean(req.query.username);
  ensureReportWeek(week, username || "admin", false);
  const record = db.prepare("SELECT data FROM aforo_records WHERE week = ?").get(week);
  res.json({ week, canEdit: !username || canEditWeek(week, username), data: safeObjectJson(record?.data) });
});

app.put("/api/aforos", (req, res) => {
  const week = clean(req.body.week);
  const username = clean(req.body.username);
  if (!week) return res.status(400).json({ error: "Semana obligatoria." });
  if (!canEditWeek(week, username)) return res.status(403).json({ error: "Solo el creador puede modificar aforos." });
  db.prepare(
    `INSERT INTO aforo_records (week, data, updated_at)
     VALUES (?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(week) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP`,
  ).run(week, JSON.stringify(req.body.data || {}));
  res.json({ success: true });
});

app.get("/api/equations", (req, res) => {
  const week = clean(req.query.week);
  const username = clean(req.query.username);
  if (!week || !username) return res.status(400).json({ error: "Semana y usuario son obligatorios." });
  const rows = db.prepare("SELECT id, week, date, time, plant, tag_key AS tagKey, tag, equipment, flow, is_psi AS isPsi, elements, offset FROM equation_offset_records WHERE week = ? ORDER BY date DESC, time DESC").all(week);
  rows.forEach((r) => { r.elements = r.elements ? JSON.parse(r.elements) : []; r.isPsi = r.isPsi === 1; });
  const canEdit = canEditWeek(week, username);
  res.json({ week, canEdit, records: rows });
});

const flowsCatalog = require("./flows_catalog.js");
app.get("/api/flow-catalog", (req, res) => {
  res.json({ catalog: flowsCatalog });
});

app.post("/api/equations", (req, res) => {
  const input = normalizeEquationInput(req.body);
  if (!input.week || !input.date || !input.time || !input.plant || !input.tagKey || !input.flow) return res.status(400).json({ error: "Complete TAG, flujo, fecha, hora y planta." });
  if (!canEditWeek(input.week, input.username)) return res.status(403).json({ error: "Solo el creador puede modificar ecuaciones y offsets." });
  const result = db.prepare(
    `INSERT INTO equation_offset_records (week, date, time, plant, tag_key, tag, equipment, flow, is_psi, elements, offset)
     VALUES (@week, @date, @time, @plant, @tagKey, @tag, @equipment, @flow, @isPsi, @elements, @offset)`,
  ).run(input);
  res.status(201).json({ success: true, id: result.lastInsertRowid });
});

app.put("/api/equations/:id", (req, res) => {
  const input = normalizeEquationInput({ ...req.body, id: req.params.id });
  if (!input.id || !input.week || !input.date || !input.time || !input.plant || !input.tagKey || !input.flow) return res.status(400).json({ error: "Complete TAG, flujo, fecha, hora y planta." });
  if (!canEditWeek(input.week, input.username)) return res.status(403).json({ error: "Solo el creador puede modificar ecuaciones y offsets." });
  const result = db.prepare(
    `UPDATE equation_offset_records SET date = @date, time = @time, plant = @plant, tag_key = @tagKey, tag = @tag,
      equipment = @equipment, flow = @flow, is_psi = @isPsi, elements = @elements, offset = @offset
     WHERE id = @id AND week = @week`,
  ).run(input);
  if (result.changes === 0) return res.status(404).json({ error: "Registro no encontrado." });
  res.json({ success: true });
});

app.delete("/api/equations/:id", (req, res) => {
  const id = Number(req.params.id);
  const week = clean(req.query.week);
  const username = clean(req.query.username);
  if (!id || !week) return res.status(400).json({ error: "Registro y semana obligatorios." });
  if (!canEditWeek(week, username)) return res.status(403).json({ error: "Solo el creador puede eliminar ecuaciones y offsets." });
  const result = db.prepare("DELETE FROM equation_offset_records WHERE id = ? AND week = ?").run(id, week);
  if (result.changes === 0) return res.status(404).json({ error: "Registro no encontrado." });
  res.json({ success: true });
});

app.put("/api/maintenance/:templateId", (req, res) => {
  const templateId = Number(req.params.templateId);
  const week = clean(req.body.week);
  const username = clean(req.body.username);
  if (!week || !templateId) return res.status(400).json({ error: "Semana y plantilla son obligatorias." });
  if (!canEditWeek(week, username)) return res.status(403).json({ error: "Solo puede visualizar esta semana." });

  const payload = {
    week,
    templateId,
    date: clean(req.body.date),
    workOrder: clean(req.body.workOrder),
    notes: "",
    completed: req.body.completed ? 1 : 0,
    photos: JSON.stringify(Array.isArray(req.body.photos) ? req.body.photos : []),
  };

  db.prepare(
    `INSERT INTO maintenance_records (week, template_id, date, work_order, notes, photos, completed, updated_at)
     VALUES (@week, @templateId, @date, @workOrder, @notes, @photos, @completed, CURRENT_TIMESTAMP)
     ON CONFLICT(week, template_id) DO UPDATE SET
       date = excluded.date,
       work_order = excluded.work_order,
       notes = excluded.notes,
       photos = excluded.photos,
       completed = excluded.completed,
       updated_at = CURRENT_TIMESTAMP`,
  ).run(payload);

  res.json(buildWeeklyReport(week, username));
});

app.post("/api/activities", (req, res) => {
  const activity = normalizeActivity(req.body || {});
  const username = clean(req.body.username);
  const missing = ["week", "plant", "activityType", "date", "equipment", "description"].filter((field) => !activity[field]);
  if (missing.length > 0) return res.status(400).json({ error: `Faltan campos: ${missing.join(", ")}` });
  if (!["emergente", "mejora"].includes(activity.activityType)) {
    return res.status(400).json({ error: "Tipo de actividad no valido." });
  }
  if (!canEditWeek(activity.week, username)) return res.status(403).json({ error: "Solo puede visualizar esta semana." });

  db.prepare(
    `INSERT INTO activity_records (week, plant, activity_type, date, equipment, tag, work_order, work_order_sgscm, description, photos, completed)
     VALUES (@week, @plant, @activityType, @date, @equipment, @tag, @workOrder, @workOrderSgscm, @description, @photos, @completed)`,
  ).run({ ...activity, photos: JSON.stringify(activity.photos), completed: req.body.completed ? 1 : 0 });

  res.status(201).json(buildWeeklyReport(activity.week, username));
});

app.put("/api/activities/:activityId", (req, res) => {
  const activityId = Number(req.params.activityId);
  const activity = normalizeActivity(req.body || {});
  const username = clean(req.body.username);
  const missing = ["week", "plant", "activityType", "date", "equipment", "description"].filter((field) => !activity[field]);
  if (!activityId) return res.status(400).json({ error: "Actividad no valida." });
  if (missing.length > 0) return res.status(400).json({ error: `Faltan campos: ${missing.join(", ")}` });
  if (!["emergente", "mejora"].includes(activity.activityType)) {
    return res.status(400).json({ error: "Tipo de actividad no valido." });
  }
  if (!canEditWeek(activity.week, username)) return res.status(403).json({ error: "Solo puede visualizar esta semana." });

  const result = db
    .prepare(
      `UPDATE activity_records SET
        date = @date,
        equipment = @equipment,
        tag = @tag,
        work_order = @workOrder,
        work_order_sgscm = @workOrderSgscm,
        description = @description,
        photos = @photos,
        completed = @completed
       WHERE id = @id AND week = @week AND plant = @plant AND activity_type = @activityType`,
    )
    .run({ ...activity, id: activityId, photos: JSON.stringify(activity.photos), completed: req.body.completed ? 1 : 0 });

  if (result.changes === 0) return res.status(404).json({ error: "Actividad no encontrada." });
  res.json(buildWeeklyReport(activity.week, username));
});

app.delete("/api/activities/:activityId", (req, res) => {
  const activityId = Number(req.params.activityId);
  const week = clean(req.query.week);
  const username = clean(req.query.username);
  if (!activityId || !week) return res.status(400).json({ error: "Actividad y semana son obligatorias." });
  if (!canEditWeek(week, username)) return res.status(403).json({ error: "Solo puede visualizar esta semana." });

  const result = db.prepare("DELETE FROM activity_records WHERE id = ? AND week = ?").run(activityId, week);
  if (result.changes === 0) return res.status(404).json({ error: "Actividad no encontrada." });
  res.json(buildWeeklyReport(week, username));
});

app.get("/api/thermography/dates", (req, res) => {
  const rows = db
    .prepare(
      `SELECT DISTINCT fecha FROM thermography_records
       ORDER BY substr(fecha, 7, 2) || '-' || substr(fecha, 4, 2) || '-' || substr(fecha, 1, 2) DESC`,
    )
    .all();
  res.json(rows.map((row) => row.fecha));
});

app.get("/api/thermography", (req, res) => {
  const fecha = clean(req.query.date);
  if (!isShortDate(fecha)) return res.status(400).json({ error: "Fecha invalida." });
  res.json(buildThermographyDate(fecha));
});

app.put("/api/thermography", (req, res) => {
  const fecha = clean(req.body.date);
  const planta = clean(req.body.plant);
  const records = Array.isArray(req.body.records) ? req.body.records : [];
  if (!isShortDate(fecha) || !thermographyPumps[planta]) return res.status(400).json({ error: "Fecha o planta invalida." });

  const errors = validateThermographyRows(planta, records);
  if (errors.length > 0) return res.status(400).json({ error: "Temperaturas invalidas.", items: errors });

  const insert = db.prepare(
    `INSERT INTO thermography_records (planta, tag, ubicacion, fecha, v1, v2, v3, v4, observacion)
     VALUES (@planta, @tag, @ubicacion, @fecha, @v1, @v2, @v3, @v4, @observacion)
     ON CONFLICT(planta, tag, fecha) DO UPDATE SET
       ubicacion = excluded.ubicacion,
       v1 = excluded.v1,
       v2 = excluded.v2,
       v3 = excluded.v3,
       v4 = excluded.v4,
       observacion = excluded.observacion`,
  );
  const save = db.transaction(() => {
    thermographyPumps[planta].forEach((pump, index) => {
      const input = records.find((record) => clean(record.tag) === pump.tag) || records[index] || {};
      const sinAcceso = Boolean(input.sinAcceso);
      insert.run({
        planta,
        tag: pump.tag,
        ubicacion: pump.ubicacion,
        fecha,
        v1: sinAcceso ? "" : clean(input.v1),
        v2: sinAcceso ? "" : clean(input.v2),
        v3: sinAcceso ? "" : clean(input.v3),
        v4: sinAcceso ? "" : clean(input.v4),
        observacion: sinAcceso ? "Sin acceso" : clean(input.observacion),
      });
    });
  });
  save();
  res.json({ success: true, report: buildThermographyDate(fecha) });
});

app.delete("/api/thermography/date", (req, res) => {
  const fecha = clean(req.query.date);
  if (!isShortDate(fecha)) return res.status(400).json({ error: "Fecha invalida." });
  const result = db.prepare("DELETE FROM thermography_records WHERE fecha = ?").run(fecha);
  res.json({ success: true, deleted: result.changes, date: fecha });
});

app.put("/api/thermography/date", (req, res) => {
  const currentDate = clean(req.body.currentDate);
  const newDate = clean(req.body.newDate);
  if (!isShortDate(currentDate) || !isShortDate(newDate)) return res.status(400).json({ error: "Formato de fecha invalido. Use dd/mm/yy." });
  const existing = db.prepare("SELECT COUNT(*) AS total FROM thermography_records WHERE fecha = ?").get(newDate).total;
  if (existing > 0) return res.status(400).json({ error: `Ya existen registros para la nueva fecha: ${newDate}.` });
  const current = db.prepare("SELECT COUNT(*) AS total FROM thermography_records WHERE fecha = ?").get(currentDate).total;
  if (current === 0) return res.status(404).json({ error: `No se encontraron registros para la fecha actual: ${currentDate}.` });
  db.prepare("UPDATE thermography_records SET fecha = ? WHERE fecha = ?").run(newDate, currentDate);
  res.json({ success: true, currentDate, newDate });
});

app.get("/api/thermography/stats", (req, res) => {
  const planta = clean(req.query.plant);
  const tag = clean(req.query.tag);
  if (!thermographyPumps[planta] || !thermographyPumps[planta].some((pump) => pump.tag === tag)) {
    return res.status(400).json({ error: "Bomba invalida." });
  }
  const rows = db
    .prepare(
      `SELECT fecha, v1, v2, v3, v4 FROM thermography_records
       WHERE planta = ? AND tag = ? AND (COALESCE(v1, '') <> '' OR COALESCE(v2, '') <> '' OR COALESCE(v3, '') <> '' OR COALESCE(v4, '') <> '')
       ORDER BY substr(fecha, 7, 2) || '-' || substr(fecha, 4, 2) || '-' || substr(fecha, 1, 2) ASC`,
    )
    .all(planta, tag);
  res.json(rows.map((row) => ({ fecha: row.fecha, v1: numberOrNull(row.v1), v2: numberOrNull(row.v2), v3: numberOrNull(row.v3), v4: numberOrNull(row.v4) })));
});

app.post("/api/thermography/export", (req, res) => {
  const fecha = clean(req.body.date);
  const planta = clean(req.body.plant);
  const records = Array.isArray(req.body.records) ? req.body.records : [];
  if (!isShortDate(fecha) || !thermographyPumps[planta]) return res.status(400).json({ error: "Fecha o planta invalida." });
  const errors = validateThermographyRows(planta, records);
  if (errors.length > 0) return res.status(400).json({ error: "Temperaturas invalidas.", items: errors });

  const payloadPath = path.join(__dirname, "thermography_export_payload.json");
  const payload = {
    plant: planta,
    date: fecha,
    records: thermographyPumps[planta].map((pump, index) => {
      const input = records.find((record) => clean(record.tag) === pump.tag) || records[index] || {};
      const sinAcceso = Boolean(input.sinAcceso);
      return {
        tag: pump.tag,
        ubicacion: pump.ubicacion,
        v1: sinAcceso ? "" : clean(input.v1),
        v2: sinAcceso ? "" : clean(input.v2),
        v3: sinAcceso ? "" : clean(input.v3),
        v4: sinAcceso ? "" : clean(input.v4),
        observacion: sinAcceso ? "Sin acceso" : clean(input.observacion),
      };
    }),
  };
  fs.writeFileSync(payloadPath, JSON.stringify(payload), "utf8");
  const result = spawnSync("python3", [path.join(__dirname, "thermography_export.py"), payloadPath], { cwd: __dirname, encoding: "utf8" });
  if (result.status !== 0) {
    return res.status(500).json({ error: result.stderr || result.stdout || "No fue posible exportar." });
  }
  try { fs.unlinkSync(payloadPath); } catch {}
  const data = JSON.parse(result.stdout || "{}");
  res.json({ success: true, file: data.file });
});

app.get("/api/report-preview", (req, res) => {
  const week = clean(req.query.week);
  const planta = clean(req.query.plant) || "colectiva";
  const type = clean(req.query.type) || "full";
  if (!week) return res.status(400).json({ error: "Semana requerida." });

  try {
    const weekNumber = weekNumberFromLabel(week);
    if (!weekNumber) return res.status(400).json({ error: "Semana invalida." });
    const startIso = operationalWeekWednesday(PLAN_OPERATIONAL_YEAR, weekNumber);
    const endIso = addIsoDays(startIso, 6);
    const reportData = buildWeeklyReport(week);
    const planData = buildWeeklyPlan(week);
    const plantData = reportData.plants[planta] || emptyPlant();
    const planRows = (planData.plants[planta] || []).filter((row) => isIsoDate(row.day));
    const scheduledRows = planRows.filter((row) => /mantenci[oó]n/i.test(row.description || ""));
    const planCauseSummary = summarizePlanCauses(planRows);
    const maintenanceDaySummary = summarizeRowsByDay(scheduledRows);
    const planOk = planRows.filter((row) => row.status === "Ok").length;
    const planProcess = planRows.filter((row) => row.status === "En proceso").length;
    const planCancelled = planRows.filter((row) => row.status === "Cancelada").length;
    const planPending = planRows.filter((row) => row.status === "Pendiente").length;
    const maintenance = plantData.maintenance || [];
    const emergencies = plantData.emergencies || [];
    const improvements = plantData.improvements || [];
    const equations = db.prepare("SELECT * FROM equation_offset_records WHERE week = ? AND plant = ? ORDER BY date DESC, time DESC").all(week, planta);
    const thermoRows = db.prepare("SELECT DISTINCT fecha FROM thermography_records WHERE planta = ?").all(planta);
    const thermoDates = thermoRows.map((row) => row.fecha).filter((fecha) => {
      const iso = shortDateToIso(fecha);
      return iso && iso >= startIso && iso <= endIso;
    });
    const aforoRow = db.prepare("SELECT data FROM aforo_records WHERE week = ?").get(week);
    const aforoData = safeObjectJson(aforoRow?.data);
    const aforoChart = buildAforoChart(aforoData);
    const aforoBlocks = aforoRow ? Object.keys(aforoData).filter((key) => key !== "meta").length : 0;
    const thermoChart = buildThermoChart(planta, startIso, endIso);
    const thermoPumps = buildThermoPumpRows(planta, startIso, endIso);
    const thermoPumpSeries = buildThermoPumpSeries(planta, startIso, endIso);
    const operationalCauseSummary = [
      { label: "Mantenciones programadas", total: scheduledRows.length },
      { label: "Emergentes", total: emergencies.length },
      { label: "Mejoras", total: improvements.length },
      { label: "Ecuaciones", total: equations.length },
      { label: "Termografias bombas", total: thermoPumps.length },
      { label: "Aforos", total: aforoChart.length }
    ];
    const photosTotal = maintenance.reduce((sum, item) => sum + (Array.isArray(item.photos) ? item.photos.length : 0), 0) +
      emergencies.reduce((sum, item) => sum + (Array.isArray(item.photos) ? item.photos.length : 0), 0) +
      improvements.reduce((sum, item) => sum + (Array.isArray(item.photos) ? item.photos.length : 0), 0);
    const maintenanceCompleted = maintenance.filter((item) => item.completed).length;
    const latest = [
      ...maintenance.filter((item) => item.completed).map((item) => ({ title: item.tag || item.equipment, meta: `Mantencion | ${item.date || "sin fecha"}` })),
      ...emergencies.map((item) => ({ title: item.description, meta: `Emergente | ${item.date || "sin fecha"}` })),
      ...improvements.map((item) => ({ title: item.description, meta: `Mejora | ${item.date || "sin fecha"}` })),
      ...equations.slice(0, 5).map((item) => ({ title: item.tag, meta: `Ecuacion | ${item.date || "sin fecha"} ${item.time || ""}` }))
    ].slice(0, 10);

    res.json({
      week,
      plant: planta,
      plantLabel: planta === "selectiva" ? "Planta Selectiva" : "Planta Colectiva",
      type,
      dateRange: `${formatIsoDate(startIso)} al ${formatIsoDate(endIso)}`,
      summary: {
        maintenanceTotal: maintenance.length,
        maintenanceCompleted,
        maintenanceOpen: Math.max(0, maintenance.length - maintenanceCompleted),
        planTotal: planRows.length,
        plannedMaintenanceTotal: scheduledRows.length,
        planOk,
        planProcess,
        planPending,
        planCancelled,
        planCompliance: planRows.length ? Math.round((planOk / planRows.length) * 100) : 0,
        emergencyTotal: emergencies.length,
        improvementTotal: improvements.length,
        equationsTotal: equations.length,
        thermoDatesCount: thermoDates.length,
        aforoBlocks,
        photosTotal
      },
      maintenanceDaySummary,
      planCauseSummary,
      operationalCauseSummary,
      plannedMaintenance: scheduledRows.slice(0, 30),
      latest,
      maintenance: maintenance.slice(0, 12).map(slimReportItem),
      emergencies: emergencies.slice(0, 8).map(slimReportItem),
      improvements: improvements.slice(0, 8).map(slimReportItem),
      equations: equations.slice(0, 8),
      thermoDates,
      thermoPumps,
      thermoPumpSeries,
      aforoChart,
      thermoChart
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/report-generate", (req, res) => {
  const week = clean(req.body.week);
  const planta = clean(req.body.plant) || "colectiva";
  const type = clean(req.body.type) || "full";
  if (!week) return res.status(400).json({ error: "Semana requerida." });

  try {
    const PDFDocument = require("pdfkit");
    const weekNum = weekNumberFromLabel(week);
    const weekStart = operationalWeekWednesday(PLAN_OPERATIONAL_YEAR, weekNum);
    const weekEnd = addIsoDays(weekStart, 6);
    const dateRange = formatIsoDate(weekStart) + " al " + formatIsoDate(weekEnd);
    const reportData = buildWeeklyReport(week);
    const planData = buildWeeklyPlan(week);
    const plantData = reportData.plants[planta] || emptyPlant();
    const scheduledRows = (planData.plants[planta] || []).filter((row) => isIsoDate(row.day) && /mantenci[oó]n/i.test(row.description || ""));

    const doc = new PDFDocument({ margin: 50, size: "A4", layout: "landscape" });
    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      const filename = "Informe_" + week + "_" + planta + "_" + Date.now() + ".pdf";
      const filepath = path.join(__dirname, filename);
      require("fs").writeFileSync(filepath, pdfData);
      res.json({ success: true, downloadUrl: "/" + filename, message: "Informe generado correctamente." });
    });

    doc.fontSize(16).font("Helvetica-Bold").fillColor("#1a3c5e").text("INFORME SEMANAL DE OPERACION", 50, 40);
    doc.fontSize(11).font("Helvetica").fillColor("#333");
    doc.text("Semana: " + week + "  |  Planta: " + (planta === "colectiva" ? "Colectiva" : "Selectiva") + "  |  Periodo: " + dateRange, 50, 62);
    doc.moveTo(50, 78).lineTo(doc.page.width - 50, 78).stroke("#1a3c5e");

    let y = 95;

    if (type === "full" || type === "maintenance") {
      const maintRows = scheduledRows;
      doc.fontSize(12).font("Helvetica-Bold").fillColor("#1a3c5e").text("MANTENCIONES PROGRAMADAS (PLAN SEMANAL)", 50, y);
      y += 16;
      if (maintRows.length === 0) {
        doc.fontSize(10).font("Helvetica").fillColor("#666").text("Sin registros de mantenciones.", 50, y);
        y += 20;
      } else {
        const cols = ["Fecha", "Equipo", "Turno", "Estado"];
        const colX = [50, 170, 300, 400];
        doc.fontSize(9).font("Helvetica-Bold").fillColor("#fff");
        doc.rect(50, y, doc.page.width - 100, 18).fill("#1a3c5e");
        cols.forEach((c, i) => doc.text(c, colX[i] + 4, y + 4, { width: i === cols.length - 1 ? 320 : 110 }));
        y += 18;
        doc.font("Helvetica").fillColor("#333");
        maintRows.forEach((r, idx) => {
          if (y > doc.page.height - 60) { doc.addPage(); y = 50; }
          if (idx % 2 === 0) doc.rect(50, y, doc.page.width - 100, 16).fill("#f0f6fb");
          doc.text(r.day || "", colX[0] + 4, y + 3);
          doc.text((r.equipment || "").substring(0, 18), colX[1] + 4, y + 3);
          doc.text(r.turn || "", colX[2] + 4, y + 3);
          doc.text(r.status || "", colX[3] + 4, y + 3, { width: 320 });
          y += 16;
        });
        y += 10;
      }
    }

    if (type === "full" || type === "activities") {
      const emerg = plantData.emergencies || [];
      const mej = plantData.improvements || [];
      if (y > doc.page.height - 100) { doc.addPage(); y = 50; }
      doc.fontSize(12).font("Helvetica-Bold").fillColor("#1a3c5e").text("ACTIVIDADES (EMERGENTES / MEJORAS)", 50, y);
      y += 16;
      if (emerg.length > 0) {
        doc.fontSize(10).font("Helvetica-Bold").fillColor("#c05000").text("Emergentes:", 50, y);
        y += 14;
        doc.font("Helvetica").fillColor("#333");
        emerg.forEach(e => {
          if (y > doc.page.height - 60) { doc.addPage(); y = 50; }
          doc.text("- " + (e.description || "") + "  [" + (e.date || "") + "]", 60, y);
          y += 14;
        });
        y += 4;
      }
      if (mej.length > 0) {
        doc.fontSize(10).font("Helvetica-Bold").fillColor("#2e7d32").text("Mejoras:", 50, y);
        y += 14;
        doc.font("Helvetica").fillColor("#333");
        mej.forEach(m => {
          if (y > doc.page.height - 60) { doc.addPage(); y = 50; }
          doc.text("- " + (m.description || "") + "  [" + (m.date || "") + "]", 60, y);
          y += 14;
        });
        y += 4;
      }
    }

    if (type === "full" || type === "thermo") {
      if (y > doc.page.height - 100) { doc.addPage(); y = 50; }
      const thermoDates = db.prepare("SELECT DISTINCT fecha FROM thermography_records WHERE planta = ?").all(planta).map(r => r.fecha).filter((fecha) => {
        const iso = shortDateToIso(fecha);
        return iso && iso >= weekStart && iso <= weekEnd;
      });
      doc.fontSize(12).font("Helvetica-Bold").fillColor("#1a3c5e").text("TERMOGRAFIAS DE BOMBAS", 50, y);
      y += 16;
      doc.fontSize(10).font("Helvetica").fillColor("#333").text("Fechas con registro: " + (thermoDates.length > 0 ? thermoDates.join(", ") : "Sin registros"), 50, y);
      y += 20;
    }

    if (type === "full" || type === "aforo") {
      const aforoRow = db.prepare("SELECT data FROM aforo_records WHERE week = ?").get(week);
      if (y > doc.page.height - 100) { doc.addPage(); y = 50; }
      doc.fontSize(12).font("Helvetica-Bold").fillColor("#1a3c5e").text("AFOROS", 50, y);
      y += 16;
      const aforoData = safeObjectJson(aforoRow?.data);
      doc.fontSize(10).font("Helvetica").fillColor("#333").text("Bloques configurados: " + (aforoRow ? Object.keys(aforoData).filter((key) => key !== "meta").length : 0), 50, y);
      y += 20;
    }

    if (type === "full") {
      const eqRows = db.prepare("SELECT * FROM equation_offset_records WHERE week = ? AND plant = ?").all(week, planta);
      if (y > doc.page.height - 100) { doc.addPage(); y = 50; }
      doc.fontSize(12).font("Helvetica-Bold").fillColor("#1a3c5e").text("ECUACIONES Y OFFSETS", 50, y);
      y += 16;
      doc.fontSize(10).font("Helvetica").fillColor("#333").text("Registros: " + eqRows.length, 50, y);
      y += 20;
    }

    doc.fontSize(8).fillColor("#999").text("Generado: " + new Date().toLocaleString("es-CL"), 50, doc.page.height - 30);
    doc.end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/thermography/download/:file", (req, res) => {
  const file = path.basename(req.params.file);
  const allowed = ["Control de temperaturas bombas colectivas.xlsx", "Control de temperatura bombas selectiva.xlsx"];
  if (!allowed.includes(file)) return res.status(400).json({ error: "Archivo invalido." });
  res.download(path.join(__dirname, "bomba16", file));
});

app.get("*", renderIndexWithUsers);

app.listen(port, () => {
  console.log(`Sistema de informes disponible en http://localhost:${port}`);
});

function seedTemplates() {
  const count = db.prepare("SELECT COUNT(*) AS total FROM maintenance_templates").get().total;
  if (count > 0) return;
  const insert = db.prepare(
    `INSERT INTO maintenance_templates (plant, equipment, tag, default_ot, description, sort_order)
     VALUES (@plant, @equipment, @tag, @defaultOt, @description, @sortOrder)`,
  );
  const transaction = db.transaction(() => {
    templates.forEach((template, index) => insert.run({ ...template, sortOrder: index + 1 }));
  });
  transaction();
}

function ensureMaintenanceCompletedColumn() {
  const columns = db.prepare("PRAGMA table_info(maintenance_records)").all();
  if (columns.some((column) => column.name === "completed")) return;
  db.exec("ALTER TABLE maintenance_records ADD COLUMN completed INTEGER NOT NULL DEFAULT 0");
  db.exec("UPDATE maintenance_records SET completed = 1 WHERE date <> '' OR photos <> '[]'");
}

function ensureActivityCompletedColumn() {
  const columns = db.prepare("PRAGMA table_info(activity_records)").all();
  if (columns.some((column) => column.name === "completed")) return;
  db.exec("ALTER TABLE activity_records ADD COLUMN completed INTEGER NOT NULL DEFAULT 0");
}

function ensureActivitySgscmColumn() {
  const columns = db.prepare("PRAGMA table_info(activity_records)").all();
  if (columns.some((column) => column.name === "work_order_sgscm")) return;
  db.exec("ALTER TABLE activity_records ADD COLUMN work_order_sgscm TEXT");
}

function seedUsers() {
  const count = db.prepare("SELECT COUNT(*) AS total FROM users").get().total;
  if (count > 0) return;
  db.prepare("INSERT INTO users (username, full_name, role, password) VALUES (?, ?, ?, ?)").run("admin", "Administrador", "Administrador", "admin123");
}

function syncReportWeeks() {
  const insert = db.prepare("INSERT OR IGNORE INTO report_weeks (week, created_by, responsible) VALUES (?, 'admin', '')");
  db.prepare("SELECT DISTINCT week FROM maintenance_records").all().forEach((row) => insert.run(row.week));
  db.prepare("SELECT DISTINCT week FROM activity_records").all().forEach((row) => insert.run(row.week));
}

function ensureReportWeek(week, username, createWeek) {
  if (!week) return;
  const meta = getReportWeek(week);
  if (meta) return;
  db.prepare("INSERT INTO report_weeks (week, created_by, responsible) VALUES (?, ?, ?)").run(week, username || "admin", username || "admin");
}

function getReportWeek(week) {
  return db.prepare("SELECT week, created_by, responsible, created_at FROM report_weeks WHERE week = ?").get(week);
}

function canEditWeek(week, username) {
  const meta = getReportWeek(week);
  return !meta || meta.created_by === username || isAdmin(username);
}

function canDeleteWeek(week, username) {
  const meta = getReportWeek(week);
  return !!meta && !!username && (meta.created_by === username || isAdmin(username));
}

function isAdmin(username) {
  const cleanUsername = clean(username);
  const user = db.prepare("SELECT role FROM users WHERE username = ?").get(cleanUsername);
  return cleanUsername === "admin" || clean(user?.role).toLowerCase() === "administrador";
}

function importThermographyHistory() {
  const count = db.prepare("SELECT COUNT(*) AS total FROM thermography_records").get().total;
  const sourceDb = path.join(__dirname, "bomba16", "instance", "temperaturas.db");
  if (count > 0 || !fs.existsSync(sourceDb)) return;
  const escapedSource = sourceDb.replaceAll("'", "''");
  db.exec(`
    ATTACH DATABASE '${escapedSource}' AS bomba16;
    INSERT OR IGNORE INTO thermography_records (planta, tag, ubicacion, fecha, v1, v2, v3, v4, observacion)
    SELECT planta, TRIM(tag), ubicacion, fecha, v1, v2, v3, v4, observacion FROM bomba16.registros;
    DETACH DATABASE bomba16;
  `);
}

function buildWeeklyReport(week, username = "") {
  const templateRows = db.prepare("SELECT * FROM maintenance_templates ORDER BY sort_order ASC").all();
  const recordRows = db.prepare("SELECT * FROM maintenance_records WHERE week = ?").all(week);
  const activityRows = db.prepare("SELECT * FROM activity_records WHERE week = ? ORDER BY created_at DESC").all(week);
  const recordsByTemplate = new Map(recordRows.map((record) => [record.template_id, record]));
  const planDateByTemplate = getPlanDateByTemplate(week, templateRows);
  const plants = { selectiva: emptyPlant(), colectiva: emptyPlant() };

  templateRows.forEach((template) => {
    const record = recordsByTemplate.get(template.id);
    const plannedDate = planDateByTemplate.get(template.id) || "";
    const photos = safeJson(record?.photos);
    plants[template.plant].maintenance.push({
      id: template.id,
      equipment: template.equipment,
      tag: template.tag,
      description: template.description,
      defaultOt: template.default_ot,
      date: record?.date || plannedDate,
      plannedDate,
      workOrder: record?.work_order || template.default_ot || "",
      notes: record?.notes || "",
      photos,
      completed: Boolean(record?.completed),
    });
  });

  activityRows.forEach((row) => {
    if (!plants[row.plant]) return;
    const target = row.activity_type === "mejora" ? plants[row.plant].improvements : plants[row.plant].emergencies;
    target.push({
      id: row.id,
      date: row.date,
      equipment: row.equipment,
      tag: row.tag,
      workOrder: row.work_order,
      workOrderSgscm: row.work_order_sgscm || "",
      description: row.description,
      photos: safeJson(row.photos),
      completed: Boolean(row.completed),
    });
  });

  const meta = getReportWeek(week) || { week, created_by: username || "admin", responsible: "" };
  return {
    week,
    meta: {
      createdBy: meta.created_by,
      responsible: meta.created_by || "",
      canEdit: !username || canEditWeek(week, username),
      canDelete: !username || canDeleteWeek(week, username),
    },
    plants,
  };
}

function emptyPlant() {
  return { maintenance: [], emergencies: [], improvements: [] };
}

function getPlanDateByTemplate(week, templates) {
  const weekNumber = weekNumberFromLabel(week);
  if (!weekNumber) return new Map();
  try {
    const weekStart = operationalWeekWednesday(PLAN_OPERATIONAL_YEAR, weekNumber);
    const plants = parseWeeklyPlanPlants(weekStart);
    const result = new Map();
    templates.forEach((template) => {
      const rows = plants[template.plant] || [];
      const planned = findPlannedMaintenanceDate(template, rows);
      if (planned) result.set(template.id, planned);
    });
    return result;
  } catch {
    return new Map();
  }
}

function findPlannedMaintenanceDate(template, rows) {
  const tags = extractTags(`${template.tag} ${template.equipment}`);
  const maintenanceRows = rows.filter((row) => isIsoDate(row.day) && /mantenci[oó]n/i.test(row.description || ""));
  if (/conjunto\s+vsa/i.test(template.equipment)) {
    const vsa = maintenanceRows.find((row) => /cortador|muestreador/i.test(`${row.equipment} ${row.description}`));
    if (vsa) return vsa.day;
  }
  const exact = maintenanceRows.find((row) => tags.includes(clean(row.equipment).toUpperCase()));
  if (exact) return exact.day;
  const fallback = maintenanceRows.find((row) => {
    const haystack = normalizeSearchText(`${row.equipment} ${row.description}`);
    return normalizeSearchText(template.equipment).split(" ").filter((part) => part.length > 3).some((part) => haystack.includes(part));
  });
  return fallback ? fallback.day : "";
}

function extractTags(text) {
  return [...new Set(String(text || "").toUpperCase().match(/\b\d{4}-[A-Z]{2}-\d{3}\b/g) || [])];
}

function normalizeSearchText(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(clean(value));
}

function normalizeActivity(input) {
  return {
    week: clean(input.week),
    plant: clean(input.plant),
    activityType: clean(input.activityType),
    date: clean(input.date),
    equipment: clean(input.equipment),
    tag: clean(input.tag),
    workOrder: clean(input.workOrder),
    workOrderSgscm: clean(input.workOrderSgscm),
    description: clean(input.description),
    photos: Array.isArray(input.photos) ? input.photos : [],
  };
}

function buildThermographyDate(fecha) {
  const rows = db.prepare("SELECT * FROM thermography_records WHERE fecha = ?").all(fecha);
  const byPlantTag = new Map(rows.map((row) => [`${row.planta}:${row.tag}`, row]));
  const plants = {};
  Object.entries(thermographyPumps).forEach(([planta, pumps]) => {
    plants[planta] = pumps.map((pump) => {
      const row = byPlantTag.get(`${planta}:${pump.tag}`);
      return {
        tag: pump.tag,
        ubicacion: pump.ubicacion,
        v1: row?.v1 || "",
        v2: row?.v2 || "",
        v3: row?.v3 || "",
        v4: row?.v4 || "",
        observacion: row?.observacion || "",
        sinAcceso: row?.observacion === "Sin acceso",
      };
    });
  });
  return { date: fecha, plants, pumps: thermographyPumps };
}

function buildWeeklyPlan(week, username = "") {
  const weekNumber = weekNumberFromLabel(week);
  if (!weekNumber) throw new Error("Semana invalida. Use formato W-19, W19 o similar.");
  const weekStart = operationalWeekWednesday(PLAN_OPERATIONAL_YEAR, weekNumber);
  const plants = parseWeeklyPlanPlants(weekStart);
  const statuses = db.prepare("SELECT row_key AS rowKey, status FROM plan_status_records WHERE week = ?").all(week);
  const statusByRow = new Map(statuses.map((row) => [row.rowKey, row.status]));
  Object.values(plants).forEach((rows) => {
    rows.forEach((row) => {
      row.status = statusByRow.get(row.rowKey) || normalizePlanStatus(row.status) || "Ok";
    });
  });
  return {
    week,
    weekStart,
    weekEnd: addIsoDays(weekStart, 6),
    canEdit: !username || canEditWeek(week, username),
    plants,
  };
}

function parseWeeklyPlanPlants(weekStart) {
  const planPath = path.join(__dirname, "plan.xlsx");
  if (!fs.existsSync(planPath)) throw new Error("No se encontro plan.xlsx en la carpeta del proyecto.");
  const parser = spawnSync("python3", [path.join(__dirname, "plan_parser.py"), planPath, weekStart], { encoding: "utf8" });
  if (parser.status !== 0) throw new Error(clean(parser.stderr) || "No fue posible leer plan.xlsx.");
  return JSON.parse(parser.stdout || "{}");
}

function weekNumberFromLabel(week) {
  const match = clean(week).match(/W\s*-?\s*(\d{1,2})/i) || clean(week).match(/^(\d{1,2})$/);
  if (!match) return 0;
  const number = Number(match[1]);
  return number >= 1 && number <= 53 ? number : 0;
}

function operationalWeekWednesday(year, weekNumber) {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const mondayWeekOne = new Date(jan4);
  mondayWeekOne.setUTCDate(jan4.getUTCDate() - jan4Day + 1);
  mondayWeekOne.setUTCDate(mondayWeekOne.getUTCDate() + (weekNumber - 1) * 7 + 2);
  return mondayWeekOne.toISOString().slice(0, 10);
}

function addIsoDays(isoDate, days) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function normalizePlanStatus(value) {
  const text = clean(value).toLowerCase();
  if (text === "ok") return "Ok";
  if (text === "pendiente" || text === "pending" || text === "") return "Pendiente";
  if (text === "en proceso" || text === "proceso") return "En proceso";
  if (text === "cancelada" || text === "cancelado") return "Cancelada";
  return "";
}

function validateThermographyRows(planta, records) {
  const errors = [];
  thermographyPumps[planta].forEach((pump, index) => {
    const input = records.find((record) => clean(record.tag) === pump.tag) || records[index] || {};
    if (input.sinAcceso) return;
    ["v1", "v2", "v3", "v4"].forEach((field) => {
      if (!isValidTemperature(input[field], planta === "selectiva" && field === "v1")) errors.push(pump.tag);
    });
  });
  return [...new Set(errors)];
}

function normalizeEquationInput(body) {
  const isPsi = Boolean(body.isPsi);
  return {
    id: Number(body.id) || 0,
    week: clean(body.week),
    username: clean(body.username),
    date: clean(body.date),
    time: clean(body.time),
    plant: clean(body.plant),
    tagKey: clean(body.tagKey),
    tag: clean(body.tag),
    equipment: clean(body.equipment),
    flow: clean(body.flow),
    isPsi: isPsi ? 1 : 0,
    elements: JSON.stringify(isPsi ? [] : Array.isArray(body.elements) ? body.elements.map(clean).filter(Boolean) : []),
    offset: isPsi ? clean(body.offset) : "",
  };
}

function isValidTemperature(value, allowOutOfService = false) {
  const text = clean(value);
  if (!text) return true;
  if (allowOutOfService && text === "Fuera de servicio") return true;
  const number = Number(text.replace(",", "."));
  return Number.isFinite(number) && number >= 0 && number <= 100;
}

function isShortDate(value) {
  return /^\d{2}\/\d{2}\/\d{2}$/.test(clean(value));
}

function numberOrNull(value) {
  if (!value || value === "Fuera de servicio") return null;
  const number = Number(String(value).replace(",", "."));
  return Number.isFinite(number) ? number : null;
}

function shortDateToIso(value) {
  const text = clean(value);
  if (!isShortDate(text)) return "";
  const [day, month, year] = text.split("/");
  return `20${year}-${month}-${day}`;
}

function formatIsoDate(value) {
  const text = clean(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const [year, month, day] = text.split("-");
  return `${day}/${month}/${year}`;
}

function aforoAverageRounded(samples) {
  const nums = Array.isArray(samples) ? samples.map(Number).filter(Number.isFinite) : [];
  if (!nums.length) return 0;
  const avg = nums.reduce((sum, n) => sum + n, 0) / nums.length;
  return Math.round(avg / 10) * 10;
}

function aforoFlowLiters(flow) {
  if (!flow || typeof flow !== "object") return 0;
  const blockHours = Number(flow.blockHours) || 0;
  const intervalMinutes = Number(flow.intervalMinutes) || 0;
  const cutsPerInterval = Number(flow.cutsPerInterval || flow.primaryCuts) || 0;
  if (!blockHours || !intervalMinutes || !cutsPerInterval) return 0;
  const ccPerInterval = aforoAverageRounded(flow.samples);
  const ccPerHour = (ccPerInterval * 60) / intervalMinutes;
  return (ccPerHour * blockHours) / 1000;
}

function buildAforoChart(data) {
  const rows = [];
  if (data?.feed?.flows) {
    data.feed.flows.forEach((flow) => rows.push({ label: flow.name || "Alimentacion", liters: aforoFlowLiters(flow) }));
  }
  if (data?.bulk6) rows.push({ label: data.bulk6.title || "Bulk 6h", liters: aforoFlowLiters(data.bulk6) });
  if (data?.bulk24) rows.push({ label: data.bulk24.title || "Bulk 24h", liters: aforoFlowLiters(data.bulk24) });
  if (data?.relave) rows.push({ label: data.relave.title || "Relave final", liters: aforoFlowLiters(data.relave) });
  return rows.map((row) => ({ label: row.label, liters: Number(row.liters.toFixed(2)) }));
}

function buildThermoChart(planta, startIso, endIso) {
  const rows = db.prepare("SELECT fecha, v1, v2, v3, v4 FROM thermography_records WHERE planta = ? ORDER BY fecha ASC").all(planta);
  const grouped = new Map();
  rows.forEach((row) => {
    const iso = shortDateToIso(row.fecha);
    if (!iso || iso < startIso || iso > endIso) return;
    const values = [row.v1, row.v2, row.v3, row.v4]
      .map((value) => Number(String(value || "").replace(",", ".")))
      .filter(Number.isFinite);
    if (!values.length) return;
    if (!grouped.has(row.fecha)) grouped.set(row.fecha, []);
    grouped.get(row.fecha).push(...values);
  });
  return Array.from(grouped.entries()).map(([fecha, values]) => ({
    label: fecha,
    avg: Number((values.reduce((sum, n) => sum + n, 0) / values.length).toFixed(1)),
    max: Number(Math.max(...values).toFixed(1))
  }));
}

function buildThermoPumpRows(planta, startIso, endIso) {
  const rows = db.prepare("SELECT fecha, tag, ubicacion, v1, v2, v3, v4, observacion FROM thermography_records WHERE planta = ? ORDER BY fecha ASC, tag ASC").all(planta);
  return rows.map((row) => {
    const iso = shortDateToIso(row.fecha);
    if (!iso || iso < startIso || iso > endIso) return null;
    const values = [row.v1, row.v2, row.v3, row.v4]
      .map((value) => Number(String(value || "").replace(",", ".")))
      .filter(Number.isFinite);
    if (!values.length && row.observacion !== "Sin acceso") return null;
    return {
      fecha: row.fecha,
      tag: row.tag,
      ubicacion: row.ubicacion,
      avg: values.length ? Number((values.reduce((sum, n) => sum + n, 0) / values.length).toFixed(1)) : null,
      max: values.length ? Number(Math.max(...values).toFixed(1)) : null,
      observacion: row.observacion || ""
    };
  }).filter(Boolean);
}

function summarizeRowsByDay(rows) {
  const grouped = new Map();
  rows.forEach((row) => {
    const key = row.day || "Sin fecha";
    if (!grouped.has(key)) grouped.set(key, { day: key, total: 0, ok: 0, process: 0, pending: 0, cancelled: 0 });
    const item = grouped.get(key);
    item.total += 1;
    if (row.status === "Ok") item.ok += 1;
    else if (row.status === "En proceso") item.process += 1;
    else if (row.status === "Cancelada") item.cancelled += 1;
    else item.pending += 1;
  });
  return Array.from(grouped.values()).sort((a, b) => a.day.localeCompare(b.day));
}

function planCauseLabel(row) {
  const text = normalizeSearchText(`${row.equipment || ""} ${row.description || ""}`);
  if (text.includes("termografia")) return "Termografia bombas";
  if (text.includes("aforo")) return "Aforos";
  if (text.includes("toma de muestra") || text.includes("toma de muestras")) return "Toma muestras";
  if (text.includes("mantencion")) return "Mantencion programada";
  if (text.includes("inspeccion")) return "Inspeccion";
  return "Otros trabajos";
}

function summarizePlanCauses(rows) {
  const grouped = new Map();
  rows.forEach((row) => {
    const label = planCauseLabel(row);
    grouped.set(label, (grouped.get(label) || 0) + 1);
  });
  return Array.from(grouped.entries()).map(([label, total]) => ({ label, total })).sort((a, b) => b.total - a.total);
}

function buildThermoPumpSeries(planta, startIso, endIso) {
  const rows = db.prepare("SELECT fecha, tag, ubicacion, v1, v2, v3, v4 FROM thermography_records WHERE planta = ? ORDER BY fecha ASC").all(planta)
    .filter((row) => {
      const iso = shortDateToIso(row.fecha);
      return iso && iso >= startIso && iso <= endIso;
    });
  const byTag = new Map();
  rows.forEach((row) => {
    if (!byTag.has(row.tag)) byTag.set(row.tag, []);
    byTag.get(row.tag).push(row);
  });
  const selected = Array.from(byTag.entries()).sort((a, b) => b[1].length - a[1].length)[0];
  if (!selected) return null;
  return {
    tag: selected[0],
    ubicacion: selected[1][0]?.ubicacion || "",
    rows: selected[1].map((row) => ({
      fecha: row.fecha,
      v1: numberOrNull(row.v1),
      v2: numberOrNull(row.v2),
      v3: numberOrNull(row.v3),
      v4: numberOrNull(row.v4)
    }))
  };
}

function slimReportItem(item) {
  return {
    id: item.id,
    date: item.date,
    equipment: item.equipment,
    tag: item.tag,
    workOrder: item.workOrder,
    workOrderSgscm: item.workOrderSgscm,
    description: item.description,
    notes: item.notes,
    completed: item.completed,
    photoCount: Array.isArray(item.photos) ? item.photos.length : 0
  };
}

function currentWeek() {
  const now = new Date();
  const utc = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const operationalDay = utc.getUTCDay() || 7;
  const daysSinceWednesday = operationalDay >= 3 ? operationalDay - 3 : operationalDay + 4;
  utc.setUTCDate(utc.getUTCDate() - daysSinceWednesday);
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((utc - yearStart) / 86400000) + 1) / 7);
  return `W-${String(week).padStart(2, "0")}`;
}

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function safeJson(value) {
  try {
    return JSON.parse(value || "[]");
  } catch {
    return [];
  }
}

function safeObjectJson(value) {
  try {
    const parsed = JSON.parse(value || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}
