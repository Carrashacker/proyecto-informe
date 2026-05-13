# Graph Report - /Users/robinsoncarrascoveliz/Desktop/plan/gravity  (2026-05-12)

## Corpus Check
- 73 files · ~383,908 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1211 nodes · 2970 edges · 58 communities (52 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Backup app pre-restore|Backup app pre-restore]]
- [[_COMMUNITY_Backup app pre-restore v2|Backup app pre-restore v2]]
- [[_COMMUNITY_Backup app v45|Backup app v45]]
- [[_COMMUNITY_Backup server responsive-full|Backup server responsive-full]]
- [[_COMMUNITY_Backend server.js|Backend server.js]]
- [[_COMMUNITY_Backup app responsive-full|Backup app responsive-full]]
- [[_COMMUNITY_Backup app ecuaciones v55|Backup app ecuaciones v55]]
- [[_COMMUNITY_Frontend app.js|Frontend app.js]]
- [[_COMMUNITY_Frontend app.js UI|Frontend app.js UI]]
- [[_COMMUNITY_Bomba16 Python app|Bomba16 Python app]]
- [[_COMMUNITY_Backup app actividades|Backup app actividades]]
- [[_COMMUNITY_Backup app photos|Backup app photos]]
- [[_COMMUNITY_Frontend actividades|Frontend actividades]]
- [[_COMMUNITY_Backup app semanas|Backup app semanas]]
- [[_COMMUNITY_Backup app semanas v2|Backup app semanas v2]]
- [[_COMMUNITY_Aforo module|Aforo module]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]

## God Nodes (most connected - your core abstractions)
1. `esc()` - 20 edges
2. `esc()` - 20 edges
3. `esc()` - 20 edges
4. `esc()` - 20 edges
5. `esc()` - 20 edges
6. `esc()` - 20 edges
7. `notify()` - 15 edges
8. `notify()` - 15 edges
9. `clean()` - 14 edges
10. `enterWorkWeek()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `buildWeeklyPlan()` --calls--> `canEditWeek()`  [EXTRACTED]
  server.js → server.js  _Bridges community 36 → community 42_
- `isAdmin()` --calls--> `clean()`  [EXTRACTED]
  server.js → server.js  _Bridges community 36 → community 26_
- `parseWeeklyPlanPlants()` --calls--> `clean()`  [EXTRACTED]
  server.js → server.js  _Bridges community 42 → community 26_
- `renderWeekControl()` --calls--> `currentWeekCanEdit()`  [EXTRACTED]
  app.js → app.js  _Bridges community 12 → community 8_
- `submitMaintenanceForm()` --calls--> `readFilesAsDataUrls()`  [EXTRACTED]
  app.js → app.js  _Bridges community 12 → community 7_

## Communities (58 total, 6 thin omitted)

### Community 0 - "Backup app pre-restore"
Cohesion: 0.05
Nodes (129): activateThermoStatsPanel(), activityBranch(), activityCameraTags(), activityTag(), aforoAvgRounded(), aforoCalcBox(), aforoCell(), aforoFlowMetrics() (+121 more)

### Community 1 - "Backup app pre-restore v2"
Cohesion: 0.05
Nodes (129): activateThermoStatsPanel(), activityBranch(), activityCameraTags(), activityTag(), aforoAvgRounded(), aforoCalcBox(), aforoCell(), aforoFlowMetrics() (+121 more)

### Community 2 - "Backup app v45"
Cohesion: 0.05
Nodes (123): activateThermoStatsPanel(), activityBranch(), activityCameraTags(), activityTag(), aforoAvgRounded(), aforoCalcBox(), aforoCell(), aforoFlowMetrics() (+115 more)

### Community 3 - "Backup server responsive-full"
Cohesion: 0.02
Nodes (75): activity, activityId, aforoChart, aforoData, aforoRow, allowed, app, buffers (+67 more)

### Community 4 - "Backend server.js"
Cohesion: 0.02
Nodes (75): activity, activityId, aforoChart, aforoData, aforoRow, allowed, app, buffers (+67 more)

### Community 5 - "Backup app responsive-full"
Cohesion: 0.11
Nodes (31): activateThermoStatsPanel(), activityBranch(), activityCameraTags(), activityTag(), attachTagTreeEvents(), bindThermoAutoSave(), buildActivityTagTreeNodes(), buildTagTreeHTML() (+23 more)

### Community 6 - "Backup app ecuaciones v55"
Cohesion: 0.13
Nodes (28): activityBranch(), activityCameraTags(), activityTag(), attachTagTreeEvents(), bootstrap(), buildActivityTagTreeNodes(), buildTagTreeHTML(), closeActivityTagModal() (+20 more)

### Community 7 - "Frontend app.js"
Cohesion: 0.13
Nodes (26): activityBranch(), activityCameraTags(), activityTag(), attachTagTreeEvents(), buildActivityTagTreeNodes(), buildTagTreeHTML(), closeActivityTagModal(), ensureActivityTagModal() (+18 more)

### Community 8 - "Frontend app.js UI"
Cohesion: 0.12
Nodes (29): api(), changeThermoDate(), confirmDialog(), createNewWeek(), deleteCurrentWeek(), deleteThermoDate(), deleteWeekFromChooser(), enterWorkWeek() (+21 more)

### Community 9 - "Bomba16 Python app"
Cohesion: 0.09
Nodes (26): cargar(), descargar(), eliminar_fecha(), encontrar_hoja_mas_parecida(), es_valido_temp(), estadisticas_datos(), exportar(), guardar() (+18 more)

### Community 10 - "Backup app actividades"
Cohesion: 0.17
Nodes (25): currentWeekCanEdit(), deleteActivity(), getActivityPendingPhotos(), getActivityPhotoGrid(), getActivityPhotos(), getActivityTagButton(), getExistingPhotoSources(), getSelectedTagLabel() (+17 more)

### Community 11 - "Backup app photos"
Cohesion: 0.18
Nodes (24): compressImage(), currentWeekCanEdit(), getActivityPendingPhotos(), getActivityPhotoGrid(), getActivityPhotos(), getActivityTagButton(), getExistingPhotoSources(), getSelectedTagLabel() (+16 more)

### Community 12 - "Frontend actividades"
Cohesion: 0.21
Nodes (21): compressImage(), currentWeekCanEdit(), deleteActivity(), getActivityPendingPhotos(), getActivityPhotoGrid(), getActivityPhotos(), getActivityTagButton(), getSelectedTagLabel() (+13 more)

### Community 13 - "Backup app semanas"
Cohesion: 0.16
Nodes (20): changeThermoDate(), confirmDialog(), createNewWeek(), deleteActivity(), deleteCurrentWeek(), deleteThermoDate(), deleteWeekFromChooser(), enterWorkWeek() (+12 more)

### Community 14 - "Backup app semanas v2"
Cohesion: 0.15
Nodes (20): changeThermoDate(), confirmDialog(), createNewWeek(), deleteCurrentWeek(), deleteThermoDate(), deleteWeekFromChooser(), enterWorkWeek(), getWeekNumber() (+12 more)

### Community 15 - "Aforo module"
Cohesion: 0.29
Nodes (19): aforoAvgRounded(), aforoCalcBox(), aforoCell(), aforoFlowMetrics(), aforoFlowParamsBlock(), aforoInputCell(), aforoRelaveMetrics(), aforoRow() (+11 more)

### Community 16 - "Community 16"
Cohesion: 0.29
Nodes (19): aforoAvgRounded(), aforoCalcBox(), aforoCell(), aforoFlowMetrics(), aforoFlowParamsBlock(), aforoInputCell(), aforoRelaveMetrics(), aforoRow() (+11 more)

### Community 17 - "Community 17"
Cohesion: 0.29
Nodes (19): aforoAvgRounded(), aforoCalcBox(), aforoCell(), aforoFlowMetrics(), aforoFlowParamsBlock(), aforoInputCell(), aforoRelaveMetrics(), aforoRow() (+11 more)

### Community 18 - "Community 18"
Cohesion: 0.24
Nodes (13): cameras(), closeModal(), collectMatches(), ensureModal(), esc(), openModal(), parseGroupTag(), renderCurrentFolder() (+5 more)

### Community 19 - "Community 19"
Cohesion: 0.24
Nodes (13): cameras(), closeModal(), collectMatches(), ensureModal(), esc(), openModal(), parseGroupTag(), renderCurrentFolder() (+5 more)

### Community 20 - "Community 20"
Cohesion: 0.26
Nodes (16): api(), currentEquationCanEdit(), eqResolveTagKey(), equationsAutoSetPlant(), equationsPopulateFlowSelect(), equationsPopulateTagSelect(), getTagDisplayByKey(), getTagEquipmentByKey() (+8 more)

### Community 21 - "Community 21"
Cohesion: 0.27
Nodes (14): cameras(), closeModal(), collectMatches(), ensureModal(), esc(), getItemsAtPath(), getPathNames(), openModal() (+6 more)

### Community 22 - "Community 22"
Cohesion: 0.27
Nodes (14): cameras(), closeModal(), collectMatches(), ensureModal(), esc(), getItemsAtPath(), getPathNames(), openModal() (+6 more)

### Community 23 - "Community 23"
Cohesion: 0.31
Nodes (13): currentEquationCanEdit(), eqResolveTagKey(), equationsAutoSetPlant(), equationsPopulateFlowSelect(), equationsPopulateTagSelect(), getTagDisplayByKey(), getTagEquipmentByKey(), isEquationPsiTag() (+5 more)

### Community 24 - "Community 24"
Cohesion: 0.23
Nodes (13): api(), eqResolveTagKey(), equationsAutoSetPlant(), equationsPopulateFlowSelect(), equationsPopulateTagSelect(), getEquationForm(), getTagDisplayByKey(), loadEquations() (+5 more)

### Community 25 - "Community 25"
Cohesion: 0.32
Nodes (10): cameras(), closeModal(), ensureModal(), esc(), filterRows(), openModal(), parseGroupTag(), render() (+2 more)

### Community 26 - "Community 26"
Cohesion: 0.2
Nodes (11): clean(), displayCargo(), formatIsoDate(), isIsoDate(), isShortDate(), isValidTemperature(), normalizeActivity(), normalizeCargo() (+3 more)

### Community 27 - "Community 27"
Cohesion: 0.2
Nodes (11): clean(), displayCargo(), formatIsoDate(), isIsoDate(), isShortDate(), isValidTemperature(), normalizeActivity(), normalizeCargo() (+3 more)

### Community 28 - "Community 28"
Cohesion: 0.27
Nodes (10): activateThermoStatsPanel(), bindThermoAutoSave(), loadThermoData(), newThermoRecord(), populateThermoStatsSelects(), renderThermoPlant(), renderThermoTables(), saveThermoData() (+2 more)

### Community 29 - "Community 29"
Cohesion: 0.28
Nodes (9): activateThermoStatsPanel(), bootstrap(), closeModal(), populateThermoStatsSelects(), populateUsernameSelect(), refreshUsers(), setUserListStatus(), showModal() (+1 more)

### Community 30 - "Community 30"
Cohesion: 0.42
Nodes (9): destroyThermoChart(), drawThermoCanvasMessage(), drawThermoFallbackChart(), getThermoCanvas(), loadThermoStats(), notify(), prepareThermoCanvas(), renderThermoChart() (+1 more)

### Community 31 - "Community 31"
Cohesion: 0.42
Nodes (9): destroyThermoChart(), drawThermoCanvasMessage(), drawThermoFallbackChart(), getThermoCanvas(), loadThermoStats(), notify(), prepareThermoCanvas(), renderThermoChart() (+1 more)

### Community 32 - "Community 32"
Cohesion: 0.32
Nodes (8): bindThermoAutoSave(), loadThermoData(), newThermoRecord(), renderThermoPlant(), renderThermoTables(), saveThermoData(), scheduleThermoAutoSave(), setThermoState()

### Community 33 - "Community 33"
Cohesion: 0.46
Nodes (8): destroyThermoChart(), drawThermoCanvasMessage(), drawThermoFallbackChart(), getThermoCanvas(), loadThermoStats(), prepareThermoCanvas(), renderThermoChart(), setThermoStatsStatus()

### Community 34 - "Community 34"
Cohesion: 0.36
Nodes (8): getWeekNumber(), initAforoData(), loadAforos(), loadWeeklyPlan(), renderAforos(), saveAforoData(), scheduleAforoAutoSave(), setAforoState()

### Community 35 - "Community 35"
Cohesion: 0.52
Nodes (6): closest_sheet(), ensure_sheet(), ensure_workbook(), main(), normalise_number(), write_record()

### Community 36 - "Community 36"
Cohesion: 0.43
Nodes (7): buildWeeklyReport(), canDeleteWeek(), canEditWeek(), emptyPlant(), ensureReportWeek(), getReportWeek(), isAdmin()

### Community 37 - "Community 37"
Cohesion: 0.33
Nodes (6): leer_datos_hoja_individual(), normalizar_numero(), parsear_fecha_excel(), Intenta parsear una fecha desde el formato DD/MM/YY, DD/MM/YYYY, MM/DD/YY, MM/DD, Convierte coma decimal a punto y valida rango. Devuelve string o None., Lee una hoja individual de un archivo Excel.     Asume que los datos comienzan e

### Community 38 - "Community 38"
Cohesion: 0.33
Nodes (6): leer_datos_hoja_individual(), normalizar_numero(), parsear_fecha_excel(), Intenta parsear una fecha desde el formato DD/MM/YY, DD/MM/YYYY, MM/DD/YY, MM/DD, Convierte coma decimal a punto y valida rango. Devuelve string o None., Lee una hoja individual de un archivo Excel.     Asume que los datos comienzan e

### Community 39 - "Community 39"
Cohesion: 0.52
Nodes (6): closest_sheet(), ensure_sheet(), ensure_workbook(), main(), normalise_number(), write_record()

### Community 40 - "Community 40"
Cohesion: 0.43
Nodes (7): buildWeeklyReport(), canDeleteWeek(), canEditWeek(), emptyPlant(), ensureReportWeek(), getReportWeek(), isAdmin()

### Community 41 - "Community 41"
Cohesion: 0.38
Nodes (7): bootstrap(), closeModal(), populateUsernameSelect(), refreshUsers(), setUserListStatus(), showModal(), showUserManager()

### Community 42 - "Community 42"
Cohesion: 0.47
Nodes (6): addIsoDays(), buildWeeklyPlan(), getPlanDateByTemplate(), operationalWeekWednesday(), parseWeeklyPlanPlants(), weekNumberFromLabel()

### Community 43 - "Community 43"
Cohesion: 0.47
Nodes (6): addIsoDays(), buildWeeklyPlan(), getPlanDateByTemplate(), operationalWeekWednesday(), parseWeeklyPlanPlants(), weekNumberFromLabel()

### Community 44 - "Community 44"
Cohesion: 0.9
Nodes (4): clean(), main(), normalize_status(), parse_date()

### Community 45 - "Community 45"
Cohesion: 0.9
Nodes (4): clean(), main(), normalize_status(), parse_date()

### Community 46 - "Community 46"
Cohesion: 0.6
Nodes (5): initAforoData(), renderAforos(), saveAforoData(), scheduleAforoAutoSave(), setAforoState()

### Community 47 - "Community 47"
Cohesion: 0.67
Nodes (3): aforoAverageRounded(), aforoFlowLiters(), buildAforoChart()

### Community 48 - "Community 48"
Cohesion: 0.67
Nodes (3): aforoAverageRounded(), aforoFlowLiters(), buildAforoChart()

## Knowledge Gaps
- **169 isolated node(s):** `express`, `fs`, `path`, `{ spawnSync }`, `Database` (+164 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `express`, `fs`, `path` to the rest of the system?**
  _169 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Backup app pre-restore` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Backup app pre-restore v2` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Backup app v45` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Backup server responsive-full` be split into smaller, more focused modules?**
  _Cohesion score 0.02 - nodes in this community are weakly interconnected._
- **Should `Backend server.js` be split into smaller, more focused modules?**
  _Cohesion score 0.02 - nodes in this community are weakly interconnected._
- **Should `Backup app responsive-full` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._