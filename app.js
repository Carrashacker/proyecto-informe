(function() {
  "use strict";

  var loginScreen = document.getElementById("loginScreen");
  var appScreen = document.getElementById("appScreen");
  var loginForm = document.getElementById("loginForm");
  var loginError = document.getElementById("loginError");
  var logoutBtn = document.getElementById("logoutBtn");
  var userManageBtn = document.getElementById("userManageBtn");
  var modalOverlay = document.getElementById("modalOverlay");
  var weekInput = document.getElementById("weekInput");
  var weekFilter = document.getElementById("weekFilter");
  var workWeekControl = document.getElementById("workWeekControl");

  var activeWeekLabel = document.getElementById("activeWeekLabel");
  var responsibleLabel = document.getElementById("responsibleLabel");
  var deleteWeekBtn = document.getElementById("deleteWeekBtn");
  var sectionTitle = document.getElementById("sectionTitle");
  var sectionSubtitle = document.getElementById("sectionSubtitle");
  var maintenanceList = document.getElementById("maintenanceList");
  var emergencyList = document.getElementById("emergencyList");
  var improvementList = document.getElementById("improvementList");
  var emergencyForm = document.getElementById("emergencyForm");
  var improvementForm = document.getElementById("improvementForm");
  var metricMaintenance = document.getElementById("metricMaintenance");
  var metricEmergencies = document.getElementById("metricEmergencies");
  var metricImprovements = document.getElementById("metricImprovements");

  var users = Array.isArray(window.__INITIAL_USERS__) ? window.__INITIAL_USERS__.slice() : [];
  var currentUser = null;
  var report = null;
  var activePlant = "selectiva";
  var selectedMaintenanceId = null;
  var selectedActivityIds = { emergente: null, mejora: null };

  var thermoData = null;
  var thermoActivePanel = "colectiva";
  var planData = null;
  var planActivePlant = "selectiva";
  var planLoadSeq = 0;
  var aforoData = null;
  var equationList = [];
  var equationCanEdit = null;
  var METSO_VERSION = "v=79-save-success-toast";
  console.log("[METSO] app.js " + METSO_VERSION + " cargado.");
  /* Badge visible en pantalla para confirmar version sin DevTools */
  setTimeout(function() {
    if (document.getElementById("metsoVersionBadge")) return;
    var b = document.createElement("div");
    b.id = "metsoVersionBadge";
    b.textContent = METSO_VERSION;
    b.style.cssText = "position:fixed;bottom:8px;right:8px;background:#0a3d62;color:#fff;padding:4px 10px;border-radius:999px;font-size:11px;font-family:monospace;z-index:99999;opacity:.85;pointer-events:none;";
    document.body.appendChild(b);
  }, 0);
  /* Polling: detecta cambios del TAG y actualiza flujos + planta */
  setInterval(function() {
    var f = document.getElementById("equationForm");
    var tagSelect = f ? f.querySelector('[name="tagKey"]') : null;
    if (!tagSelect) return;
    var v = tagSelect.value;
    if (v === tagSelect.__lastSeen) return;
    tagSelect.__lastSeen = v;
    equationsPopulateFlowSelect(v);
    equationsAutoSetPlant(v);
    syncEquationMode();
  }, 200);
  /* Catalogo de equipos y flujos embebido (extraido de flujos.xlsx).
     Editar aqui es la fuente de verdad del frontend - sin fetch, sin cache, sin Python. */
  var EMBEDDED_FLOW_CATALOG = {
    tags: [
      { key: "3811-az-601", display: "3811-AZ-601", equipment: "COURIER MOLIBDENO" },
      { key: "3221-az-012", display: "3221-AZ-012", equipment: "COURIER ALIMENTACION" },
      { key: "3311-az-031", display: "3311-AZ-031", equipment: "COURIER RELAVES" },
      { key: "3311-az-012", display: "3311-AZ-012", equipment: "COURIER CONCENTRADOS" },
      { key: "3511-a-002",  display: "3511-AZ-002", equipment: "COURIER REMOLIENDA" },
      { key: "3221-az-011", display: "3221-AZ-011", equipment: "PSI ALIMENTACION" },
      { key: "3511-az-004", display: "3511-AZ-004", equipment: "PSI REMOLIENDA" }
    ],
    flows: {
      "3811-az-601": [
        "Concentrado Colectivo", "Concentrado pre primario",
        "Colas primaria  Fila 1", "Colas primaria Fila 2",
        "Concentrado primario Fila 1", "Concentrado primario Fila 2",
        "concentrado 1° limpieza", "concentrado 2° Limpieza",
        "Concentrado 3° limpieza", "Concentrado Final Moly"
      ],
      "3221-az-012": [
        "Alimentacion Fila 1", "Alimentacion fila 2", "Alimentacion Fila 3"
      ],
      "3311-az-031": [
        "Relave Scavenger", "Relave Fila 3", "Relave Fila 2", "Relave Fila 1"
      ],
      "3311-az-012": [
        "concentrado 1° limpieza", "concentrado Scavenger",
        "Relave 1° limpieza", "Concentrado Rougher Fila 1",
        "Concentrado Rougher Fila 2", "Concentrado Rougher fila 3"
      ],
      "3511-a-002": [
        "concentrado Celda n° 3", "concentrado Celda n° 2",
        "concentrado Celda n° 4", "concentrado final Bulk",
        "concentrado Celda n° 1", "concentrado Alta Ley",
        "concentrado Celda n° 5", "concentrado Celda n° 6"
      ],
      "3221-az-011": [
        "Linea 1", "Linea 2", "Linea 3"
      ],
      "3511-az-004": [
        "Alta ley", "Bulk"
      ]
    }
  };
  var flowCatalog = EMBEDDED_FLOW_CATALOG;
  var thermoCharts = { colectiva: null, selectiva: null };

  function currentWeekCanEdit() {
    return !!(report && report.meta && report.meta.canEdit);
  }

  function currentEquationCanEdit() {
    if (report && report.meta) return !!report.meta.canEdit;
    return equationCanEdit !== false;
  }

  function compressImage(file) {
    return new Promise(function(resolve, reject) {
      var img = new Image();
      var url = URL.createObjectURL(file);
      img.onload = function() {
        URL.revokeObjectURL(url);
        var MAX_W = 800, MAX_H = 800;
        var w = img.width, h = img.height;
        if (w > MAX_W || h > MAX_H) {
          var r = Math.min(MAX_W / w, MAX_H / h);
          w = Math.round(w * r); h = Math.round(h * r);
        }
        var canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        var out = canvas.toDataURL("image/jpeg", 0.5);
        resolve(out);
      };
      img.onerror = function() { URL.revokeObjectURL(url); reject(new Error("No fue posible comprimir imagen.")); };
      img.src = url;
    });
  }

  function readFilesAsDataUrls(fileList) {
    var files = Array.prototype.slice.call(fileList || []);
    return Promise.all(files.map(function(file) {
      return new Promise(function(resolve, reject) {
        if (!file || !file.type || file.type.indexOf("image/") !== 0) {
          resolve("");
          return;
        }
        compressImage(file).then(resolve).catch(function() {
          var reader = new FileReader();
          reader.onload = function() { resolve(reader.result || ""); };
          reader.onerror = function() { reject(new Error("No fue posible leer una imagen.")); };
          reader.readAsDataURL(file);
        });
      });
    })).then(function(results) {
      return results.filter(Boolean);
    });
  }

  function getExistingPhotoSources(container) {
    var sources = [];
    if (!container) return sources;
    if (Array.isArray(container.__photos)) return container.__photos.slice();
    container.querySelectorAll("img").forEach(function(img) {
      if (img.src) sources.push(img.src);
    });
    return sources;
  }

  function renderPhotoGrid(container, photos, canEdit) {
    if (!container) return;
    var items = Array.isArray(photos) ? photos : [];
    container.__photos = items.slice();
    if (items.length === 0) {
      container.innerHTML = canEdit ? "<p class=\"hint\">No hay fotos cargadas.</p>" : "";
      return;
    }
    container.innerHTML = items.map(function(photo, idx) {
      return '<figure class="photo-item"><img src="' + photo + '" alt="Foto ' + (idx + 1) + '"/>' +
        (canEdit ? '<button class="danger-button photo-remove" type="button" data-photo-index="' + idx + '">Quitar</button>' : '') +
        '</figure>';
    }).join("");

    if (canEdit) {
      container.querySelectorAll("[data-photo-index]").forEach(function(btn) {
        btn.onclick = function() {
          var index = Number(btn.dataset.photoIndex);
          var next = items.filter(function(_, i) { return i !== index; });
          renderPhotoGrid(container, next, true);
        };
      });
    }
  }

  function setFormEnabled(form, enabled) {
    if (!form) return;
    form.querySelectorAll("input, select, textarea, button").forEach(function(el) {
      if (el.type === "hidden") return;
      el.disabled = !enabled;
    });
  }

  function getSelectedTagLabel(tagValue) {
    if (!tagValue) return "Seleccione TAG";
    return tagValue;
  }

  function getTagDisplayByKey(tagKey) {
    if (!flowCatalog || !Array.isArray(flowCatalog.tags)) return tagKey ? tagKey.toUpperCase() : "";
    var cleanKey = String(tagKey || "").toLowerCase();
    var found = flowCatalog.tags.find(function(tag) { return String(tag.key || "").toLowerCase() === cleanKey; });
    return found ? found.display : (tagKey ? tagKey.toUpperCase() : "");
  }

  function getTagEquipmentByKey(tagKey) {
    var catalog = flowCatalog || EMBEDDED_FLOW_CATALOG;
    if (!catalog || !Array.isArray(catalog.tags)) return "";
    var cleanKey = String(tagKey || "").toLowerCase();
    var found = catalog.tags.find(function(tag) { return String(tag.key || "").toLowerCase() === cleanKey; });
    return found ? (found.equipment || "") : "";
  }

  function isEquationPsiTag(tagKey) {
    var lower = String(tagKey || "").toLowerCase();
    return lower === "3221-az-011" || lower === "3511-az-004";
  }

  function syncEquationMode() {
    if (!equationForm) return;
    var offsetInput = equationForm.querySelector('[name="offset"]');
    var checkboxes = equationForm.querySelectorAll('input[name="elements"]');
    var canEdit = currentEquationCanEdit();
    var tagSelect = equationForm.querySelector('[name="tagKey"]');
    var isPsi = isEquationPsiTag(tagSelect ? tagSelect.value : "");
    checkboxes.forEach(function(cb) {
      cb.disabled = isPsi || !canEdit;
      if (isPsi) cb.checked = false;
    });
    if (offsetInput) {
      offsetInput.disabled = !isPsi || !canEdit;
      if (!isPsi) offsetInput.value = "";
    }
  }

  function getActivityPhotoGrid(form) {
    return form ? document.getElementById(form.id === "emergencyForm" ? "emergencyEditPhotos" : "improvementEditPhotos") : null;
  }

  function getActivityTagButton(form) {
    return form ? form.querySelector(".tag-tree-toggle") : null;
  }

  function getActivityPhotos(form) {
    var grid = getActivityPhotoGrid(form);
    if (!grid) return [];
    return Array.from(grid.querySelectorAll(".photo-item:not([data-pending='1']) img")).map(function(img) { return img.src; });
  }

  function getActivityPendingPhotos(form) {
    return (form && Array.isArray(form.__pendingActivityPhotos)) ? form.__pendingActivityPhotos.slice() : [];
  }

  function renderActivityPhotoGrid(form, existingPhotos, pendingPhotos, canEdit) {
    var container = getActivityPhotoGrid(form);
    if (!container) return;
    existingPhotos = existingPhotos || [];
    pendingPhotos = pendingPhotos || [];
    container.innerHTML = existingPhotos.map(function(photo, idx) {
      return '<figure class="photo-item"><img src="' + photo + '" alt="Foto ' + (idx + 1) + '"/>' +
        (canEdit ? '<button class="danger-button photo-remove" type="button" data-existing-photo-index="' + idx + '">Quitar</button>' : '') +
        '</figure>';
    }).join("") + pendingPhotos.map(function(photo, idx) {
      return '<figure class="photo-item pending-photo" data-pending="1"><img src="' + photo + '" alt="Foto nueva ' + (idx + 1) + '"/>' +
        '<figcaption>Sin guardar</figcaption>' +
        (canEdit ? '<button class="danger-button photo-remove" type="button" data-pending-photo-index="' + idx + '">Quitar</button>' : '') +
        '</figure>';
    }).join("");
    if (!canEdit) return;
    container.querySelectorAll("[data-existing-photo-index]").forEach(function(btn) {
      btn.onclick = function() {
        var index = Number(btn.dataset.existingPhotoIndex);
        var nextExisting = existingPhotos.filter(function(_, i) { return i !== index; });
        renderActivityPhotoGrid(form, nextExisting, getActivityPendingPhotos(form), canEdit);
      };
    });
    container.querySelectorAll("[data-pending-photo-index]").forEach(function(btn) {
      btn.onclick = function() {
        var index = Number(btn.dataset.pendingPhotoIndex);
        form.__pendingActivityPhotos = getActivityPendingPhotos(form).filter(function(_, i) { return i !== index; });
        renderActivityPhotoGrid(form, getActivityPhotos(form), getActivityPendingPhotos(form), canEdit);
      };
    });
  }

  function setupActivityPhotoPreview(form) {
    if (!form || !form.elements.photos) return;
    form.__pendingActivityPhotos = [];
    form.elements.photos.onchange = function() {
      readFilesAsDataUrls(form.elements.photos.files).then(function(photos) {
        form.__pendingActivityPhotos = photos;
        form.elements.photos.value = "";
        renderActivityPhotoGrid(form, getActivityPhotos(form), getActivityPendingPhotos(form), currentWeekCanEdit());
      }).catch(function(err) {
        notify("error", err && err.message ? err.message : "No fue posible previsualizar las fotos.");
      });
    };
  }

  function setupMaintenancePhotoPreview(form, grid) {
    if (!form || !grid || !form.elements.photos) return;
    form.elements.photos.onchange = function() {
      readFilesAsDataUrls(form.elements.photos.files).then(function(photos) {
        var current = getExistingPhotoSources(grid);
        form.elements.photos.value = "";
        renderPhotoGrid(grid, current.concat(photos), currentWeekCanEdit());
      }).catch(function(err) {
        notify("error", err && err.message ? err.message : "No fue posible previsualizar las fotos.");
      });
    };
  }

  function getFormErrorMessage(result, fallback) {
    return result && result.data && result.data.error ? result.data.error : fallback;
  }

  function getWeekNumber() {
    var now = new Date();
    var utc = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    var operationalDay = utc.getUTCDay() || 7;
    var daysSinceWednesday = operationalDay >= 3 ? operationalDay - 3 : operationalDay + 4;
    utc.setUTCDate(utc.getUTCDate() - daysSinceWednesday);
    var day = utc.getUTCDay() || 7;
    utc.setUTCDate(utc.getUTCDate() + 4 - day);
    var yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
    var week = Math.ceil((((utc - yearStart) / 86400000) + 1) / 7);
    return "W-" + String(week).padStart(2, "0");
  }

  function esc(text) {
    if (text == null) return "";
    text = String(text);
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function hide(el) { if (el) el.classList.add("hidden"); }
  function show(el) { if (el) el.classList.remove("hidden"); }

  function api(method, path, body) {
    var opts = { method: method, headers: { "Content-Type": "application/json" } };
    if (body) opts.body = JSON.stringify(body);
    return fetch(path, opts).then(function(r) { return r.json().then(function(d) { return { ok: r.ok, status: r.status, data: d }; }); });
  }

  /* ===================== POPUPS (SweetAlert2) ===================== */
  var hasSwal = typeof window.Swal !== "undefined";
  var METSO_BLUE = "#0077b7";
  var METSO_ORANGE = "#ff6a13";
  var DANGER_RED = "#d33";

  function notify(type, message, title) {
    if (!message) return;
    if (!hasSwal) { try { window.__nativeAlert ? window.__nativeAlert(message) : console.log(message); } catch (e) {} return; }
    var titles = { success: "Listo", error: "Error", warning: "Atencion", info: "Informacion" };
    Swal.fire({
      title: title || titles[type] || "Aviso",
      text: message,
      icon: type === "error" || type === "warning" || type === "info" ? type : "success",
      confirmButtonText: "Aceptar",
      confirmButtonColor: METSO_BLUE,
      timer: type === "success" ? 2200 : undefined,
      timerProgressBar: type === "success",
      showConfirmButton: type !== "success"
    });
  }

  function detectAlertType(message) {
    var text = String(message || "").toLowerCase();
    if (/error|fall|invalid|fuera de rango|incorrecto|no fue posible|no se pudo|no fue|formato/.test(text)) return "error";
    if (/seleccione|cargue|preparado|atencion|aviso|primero|debe |faltan/.test(text)) return "warning";
    if (/guardado|guardada|eliminad|agregad|actualizad|creado|creada|exportado|cargad|listo|exito|exitosa|registrad|fecha actualizada/.test(text)) return "success";
    return "info";
  }

  function confirmDialog(message, options) {
    options = options || {};
    if (!hasSwal) { try { return Promise.resolve(window.__nativeConfirm ? window.__nativeConfirm(message) : true); } catch (e) { return Promise.resolve(true); } }
    return Swal.fire({
      title: options.title || "Confirmar accion",
      text: message,
      icon: options.icon || "warning",
      showCancelButton: true,
      confirmButtonColor: options.danger === false ? METSO_BLUE : DANGER_RED,
      cancelButtonColor: "#6c757d",
      confirmButtonText: options.confirmText || "Si, continuar",
      cancelButtonText: options.cancelText || "Cancelar",
      reverseButtons: true,
      focusCancel: true
    }).then(function(r) { return !!r.isConfirmed; });
  }

  function promptDialog(message, options) {
    options = options || {};
    if (!hasSwal) { try { var v = window.__nativePrompt ? window.__nativePrompt(message, options.defaultValue || "") : null; return Promise.resolve(v ? v.trim() : null); } catch (e) { return Promise.resolve(null); } }
    return Swal.fire({
      title: options.title || "Ingresar dato",
      text: message,
      input: options.input || "text",
      inputValue: options.defaultValue || "",
      inputPlaceholder: options.placeholder || "",
      showCancelButton: true,
      confirmButtonColor: METSO_BLUE,
      cancelButtonColor: "#6c757d",
      confirmButtonText: options.confirmText || "Aceptar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      inputValidator: options.validator
    }).then(function(r) { return r.isConfirmed ? String(r.value || "").trim() : null; });
  }

  if (hasSwal) {
    window.__nativeAlert = window.alert.bind(window);
    window.__nativeConfirm = window.confirm.bind(window);
    window.__nativePrompt = window.prompt.bind(window);
    window.alert = function(msg) { notify(detectAlertType(msg), String(msg == null ? "" : msg)); };
  }

loginForm.onsubmit = function(e) {
    e.preventDefault();
    loginError.textContent = "";
    var username = document.getElementById("username").value.trim();
    var password = document.getElementById("password").value;
    if (!username) { loginError.textContent = "Seleccione un usuario."; return; }
    fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username, password: password })
    }).then(function(r) {
      if (!r.ok) {
        return r.json().catch(function() { return {}; }).then(function(d) { throw new Error(d.error || "Error de autenticacion."); });
      }
      return r.json();
    }).then(function(data) {
      if (!data.ok) { loginError.textContent = data.error || "Error."; return; }
      currentUser = data.user;
      document.getElementById("password").value = "";
      hide(loginScreen);
      showWeekChooser();
    }).catch(function(err) { loginError.textContent = err.message || "Error de conexion."; });
  };

  logoutBtn.onclick = function() {
    hide(appScreen);
    hide(weekChooserScreen);
    show(loginScreen);
    currentUser = null;
    report = null;
    refreshUsers();
  };

  if (userManageBtn) userManageBtn.onclick = showUserManager;
  var openRegisterBtn = document.getElementById("openRegisterBtn");
  if (openRegisterBtn) openRegisterBtn.onclick = function() { showUserManager(false); };

  /* ===================== WEEK CHOOSER ===================== */
  var weekChooserScreen = document.getElementById("weekChooserScreen");
  var weekChooserUserLabel = document.getElementById("weekChooserUser");
  var existingWeekSelect = document.getElementById("existingWeekSelect");
  var deleteWeekSelect = document.getElementById("deleteWeekSelect");
  var enterWeekBtn = document.getElementById("enterWeekBtn");
  var deleteWeekChooserBtn = document.getElementById("deleteWeekChooserBtn");
  var createWeekBtn = document.getElementById("createWeekBtn");
  var weekChooserBack = document.getElementById("weekChooserBack");
  var changeWeekBtn = document.getElementById("changeWeekBtn");
  var changeWeekLabel = document.getElementById("changeWeekLabel");

  if (existingWeekSelect && enterWeekBtn) {
    existingWeekSelect.onchange = function() {
      enterWeekBtn.disabled = !existingWeekSelect.value;
    };
    enterWeekBtn.onclick = function() {
      var w = existingWeekSelect.value;
      if (!w) { notify("warning", "Selecciona una semana de la lista."); return; }
      enterWorkWeek(w);
    };
  }
  if (deleteWeekSelect && deleteWeekChooserBtn) {
    deleteWeekSelect.onchange = function() {
      var opt = deleteWeekSelect.options[deleteWeekSelect.selectedIndex];
      var canDelete = opt && opt.dataset.canDelete === "true";
      deleteWeekChooserBtn.disabled = !deleteWeekSelect.value || !canDelete;
      if (deleteWeekSelect.value && !canDelete) notify("warning", "Solo el creador o administrador puede eliminar esta semana.");
    };
    deleteWeekChooserBtn.onclick = deleteWeekFromChooser;
  }
  if (createWeekBtn) createWeekBtn.onclick = function() { createNewWeek(); };
  if (weekChooserBack) weekChooserBack.onclick = function() {
    hide(weekChooserScreen);
    show(loginScreen);
    currentUser = null;
    refreshUsers();
  };
  if (changeWeekBtn) changeWeekBtn.onclick = function() {
    if (!currentUser) return;
    hide(appScreen);
    showWeekChooser();
  };

  function showWeekChooser() {
    if (!weekChooserScreen) { enterWorkWeek(getWeekNumber()); return; }
    if (weekChooserUserLabel) weekChooserUserLabel.textContent = currentUser ? (currentUser.fullName || currentUser.username) : "-";
    show(weekChooserScreen);
    refreshWeekChooserList();
  }

  function refreshWeekChooserList() {
    if (!existingWeekSelect && !deleteWeekSelect) return;
    fetch("/api/weeks?username=" + encodeURIComponent(currentUser ? currentUser.username : "")).then(function(r) { return r.json(); }).then(function(weeks) {
      if (existingWeekSelect) existingWeekSelect.innerHTML = "<option value=\"\">-- Seleccionar semana --</option>";
      if (deleteWeekSelect) deleteWeekSelect.innerHTML = "<option value=\"\">-- Seleccionar semana --</option>";
      (weeks || []).forEach(function(w) {
        var by = w.createdBy ? " (por " + w.createdBy + ")" : "";
        if (existingWeekSelect) {
          var enterOpt = document.createElement("option");
          enterOpt.value = w.week;
          enterOpt.textContent = w.week + by;
          existingWeekSelect.appendChild(enterOpt);
        }
        if (deleteWeekSelect) {
          var deleteOpt = document.createElement("option");
          deleteOpt.value = w.week;
          deleteOpt.dataset.canDelete = w.canDelete ? "true" : "false";
          deleteOpt.textContent = w.week + by + (w.canDelete ? "" : " - sin permiso");
          deleteWeekSelect.appendChild(deleteOpt);
        }
      });
      if (enterWeekBtn) enterWeekBtn.disabled = true;
      if (deleteWeekChooserBtn) deleteWeekChooserBtn.disabled = true;
    });
  }

  function deleteWeekFromChooser() {
    if (!deleteWeekSelect || !deleteWeekSelect.value) {
      notify("warning", "Selecciona una semana para eliminar.");
      return;
    }
    var week = deleteWeekSelect.value;
    var opt = deleteWeekSelect.options[deleteWeekSelect.selectedIndex];
    if (!opt || opt.dataset.canDelete !== "true") {
      notify("warning", "Solo el creador o administrador puede eliminar esta semana.");
      return;
    }
    confirmDialog("Se eliminaran TODOS los datos de la semana " + week + " (mantenciones, emergentes, mejoras, plan, aforos y ecuaciones). Esta accion no se puede deshacer.", { title: "Eliminar semana " + week }).then(function(ok) {
      if (!ok) return;
      fetch("/api/report/week?week=" + encodeURIComponent(week) + "&username=" + encodeURIComponent(currentUser ? currentUser.username : ""), { method: "DELETE" })
        .then(function(r) { return r.json().then(function(data) { return { ok: r.ok, data: data }; }); })
        .then(function(result) {
          if (!result.ok) {
            notify("error", (result.data && result.data.error) || "No fue posible eliminar la semana.");
            return;
          }
          if (weekInput && weekInput.value === week) weekInput.value = "";
          if (report && report.week === week) report = null;
          refreshWeekChooserList();
          loadWeeks();
          notify("success", "Semana eliminada correctamente.");
        })
        .catch(function() { notify("error", "No fue posible eliminar la semana."); });
    });
  }

  function isValidWeekLabel(value) {
    return /^W-?\d{1,2}$/i.test(String(value || "").trim());
  }

  function normalizeWeekLabel(value) {
    var clean = String(value || "").trim().toUpperCase().replace(/^W-?/, "");
    var num = parseInt(clean, 10);
    if (!num || num < 1 || num > 53) return "";
    return "W-" + String(num).padStart(2, "0");
  }

  function createNewWeek() {
    var suggested = getWeekNumber();
    promptDialog("Indique la semana en formato W-XX (ej: W-19). Sugerencia: " + suggested, {
      title: "Crear nueva semana",
      placeholder: "W-XX",
      defaultValue: suggested,
      confirmText: "Crear",
      validator: function(value) {
        return isValidWeekLabel(value) ? null : "Formato invalido. Use W seguido de un numero (ej: W-19).";
      }
    }).then(function(value) {
      if (!value) return;
      var week = normalizeWeekLabel(value);
      fetch("/api/weeks?username=" + encodeURIComponent(currentUser ? currentUser.username : "")).then(function(r) { return r.json(); }).then(function(weeks) {
        var exists = (weeks || []).some(function(w) { return w.week === week; });
        if (exists) {
          confirmDialog("La semana " + week + " ya existe. Quieres ingresar a esa semana?", {
            title: "Semana existente",
            icon: "info",
            confirmText: "Si, ingresar",
            danger: false
          }).then(function(ok) { if (ok) enterWorkWeek(week); });
          return;
        }
        enterWorkWeek(week);
      });
    });
  }

  function enterWorkWeek(week) {
    if (!week) return;
    setActiveWeek(week);
    hide(weekChooserScreen);
    hide(loginScreen);
    show(appScreen);
    loadWeeks();
    loadReport();
    loadThermoDates();
    populateThermoStatsSelects();
    loadFlowCatalog();
    loadWeeklyPlan();
    loadAforos();
    loadEquations();
    setTimeout(function() {
      if (weekInput.value === week) loadWeeklyPlan();
    }, 50);
  }

  function setActiveWeek(week) {
    weekInput.value = week;
    if (changeWeekLabel) changeWeekLabel.textContent = week;
    report = null;
    planData = null;
    aforoData = null;
    equationList = [];
    equationCanEdit = null;
    thermoData = null;
    var planTable = document.getElementById("planTable");
    if (planTable) planTable.innerHTML = '<p style="color:#888;padding:20px">Seleccione Plan semanal para cargar los datos de la semana.</p>';
    var aforoContent = document.getElementById("aforoContent");
    if (aforoContent) aforoContent.innerHTML = '<div class="card"><p style="color:#888;padding:20px">Cargando aforos...</p></div>';
    var equationListEl = document.getElementById("equationList");
    if (equationListEl) equationListEl.innerHTML = '<p style="color:#888;padding:20px">Cargando ecuaciones...</p>';
  }

  document.querySelectorAll(".tab").forEach(function(tab) {
    tab.onclick = function() {
      document.querySelectorAll(".tab").forEach(function(b) { b.classList.remove("active"); });
      document.querySelectorAll(".section").forEach(function(s) { s.classList.remove("active-section"); });
      tab.classList.add("active");
      var target = document.getElementById(tab.dataset.section);
      if (target) target.classList.add("active-section");
      if (sectionTitle) sectionTitle.textContent = tab.textContent;
      var metricsEl = document.querySelector(".metrics");
      if (metricsEl) metricsEl.classList.toggle("hidden", tab.dataset.section !== "mantencion");
      if (tab.dataset.section === "plan") {
        loadWeeklyPlan();
      }
      if (tab.dataset.section === "aforos") {
        if (aforoData) renderAforos(); else loadAforos();
      }
      if (tab.dataset.section === "termografias") {
        if (thermoActivePanel === "stats") activateThermoStatsPanel();
        else populateThermoStatsSelects();
      }
      if (tab.dataset.section === "control") {
        if (!flowCatalog || !flowCatalog.tags || !flowCatalog.tags.length) loadFlowCatalog();
        else equationsPopulateTagSelect();
      }
      if (tab.dataset.section === "informes") {
        initInformes();
      }
    };
  });

  document.querySelectorAll(".plant-tab").forEach(function(tab) {
    tab.onclick = function() {
      document.querySelectorAll(".plant-tab").forEach(function(b) { b.classList.remove("active"); });
      tab.classList.add("active");
      activePlant = tab.dataset.plant;
      selectedMaintenanceId = null;
      selectedActivityIds = { emergente: null, mejora: null };
      renderPlant();
      updateMetrics();
    };
  });

  document.querySelectorAll(".work-tab").forEach(function(tab) {
    tab.onclick = function() {
      document.querySelectorAll(".work-tab").forEach(function(b) { b.classList.remove("active"); });
      document.querySelectorAll(".work-panel").forEach(function(p) { p.classList.remove("active-work-panel"); });
      tab.classList.add("active");
      var panel = document.querySelector('.work-panel[data-work-panel="' + tab.dataset.workSection + '"]');
      if (panel) panel.classList.add("active-work-panel");
    };
  });

  weekInput.onchange = function() { setActiveWeek(weekInput.value); loadReport(); loadThermoDates(); loadWeeklyPlan(); loadAforos(); loadEquations(); };
  weekFilter.onchange = function() {
    if (!weekFilter.value) return;
    setActiveWeek(weekFilter.value);
    loadReport();
    loadThermoDates();
    loadWeeklyPlan();
    loadAforos();
    loadEquations();
  };

  if (emergencyForm) emergencyForm.onsubmit = submitActivity;
  if (improvementForm) improvementForm.onsubmit = submitActivity;
  setupActivityPhotoPreview(emergencyForm);
  setupActivityPhotoPreview(improvementForm);

  if (emergencyForm) {
    emergencyForm.querySelector(".activity-cancel").onclick = function() { resetActivityForm(emergencyForm); };
    emergencyForm.querySelector(".activity-delete").onclick = function() {
      if (!emergencyForm.dataset.activityId) return;
      deleteActivity(Number(emergencyForm.dataset.activityId), "emergente");
    };
  }
  if (improvementForm) {
    improvementForm.querySelector(".activity-cancel").onclick = function() { resetActivityForm(improvementForm); };
    improvementForm.querySelector(".activity-delete").onclick = function() {
      if (!improvementForm.dataset.activityId) return;
      deleteActivity(Number(improvementForm.dataset.activityId), "mejora");
    };
  }

  if (deleteWeekBtn) deleteWeekBtn.onclick = deleteCurrentWeek;

  var thermoDateSelect = document.getElementById("thermoDateSelect");
  var thermoLoadBtn = document.getElementById("thermoLoadBtn");
  var thermoNewBtn = document.getElementById("thermoNewBtn");
  var thermoChangeDateBtn = document.getElementById("thermoChangeDateBtn");
  var thermoDeleteDateBtn = document.getElementById("thermoDeleteDateBtn");
  var thermoColectivaTable = document.getElementById("thermoColectivaTable");
  var thermoSelectivaTable = document.getElementById("thermoSelectivaTable");
  var thermoStatsColectiva = document.getElementById("thermoStatsColectiva");
  var thermoStatsSelectiva = document.getElementById("thermoStatsSelectiva");

  if (thermoLoadBtn) thermoLoadBtn.onclick = function() {
    if (thermoDateSelect && thermoDateSelect.value) loadThermoData(thermoDateSelect.value);
  };
  if (thermoNewBtn) thermoNewBtn.onclick = newThermoRecord;
  if (thermoChangeDateBtn) thermoChangeDateBtn.onclick = changeThermoDate;
  if (thermoDeleteDateBtn) thermoDeleteDateBtn.onclick = deleteThermoDate;

  document.querySelectorAll(".thermo-tab").forEach(function(tab) {
    tab.onclick = function() {
      document.querySelectorAll(".thermo-tab").forEach(function(b) { b.classList.remove("active"); });
      document.querySelectorAll(".thermo-panel").forEach(function(p) { p.classList.remove("active-thermo-panel"); });
      tab.classList.add("active");
      thermoActivePanel = tab.dataset.thermoPanel;
      var panel = document.querySelector('.thermo-panel[data-thermo-panel="' + thermoActivePanel + '"]');
      if (panel) panel.classList.add("active-thermo-panel");
      if (thermoActivePanel === "stats") activateThermoStatsPanel();
    };
  });

  document.querySelectorAll("[data-thermo-save]").forEach(function(btn) {
    btn.onclick = function() { saveThermoData(btn.dataset.thermoSave); };
  });

  document.querySelectorAll("[data-thermo-export]").forEach(function(btn) {
    btn.onclick = function() { exportThermo(btn.dataset.thermoExport); };
  });

  window.metsoLoadThermoStats = loadThermoStats;
  if (thermoStatsColectiva) {
    thermoStatsColectiva.onchange = function() { loadThermoStats("colectiva", thermoStatsColectiva.value); };
    thermoStatsColectiva.addEventListener("input", function() { loadThermoStats("colectiva", thermoStatsColectiva.value); });
  }
  if (thermoStatsSelectiva) {
    thermoStatsSelectiva.onchange = function() { loadThermoStats("selectiva", thermoStatsSelectiva.value); };
    thermoStatsSelectiva.addEventListener("input", function() { loadThermoStats("selectiva", thermoStatsSelectiva.value); });
  }

  document.querySelectorAll(".plan-plant-tab").forEach(function(tab) {
    tab.onclick = function() {
      document.querySelectorAll(".plan-plant-tab").forEach(function(b) { b.classList.remove("active"); });
      tab.classList.add("active");
      planActivePlant = tab.dataset.planPlant;
      renderPlanTable();
    };
  });

  var equationForm = document.getElementById("equationForm");
  var equationDeleteBtn = document.getElementById("equationDeleteBtn");

  if (equationDeleteBtn) equationDeleteBtn.onclick = function() {
    var idInput = equationForm ? equationForm.querySelector('[name="id"]') : null;
    var id = idInput ? Number(idInput.value) : 0;
    if (!id) return;
    confirmDialog("Esta accion eliminara el registro de ecuacion/offset seleccionado.", { title: "Eliminar registro" }).then(function(ok) {
      if (!ok) return;
      api("DELETE", "/api/equations/" + id + "?week=" + encodeURIComponent(weekInput.value) + "&username=" + encodeURIComponent(currentUser.username))
        .then(function(r) {
          if (r.ok) { resetEquationForm(); loadEquations(); notify("success", "Registro eliminado."); }
          else notify("error", r.data.error || "No fue posible eliminar.");
        });
    });
  };
  if (equationForm) {
    equationForm.onsubmit = submitEquationForm;
    /* Event delegation: el handler vive en el form, sobrevive a reemplazos del select */
    equationForm.addEventListener("change", function(e) {
      if (e.target && e.target.name === "tagKey") {
        window.metsoTagChange(e.target.value);
      }
    });
    equationForm.addEventListener("input", function(e) {
      if (e.target && e.target.name === "tagKey") {
        window.metsoTagChange(e.target.value);
      }
    });
    var equationOffsetInput = equationForm.querySelector('[name="offset"]');
    if (equationOffsetInput) equationOffsetInput.oninput = syncEquationMode;
    equationForm.querySelectorAll('input[name="elements"]').forEach(function(cb) {
      cb.onchange = function() {
        var offsetInput = equationForm.querySelector('[name="offset"]');
        if (cb.checked && offsetInput) offsetInput.value = "";
        syncEquationMode();
      };
    });
  }

  function loadWeeks() {
    fetch("/api/weeks?username=" + encodeURIComponent(currentUser ? currentUser.username : "")).then(function(r) { return r.json(); }).then(function(weeks) {
      weekFilter.innerHTML = "<option value=\"\">Semanas guardadas</option>";
      weeks.forEach(function(w) {
        var o1 = document.createElement("option");
        o1.value = w.week;
        o1.textContent = w.week;
        weekFilter.appendChild(o1);
      });
    });
  }

  function loadReport() {
    var week = weekInput.value.trim() || getWeekNumber();
    weekInput.value = week;
    fetch("/api/report?week=" + encodeURIComponent(week) + "&username=" + encodeURIComponent(currentUser ? currentUser.username : "")).then(function(r) { return r.json(); }).then(function(data) {
      report = data;
      renderPlant();
      renderWeekControl();
      updateMetrics();
    });
  }

  function renderPlant() {
    if (!report || !report.plants) return;
    var plant = report.plants[activePlant];
    if (!plant) return;
    renderMaintenance(plant.maintenance || []);
    renderActivities(emergencyList, plant.emergencies || [], "emergente");
    renderActivities(improvementList, plant.improvements || [], "mejora");
    updateMetrics();
  }

  function renderMaintenance(items) {
    if (!maintenanceList) return;
    maintenanceList.innerHTML = "";
    if (items.length === 0) {
      maintenanceList.innerHTML = "<p style=\"color:#888;padding:20px\">No hay mantenciones precargadas.</p>";
      return;
    }
    if (!selectedMaintenanceId || !items.some(function(i) { return i.id === selectedMaintenanceId; })) {
      selectedMaintenanceId = items[0].id;
    }
    var selected = items.find(function(i) { return i.id === selectedMaintenanceId; }) || items[0];
    var canEdit = currentWeekCanEdit();

    var html = '<div class="maintenance-picker"><div class="equipment-status-list">';
    items.forEach(function(item) {
      var status = item.completed ? "Terminado" : (item.date ? "Pendiente" : "Sin iniciar");
      html += '<button class="equipment-status ' + (item.completed ? "completed" : "pending") + (item.id === selected.id ? " active" : "") + '" data-template-id="' + item.id + '" type="button">' +
        '<span>' + esc(item.equipment) + '</span><strong>' + status + '</strong></button>';
    });
    html += '</div></div>';
    maintenanceList.innerHTML = html;

    var btns = maintenanceList.querySelectorAll(".equipment-status");
    for (var i = 0; i < btns.length; i++) {
      btns[i].onclick = (function(id) { return function() {
        selectedMaintenanceId = Number(id);
        renderMaintenance(items);
      }; })(btns[i].dataset.templateId);
    }

    var card = document.createElement("article");
    card.className = "card template-card selected-template";
    card.innerHTML =
      '<div class="card-title"><div><p class="label-top">Plantilla</p><h3>' + esc(selected.equipment) + '</h3><span>TAG: ' + esc(selected.tag) + '</span></div><span class="badge">OT ' + esc(selected.workOrder || selected.defaultOt || "S/O") + '</span></div>' +
      '<p>' + esc(selected.description) + '</p>' +
      '<form class="maintenance-form" data-template-id="' + selected.id + '">' +
      '<label class="check-row wide"><input name="completed" type="checkbox" ' + (selected.completed ? "checked" : "") + ' /> Mantencion realizada</label>' +
      '<label>Fecha<input name="date" type="date" value="' + esc(selected.date || "") + '"/></label>' +
      '<label>OT<input name="workOrder" type="text" value="' + esc(selected.workOrder || "") + '"/></label>' +
      '<label class="wide">Fotos<input name="photos" type="file" accept="image/*" multiple/></label>' +
      '<button class="primary-button" type="submit">Guardar</button>' +
      '</form>' +
      '<div class="photo-grid editable-photos"></div>';
    maintenanceList.appendChild(card);

    var form = card.querySelector(".maintenance-form");
    var photoGrid = card.querySelector(".editable-photos");
    renderPhotoGrid(photoGrid, selected.photos || [], canEdit);
    setupMaintenancePhotoPreview(form, photoGrid);
    setFormEnabled(form, canEdit);
    if (!canEdit) {
      var saveBtn = form.querySelector('button[type="submit"]');
      if (saveBtn) saveBtn.classList.add("hidden");
    }

    form.onsubmit = function(e) {
      e.preventDefault();
      submitMaintenanceForm(form, selected.id);
    };
  }

  function renderActivities(container, items, type) {
    if (!container) return;
    var form = type === "emergente" ? emergencyForm : improvementForm;
    var editingId = selectedActivityIds[type];
    var canEdit = currentWeekCanEdit();
    container.innerHTML = items.length === 0 ? '<p style="color:#888;padding:10px 20px">No hay actividades.</p>' : "";
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var isEditing = item.id === editingId;
      var div = document.createElement("article");
      var otHtml = '<div class="activity-ot-summary"><span><strong>OT</strong>' + esc(item.workOrder || "-") + '</span><span><strong>OT SGSCM</strong>' + esc(item.workOrderSgscm || "-") + '</span></div>';
      div.className = "record-card activity-card-tone-" + (i % 2 === 0 ? "a" : "b") + (isEditing ? " selected-template" : "");
      div.innerHTML =
        '<div class="template-head"><div><strong>' + esc(item.equipment) + '</strong><span>TAG: ' + esc(item.tag || "") + '</span></div>' +
        '<span class="status-pill ' + (item.completed ? "completed" : "pending") + '">' + (item.completed ? "Terminado" : "Pendiente") + '</span></div>' +
        otHtml +
        '<p>' + esc(item.description) + '</p>' +
        '<div class="activity-card-actions">' +
        '<button class="soft-button table-action activity-edit-action" type="button"' + (canEdit ? "" : " disabled") + '>' + (isEditing ? "Editando..." : "Editar") + '</button>' +
        '<button class="danger-button table-action activity-delete-action" type="button"' + (canEdit ? "" : " disabled") + '>Eliminar</button>' +
        '</div>';
      container.appendChild(div);
      div.querySelector(".activity-edit-action").onclick = (function(itm, editing) { return function() {
        if (!canEdit) return;
        selectedActivityIds[type] = editing ? null : itm.id;
        if (editing) {
          resetActivityForm(form);
        } else {
          loadActivityIntoForm(form, itm);
        }
        renderPlant();
      }; })(item, isEditing);
      div.querySelector(".activity-delete-action").onclick = (function(itm) { return function() {
        if (!canEdit) return;
        deleteActivity(Number(itm.id), type);
      }; })(item);
    }

    if (form) {
      setFormEnabled(form, canEdit);
      var tagButton = getActivityTagButton(form);
      if (tagButton) tagButton.textContent = getSelectedTagLabel(form.elements.tag.value);
      renderActivityPhotoGrid(form, getActivityPhotos(form), getActivityPendingPhotos(form), canEdit);
    }
  }

  function submitMaintenanceForm(form, templateId, silent) {
    var card = form.closest(".template-card");
    var existingPhotos = getExistingPhotoSources(card ? card.querySelector(".editable-photos") : null);
    setMaintenanceState(card, "Guardando...", "pending");
    readFilesAsDataUrls(form.elements.photos.files).then(function(newPhotos) {
      var payload = {
        week: weekInput.value,
        username: currentUser.username,
        templateId: templateId,
        date: form.elements.date.value,
        workOrder: form.elements.workOrder.value,
        completed: form.elements.completed.checked,
        photos: existingPhotos.concat(newPhotos)
      };
      fetch("/api/maintenance/" + templateId, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).then(function(r) { return r.json(); }).then(function(data) {
        if (data && data.error) {
          setMaintenanceState(card, "Error al guardar", "error");
          if (!silent) alert(data.error);
          return;
        }
        setMaintenanceState(card, "Guardado " + new Date().toLocaleTimeString(), "ok");
        if (!silent) notify("success", "Archivos guardados correctamente.");
        if (!silent) loadReport();
      }).catch(function(err) {
        setMaintenanceState(card, "Sin conexion", "error");
        if (!silent) alert(err && err.message ? err.message : "Error.");
      });
    }).catch(function(err) {
      setMaintenanceState(card, "Error fotos", "error");
      if (!silent) alert(err && err.message ? err.message : "No fue posible procesar las fotos.");
    });
  }

  function setMaintenanceState(card, text, kind) {
    if (!card) return;
    var el = card.querySelector(".maintenance-save-state");
    if (!el) return;
    el.textContent = text;
    el.className = "hint aforo-save-state maintenance-save-state" + (kind ? " " + kind : "");
  }

  var maintSaveTimers = {};
  function scheduleMaintenanceAutoSave(form, templateId) {
    if (maintSaveTimers[templateId]) clearTimeout(maintSaveTimers[templateId]);
    var card = form.closest(".template-card");
    setMaintenanceState(card, "Cambios sin guardar", "pending");
    maintSaveTimers[templateId] = setTimeout(function() { submitMaintenanceForm(form, templateId, true); }, 700);
  }

  function submitActivity(e) {
    e.preventDefault();
    var form = e.target;
    var type = form.dataset.type;
    var isEditing = form.dataset.activityId && form.dataset.activityId !== "";
    var existingPhotos = getActivityPhotos(form);
    var pendingPhotos = getActivityPendingPhotos(form);
    var hasPendingPhotoState = Array.isArray(form.__pendingActivityPhotos);
    var photosPromise = hasPendingPhotoState ? Promise.resolve(pendingPhotos) : readFilesAsDataUrls(form.elements.photos.files);
    photosPromise.then(function(newPhotos) {
      var payload = {
        week: weekInput.value,
        username: currentUser.username,
        plant: activePlant,
        activityType: type,
        date: form.elements.date.value,
        equipment: form.elements.equipment.value,
        tag: form.elements.tag.value,
        workOrder: form.elements.workOrder.value,
        workOrderSgscm: form.elements.workOrderSgscm ? form.elements.workOrderSgscm.value : "",
        description: form.elements.description.value,
        completed: form.elements.completed.checked,
        photos: existingPhotos.concat(newPhotos)
      };
      var url = isEditing ? "/api/activities/" + form.dataset.activityId : "/api/activities";
      fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).then(function(r) { return r.json(); }).then(function(data) {
        if (data && data.error) {
          alert(data.error);
          return;
        }
        notify("success", "Archivos guardados correctamente.");
        selectedActivityIds[type] = null;
        resetActivityForm(form);
        loadReport();
      }).catch(function(err) { alert(err && err.message ? err.message : "Error."); });
    }).catch(function(err) {
      alert(err && err.message ? err.message : "No fue posible procesar las fotos.");
    });
  }

  function deleteActivity(id, type) {
    var label = type === "emergente" ? "esta actividad emergente" : "esta mejora";
    confirmDialog("Esta accion eliminara " + label + " junto con sus fotos.", { title: "Eliminar actividad" }).then(function(ok) {
      if (!ok) return;
      fetch("/api/activities/" + id + "?week=" + encodeURIComponent(weekInput.value) + "&username=" + encodeURIComponent(currentUser.username), { method: "DELETE" }).then(function(r) { return r.json(); }).then(function(data) {
        if (data && data.error) { notify("error", data.error); return; }
        selectedActivityIds[type] = null;
        resetActivityForm(type === "emergente" ? emergencyForm : improvementForm);
        loadReport();
        notify("success", "Actividad eliminada.");
      }).catch(function() { notify("error", "No fue posible eliminar la actividad."); });
    });
  }

  function resetActivityForm(form) {
    if (!form) return;
    form.reset();
    form.dataset.activityId = "";
    var type = form.dataset.type;
    var btn = form.querySelector(".activity-submit");
    if (btn) btn.textContent = type === "emergente" ? "Agregar mantencion emergente" : "Agregar mejora";
    var cb = form.querySelector(".activity-cancel");
    if (cb) cb.style.display = "none";
    var db = form.querySelector(".activity-delete");
    if (db) db.style.display = "none";
    var grid = getActivityPhotoGrid(form);
    form.__pendingActivityPhotos = [];
    if (form.elements.photos) form.elements.photos.value = "";
    renderActivityPhotoGrid(form, [], [], currentWeekCanEdit());
    var tagButton = getActivityTagButton(form);
    if (tagButton) tagButton.textContent = "Seleccione TAG";
  }

  function loadActivityIntoForm(form, item) {
    if (!form) return;
    form.dataset.activityId = item.id;
    form.elements.date.value = item.date || "";
    form.elements.equipment.value = item.equipment || "";
    form.elements.tag.value = item.tag || "";
    form.elements.workOrder.value = item.workOrder || "";
    if (form.elements.workOrderSgscm) form.elements.workOrderSgscm.value = item.workOrderSgscm || "";
    form.elements.description.value = item.description || "";
    form.elements.completed.checked = item.completed || false;
    form.__pendingActivityPhotos = [];
    if (form.elements.photos) form.elements.photos.value = "";
    var btn = form.querySelector(".activity-submit");
    if (btn) btn.textContent = "Guardar cambios";
    var cb = form.querySelector(".activity-cancel");
    if (cb) cb.style.display = "";
    var db = form.querySelector(".activity-delete");
    if (db) db.style.display = "";
    renderActivityPhotoGrid(form, item.photos || [], [], currentWeekCanEdit());
    var tagButton = getActivityTagButton(form);
    if (tagButton) tagButton.textContent = getSelectedTagLabel(item.tag || "");
  }

  function renderWeekControl() {
    if (!report || !workWeekControl) return;
    show(workWeekControl);
    if (activeWeekLabel) activeWeekLabel.textContent = report.week || weekInput.value;
    if (responsibleLabel) responsibleLabel.textContent = (report.meta && report.meta.createdBy) ? report.meta.createdBy : "-";
    var permissionLabel = document.getElementById("weekPermissionLabel");
    if (permissionLabel) permissionLabel.textContent = currentWeekCanEdit() ? "Puede editar esta semana." : "Semana en modo solo lectura.";
    if (deleteWeekBtn) deleteWeekBtn.disabled = !(report.meta && report.meta.canDelete);
  }

  function updateMetrics() {
    if (!report || !report.plants) return;
    var plant = report.plants[activePlant];
    if (!plant) return;
    var total = (plant.maintenance || []).length;
    var done = (plant.maintenance || []).filter(function(i) { return i.completed; }).length;
    if (metricMaintenance) metricMaintenance.textContent = done + "/" + total;
    if (metricEmergencies) metricEmergencies.textContent = (plant.emergencies || []).length;
    if (metricImprovements) metricImprovements.textContent = (plant.improvements || []).length;
  }

  function deleteCurrentWeek() {
    if (!report) return;
    confirmDialog("Se eliminaran TODOS los datos de la semana " + report.week + " (mantenciones, emergentes, mejoras, plan, aforos y ecuaciones). Esta accion no se puede deshacer.", { title: "Eliminar semana " + report.week }).then(function(ok) {
      if (!ok) return;
      fetch("/api/report/week?week=" + encodeURIComponent(report.week) + "&username=" + encodeURIComponent(currentUser.username), { method: "DELETE" }).then(function(r) { return r.json().then(function(data) { return { ok: r.ok, data: data }; }); }).then(function(result) {
        if (!result.ok) { notify("error", (result.data && result.data.error) || "No fue posible eliminar la semana."); return; }
        weekInput.value = "";
        report = null;
        hide(workWeekControl);
        loadWeeks();
        notify("success", "Semana eliminada correctamente.");
      }).catch(function() { notify("error", "No fue posible eliminar la semana."); });
    });
  }

  function showUserManager(forceCreate) {
    if (!forceCreate && (!users || users.length === 0)) {
      refreshUsers(function() { showUserManager(forceCreate); });
      return;
    }
    var tmpl = document.getElementById("userManagerTemplate");
    if (!tmpl) return;
    var clone = tmpl.content.cloneNode(true);
    var form = clone.querySelector("form");
    var existingSelect = form.elements.existingUser;
    var existingLabel = existingSelect ? existingSelect.closest("label") : null;
    var submitLabel = form.querySelector("[data-submit-label]");
    var deleteBtn = clone.querySelector("[data-delete-user]");

    function refreshSubmitLabel() {
      var isEdit = existingSelect && existingSelect.value;
      if (!submitLabel) return;
      submitLabel.textContent = isEdit ? "Actualizar usuario" : "Agregar usuario";
      if (deleteBtn) {
        if (isEdit) deleteBtn.classList.remove("hidden");
        else deleteBtn.classList.add("hidden");
      }
    }

    if (forceCreate) {
      if (existingLabel) existingLabel.classList.add("hidden");
    } else {
      existingSelect.innerHTML = "<option value=\"\">-- Agregar nuevo usuario --</option>";
      for (var i = 0; i < users.length; i++) {
        var opt = document.createElement("option");
        opt.value = users[i].username;
        opt.textContent = users[i].username + (users[i].cargo || users[i].role ? " - " + (users[i].cargo || users[i].role) : "");
        existingSelect.appendChild(opt);
      }
      existingSelect.onchange = function() {
        var u = null;
        for (var j = 0; j < users.length; j++) { if (users[j].username === existingSelect.value) { u = users[j]; break; } }
        if (u) {
          form.elements.username.value = u.username;
          form.elements.cargo.value = u.cargo || u.role || "Operador mantenedor";
          form.elements.password.value = "";
        } else {
          form.elements.username.value = "";
          form.elements.cargo.value = "Operador mantenedor";
          form.elements.password.value = "";
        }
        refreshSubmitLabel();
      };
    }
    refreshSubmitLabel();

    form.onsubmit = function(e) {
      e.preventDefault();
      var username = form.elements.username.value.trim();
      var password = form.elements.password.value;
      var cargo = form.elements.cargo.value;
      if (!username || !password || !cargo) { notify("warning", "Ingresa usuario, cargo y contrasena."); return; }
      var isEdit = !forceCreate && existingSelect && existingSelect.value;
      var url = isEdit ? "/api/users/" + encodeURIComponent(existingSelect.value) : "/api/users";
      api(isEdit ? "PUT" : "POST", url, { username: username, password: password, cargo: cargo }).then(function(r) {
        if (!r.ok) { notify("error", (r.data && r.data.error) || "No fue posible guardar el usuario."); return; }
        refreshUsers(function() {
          var sel = document.getElementById("username");
          if (sel && sel.tagName === "SELECT") sel.value = username;
        });
        closeModal();
        notify("success", isEdit ? "Usuario actualizado." : "Usuario agregado correctamente.");
      }).catch(function() { notify("error", "Error de conexion."); });
    };
    if (deleteBtn) {
      deleteBtn.onclick = function() {
        var usernameToDelete = existingSelect && existingSelect.value;
        if (!usernameToDelete) return;
        confirmDialog("Esta accion eliminara el usuario " + usernameToDelete + ".", { title: "Eliminar usuario" }).then(function(ok) {
          if (!ok) return;
          api("DELETE", "/api/users/" + encodeURIComponent(usernameToDelete)).then(function(r) {
            if (!r.ok) { notify("error", (r.data && r.data.error) || "No fue posible eliminar el usuario."); return; }
            refreshUsers();
            closeModal();
            notify("success", "Usuario eliminado.");
          }).catch(function() { notify("error", "Error de conexion."); });
        });
      };
    }
    var cancelBtn = clone.querySelector("[data-cancel]");
    if (cancelBtn) cancelBtn.onclick = closeModal;
    showModal(clone);
  }

  function showModal(content) {
    if (!modalOverlay) return;
    modalOverlay.innerHTML = "";
    modalOverlay.appendChild(content);
    modalOverlay.classList.remove("hidden");
    modalOverlay.style.display = "grid";
  }

  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.innerHTML = "";
    modalOverlay.classList.add("hidden");
    modalOverlay.style.display = "";
  }

  /* ===================== TERMOGRAFIAS ===================== */

  function loadThermoDates() {
    fetch("/api/thermography/dates").then(function(r) { return r.json(); }).then(function(dates) {
      if (thermoDateSelect) {
        thermoDateSelect.innerHTML = "<option value=\"\">-- Seleccionar fecha --</option>";
        dates.forEach(function(d) {
          var opt = document.createElement("option");
          opt.value = d;
          opt.textContent = d;
          thermoDateSelect.appendChild(opt);
        });
      }
    });
  }

  function loadThermoData(date) {
    fetch("/api/thermography?date=" + encodeURIComponent(date)).then(function(r) { return r.json(); }).then(function(data) {
      thermoData = data;
      renderThermoTables();
    });
  }

  function newThermoRecord() {
    promptDialog("Formato dd/mm/yy (ejemplo: 15/05/26)", {
      title: "Nuevo registro de termografia",
      placeholder: "dd/mm/yy",
      confirmText: "Crear",
      validator: function(value) {
        return /^\d{2}\/\d{2}\/\d{2}$/.test(String(value || "").trim()) ? null : "Formato invalido. Use dd/mm/yy.";
      }
    }).then(function(date) {
      if (!date) return;
      thermoDateSelect.value = date;
      fetch("/api/thermography?date=" + encodeURIComponent(date)).then(function(r) { return r.json(); }).then(function(data) {
        thermoData = data;
        renderThermoTables();
      });
    });
  }

  var data_pumps = {
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
      { tag: "3511-PP-023", ubicacion: "Rechazo Courier Remolienda" }
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
      { tag: "3811-PP-641", ubicacion: "Rechazo BX634" }
    ]
  };

  function renderThermoTables() {
    if (!thermoData) return;
    renderThermoPlant("colectiva", thermoColectivaTable);
    renderThermoPlant("selectiva", thermoSelectivaTable);
    populateThermoStatsSelects();
  }

  function renderThermoPlant(plant, container) {
    if (!container) return;
    var pumps = thermoData.pumps ? thermoData.pumps[plant] : data_pumps[plant];
    var records = thermoData.plants ? thermoData.plants[plant] : [];
    if (!pumps) { container.innerHTML = ""; return; }

    var isSelectiva = plant === "selectiva";
    var headers = "<tr><th>Bomba / Ubicacion</th><th>V1" + (isSelectiva ? " / Estado" : "") + "</th><th>V2</th><th>V3</th><th>V4</th><th>Sin acceso</th><th>Observacion</th></tr>";
    var rows = pumps.map(function(pump, idx) {
      var rec = null;
      if (records && records.length > 0) {
        rec = records.find(function(r) { return r.tag === pump.tag; }) || records[idx] || {};
      }
      var sa = rec && rec.sinAcceso;
      return '<tr data-thermo-tag="' + esc(pump.tag) + '">' +
        '<td><strong>' + esc(pump.tag) + '</strong><br><span style="color:var(--muted);font-size:.84rem">' + esc(pump.ubicacion) + '</span></td>' +
        '<td><input class="thermo-temp" data-field="v1" value="' + esc(sa ? "" : (rec ? rec.v1 || "" : "")) + '" ' + (sa ? "disabled" : "") + '/></td>' +
        '<td><input class="thermo-temp" data-field="v2" value="' + esc(sa ? "" : (rec ? rec.v2 || "" : "")) + '" ' + (sa ? "disabled" : "") + '/></td>' +
        '<td><input class="thermo-temp" data-field="v3" value="' + esc(sa ? "" : (rec ? rec.v3 || "" : "")) + '" ' + (sa ? "disabled" : "") + '/></td>' +
        '<td><input class="thermo-temp" data-field="v4" value="' + esc(sa ? "" : (rec ? rec.v4 || "" : "")) + '" ' + (sa ? "disabled" : "") + '/></td>' +
        '<td><label class="switch-row"><input type="checkbox" data-field="sinAcceso" ' + (sa ? "checked" : "") + '/><span></span></label></td>' +
        '<td><input type="text" data-field="observacion" value="' + esc(sa ? "Sin acceso" : (rec ? rec.observacion || "" : "")) + '" style="min-width:140px" ' + (sa ? "disabled" : "") + '/></td></tr>';
    }).join("");

    container.innerHTML = '<div class="thermo-table-scroll"><table class="thermo-table">' + headers + rows + '</table></div>';

    container.querySelectorAll('input[data-field="sinAcceso"]').forEach(function(cb) {
      cb.onchange = function() {
        var row = cb.closest("tr");
        var checked = cb.checked;
        row.querySelectorAll('.thermo-temp, input[data-field="observacion"]').forEach(function(inp) {
          inp.disabled = checked;
          if (checked) { if (inp.dataset.field !== "observacion") inp.value = ""; else inp.value = "Sin acceso"; }
        });
        scheduleThermoAutoSave(plant);
      };
    });
    bindThermoAutoSave(container, plant);
  }

  function populateThermoStatsSelects() {
    ["colectiva", "selectiva"].forEach(function(plant) {
      var sel = plant === "colectiva" ? thermoStatsColectiva : thermoStatsSelectiva;
      if (!sel) return;
      var currentVal = sel.value;
      sel.innerHTML = "<option value=\"\">-- Seleccionar bomba --</option>";
      data_pumps[plant].forEach(function(pump) {
        var opt = document.createElement("option");
        opt.value = pump.tag;
        opt.textContent = pump.tag + " - " + pump.ubicacion;
        sel.appendChild(opt);
      });
      sel.value = currentVal;
    });
  }

  function activateThermoStatsPanel() {
    populateThermoStatsSelects();
    ["colectiva", "selectiva"].forEach(function(plant) {
      var sel = plant === "colectiva" ? thermoStatsColectiva : thermoStatsSelectiva;
      if (!sel) return;
      if (!sel.value && data_pumps[plant] && data_pumps[plant][0]) sel.value = data_pumps[plant][0].tag;
      if (sel.value) loadThermoStats(plant, sel.value);
    });
  }

  function saveThermoData(plant, silent) {
    if (!thermoData || !thermoData.date) { if (!silent) alert("Seleccione una fecha primero."); return; }
    var container = plant === "colectiva" ? thermoColectivaTable : thermoSelectivaTable;
    if (!container) return;
    var rows = container.querySelectorAll("tr[data-thermo-tag]");
    var records = [];
    rows.forEach(function(row) {
      var tag = row.dataset.thermoTag;
      var sa = row.querySelector('input[data-field="sinAcceso"]');
      records.push({
        tag: tag,
        sinAcceso: sa ? sa.checked : false,
        v1: row.querySelector('input[data-field="v1"]') ? row.querySelector('input[data-field="v1"]').value : "",
        v2: row.querySelector('input[data-field="v2"]') ? row.querySelector('input[data-field="v2"]').value : "",
        v3: row.querySelector('input[data-field="v3"]') ? row.querySelector('input[data-field="v3"]').value : "",
        v4: row.querySelector('input[data-field="v4"]') ? row.querySelector('input[data-field="v4"]').value : "",
        observacion: row.querySelector('input[data-field="observacion"]') ? row.querySelector('input[data-field="observacion"]').value : ""
      });
    });
    setThermoState(plant, "Guardando...", "pending");
    fetch("/api/thermography", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: thermoData.date, plant: plant, records: records })
    }).then(function(r) { return r.json(); }).then(function(data) {
      if (data.error) {
        setThermoState(plant, "Error al guardar", "error");
        if (!silent) alert(data.error);
        return;
      }
      setThermoState(plant, "Guardado " + new Date().toLocaleTimeString(), "ok");
      if (data.report) thermoData = data.report;
      if (thermoDateSelect) thermoDateSelect.value = thermoData.date;
      if (!silent) loadThermoDates();
    }).catch(function() {
      setThermoState(plant, "Sin conexion", "error");
      if (!silent) alert("Error.");
    });
  }

  var thermoSaveTimers = { colectiva: null, selectiva: null };
  function scheduleThermoAutoSave(plant) {
    if (!thermoData || !thermoData.date) return;
    if (thermoSaveTimers[plant]) clearTimeout(thermoSaveTimers[plant]);
    setThermoState(plant, "Cambios sin guardar", "pending");
    thermoSaveTimers[plant] = setTimeout(function() { saveThermoData(plant, true); }, 700);
  }
  function setThermoState(plant, text, kind) {
    var el = document.getElementById("thermoSaveState_" + plant);
    if (!el) return;
    el.textContent = text;
    el.className = "hint aforo-save-state" + (kind ? " " + kind : "");
  }
  function bindThermoAutoSave(container, plant) {
    if (!container) return;
    container.querySelectorAll('input[data-field]').forEach(function(inp) {
      inp.addEventListener("input", function() { scheduleThermoAutoSave(plant); });
      inp.addEventListener("change", function() { scheduleThermoAutoSave(plant); });
    });
  }

  function changeThermoDate() {
    if (!thermoData || !thermoData.date) { notify("warning", "Cargue un registro primero."); return; }
    var current = thermoData.date;
    promptDialog("Fecha actual: " + current + ". Indique la nueva fecha (dd/mm/yy).", {
      title: "Modificar fecha",
      placeholder: "dd/mm/yy",
      confirmText: "Modificar",
      validator: function(value) {
        return /^\d{2}\/\d{2}\/\d{2}$/.test(String(value || "").trim()) ? null : "Formato invalido. Use dd/mm/yy.";
      }
    }).then(function(newDate) {
      if (!newDate) return;
      api("PUT", "/api/thermography/date", { currentDate: current, newDate: newDate }).then(function(r) {
        if (r.ok) { notify("success", "Fecha actualizada."); loadThermoDates(); thermoData.date = newDate; }
        else notify("error", r.data.error || "No fue posible modificar la fecha.");
      });
    });
  }

  function deleteThermoDate() {
    if (!thermoData || !thermoData.date) { notify("warning", "Cargue un registro primero."); return; }
    var current = thermoData.date;
    confirmDialog("Esta accion eliminara TODOS los registros de termografia de la fecha " + current + ".", { title: "Eliminar fecha " + current }).then(function(ok) {
      if (!ok) return;
      api("DELETE", "/api/thermography/date?date=" + encodeURIComponent(current)).then(function(r) {
        if (r.ok) {
          notify("success", "Registros eliminados.");
          thermoData = null;
          if (thermoColectivaTable) thermoColectivaTable.innerHTML = "";
          if (thermoSelectivaTable) thermoSelectivaTable.innerHTML = "";
          loadThermoDates();
        } else notify("error", r.data.error || "No fue posible eliminar.");
      });
    });
  }

  function exportThermo(plant) {
    if (!thermoData || !thermoData.date) { alert("Cargue un registro primero."); return; }
    var container = plant === "colectiva" ? thermoColectivaTable : thermoSelectivaTable;
    var rows = container ? container.querySelectorAll("tr[data-thermo-tag]") : [];
    var records = [];
    rows.forEach(function(row) {
      var tag = row.dataset.thermoTag;
      var sa = row.querySelector('input[data-field="sinAcceso"]');
      records.push({
        tag: tag,
        sinAcceso: sa ? sa.checked : false,
        v1: row.querySelector('input[data-field="v1"]') ? row.querySelector('input[data-field="v1"]').value : "",
        v2: row.querySelector('input[data-field="v2"]') ? row.querySelector('input[data-field="v2"]').value : "",
        v3: row.querySelector('input[data-field="v3"]') ? row.querySelector('input[data-field="v3"]').value : "",
        v4: row.querySelector('input[data-field="v4"]') ? row.querySelector('input[data-field="v4"]').value : "",
        observacion: row.querySelector('input[data-field="observacion"]') ? row.querySelector('input[data-field="observacion"]').value : ""
      });
    });
    fetch("/api/thermography/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: thermoData.date, plant: plant, records: records })
    }).then(function(r) { return r.json(); }).then(function(data) {
      if (data.error) { alert(data.error); return; }
      if (data.file) window.location.href = "/api/thermography/download/" + encodeURIComponent(data.file);
    }).catch(function() { alert("Error al exportar."); });
  }

  function loadThermoStats(plant, tag) {
    if (!tag) {
      destroyThermoChart(plant);
      drawThermoCanvasMessage(plant, "Seleccione una bomba para ver el historico.");
      setThermoStatsStatus(plant, "Seleccione una bomba.", "");
      return;
    }
    setThermoStatsStatus(plant, "Cargando historico de " + tag + "...", "pending");
    fetch("/api/thermography/stats?plant=" + encodeURIComponent(plant) + "&tag=" + encodeURIComponent(tag)).then(function(r) {
      return r.json().then(function(data) { return { ok: r.ok, data: data }; });
    }).then(function(result) {
      if (!result.ok || (result.data && result.data.error)) {
        throw new Error((result.data && result.data.error) || "Error al cargar datos del grafico.");
      }
      if (!Array.isArray(result.data)) throw new Error("Respuesta invalida de estadisticas.");
      setThermoStatsStatus(plant, result.data.length + " registros historicos cargados.", "ok");
      renderThermoChart(plant, tag, result.data);
    }).catch(function(err) {
      console.error("[thermo] Error al cargar grafico:", err);
      destroyThermoChart(plant);
      drawThermoCanvasMessage(plant, err.message || "Error al cargar datos del grafico.");
      setThermoStatsStatus(plant, err.message || "Error al cargar datos del grafico.", "error");
      notify("error", err.message || "Error al cargar datos del grafico.");
    });
  }

  function setThermoStatsStatus(plant, message, kind) {
    var el = document.getElementById(plant === "colectiva" ? "thermoStatsStatusColectiva" : "thermoStatsStatusSelectiva");
    if (!el) return;
    el.textContent = message || "";
    el.className = "thermo-stats-status" + (kind ? " " + kind : "");
  }

  function destroyThermoChart(plant) {
    if (thermoCharts[plant]) { thermoCharts[plant].destroy(); thermoCharts[plant] = null; }
  }

  function renderThermoChart(plant, tag, rows) {
    var canvasId = plant === "colectiva" ? "thermoChartColectiva" : "thermoChartSelectiva";
    var canvas = document.getElementById(canvasId);
    if (!canvas) { console.warn("[thermo] canvas no encontrado:", canvasId); return; }
    destroyThermoChart(plant);
    if (!rows || !rows.length) {
      drawThermoCanvasMessage(plant, "Sin datos historicos para " + tag + ".");
      setThermoStatsStatus(plant, "Sin datos historicos para " + tag + ".", "warn");
      notify("info", "No hay datos historicos para la bomba " + tag + ".");
      return;
    }
    var labels = rows.map(function(r) { return r.fecha; });
    var datasets = [
      { label: "Lado Bomba V1 (°C)", data: rows.map(function(r) { return r.v1; }), borderColor: "rgba(255,99,132,1)", backgroundColor: "rgba(255,99,132,0.18)", tension: 0.1, fill: false },
      { label: "Lado Polea V2 (°C)", data: rows.map(function(r) { return r.v2; }), borderColor: "rgba(54,162,235,1)", backgroundColor: "rgba(54,162,235,0.18)", tension: 0.1, fill: false },
      { label: "Lado Bomba V3 (°C)", data: rows.map(function(r) { return r.v3; }), borderColor: "rgba(255,205,86,1)", backgroundColor: "rgba(255,205,86,0.18)", tension: 0.1, fill: false },
      { label: "Lado Polea V4 (°C)", data: rows.map(function(r) { return r.v4; }), borderColor: "rgba(75,192,192,1)", backgroundColor: "rgba(75,192,192,0.18)", tension: 0.1, fill: false }
    ];
    if (!window.Chart) {
      console.warn("[thermo] Chart.js no cargado; usando grafico canvas nativo");
      drawThermoFallbackChart(plant, tag, labels, datasets);
      return;
    }
    var ctx = canvas.getContext("2d");
    thermoCharts[plant] = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: { display: true, text: "Tendencia de Temperaturas - " + tag, font: { size: 14, weight: "bold" } },
          legend: { position: "bottom" }
        },
        scales: {
          y: { beginAtZero: false, title: { display: true, text: "Temperatura (°C)" } },
          x: { title: { display: true, text: "Fecha" } }
        }
      }
    });
    setTimeout(function() { if (thermoCharts[plant]) thermoCharts[plant].resize(); }, 0);
  }

  function getThermoCanvas(plant) {
    return document.getElementById(plant === "colectiva" ? "thermoChartColectiva" : "thermoChartSelectiva");
  }

  function prepareThermoCanvas(canvas) {
    var width = Math.max(320, Math.floor(canvas.clientWidth || canvas.parentElement.clientWidth || 900));
    var height = Math.max(260, Math.floor(canvas.clientHeight || 320));
    canvas.width = width;
    canvas.height = height;
    return canvas.getContext("2d");
  }

  function drawThermoCanvasMessage(plant, message) {
    var canvas = getThermoCanvas(plant);
    if (!canvas) return;
    var ctx = prepareThermoCanvas(canvas);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f8fafb";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#667085";
    ctx.font = "14px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
  }

  function drawThermoFallbackChart(plant, tag, labels, datasets) {
    var canvas = getThermoCanvas(plant);
    if (!canvas) return;
    var ctx = prepareThermoCanvas(canvas);
    var pad = { left: 54, right: 18, top: 42, bottom: 46 };
    var values = [];
    datasets.forEach(function(ds) {
      ds.data.forEach(function(value) { if (typeof value === "number" && Number.isFinite(value)) values.push(value); });
    });
    if (!values.length) { drawThermoCanvasMessage(plant, "Sin valores numericos para " + tag + "."); return; }
    var min = Math.floor(Math.min.apply(null, values) - 2);
    var max = Math.ceil(Math.max.apply(null, values) + 2);
    if (min === max) max = min + 1;
    var plotW = canvas.width - pad.left - pad.right;
    var plotH = canvas.height - pad.top - pad.bottom;
    function xAt(i) { return pad.left + (labels.length <= 1 ? 0 : (i / (labels.length - 1)) * plotW); }
    function yAt(v) { return pad.top + ((max - v) / (max - min)) * plotH; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f8fafb";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#d0d5dd";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top);
    ctx.lineTo(pad.left, pad.top + plotH);
    ctx.lineTo(pad.left + plotW, pad.top + plotH);
    ctx.stroke();
    ctx.fillStyle = "#101828";
    ctx.font = "bold 14px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Tendencia de Temperaturas - " + tag, canvas.width / 2, 22);
    ctx.fillStyle = "#667085";
    ctx.font = "12px Inter, sans-serif";
    ctx.textAlign = "right";
    [min, Math.round((min + max) / 2), max].forEach(function(mark) {
      var y = yAt(mark);
      ctx.fillText(String(mark), pad.left - 8, y + 4);
      ctx.strokeStyle = "rgba(208,213,221,.65)";
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + plotW, y);
      ctx.stroke();
    });
    datasets.forEach(function(ds) {
      ctx.strokeStyle = ds.borderColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      var started = false;
      ds.data.forEach(function(value, i) {
        if (typeof value !== "number" || !Number.isFinite(value)) { started = false; return; }
        var x = xAt(i);
        var y = yAt(value);
        if (!started) { ctx.moveTo(x, y); started = true; }
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });
    ctx.fillStyle = "#667085";
    ctx.font = "11px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(labels[0] || "", pad.left, canvas.height - 16);
    ctx.textAlign = "right";
    ctx.fillText(labels[labels.length - 1] || "", canvas.width - pad.right, canvas.height - 16);
  }

  /* ===================== PLAN SEMANAL ===================== */

  function loadWeeklyPlan() {
    var week = weekInput.value.trim() || getWeekNumber();
    var requestId = ++planLoadSeq;
    var pt = document.getElementById("planTable");
    if (pt) pt.innerHTML = '<p style="color:#888;padding:20px">Cargando plan semanal...</p>';
    api("GET", "/api/weekly-plan?week=" + encodeURIComponent(week) + "&username=" + encodeURIComponent(currentUser ? currentUser.username : "")).then(function(r) {
      if (requestId !== planLoadSeq) return;
      if (r.ok) {
        planData = r.data;
        renderPlanTable();
      } else {
        planData = null;
        if (pt) pt.innerHTML = "<p style=\"color:#888;padding:20px\">" + (r.data.error || "No se pudo cargar el plan semanal.") + "</p>";
      }
    }).catch(function(err) {
      if (requestId !== planLoadSeq) return;
      planData = null;
      if (pt) pt.innerHTML = "<p style=\"color:#888;padding:20px\">No se pudo cargar el plan semanal: " + esc(err && err.message ? err.message : "sin conexion") + "</p>";
    });
  }

  function renderPlanTable() {
    var pt = document.getElementById("planTable");
    if (!pt) return;
    if (!planData) { pt.innerHTML = "<p style=\"color:#888;padding:20px\">Sin datos de plan.</p>"; return; }
    var titleEl = document.getElementById("planWeekTitle");
    var rangeEl = document.getElementById("planWeekRange");
    if (titleEl) titleEl.textContent = "Plan semanal " + planData.week;
    if (rangeEl) rangeEl.textContent = planData.weekStart ? planData.weekStart + " al " + planData.weekEnd : "";
    renderPlanSummary();

    var rows = planData.plants[planActivePlant] || [];
    if (rows.length === 0) { pt.innerHTML = "<p style=\"color:#888;padding:20px\">No hay datos para esta planta.</p>"; return; }

    var html = '<div class="plan-table-scroll"><table class="plan-table"><thead><tr><th>Dia</th><th>Turno</th><th>Grupo</th><th>OT</th><th>Equipo</th><th>Trabajo</th><th>Estado</th></tr></thead><tbody>';
    rows.forEach(function(row) {
      var statusClass = planStatusClass(row.status);
      html += '<tr data-row-key="' + esc(row.rowKey) + '">' +
        '<td>' + esc(row.day) + '</td>' +
        '<td>' + esc(row.turn) + '</td>' +
        '<td>' + esc(row.workGroup) + '</td>' +
        '<td>' + esc(row.workOrder) + '</td>' +
        '<td>' + esc(row.equipment) + '</td>' +
        '<td>' + esc(row.description) + '</td>' +
        '<td><select class="plan-status-select ' + statusClass + '" data-row-key="' + esc(row.rowKey) + '"' + (planData.canEdit ? '' : ' disabled') + '>' +
        '<option value="Ok"' + (row.status === "Ok" ? " selected" : "") + '>Ok</option>' +
        '<option value="Pendiente"' + (row.status === "Pendiente" ? " selected" : "") + '>Pendiente</option>' +
        '<option value="En proceso"' + (row.status === "En proceso" ? " selected" : "") + '>En proceso</option>' +
        '<option value="Cancelada"' + (row.status === "Cancelada" ? " selected" : "") + '>Cancelada</option>' +
        '</select></td></tr>';
    });
    html += '</tbody></table></div>';
    pt.innerHTML = html;

    pt.querySelectorAll(".plan-status-select").forEach(function(sel) {
      sel.onchange = function() {
        var rowKey = sel.dataset.rowKey;
        setPlanState("Guardando...", "pending");
        api("PUT", "/api/weekly-plan/status", { week: planData.week, username: currentUser ? currentUser.username : "", rowKey: rowKey, status: sel.value }).then(function(r) {
          if (!r.ok) {
            setPlanState("Error al guardar", "error");
            alert(r.data.error || "Error.");
          } else {
            updatePlanRowStatus(rowKey, r.data.status || sel.value);
            sel.className = "plan-status-select " + planStatusClass(sel.value);
            renderPlanSummary();
            setPlanState("Guardado " + new Date().toLocaleTimeString(), "ok");
          }
        }).catch(function() {
          setPlanState("Sin conexion", "error");
        });
      };
    });
  }

  function setPlanState(text, kind) {
    var el = document.getElementById("planSaveState");
    if (!el) return;
    el.textContent = text;
    el.className = "hint aforo-save-state" + (kind ? " " + kind : "");
  }

  function updatePlanRowStatus(rowKey, status) {
    if (!planData || !planData.plants) return;
    ["selectiva", "colectiva"].forEach(function(plant) {
      (planData.plants[plant] || []).forEach(function(row) {
        if (row.rowKey === rowKey) row.status = status;
      });
    });
  }

  function planStatusClass(status) {
    if (status === "Ok") return "ok";
    if (status === "En proceso") return "process";
    if (status === "Cancelada") return "cancelled";
    return "pending";
  }

  function summarizePlanRows(rows) {
    var total = rows.length;
    var done = 0;
    var process = 0;
    var pending = 0;
    rows.forEach(function(row) {
      if (row.status === "Ok") done += 1;
      else if (row.status === "En proceso") process += 1;
      else pending += 1;
    });
    return { total: total, done: done, process: process, pending: pending, compliance: total ? Math.round((done / total) * 100) : 0 };
  }

  function renderPlanSummary() {
    var el = document.getElementById("planSummary");
    if (!el || !planData || !planData.plants) return;
    var selectiva = summarizePlanRows(planData.plants.selectiva || []);
    var colectiva = summarizePlanRows(planData.plants.colectiva || []);
    var total = summarizePlanRows((planData.plants.selectiva || []).concat(planData.plants.colectiva || []));
    var cards = [
      { title: "Planta Selectiva", data: selectiva },
      { title: "Planta Colectiva", data: colectiva },
      { title: "Total semanal", data: total, total: true }
    ];
    el.innerHTML = cards.map(function(card) {
      return '<article class="plan-summary-card' + (card.total ? ' total' : '') + '">' +
        '<div class="plan-summary-head"><span>' + esc(card.title) + '</span><strong>' + card.data.compliance + '%</strong></div>' +
        '<div class="plan-progress"><span style="width:' + card.data.compliance + '%"></span></div>' +
        '<div class="plan-summary-stats">' +
          '<p><strong>' + card.data.done + '</strong><span>Realizadas</span></p>' +
          '<p><strong>' + card.data.pending + '</strong><span>Pendientes</span></p>' +
          '<p><strong>' + card.data.process + '</strong><span>En proceso</span></p>' +
          '<p><strong>' + card.data.total + '</strong><span>Total</span></p>' +
        '</div>' +
      '</article>';
    }).join("");
  }

  /* ===================== AFOROS ===================== */

  function loadAforos() {
    var week = weekInput.value.trim() || getWeekNumber();
    api("GET", "/api/aforos?week=" + encodeURIComponent(week) + "&username=" + encodeURIComponent(currentUser ? currentUser.username : "")).then(function(r) {
      if (weekInput.value.trim() !== week) return;
      if (r.ok) { aforoData = r.data; renderAforos(); }
    });
  }

  function renderAforos() {
    var summaryEl = document.getElementById("aforoSummary");
    var contentEl = document.getElementById("aforoContent");
    if (!contentEl) return;
    if (!aforoData || !aforoData.data || Object.keys(aforoData.data).length === 0) {
      contentEl.innerHTML = '<div class="card"><p style="color:#888;padding:20px">No hay datos de aforos para esta semana. Haga clic en el boton para crear.</p><button class="primary-button" id="aforoInitBtn" type="button">Inicializar aforos</button></div>';
      var initBtn = document.getElementById("aforoInitBtn");
      if (initBtn) initBtn.onclick = function() { initAforoData(); };
      if (summaryEl) summaryEl.innerHTML = "";
      return;
    }

    var data = aforoData.data;
    var canEdit = aforoData.canEdit;

    renderAforoSummary(summaryEl, data);
    renderAforoContent(contentEl, data, canEdit);
  }

  function initAforoData() {
    var newData = {
      meta: { code: "INF-AFO-COUR-306", contract: "CW2276359", reportDate: "" },
      feed: { title: "Cortadores alimentacion L1-L2-L3", blockHours: 6, intervalMinutes: 15, cutsPerInterval: 3, flows: [
        { name: "Molino 1", blockHours: 6, intervalMinutes: 15, cutsPerInterval: 3, samples: [0,0,0], courierLiters: 0, tonnage: 0, onlineTonnage: 0, observation: "S/O" },
        { name: "Molino 2", blockHours: 6, intervalMinutes: 15, cutsPerInterval: 3, samples: [0,0,0], courierLiters: 0, tonnage: 0, onlineTonnage: 0, observation: "S/O" },
        { name: "Molino 3", blockHours: 6, intervalMinutes: 15, cutsPerInterval: 3, samples: [0,0,0], courierLiters: 0, tonnage: 0, onlineTonnage: 0, observation: "S/O" }
      ]},
      bulk6: { title: "Cortador Bulk 6 horas", flowName: "Concentrado Bulk", side: "Izq.", blockHours: 6, intervalMinutes: 15, cutsPerInterval: 4, samples: [0,0,0], courierLiters: 103, columns: 6, observation: "Bloque de 6 horas" },
      bulk24: { title: "Cortador Bulk 24 horas", flowName: "Concentrado Bulk", side: "Der.", blockHours: 24, intervalMinutes: 15, cutsPerInterval: 4, samples: [0,0,0], courierLiters: 103, columns: 6, observation: "Bloque de 24 horas" },
      relave: { title: "Cortador Relave Final", flowName: "Relave Final", blockHours: 6, intervalMinutes: 20, primaryCuts: 30, secondaryCuts: 1, samples: [0,0,0], flowReadings: [0,0,0], flowObservation: "F/S", observation: "F/S en Courier", totalTonnage: 0 }
    };
    saveAforoData(newData);
  }

  function saveAforoData(data) {
    var week = weekInput.value.trim() || getWeekNumber();
    setAforoState("Guardando...", "pending");
    var wasEmpty = !aforoData || !aforoData.data || Object.keys(aforoData.data).length === 0;
    api("PUT", "/api/aforos", { week: week, username: currentUser ? currentUser.username : "", data: data }).then(function(r) {
      if (r.ok) {
        aforoData = { week: week, canEdit: true, data: data };
        setAforoState("Guardado " + new Date().toLocaleTimeString(), "ok");
        if (wasEmpty) renderAforos();
      } else {
        setAforoState("Error al guardar", "error");
        notify("error", r.data.error || "Error al guardar aforos.");
      }
    }).catch(function() {
      setAforoState("Sin conexion", "error");
    });
  }

  /* ---- Calculo aforos (formulas aforo.xlsx) ---- */
  function aforoAvgRounded(samples) {
    var nums = (samples || []).map(Number).filter(function(n) { return !isNaN(n); });
    if (!nums.length) return 0;
    var avg = nums.reduce(function(a, b) { return a + b; }, 0) / nums.length;
    return Math.round(avg / 10) * 10; // Excel ROUND(x, -1)
  }

  function aforoFlowMetrics(flow) {
    var bh = Number(flow.blockHours) || 0;
    var im = Number(flow.intervalMinutes) || 0;
    var cpi = Number(flow.cutsPerInterval) || 0;
    var ccPerInterval = aforoAvgRounded(flow.samples);
    var cutsPerBlock = im ? (60 / im) * bh * cpi : 0;
    var ccPerHour = im ? (ccPerInterval * 60) / im : 0;
    var ccPerBlock = ccPerHour * bh;
    return { ccPerInterval: ccPerInterval, cutsPerBlock: cutsPerBlock, ccPerHour: ccPerHour, ccPerBlock: ccPerBlock, liters: ccPerBlock / 1000 };
  }

  function aforoRelaveMetrics(rel) {
    var bh = Number(rel.blockHours) || 0;
    var im = Number(rel.intervalMinutes) || 0;
    var pc = Number(rel.primaryCuts) || 0;
    var ccPerInterval = aforoAvgRounded(rel.samples);
    var cutsPerBlock = im ? (60 / im) * pc * bh : 0;
    var ccPerHour = im ? (ccPerInterval * 60) / im : 0;
    var ccPerBlock = ccPerHour * bh;
    var totalTonnage = (rel.flowReadings || []).reduce(function(a, b) { return a + (Number(b) || 0); }, 0);
    return { ccPerInterval: ccPerInterval, cutsPerBlock: cutsPerBlock, ccPerHour: ccPerHour, ccPerBlock: ccPerBlock, liters: ccPerBlock / 1000, totalTonnage: totalTonnage };
  }

  function fmt(n, decimals) {
    if (n == null || !isFinite(n)) return "0";
    var d = decimals == null ? 1 : decimals;
    var fixed = Number(n).toFixed(d);
    if (d > 0) fixed = fixed.replace(/\.?0+$/, "");
    return fixed || "0";
  }

  function renderAforoSummary(container, data) {
    if (!container) return;
    var html = "";
    var totals = [];
    if (data.feed && data.feed.flows) {
      data.feed.flows.forEach(function(f) {
        totals.push({ name: f.name, liters: aforoFlowMetrics(f).liters });
      });
    }
    if (data.bulk6) totals.push({ name: data.bulk6.title || "Concentrado Bulk 6h", liters: aforoFlowMetrics(data.bulk6).liters });
    if (data.bulk24) totals.push({ name: data.bulk24.title || "Concentrado Bulk 24h", liters: aforoFlowMetrics(data.bulk24).liters });
    if (data.relave) totals.push({ name: data.relave.title || "Relave Final", liters: aforoRelaveMetrics(data.relave).liters });

    html += '<div class="aforo-summary-grid">';
    totals.forEach(function(t) {
      html += '<div class="aforo-summary-card"><span>' + esc(t.name) + '</span><strong>' + fmt(t.liters, 2) + ' L</strong></div>';
    });
    html += '</div>';
    container.innerHTML = html;
  }

  function aforoInputCell(label, name, value, type, disabled, hint) {
    type = type || "text";
    var v = (type === "number") ? (value == null ? "" : value) : (value == null ? "" : String(value));
    var hintHtml = hint ? '<small class="aforo-hint">' + esc(hint) + '</small>' : '';
    return '<label>' + esc(label) + '<input type="' + type + '" data-aforo-field="' + name + '" value="' + esc(v) + '" ' + (disabled ? "disabled" : "") + (type === "number" ? ' step="any" inputmode="decimal"' : "") + '/>' + hintHtml + '</label>';
  }

  function aforoCalcBox(label, value, suffix) {
    return '<div class="aforo-calculated-box"><span>' + esc(label) + '</span><strong>' + esc(value) + (suffix ? " " + suffix : "") + '</strong></div>';
  }

  function aforoFlowParamsBlock(prefix, flow, disabled, options) {
    options = options || {};
    var m = aforoFlowMetrics(flow);
    var html = '<div class="aforo-mini-fields">' +
      aforoInputCell("Tiempo bloque (hr)", prefix + ".blockHours", flow.blockHours, "number", disabled, "Cambiar si es necesario") +
      aforoInputCell("Intervalo (min)", prefix + ".intervalMinutes", flow.intervalMinutes, "number", disabled, "Cambiar si es necesario") +
      aforoInputCell((options.cutsLabel || "Cortes por intervalo (Un)"), prefix + ".cutsPerInterval", flow.cutsPerInterval, "number", disabled, "Cambiar si es necesario") +
      '</div>';
    html += '<div class="aforo-samples"><p class="aforo-section-hint">Ingresar nuevo aforo (cc)</p>';
    (flow.samples || [0,0,0]).forEach(function(s, si) {
      html += aforoInputCell("Muestra " + (si + 1) + " (cc)", prefix + ".samples." + si, s, "number", disabled);
    });
    html += '</div>';
    html += '<dl>' +
      '<div><dt>Cortes por bloque</dt><dd>' + fmt(m.cutsPerBlock, 0) + '</dd></div>' +
      '<div><dt>Muestra por intervalo (cc)</dt><dd>' + fmt(m.ccPerInterval, 0) + '</dd></div>' +
      '<div><dt>Muestra por hora (cc)</dt><dd>' + fmt(m.ccPerHour, 0) + '</dd></div>' +
      '<div><dt>Muestra por bloque (cc)</dt><dd>' + fmt(m.ccPerBlock, 0) + '</dd></div>' +
      '</dl>';
    html += aforoCalcBox("Litros por bloque", fmt(m.liters, 2), "L");
    return html;
  }

  function aforoCell(opts, disabled) {
    if (opts.type === "output") {
      return '<td class="aforo-out" data-aforo-derived="' + opts.derived + '"><strong>' + esc(opts.value == null ? "0" : opts.value) + '</strong></td>';
    }
    var v = opts.value == null ? "" : String(opts.value);
    if (opts.type === "text") {
      return '<td class="aforo-in"><input type="text" data-aforo-field="' + opts.name + '" value="' + esc(v) + '"' + (disabled ? " disabled" : "") + '/></td>';
    }
    if (opts.type === "date") {
      return '<td class="aforo-in"><input type="date" data-aforo-field="' + opts.name + '" value="' + esc(v) + '"' + (disabled ? " disabled" : "") + '/></td>';
    }
    return '<td class="aforo-in"><input type="number" step="any" inputmode="decimal" data-aforo-field="' + opts.name + '" value="' + esc(v) + '"' + (disabled ? " disabled" : "") + '/></td>';
  }

  function aforoRow(label, cells, hint) {
    var html = '<tr><td class="aforo-label">' + esc(label) + '</td>';
    cells.forEach(function(c) { html += c; });
    html += '<td class="aforo-hint-cell">' + (hint ? esc(hint) : "") + '</td></tr>';
    return html;
  }

  function aforoTableHeader(firstColLabel, columns) {
    var html = '<thead><tr><th>' + esc(firstColLabel) + '</th>';
    columns.forEach(function(c) { html += '<th>' + esc(c) + '</th>'; });
    html += '<th class="aforo-hint-col"></th></tr></thead>';
    return html;
  }

  function renderFeedSection(feed, disabled) {
    var html = '<div class="card aforo-card aforo-section">';
    html += '<div class="aforo-card-title"><div><p class="label-top">Composito alimentacion</p><h3>' + esc(feed.title) + '</h3></div></div>';
    html += '<p class="aforo-sub">Parametros operacionales courier alimentacion composito 6 horas</p>';
    html += '<div class="aforo-excel-input-wrap"><table class="aforo-excel-input">';
    html += aforoTableHeader("Flujo", feed.flows.map(function(f) { return f.name; }));
    html += '<tbody>';
    var paramRows = [
      { label: "Tiempo del bloque (hr)", key: "blockHours", hint: "Cambiar si es necesario" },
      { label: "Intervalo de tiempo para cortes (min)", key: "intervalMinutes", hint: "Cambiar si es necesario" },
      { label: "Cantidad de cortes por intervalo tiempo (Un)", key: "cutsPerInterval", hint: "Cambiar si es necesario" }
    ];
    paramRows.forEach(function(r) {
      var cells = feed.flows.map(function(f, i) { return aforoCell({ type: "input", name: "feed.flows." + i + "." + r.key, value: f[r.key] }, disabled); });
      html += aforoRow(r.label, cells, r.hint);
    });
    var outRows = [
      { label: "Cantidad de cortes por bloque (Un)", key: "cutsPerBlock", dec: 0 },
      { label: "Cantidad de muestra por intervalo (cc)", key: "ccPerInterval", dec: 0, hint: "Calculado: ROUND(promedio muestras, -1)" },
      { label: "Cantidad de muestra por hora (cc)", key: "ccPerHour", dec: 0 },
      { label: "Cantidad de muestra por bloque (cc)", key: "ccPerBlock", dec: 0 }
    ];
    outRows.forEach(function(r) {
      var cells = feed.flows.map(function(f, i) {
        var m = aforoFlowMetrics(f);
        return aforoCell({ type: "output", value: fmt(m[r.key], r.dec), derived: "feed.flows." + i + "." + r.key }, disabled);
      });
      html += aforoRow(r.label, cells, r.hint);
    });
    var obsCells = feed.flows.map(function(f, i) { return aforoCell({ type: "text", name: "feed.flows." + i + ".observation", value: f.observation }, disabled); });
    html += aforoRow("Observaciones", obsCells);
    html += '</tbody></table></div>';

    /* Muestras */
    html += '<p class="aforo-sub">Ingresar nuevo aforo &mdash; muestras por intervalo</p>';
    html += '<div class="aforo-excel-input-wrap"><table class="aforo-excel-input aforo-excel-samples">';
    html += aforoTableHeader("Muestra", feed.flows.map(function(f) { return f.name; }));
    html += '<tbody>';
    for (var s = 0; s < 3; s++) {
      (function(si) {
        var cells = feed.flows.map(function(f, i) { return aforoCell({ type: "input", name: "feed.flows." + i + ".samples." + si, value: (f.samples || [0,0,0])[si] }, disabled); });
        html += aforoRow("Muestra " + (si + 1) + " (cc)", cells);
      })(s);
    }
    html += '</tbody></table></div>';

    /* Datos de flujo por courier y tonelaje */
    html += '<p class="aforo-sub">Datos de flujo por courier y tonelaje</p>';
    html += '<div class="aforo-excel-input-wrap"><table class="aforo-excel-input">';
    html += aforoTableHeader("Flujo", feed.flows.map(function(f) { return f.name; }));
    html += '<tbody>';
    var datosRows = [
      { label: "Promedio de litros por courier (Lt)", key: "courierLiters", hint: "Ingresar dato actualizado 24 hrs" },
      { label: "Tonelaje molino (T)", key: "tonnage", hint: "Ingresar dato actualizado 24 hrs" },
      { label: "Tonelaje molino (T) en linea", key: "onlineTonnage", hint: "Ingresar dato cuando se realiza el aforo" }
    ];
    datosRows.forEach(function(r) {
      var cells = feed.flows.map(function(f, i) { return aforoCell({ type: "input", name: "feed.flows." + i + "." + r.key, value: f[r.key] }, disabled); });
      html += aforoRow(r.label, cells, r.hint);
    });
    html += '</tbody></table></div>';

    /* Litros por bloque destacado */
    html += '<div class="aforo-liters-row">';
    feed.flows.forEach(function(f, i) {
      var m = aforoFlowMetrics(f);
      html += '<div class="aforo-liters-card" data-aforo-derived="feed.flows.' + i + '.liters"><span>' + esc(f.name) + ' &mdash; Litros por bloque</span><strong>' + fmt(m.liters, 2) + ' L</strong></div>';
    });
    html += '</div>';
    html += '</div>';
    return html;
  }

  function renderSimpleFlowSection(prefix, flow, sectionLabel, sectionTitle, sideLabel, hasColumns, disabled) {
    var m = aforoFlowMetrics(flow);
    var colName = flow.flowName || (prefix === "bulk6" ? "Concentrado Bulk" : "Concentrado bulk");
    var html = '<div class="card aforo-card aforo-section">';
    html += '<div class="aforo-card-title"><div><p class="label-top">' + esc(sectionLabel) + '</p><h3>' + esc(sectionTitle) + '</h3></div>' + (sideLabel ? '<strong>' + esc(sideLabel) + '</strong>' : '') + '</div>';
    html += '<p class="aforo-sub">Parametros operacionales courier ' + esc(sectionLabel.toLowerCase()) + '</p>';
    html += '<div class="aforo-excel-input-wrap"><table class="aforo-excel-input">';
    html += aforoTableHeader("Flujo", [colName]);
    html += '<tbody>';
    html += aforoRow("Tiempo del bloque (hr)", [aforoCell({ type: "input", name: prefix + ".blockHours", value: flow.blockHours }, disabled)], "Cambiar si es necesario");
    html += aforoRow("Intervalo de tiempo para cortes (min)", [aforoCell({ type: "input", name: prefix + ".intervalMinutes", value: flow.intervalMinutes }, disabled)], "Cambiar si es necesario");
    html += aforoRow("Cantidad de cortes por intervalo tiempo (Un)", [aforoCell({ type: "input", name: prefix + ".cutsPerInterval", value: flow.cutsPerInterval }, disabled)], "Cambiar si es necesario");
    html += aforoRow("Cantidad de cortes por bloque (Un)", [aforoCell({ type: "output", value: fmt(m.cutsPerBlock, 0), derived: prefix + ".cutsPerBlock" }, disabled)]);
    html += aforoRow("Cantidad de muestra por intervalo (cc)", [aforoCell({ type: "output", value: fmt(m.ccPerInterval, 0), derived: prefix + ".ccPerInterval" }, disabled)], "Calculado: ROUND(promedio muestras, -1)");
    html += aforoRow("Cantidad de muestra por hora (cc)", [aforoCell({ type: "output", value: fmt(m.ccPerHour, 0), derived: prefix + ".ccPerHour" }, disabled)]);
    html += aforoRow("Cantidad de muestra por bloque (cc)", [aforoCell({ type: "output", value: fmt(m.ccPerBlock, 0), derived: prefix + ".ccPerBlock" }, disabled)]);
    html += aforoRow("Observaciones", [aforoCell({ type: "text", name: prefix + ".observation", value: flow.observation }, disabled)]);
    html += '</tbody></table></div>';

    html += '<p class="aforo-sub">Ingresar nuevo aforo &mdash; muestras por intervalo</p>';
    html += '<div class="aforo-excel-input-wrap"><table class="aforo-excel-input aforo-excel-samples">';
    html += aforoTableHeader("Muestra", [colName]);
    html += '<tbody>';
    for (var s = 0; s < 3; s++) {
      html += aforoRow("Muestra " + (s + 1) + " (cc)", [aforoCell({ type: "input", name: prefix + ".samples." + s, value: (flow.samples || [0,0,0])[s] }, disabled)]);
    }
    html += '</tbody></table></div>';

    html += '<p class="aforo-sub">Datos de flujos por courier y cantidad de columnas operativas</p>';
    html += '<div class="aforo-excel-input-wrap"><table class="aforo-excel-input"><tbody>';
    html += aforoRow("Promedio de litros por courier (Lt)", [aforoCell({ type: "input", name: prefix + ".courierLiters", value: flow.courierLiters }, disabled)], "Ingresar dato actualizado 24 hrs");
    if (hasColumns) html += aforoRow("Cantidad de columnas operativas", [aforoCell({ type: "input", name: prefix + ".columns", value: flow.columns }, disabled)], "Ingresar dato actualizado 24 hrs");
    html += '</tbody></table></div>';

    html += '<div class="aforo-liters-row"><div class="aforo-liters-card" data-aforo-derived="' + prefix + '.liters"><span>Litros por bloque</span><strong>' + fmt(m.liters, 2) + ' L</strong></div></div>';
    html += '</div>';
    return html;
  }

  function renderRelaveSection(rel, disabled) {
    var rm = aforoRelaveMetrics(rel);
    var colName = rel.flowName || "Relave Final";
    var html = '<div class="card aforo-card aforo-section">';
    html += '<div class="aforo-card-title"><div><p class="label-top">Cortador Relave Final</p><h3>' + esc(rel.title) + '</h3></div></div>';
    html += '<p class="aforo-sub">Parametros operacionales courier relave final composito ' + (rel.blockHours || 6) + ' horas</p>';
    html += '<div class="aforo-excel-input-wrap"><table class="aforo-excel-input">';
    html += aforoTableHeader("Flujo", [colName]);
    html += '<tbody>';
    html += aforoRow("Tiempo del bloque (hr)", [aforoCell({ type: "input", name: "relave.blockHours", value: rel.blockHours }, disabled)], "Cambiar si es necesario");
    html += aforoRow("Intervalo de tiempo para cortes (min)", [aforoCell({ type: "input", name: "relave.intervalMinutes", value: rel.intervalMinutes }, disabled)], "Cambiar si es necesario");
    html += aforoRow("Cantidad cortes por interv. tiempo Primario (Un)", [aforoCell({ type: "input", name: "relave.primaryCuts", value: rel.primaryCuts }, disabled)], "Cambiar si es necesario");
    html += aforoRow("Cantidad cortes por interv. tiempo Secundario (Un)", [aforoCell({ type: "input", name: "relave.secondaryCuts", value: rel.secondaryCuts }, disabled)]);
    html += aforoRow("Cantidad de cortes por bloque (Un)", [aforoCell({ type: "output", value: fmt(rm.cutsPerBlock, 0), derived: "relave.cutsPerBlock" }, disabled)]);
    html += aforoRow("Cantidad de muestra por intervalo (cc)", [aforoCell({ type: "output", value: fmt(rm.ccPerInterval, 0), derived: "relave.ccPerInterval" }, disabled)], "Calculado: ROUND(promedio muestras, -1)");
    html += aforoRow("Cantidad de muestra por hora (cc)", [aforoCell({ type: "output", value: fmt(rm.ccPerHour, 0), derived: "relave.ccPerHour" }, disabled)]);
    html += aforoRow("Cantidad de muestra por bloque (cc)", [aforoCell({ type: "output", value: fmt(rm.ccPerBlock, 0), derived: "relave.ccPerBlock" }, disabled)]);
    html += aforoRow("Observaciones", [aforoCell({ type: "text", name: "relave.observation", value: rel.observation }, disabled)]);
    html += '</tbody></table></div>';

    html += '<p class="aforo-sub">Ingresar nuevo aforo &mdash; muestras por intervalo</p>';
    html += '<div class="aforo-excel-input-wrap"><table class="aforo-excel-input aforo-excel-samples">';
    html += aforoTableHeader("Muestra", [colName]);
    html += '<tbody>';
    for (var s = 0; s < 3; s++) {
      html += aforoRow("Muestra " + (s + 1) + " (cc)", [aforoCell({ type: "input", name: "relave.samples." + s, value: (rel.samples || [0,0,0])[s] }, disabled)]);
    }
    html += '</tbody></table></div>';

    html += '<p class="aforo-sub">Datos del estado del flujo &mdash; tonelaje total hora</p>';
    html += '<div class="aforo-excel-input-wrap"><table class="aforo-excel-input"><tbody>';
    for (var r = 0; r < 3; r++) {
      html += aforoRow("Lectura " + (r + 1) + " (T)", [aforoCell({ type: "input", name: "relave.flowReadings." + r, value: (rel.flowReadings || [0,0,0])[r] }, disabled)], "Ingresar dato actualizado 24 hrs");
    }
    html += aforoRow("Tonelaje total hora (T)", [aforoCell({ type: "output", value: fmt(rm.totalTonnage, 0), derived: "relave.totalTonnage" }, disabled)], "Suma de las 3 lecturas");
    html += aforoRow("Observaciones", [aforoCell({ type: "text", name: "relave.flowObservation", value: rel.flowObservation }, disabled)]);
    html += '</tbody></table></div>';

    html += '<div class="aforo-liters-row"><div class="aforo-liters-card" data-aforo-derived="relave.liters"><span>Litros por bloque</span><strong>' + fmt(rm.liters, 2) + ' L</strong></div></div>';
    html += '</div>';
    return html;
  }

  function renderAforoContent(container, data, canEdit) {
    if (!container) return;
    var html = "";
    var disabled = !canEdit;

    if (data.meta) {
      html += '<div class="card aforo-meta-card"><div><p class="label-top">INF-AFO-COUR-304</p><h3>Datos generales</h3></div><div class="aforo-excel-input-wrap"><table class="aforo-excel-input"><tbody>';
      html += aforoRow("Codigo", [aforoCell({ type: "text", name: "meta.code", value: data.meta.code }, disabled)]);
      html += aforoRow("N\u00b0 Contrato", [aforoCell({ type: "text", name: "meta.contract", value: data.meta.contract }, disabled)]);
      html += aforoRow("Fecha informe", [aforoCell({ type: "date", name: "meta.reportDate", value: data.meta.reportDate }, disabled)]);
      html += '</tbody></table></div></div>';
    }

    if (data.feed && data.feed.flows) html += renderFeedSection(data.feed, disabled);
    if (data.bulk6) html += renderSimpleFlowSection("bulk6", data.bulk6, "Cortador Bulk 6 horas", data.bulk6.title, data.bulk6.side || "Izq.", true, disabled);
    if (data.bulk24) html += renderSimpleFlowSection("bulk24", data.bulk24, "Cortador Bulk 24 horas", data.bulk24.title, data.bulk24.side || "Der.", true, disabled);
    if (data.relave) html += renderRelaveSection(data.relave, disabled);

    /* === Resumen estilo Excel === */
    var resumenRows = [];
    if (data.feed && data.feed.flows) {
      data.feed.flows.forEach(function(f) { resumenRows.push({ name: "Alimentacion " + f.name, liters: aforoFlowMetrics(f).liters }); });
    }
    if (data.bulk6) resumenRows.push({ name: "Concentrado Bulk 6 horas", liters: aforoFlowMetrics(data.bulk6).liters });
    if (data.bulk24) resumenRows.push({ name: "Concentrado Bulk 24 horas", liters: aforoFlowMetrics(data.bulk24).liters });
    if (data.relave) resumenRows.push({ name: "Relave Final", liters: aforoRelaveMetrics(data.relave).liters });

    var maxLiters = Math.max.apply(null, resumenRows.map(function(r) { return r.liters; }).concat([1]));
    var resumenHtml = '<div class="card aforo-card aforo-excel-summary"><div class="aforo-card-title"><div><p class="label-top">Resumen</p><h3>Resumen aforo cortadores</h3></div></div>';
    resumenHtml += '<div class="aforo-excel-grid">';
    resumenHtml += '<table class="aforo-excel-table"><thead><tr><th>Flujo</th><th>Lt</th></tr></thead><tbody>';
    resumenRows.forEach(function(r) {
      resumenHtml += '<tr><td>' + esc(r.name) + '</td><td>' + fmt(r.liters, 2) + '</td></tr>';
    });
    resumenHtml += '</tbody></table>';
    resumenHtml += '<div class="aforo-excel-chart">';
    resumenRows.forEach(function(r) {
      var pct = Math.max(2, (r.liters / maxLiters) * 100);
      resumenHtml += '<div class="aforo-excel-bar-row"><span>' + esc(r.name) + '</span><div class="aforo-excel-bar-track"><i style="width:' + pct.toFixed(1) + '%"></i></div><strong>' + fmt(r.liters, 2) + ' L</strong></div>';
    });
    resumenHtml += '</div></div></div>';
    html += resumenHtml;

    container.innerHTML = html;
    bindAforoInputs(container, data);
  }

  var aforoSaveTimer = null;
  var aforoStateEl = null;

  function setAforoState(text, kind) {
    if (!aforoStateEl) aforoStateEl = document.getElementById("aforoSaveState");
    if (!aforoStateEl) return;
    aforoStateEl.textContent = text;
    aforoStateEl.className = "hint aforo-save-state" + (kind ? " " + kind : "");
  }

  function bindAforoInputs(container, data) {
    container.querySelectorAll("[data-aforo-field]").forEach(function(inp) {
      var handler = function() {
        var path = inp.dataset.aforoField.split(".");
        var raw = inp.value;
        var val;
        if (inp.type === "number") val = raw === "" ? "" : Number(raw);
        else val = raw;
        setNestedValue(data, path, val);
        scheduleAforoAutoSave(data);
        updateAforoDerivedDisplay(data);
      };
      inp.addEventListener("input", handler);
      inp.addEventListener("change", handler);
    });
  }

  function updateAforoDerivedDisplay(data) {
    var summaryEl = document.getElementById("aforoSummary");
    var contentEl = document.getElementById("aforoContent");
    if (summaryEl) renderAforoSummary(summaryEl, data);
    if (!contentEl) return;

    function setDerived(key, value) {
      var el = contentEl.querySelector('[data-aforo-derived="' + key + '"]');
      if (!el) return;
      var s = el.querySelector("strong");
      if (s) s.textContent = value;
      else el.textContent = value;
    }

    function applyMetrics(prefix, m) {
      setDerived(prefix + ".cutsPerBlock", fmt(m.cutsPerBlock, 0));
      setDerived(prefix + ".ccPerInterval", fmt(m.ccPerInterval, 0));
      setDerived(prefix + ".ccPerHour", fmt(m.ccPerHour, 0));
      setDerived(prefix + ".ccPerBlock", fmt(m.ccPerBlock, 0));
      var litersEl = contentEl.querySelector('[data-aforo-derived="' + prefix + '.liters"] strong');
      if (litersEl) litersEl.textContent = fmt(m.liters, 2) + " L";
    }

    if (data.feed && data.feed.flows) {
      data.feed.flows.forEach(function(f, i) { applyMetrics("feed.flows." + i, aforoFlowMetrics(f)); });
    }
    if (data.bulk6) applyMetrics("bulk6", aforoFlowMetrics(data.bulk6));
    if (data.bulk24) applyMetrics("bulk24", aforoFlowMetrics(data.bulk24));
    if (data.relave) {
      var rm = aforoRelaveMetrics(data.relave);
      applyMetrics("relave", rm);
      setDerived("relave.totalTonnage", fmt(rm.totalTonnage, 0));
    }

    var resumenRows = [];
    if (data.feed && data.feed.flows) data.feed.flows.forEach(function(f) { resumenRows.push(aforoFlowMetrics(f).liters); });
    if (data.bulk6) resumenRows.push(aforoFlowMetrics(data.bulk6).liters);
    if (data.bulk24) resumenRows.push(aforoFlowMetrics(data.bulk24).liters);
    if (data.relave) resumenRows.push(aforoRelaveMetrics(data.relave).liters);
    var maxLiters = Math.max.apply(null, resumenRows.concat([1]));
    var resumenCard = contentEl.querySelector(".aforo-excel-summary");
    if (resumenCard) {
      var tableCells = resumenCard.querySelectorAll("tbody tr td:last-child");
      var bars = resumenCard.querySelectorAll(".aforo-excel-bar-row");
      resumenRows.forEach(function(lt, i) {
        if (tableCells[i]) tableCells[i].textContent = fmt(lt, 2);
        if (bars[i]) {
          var bar = bars[i].querySelector(".aforo-excel-bar-track i");
          var amt = bars[i].querySelector("strong");
          if (bar) bar.style.width = Math.max(2, (lt / maxLiters) * 100).toFixed(1) + "%";
          if (amt) amt.textContent = fmt(lt, 2) + " L";
        }
      });
    }
  }

  function scheduleAforoAutoSave(data) {
    if (aforoSaveTimer) clearTimeout(aforoSaveTimer);
    setAforoState("Cambios sin guardar", "pending");
    aforoSaveTimer = setTimeout(function() { saveAforoData(data); }, 700);
  }

  function setNestedValue(obj, path, value) {
    for (var i = 0; i < path.length - 1; i++) {
      var key = isNaN(path[i + 1]) ? path[i] : Number(path[i]);
      if (!obj[path[i]]) obj[path[i]] = isNaN(path[i + 1]) ? {} : [];
      obj = obj[path[i]];
    }
    obj[path[path.length - 1]] = value;
  }

  /* ===================== ECUACIONES Y OFFSETS ===================== */

  /* Utilidad: obtener el <option> en mayuscula si existe, minuscula fallback */
  function eqResolveTagKey(rawKey) {
    if (!rawKey) return "";
    var lower = String(rawKey).toLowerCase();
    for (var i = 0; i < EMBEDDED_FLOW_CATALOG.tags.length; i++) {
      if (String(EMBEDDED_FLOW_CATALOG.tags[i].key || "").toLowerCase() === lower) {
        return EMBEDDED_FLOW_CATALOG.tags[i].key;
      }
    }
    return lower;
  }

  function loadFlowCatalog() {
    api("GET", "/api/flow-catalog").then(function(r) {
      if (r.ok) {
        flowCatalog = r.data.catalog;
        equationsPopulateTagSelect();
      }
    });
  }

  function loadEquations() {
    var week = weekInput.value.trim() || getWeekNumber();
    api("GET", "/api/equations?week=" + encodeURIComponent(week) + "&username=" + encodeURIComponent(currentUser ? currentUser.username : "")).then(function(r) {
      if (weekInput.value.trim() !== week) return;
      if (r.ok) { equationCanEdit = r.data.canEdit !== false; equationList = r.data.records; renderEquationList(); }
    });
  }

  function resetEquationForm() {
    var f = document.getElementById("equationForm");
    if (!f) return;
    f.reset();
    var idInput = f.querySelector('[name="id"]');
    var plantInput = f.querySelector('[name="plant"]');
    if (idInput) idInput.value = "";
    if (plantInput) plantInput.value = "colectiva";
    equationsPopulateTagSelect();
    equationsPopulateFlowSelect("");
    equationsAutoSetPlant("");
    f.querySelectorAll('input[name="elements"]').forEach(function(cb) { cb.checked = false; });
    if (equationDeleteBtn) equationDeleteBtn.classList.add("hidden");
    setFormEnabled(f, currentEquationCanEdit());
    syncEquationMode();
  }

  function equationsPopulateTagSelect() {
    var f = document.getElementById("equationForm");
    if (!f) return;
    var tagSelect = f.querySelector('[name="tagKey"]');
    if (!tagSelect) return;
    var catalog = flowCatalog || EMBEDDED_FLOW_CATALOG;
    if (!catalog || !catalog.tags || !catalog.tags.length) return;
    var current = tagSelect.value;
    tagSelect.innerHTML = "<option value=\"\">-- Seleccione equipo --</option>";
    catalog.tags.forEach(function(t) {
      var opt = document.createElement("option");
      opt.value = t.key;
      opt.textContent = t.display + (t.equipment ? " - " + t.equipment : "");
      tagSelect.appendChild(opt);
    });
    if (current) tagSelect.value = current;
  }

  function equationsAutoSetPlant(tagKey) {
    var f = document.getElementById("equationForm");
    var plantInput = f.querySelector('[name="plant"]');
    if (!plantInput) return;
    var resolved = eqResolveTagKey(tagKey);
    plantInput.value = resolved === "3811-az-601" ? "selectiva" : "colectiva";
  }

  function equationsPopulateFlowSelect(tagKey) {
    var f = document.getElementById("equationForm");
    if (!f) return;
    var flowSelect = f.querySelector('[name="flow"]');
    if (!flowSelect) return;
    flowSelect.innerHTML = "<option value=\"\">-- Seleccione flujo --</option>";
    var resolvedKey = eqResolveTagKey(tagKey);
    if (!resolvedKey) return;
    var catalog = flowCatalog || EMBEDDED_FLOW_CATALOG;
    var lowerKey = resolvedKey.toLowerCase();
    var flows = (catalog.flows && catalog.flows[resolvedKey]) ||
                (catalog.flows && catalog.flows[lowerKey]) ||
                (catalog.FLOWS && catalog.FLOWS[resolvedKey]) ||
                (catalog.FLOWS && catalog.FLOWS[lowerKey]) || [];
    if (flows.length === 0) {
      /* Intentar con mayusculas si el catalogo externo usa mayusculas */
      flows = (catalog.flows && catalog.flows[lowerKey.toUpperCase()]) ||
              (catalog.FLOWS && catalog.FLOWS[lowerKey.toUpperCase()]) || [];
    }
    flows.forEach(function(fl) {
      var opt = document.createElement("option");
      opt.value = fl;
      opt.textContent = fl;
      flowSelect.appendChild(opt);
    });
  }

  window.metsoTagChange = function(tagKey) {
    var resolved = eqResolveTagKey(tagKey);
    var f = document.getElementById("equationForm");
    var tagSelect = f ? f.querySelector('[name="tagKey"]') : null;
    if (tagSelect && tagSelect.value !== resolved) tagSelect.value = resolved;
    equationsPopulateFlowSelect(resolved);
    equationsAutoSetPlant(resolved);
    syncEquationMode();
  };

  function submitEquationForm(e) {
    e.preventDefault();
    var f = document.getElementById("equationForm");
    if (!f || !currentEquationCanEdit()) return;
    var idInput = f.querySelector('[name="id"]');
    var tagSelect = f.querySelector('[name="tagKey"]');
    var flowSelect = f.querySelector('[name="flow"]');
    var dateInput = f.querySelector('[name="date"]');
    var timeInput = f.querySelector('[name="time"]');
    var offsetInput = f.querySelector('[name="offset"]');
    if (!tagSelect || !flowSelect || !dateInput || !timeInput || !offsetInput) {
      alert("Formulario de ecuaciones incompleto. Recargue la pagina.");
      return;
    }
    var id = Number(idInput ? idInput.value : "") || 0;
    var tagKey = eqResolveTagKey(tagSelect.value);
    var flowVal = flowSelect.value;
    var elements = [];
    f.querySelectorAll('input[name="elements"]').forEach(function(cb) { if (cb.checked) elements.push(cb.value); });
    var offsetValue = offsetInput.value;
    if (!/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(String(timeInput.value || ""))) {
      alert("Hora invalida. Use formato 24 hrs HH:MM.");
      timeInput.focus();
      return;
    }
    if (isEquationPsiTag(tagKey)) {
      elements = [];
    } else {
      offsetValue = "";
    }
    var payload = {
      week: weekInput.value,
      username: currentUser.username,
      date: dateInput.value,
      time: timeInput.value,
      plant: (tagKey === "3811-az-601") ? "selectiva" : "colectiva",
      tagKey: tagKey,
      tag: getTagDisplayByKey(tagKey),
      equipment: getTagEquipmentByKey(tagKey),
      flow: flowVal,
      isPsi: String(offsetValue).trim() !== "",
      elements: elements,
      offset: offsetValue
    };
    var url = id ? "/api/equations/" + id : "/api/equations";
    var method = id ? "PUT" : "POST";
    api(method, url, payload).then(function(r) {
      if (r.ok) { resetEquationForm(); loadEquations(); }
      else alert(r.data.error || "Error.");
    });
  }

  function renderEquationList() {
    var listEl = document.getElementById("equationList");
    if (!listEl) return;
    var canEdit = currentEquationCanEdit();
    if (equationList.length === 0) {
      listEl.innerHTML = "<p style=\"color:#888;padding:20px\">No hay registros de ecuaciones.</p>";
      var f = document.getElementById("equationForm");
      setFormEnabled(f, canEdit);
      syncEquationMode();
      return;
    }
    var html = '<div class="equation-table-scroll"><table class="equation-table"><thead><tr><th>Fecha</th><th>Hora</th><th>Planta</th><th>TAG</th><th>Flujo</th><th>Elementos</th><th>Offset</th><th></th></tr></thead><tbody>';
    equationList.forEach(function(rec) {
      html += '<tr>' +
        '<td>' + esc(rec.date) + '</td>' +
        '<td>' + esc(rec.time) + '</td>' +
        '<td>' + esc(rec.plant) + '</td>' +
        '<td><strong>' + esc(rec.tag) + '</strong><span>' + esc(rec.equipment) + '</span></td>' +
        '<td>' + esc(rec.flow) + '</td>' +
        '<td>' + ((rec.elements || []).join(", ")) + '</td>' +
        '<td>' + esc(rec.offset || "") + '</td>' +
        '<td><button class="soft-button table-action" data-eq-edit-id="' + rec.id + '" type="button"' + (canEdit ? '' : ' disabled') + '>Modificar</button> ' +
        '<button class="danger-button table-action" data-eq-delete-id="' + rec.id + '" type="button"' + (canEdit ? '' : ' disabled') + '>Eliminar</button></td></tr>';
    });
    html += '</tbody></table></div>';
    listEl.innerHTML = html;

    listEl.querySelectorAll("[data-eq-edit-id]").forEach(function(btn) {
      btn.onclick = function() {
        if (!canEdit) return;
        var id = Number(btn.dataset.eqEditId);
        var rec = equationList.find(function(r) { return r.id === id; });
        if (rec) {
          var f = document.getElementById("equationForm");
          if (!f) return;
          var idInput = f.querySelector('[name="id"]');
          var dateInput = f.querySelector('[name="date"]');
          var timeInput = f.querySelector('[name="time"]');
          var plantInput = f.querySelector('[name="plant"]');
          var tagSelect = f.querySelector('[name="tagKey"]');
          var flowSelect = f.querySelector('[name="flow"]');
          var offsetInput = f.querySelector('[name="offset"]');
          if (idInput) idInput.value = rec.id;
          if (dateInput) dateInput.value = rec.date || "";
          if (timeInput) timeInput.value = rec.time || "";
          if (plantInput) plantInput.value = rec.plant || "colectiva";
          equationsPopulateTagSelect();
          var recTagKey = eqResolveTagKey(rec.tagKey || "");
          if (tagSelect) tagSelect.value = recTagKey;
          equationsPopulateFlowSelect(recTagKey);
          if (flowSelect) flowSelect.value = rec.flow || "";
          if (offsetInput) offsetInput.value = rec.offset || "";
          f.querySelectorAll('input[name="elements"]').forEach(function(cb) {
            cb.checked = !rec.isPsi && (rec.elements || []).indexOf(cb.value) >= 0;
          });
          if (equationDeleteBtn) equationDeleteBtn.classList.remove("hidden");
          equationsAutoSetPlant(recTagKey);
          syncEquationMode();
        }
      };
    });

    listEl.querySelectorAll("[data-eq-delete-id]").forEach(function(btn) {
      btn.onclick = function() {
        if (!canEdit) return;
        var id = Number(btn.dataset.eqDeleteId);
        if (!id) return;
        confirmDialog("Esta accion eliminara el registro de ecuacion/offset seleccionado.", { title: "Eliminar registro" }).then(function(ok) {
          if (!ok) return;
          api("DELETE", "/api/equations/" + id + "?week=" + encodeURIComponent(weekInput.value) + "&username=" + encodeURIComponent(currentUser.username))
            .then(function(r) {
              if (r.ok) { resetEquationForm(); loadEquations(); notify("success", "Registro eliminado."); }
              else notify("error", r.data.error || "No fue posible eliminar.");
            });
        });
      };
    });

    var f = document.getElementById("equationForm");
    setFormEnabled(f, canEdit);
    syncEquationMode();
  }

  /* ===================== TAG TREE FOR ACTIVITIES ===================== */

  function setupTagTrees() {
    setupDelegatedTagTrees();
    document.querySelectorAll(".tag-tree-toggle").forEach(function(btn) {
      btn.onclick = function(e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        openActivityTagPanel(btn);
      };
    });
  }

  function activityTag(tag, equipment) {
    return { tag: tag, equipment: equipment, label: tag + " - " + equipment };
  }

  function activityBranch(label, children, open) {
    return { label: label, children: children || [], open: !!open };
  }

  var activeActivityTagToggle = null;

  function activityCameraTags(prefix, labelPrefix, start, end, ipBase, ipStart) {
    var list = [];
    for (var i = start; i <= end; i += 1) {
      var code = prefix + "-" + String(i).padStart(3, "0");
      var labelNum = String(i - start + 1).padStart(3, "0");
      list.push(activityTag(code, labelPrefix + " " + labelNum + " (IP " + ipBase + "." + (ipStart + i - start) + " )"));
    }
    return list;
  }

  function splitActivityTagLabel(label) {
    var match = String(label || "").match(/^([A-Z0-9.\-]+)\s+-\s+(.+)$/i);
    return match ? { tag: match[1], equipment: match[2] } : null;
  }

  function getActivityTagTree() {
    return [activityBranch("3000 - Sistema de Muestreo e Instrumentacion Sierra Gorda", [
      activityBranch("3200-PC-001 - Planta Colectiva", [
        activityBranch("3221-AZ-011 - PSI Alimentacion", []),
        activityBranch("3221-AZ-012 - Courier de Alimentacion", [
          activityBranch("3221-MU-001 - Multiplexor Molienda", [
            activityTag("3221-SA-011", "Muestreador Primario Molino No 1 MSA 3/140 Outlet 42\""),
            activityTag("3221-SA-021", "Muestreador Primario Molino No 2 MSA 3/140 Outlet 42\""),
            activityTag("3221-SA-022", "Muestreador Secundario Molino No 2 LMC 80"),
            activityTag("3221-SA-012", "Muestreador Secundario Molino No 1 LMC 80"),
            activityTag("3221-SA-031", "Muestreador Primario Molino No 3 MSA 3/140 Outlet 42\""),
            activityTag("3221-SA-032", "Muestreador Secundario Molino No 3 LMC 80")
          ], true),
          activityBranch("3221-PC-001 - Panel de Control de Analizador", []),
          activityTag("3221-PP-001", "Bomba de rechazo (Out of Service)"),
          activityBranch("3221-SO-001 - Sonda de Analizador", [])
        ], true),
        activityBranch("3311-AZ-012 - Courier de Concentrados Rougher", [
          activityBranch("3311-MU-001 - Multiplexor Concentrado Rougher", [
            activityBranch("3311-SA-012 - Muestreador concentrado fila 1 LSA 24\"", [activityTag("3311-PP-013", "Bomba Estanumi WEIR ST 1,5-9-A*")], true),
            activityBranch("3311-SA-022 - Muestreador concentrado fila 2 LSA 24\"", [activityTag("3311-PP-014", "Bomba Estanumi WEIR ST 1,5-9-A*")], true),
            activityBranch("3311-SA-032 - Muestreador concentrado fila 3 LSA 24\"", [activityTag("3311-PP-015", "Bomba Estanumi WEIR ST 1,5-9-A*")], true),
            activityBranch("3511-SA-011 - Muestreador concentrado limpieza colectiva LSA 28\" TSC", [activityTag("3511-PP-019", "Bomba Estanumi WEIR ST 1,5-9-A*")], true),
            activityBranch("3511-SA-013 - Muestreador concentrado limpieza gruesa colectiva LSA 28\" TSC", [activityTag("3511-PP-018", "Bomba Estanumi WEIR ST 1,5-9-A*")], true),
            activityBranch("3511-SA-014 - Muestreador relaves primera limpieza colectiva SPA 50 2\"", [activityTag("3511-PP-012", "Bomba Estanumi WEIR ST 1,5-9-A*")], true)
          ], true),
          activityBranch("3311-PC-002 - Panel de Control de Analizador", []),
          activityBranch("3311-SO-002 - Sonda de Analizador", [])
        ], true),
        activityBranch("3311-AZ-031 - Courier de Relaves Rougher", [
          activityBranch("3311-MU-002 - Multiplexor Relaves", [
            activityBranch("3311-SA-011 - Muestreador relave fila 1 CPS-160 30\"", [activityTag("3311-PP-007", "Bomba Estansumi WEIR ST 1,5-9-A")], true),
            activityBranch("3311-SA-021 - Muestreador relave fila 2 CPS-160 30\"", [activityTag("3311-PP-008", "Bomba Estansumi WEIR ST 1,5-9-A")], true),
            activityBranch("3311-SA-031 - Muestreador relave fila 3 CPS-160 30\"", [activityTag("3311-PP-009", "Bomba Estansumi WEIR ST 1,5-9-A")], true),
            activityBranch("3511-SA-012 - Muestreador relave Limpieza CPS-160 30\"", [activityTag("3311-PP-006", "Bomba Estansumi WEIR ST 1,5-9-A")], true),
            activityTag("5111-PP-007", "Bomba Estansumi WEIR ST 3-16-A"),
            activityTag("5111-SA-001", "Muestreador primario relave final MSA 3/300"),
            activityTag("5111-SA-002", "Muestreador secundario relave final LMC 80")
          ], true),
          activityBranch("3311-PC-001 - Panel de Control de Analizador", []),
          activityBranch("3311-SO-001 - Sonda de Analizador", [])
        ], true),
        activityBranch("3511-AZ-001 - Courier de Relave Remolienda", [
          activityBranch("3511-MU-002 - Multiplexor Planta Colas-Relave", [
            activityTag("3511-SA-001", "Muestreador alimentacion primera limpieza fila 1 LSA 24\""),
            activityTag("3511-SA-003", "Muestreador relaves columna 1 LSA 12\""),
            activityTag("3511-SA-005", "Muestreador relaves columna 2 LSA 12\""),
            activityTag("3511-SA-007", "Muestreador relaves columna 3 LSA 12\""),
            activityTag("3511-SA-009", "Muestreador relaves columna 4 LSA 12\"")
          ], true),
          activityBranch("3511-PC-001 - Panel de Control de Analizador", []),
          activityTag("3511-PP-024", "Bomba de rechazo Estansumi WEIR ST-3-16-C"),
          activityBranch("3511-SO-001 - Sonda de Analizador", [])
        ], true),
        activityBranch("3511-AZ-002 - Courier de Concentrados de Remolienda", [
          activityBranch("3511-MU-001 - Multiplexor Planta Re-Molienda", [
            activityTag("3411-SA-001", "Muestreador over hidrociclones molino No 1 remolienda LSA 32\" - TSC"),
            activityTag("3411-SA-002", "Muestreador over hidrociclones molino No 2 remolienda LSA 32\" - TSC"),
            activityTag("3511-SA-004", "Muestreador celda columna 1 MSA 1/40"),
            activityTag("3511-SA-006", "Muestreador celda columna 2 MSA 1/40"),
            activityTag("3511-SA-008", "Muestreador celda columna 3 MSA 1/40"),
            activityTag("3511-SA-010", "Muestreador celda columna 4 MSA 1/40"),
            activityTag("3511-SA-015", "Muestreador alimentacion primera limpieza fila 2 LSA 24\""),
            activityTag("3611-SA-002", "Muestreador primario concentrado bulk MSA 2/250"),
            activityTag("3611-SA-003", "Muestreador secundario concentrado bulk LMC80")
          ], true),
          activityBranch("3511-PC-002 - Panel de Control de Analizador", []),
          activityTag("3511-PP-023", "Bomba de rechazo Estansumi WEIR ST-2-10,5-C"),
          activityBranch("3511-SO-002 - Sonda de Analizador", [])
        ], true),
        activityBranch("3511-AZ-004 - PSI Re-Molienda", []),
        activityBranch("3600-SC-000 - Sistema de Camaras Planta Colectiva", [
          activityBranch("3600-SC-000.2 - Sistema de Camaras Cleaner - Scavenger", [].concat(
            activityCameraTags("CF", "Camara Primera Limpieza", 1, 5, "192.168.15", 125),
            activityCameraTags("CF", "Camara Scavenger", 6, 10, "192.168.15", 130)
          ), true),
          activityBranch("3600-SC-000.3 - Sistema de Camaras Rougher Fila 1", activityCameraTags("CF", "Camara Rougher", 11, 18, "192.168.15", 101), true),
          activityBranch("3600-SC-000.4 - Sistema de Camaras Rougher Fila 2", activityCameraTags("CF", "Camara Rougher", 21, 28, "192.168.15", 109), true),
          activityBranch("3600-SC-000.5 - Sistema de Camaras Rougher Fila 3", activityCameraTags("CF", "Camara Rougher", 31, 38, "192.168.15", 117), true),
          activityBranch("3600-SC-000.6 - Sistema de Camaras Cleaner", activityCameraTags("CM", "Camara Remolienda", 1, 6, "192.168.15", 135), true)
        ], true)
      ], true),
      activityBranch("3800-PS-000 - Planta Selectiva", [
        activityBranch("3811-AZ-601 - Courier de Molibdeno", [
          activityBranch("3811-PC-001 - Panel de Control de Analizador", []),
          activityBranch("3811-SO-001 - Sonda de Analizador", []),
          activityBranch("3811-ZM-601 - Multiplexor # 1", [
            activityTag("3811-PP-636", "Bomba Rechazo ATLAS 2X1,5B WXR"),
            activityTag("3811-PP-637", "Bomba rechazo ATLAS 2X1,5B WXR"),
            activityBranch("3811-SA-006 - Muestreador concentrado rougher selectivo linea 2", [activityTag("3811-PP-620", "Bomba ATLAS 2X1,5B WXR")], true),
            activityBranch("3811-SA-007 - Muestreador concentrado rougher selectivo linea 1", [activityTag("3811-PP-621", "Bomba ATLAS 2X1,5B WXR")], true),
            activityBranch("3811-SA-008 - Muestreador relave rougher selectivo linea 2", [activityTag("3811-PP-622", "Bomba ATLAS 2X1,5B WXR")], true),
            activityBranch("3811-SA-009 - Muestreador relave rougher selectivo linea 1", [activityTag("3811-PP-623", "Bomba ATLAS 2X1,5B WXR")], true),
            activityBranch("3811-SA-012 - Muestreador concentrado pre-rougher selectivo", [activityTag("3811-PP-624", "Bomba ATLAS 2X1,5B WXR")], true),
            activityBranch("3811-SA-031 - Muestreador Concentrado colectivo", [activityTag("3811-PP-625", "Bomba ATLAS 2X1,5B WXR")], true)
          ], true),
          activityBranch("3811-ZM-602 - Multiplexor # 2", [
            activityTag("3811-PP-631", "Bomba ATLAS 2X1,5B WXR"),
            activityTag("3811-PP-638", "Bomba Rechazo ATLAS 2X1,5B WXR"),
            activityTag("3811-PP-639", "Bomba rechazo ATLAS 2X1,5B WXR"),
            activityTag("3811-PP-640", "Bomba Rechazo ATLAS 2X1,5B WXR"),
            activityTag("3811-PP-641", "Bomba Rechazo ATLAS 2X1,5B WXR"),
            activityTag("3811-SA-001", "Muestreador Metalurgico primario alimentacion a espesador moly"),
            activityTag("3811-SA-002", "Muestreador Metalurgico secundario alimentacion a espesador moly"),
            activityBranch("3811-SA-018 - Muestreador concentrado primera limpieza LSA", [activityTag("3811-PP-626", "Bomba ATLAS 2X1,5B WXR")], true),
            activityBranch("3811-SA-023 - Muestreador concentrado segunda limpieza LSA", [activityTag("3811-PP-627", "Bomba ATLAS 2X1,5B WXR")], true),
            activityBranch("3811-SA-028 - Muestreador concentrado tercera limpieza LSA", [activityTag("3811-PP-628", "Bomba ATLAS 2X1,5B WXR")], true),
            activityBranch("3811-SA-029 - Muestreador concentrado cuarta limpieza 1 LSA", [activityTag("3811-PP-629", "Bomba ATLAS 2X1,5B WXR")], true),
            activityBranch("3811-SA-034 - Muestreador concentrado cuarta limpieza 2 LSA", [activityTag("3811-PP-630", "Bomba ATLAS 2X1,5B WXR")], true)
          ], true)
        ], true),
        activityBranch("3900-SC-000 - Sistema de Camaras Planta Selectiva", [
          activityBranch("3900-SC-000.1 - Sistema de Camaras Cleaner 1", [
            activityTag("CL-001", "Camara Cleaner 1 - Cell 001 ( IP 192.168.2.127 )"),
            activityTag("CL-002", "Camara Cleaner 1 - Cell 002 ( IP 192.168.2.128 )"),
            activityTag("CL-003", "Camara Cleaner 1 - Cell 003 ( IP 192.168.2.129 )"),
            activityTag("CL-004", "Camara Cleaner 1 - Cell 004 ( IP 192.168.2.130 )"),
            activityTag("CL-005", "Camara Cleaner 1 - Cell 005 ( IP 192.168.2.131 )"),
            activityTag("CL-006", "Camara Cleaner 1 - Cell 006 ( IP 192.168.2.132 )")
          ], true),
          activityBranch("3900-SC-000.2 - Sistema de Camaras Cleaner 2", [
            activityTag("CL-007", "Camara Cleaner 2 - Cell 001 ( IP 192.168.2.119 )"),
            activityTag("CL-008", "Camara Cleaner 2 - Cell 002 ( IP 192.168.2.120 )"),
            activityTag("CL-009", "Camara Cleaner 2 - Cell 003 ( IP 192.168.2.121 )"),
            activityTag("CL-010", "Camara Cleaner 2 - Cell 004 ( IP 192.168.2.122 )"),
            activityTag("CL-011", "Camara Cleaner 2 - Cell 005 ( IP 192.168.2.123 )"),
            activityTag("CL-012", "Camara Cleaner 2 - Cell 006 ( IP 192.168.2.124 )"),
            activityTag("CL-013", "Camara Cleaner 2 - Cell 007 ( IP 192.168.2.125 )"),
            activityTag("CL-014", "Camara Cleaner 2 - Cell 008 ( IP 192.168.2.126 )")
          ], true),
          activityBranch("3900-SC-000.3 - Sistema de Camaras Cleaner 3", [
            activityTag("CL-015", "Camara Cleaner 3 - Cell 001 ( IP 192.168.2.111 )"),
            activityTag("CL-016", "Camara Cleaner 3 - Cell 002 ( IP 192.168.2.112 )"),
            activityTag("CL-017", "Camara Cleaner 3 - Cell 003 ( IP 192.168.2.113 )"),
            activityTag("CL-018", "Camara Cleaner 3 - Cell 004 ( IP 192.168.2.114 )"),
            activityTag("CL-019", "Camara Cleaner 3 - Cell 005 ( IP 192.168.2.115 )"),
            activityTag("CL-020", "Camara Cleaner 3 - Cell 006 ( IP 192.168.2.116 )"),
            activityTag("CL-021", "Camara Cleaner 3 - Cell 007 ( IP 192.168.2.117 )"),
            activityTag("CL-022", "Camara Cleaner 3 - Cell 008 ( IP 192.168.2.118 )")
          ], true),
          activityBranch("3900-SC-000.4 - Sistema de Camaras Column Cells", [
            activityTag("CM-001", "Camara Column Cell 001 ( IP 192.168.2.133 )"),
            activityTag("CM-002", "Camara Column Cell 002 ( IP 192.168.2.134 )"),
            activityTag("CM-003", "Camara Column Cell 003 ( IP 192.168.2.135 )"),
            activityTag("CM-004", "Camara Column Cell 004 ( IP 192.168.2.136 )")
          ], true),
          activityBranch("3900-SC-000.5 - Sistema de Camaras Rougher Cells", [
            activityTag("CF-001", "Camara Rougher Cell 001 ( IP 192.168.2.101 )"),
            activityTag("CF-002", "Camara Rougher Cell 002 ( IP 192.168.2.102 )"),
            activityTag("CF-003", "Camara Rougher Cell 003 ( IP 192.168.2.103 )"),
            activityTag("CF-004", "Camara Rougher Cell 004 ( IP 192.168.2.104 )"),
            activityTag("CF-005", "Camara Rougher Cell 005 ( IP 192.168.2.105 )"),
            activityTag("CF-006", "Camara Rougher Cell 006 ( IP 192.168.2.106 )"),
            activityTag("CF-007", "Camara Rougher Cell 007 ( IP 192.168.2.107 )"),
            activityTag("CF-008", "Camara Rougher Cell 008 ( IP 192.168.2.108 )"),
            activityTag("CF-009", "Camara Rougher Cell 009 ( IP 192.168.2.109 )"),
            activityTag("CF-010", "Camara Rougher Cell 010 ( IP 192.168.2.110 )")
          ], true)
        ], true)
      ], true)
    ], true)];
  }

  function buildActivityTagTreeNodes(nodes) {
    return nodes.map(function(node) {
      if (node.children) {
        var parsed = splitActivityTagLabel(node.label);
        var attrs = parsed ? ' data-tag="' + esc(parsed.tag) + '" data-equipment="' + esc(parsed.equipment) + '"' : '';
        return '<details class="tag-branch"' + (node.open ? ' open' : '') + '><summary class="tag-summary"' + attrs + '><span class="tag-label">' + esc(node.label) + '</span></summary>' + buildActivityTagTreeNodes(node.children) + '</details>';
      }
      return '<button type="button" class="tag-node" data-tag="' + esc(node.tag) + '" data-equipment="' + esc(node.equipment) + '">' + esc(node.label) + '</button>';
    }).join("");
  }

  function buildTagTreeHTML() {
    return buildActivityTagTreeNodes(getActivityTagTree());
  }

  function ensureActivityTagModal() {
    var modal = document.getElementById("activityTagModal");
    if (modal) return modal;
    modal = document.createElement("div");
    modal.id = "activityTagModal";
    modal.className = "tag-modal hidden";
    modal.innerHTML = '<div class="tag-modal-backdrop" data-tag-modal-close="1"></div>' +
      '<section class="tag-modal-card" role="dialog" aria-modal="true" aria-labelledby="activityTagModalTitle">' +
      '<header class="tag-modal-header"><div><p class="label-top">Menu de equipos</p><h3 id="activityTagModalTitle">Seleccione TAG</h3></div><button class="tag-modal-close" type="button" data-tag-modal-close="1">Cerrar</button></header>' +
      '<div class="tag-modal-tools"><input id="activityTagSearch" type="search" placeholder="Buscar TAG o equipo..." autocomplete="off" /><span id="activityTagPicked" class="tag-picked">Seleccione un elemento del arbol</span></div>' +
      '<div id="activityTagTree" class="tag-tree-panel tag-tree-modal-panel"></div>' +
      '</section>';
    document.body.appendChild(modal);
    var tree = modal.querySelector("#activityTagTree");
    tree.innerHTML = buildTagTreeHTML();
    attachTagTreeEvents(tree, null);
    modal.querySelectorAll("[data-tag-modal-close]").forEach(function(btn) {
      btn.onclick = function() { closeActivityTagModal(); };
    });
    modal.querySelector("#activityTagSearch").oninput = function() {
      filterActivityTagTree(tree, this.value);
    };
    return modal;
  }

  function closeActivityTagModal() {
    var modal = document.getElementById("activityTagModal");
    if (modal) modal.classList.add("hidden");
  }

  function filterActivityTagTree(tree, text) {
    var term = String(text || "").trim().toLowerCase();
    tree.querySelectorAll(".tag-node, .tag-summary").forEach(function(row) {
      row.classList.toggle("tag-filter-hide", term && row.textContent.toLowerCase().indexOf(term) < 0);
    });
    if (term) {
      tree.querySelectorAll("details.tag-branch").forEach(function(branch) { branch.open = true; });
    }
  }

  function attachTagTreeEvents(panel, toggleBtn) {
    panel.querySelectorAll(".tag-node").forEach(function(node) {
      node.onclick = function() {
        selectActivityTagNode(node, panel, toggleBtn, true);
      };
    });
    panel.querySelectorAll(".tag-summary[data-tag]").forEach(function(node) {
      node.onclick = function() {
        selectActivityTagNode(node, panel, toggleBtn, false);
      };
    });
  }

  function selectActivityTagNode(node, panel, toggleBtn, closePanel) {
    toggleBtn = toggleBtn || activeActivityTagToggle;
    var form = toggleBtn.closest("form");
    if (form) {
      form.elements.tag.value = node.dataset.tag || "";
      form.elements.equipment.value = node.dataset.equipment || "";
      toggleBtn.textContent = node.dataset.tag || "Seleccione TAG";
    }
    panel.querySelectorAll(".tag-node, .tag-summary").forEach(function(n) { n.classList.remove("selected"); });
    node.classList.add("selected");
    var picked = document.getElementById("activityTagPicked");
    if (picked) picked.textContent = (node.dataset.tag || "") + " - " + (node.dataset.equipment || "");
    if (closePanel) {
      panel.classList.add("hidden");
      closeActivityTagModal();
    }
  }

  function openActivityTagPanel(btn) {
    activeActivityTagToggle = btn;
    var modal = ensureActivityTagModal();
    var search = modal.querySelector("#activityTagSearch");
    var tree = modal.querySelector("#activityTagTree");
    if (tree) tree.classList.remove("hidden");
    filterActivityTagTree(tree, "");
    if (search) search.value = "";
    modal.classList.remove("hidden");
    if (search) search.focus();
  }

  function setupDelegatedTagTrees() {
    if (document.body && document.body.dataset.tagTreeDelegated === "1") return;
    if (document.body) document.body.dataset.tagTreeDelegated = "1";
    document.addEventListener("click", function(e) {
      var toggle = e.target && e.target.closest ? e.target.closest(".tag-tree-toggle") : null;
      if (toggle) {
        e.preventDefault();
        e.stopPropagation();
        openActivityTagPanel(toggle);
        return;
      }

      var modal = e.target && e.target.closest ? e.target.closest("#activityTagModal") : null;
      var insidePanel = e.target && e.target.closest ? e.target.closest(".tag-tree-panel") : null;
      if (!insidePanel && !modal) closeActivityTagModal();
    });
    document.addEventListener("keydown", function(e) {
      if (e.key === "Escape") closeActivityTagModal();
    });
  }

  function setUserListStatus(text, kind) {
    var el = document.getElementById("userListStatus");
    if (!el) return;
    el.textContent = text || "";
    el.className = "hint user-list-status" + (kind ? " " + kind : "");
  }

  function populateUsernameSelect() {
    var sel = document.getElementById("username");
    if (!sel) return;
    if (sel.tagName !== "SELECT") return;
    var prev = sel.value;
    var list = (users || []).filter(function(u) { return u && u.username; });
    var placeholder = list.length === 0 ? "-- No hay usuarios. Usa Gestion de usuarios --" : "-- Seleccione usuario --";
    var fragments = ['<option value="">' + placeholder + '</option>'];
    list.forEach(function(u) {
      fragments.push('<option value="' + esc(u.username) + '">' + esc(u.username) + '</option>');
    });
    sel.innerHTML = fragments.join("");
    if (prev && list.some(function(u) { return u.username === prev; })) sel.value = prev;
    else if (list.some(function(u) { return u.username === "admin"; })) sel.value = "admin";
    if (list.length === 0) setUserListStatus("Sin usuarios cargados", "warn");
    else setUserListStatus(list.length + " usuario" + (list.length === 1 ? "" : "s") + " disponible" + (list.length === 1 ? "" : "s"), "ok");
  }

  function refreshUsers(callback) {
    setUserListStatus("Cargando lista de usuarios...", "pending");
    var url = "/api/users?_=" + Date.now();
    return fetch(url, { cache: "no-store", credentials: "same-origin" })
      .then(function(r) {
        console.log("[refreshUsers] HTTP", r.status, "from", url);
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function(data) {
        console.log("[refreshUsers] received", Array.isArray(data) ? data.length : "non-array", "users");
        users = Array.isArray(data) ? data : [];
        populateUsernameSelect();
        if (typeof callback === "function") callback(users);
      })
      .catch(function(err) {
        console.error("[refreshUsers] failed:", err);
        if (!users || users.length === 0) populateUsernameSelect();
        setUserListStatus("Error al cargar usuarios: " + (err && err.message ? err.message : "sin conexion"), "error");
      });
  }

  function bootstrap() {
    if (users && users.length > 0) {
      populateUsernameSelect();
      refreshUsers();
    } else {
      refreshUsers();
    }
    setupTagTrees();
    populateThermoStatsSelects();
    equationsPopulateTagSelect();
    setTimeout(function() { if (!users || users.length === 0) refreshUsers(); }, 800);
  }

  var usernameSelectEl = document.getElementById("username");
  if (usernameSelectEl) {
    usernameSelectEl.addEventListener("focus", function() {
      if (!users || users.length === 0) refreshUsers();
    });
    usernameSelectEl.addEventListener("mousedown", function() {
      if (!users || users.length === 0) refreshUsers();
    });
  }
  var reloadUsersBtn = document.getElementById("reloadUsersBtn");
  if (reloadUsersBtn) reloadUsersBtn.onclick = function() { refreshUsers(); };

  // Expone para depuracion manual desde consola
  window.__metsoDebug = { refreshUsers: refreshUsers, getUsers: function() { return users.slice(); } };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap);
  } else {
    bootstrap();
  }
})();

  /* ===================== INFORMES ===================== */
  function initInformes() {
    var section = document.getElementById("informes");
    var typeSelect = document.getElementById("reportTypeSelect");
    var refreshBtn = document.getElementById("loadPreviewBtn");
    var generateBtn = document.getElementById("generateReportBtn");
    var status = document.getElementById("reportStatus");
    if (!section || !typeSelect) return;

    var completionChart = window.__metsoReportCompletionChart || null;
    var causeChart = window.__metsoReportCauseChart || null;
    var aforoChart = window.__metsoReportAforoChart || null;
    var thermoChart = window.__metsoReportThermoChart || null;
    var activePlant = section.dataset.reportPlant || "selectiva";

    function escLocal(value) {
      return String(value == null ? "" : value).replace(/[&<>'"]/g, function(c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c];
      });
    }

    function localApi(method, url, body) {
      return fetch(url, {
        method: method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined
      }).then(function(res) {
        return res.json().catch(function() { return {}; }).then(function(data) { return { ok: res.ok, data: data }; });
      });
    }

    function currentWeekValue() {
      var activeWeek = document.getElementById("weekInput");
      return activeWeek && activeWeek.value ? activeWeek.value : getWeekNumber();
    }

    function setStatus(text, kind) {
      if (!status) return;
      status.className = "report-status" + (kind ? " " + kind : "");
      status.textContent = text || "";
    }

    function renderKpis(data) {
      var target = document.getElementById("reportKpis");
      var s = data.summary || {};
      if (!target) return;
      var pct = s.planCompliance || 0;
      target.innerHTML = [
        { label: "Plan semanal", value: s.plannedMaintenanceTotal || 0, hint: "Mantenciones programadas desde plan", glow: "rgba(255,106,19,.18)" },
        { label: "Cumplimiento", value: pct + "%", hint: (s.planOk || 0) + " OK / " + (s.planProcess || 0) + " proceso", glow: "rgba(46,125,50,.16)" },
        { label: "Canceladas", value: s.planCancelled || 0, hint: (s.planPending || 0) + " pendientes en plan", glow: "rgba(192,57,43,.16)" },
        { label: "Emergentes / mejoras", value: (s.emergencyTotal || 0) + (s.improvementTotal || 0), hint: (s.emergencyTotal || 0) + " emergentes / " + (s.improvementTotal || 0) + " mejoras", glow: "rgba(24,115,171,.16)" }
      ].map(function(kpi) {
        return '<article class="report-kpi" style="--kpi-glow:' + kpi.glow + '"><span>' + escLocal(kpi.label) + '</span><strong>' + escLocal(kpi.value) + '</strong><small>' + escLocal(kpi.hint) + '</small></article>';
      }).join("");
    }

    function renderBrief(data) {
      var brief = document.getElementById("reportExecutiveBrief");
      var detail = document.getElementById("reportDetailList");
      var s = data.summary || {};
      var pct = s.planCompliance || 0;
      if (brief) {
        brief.innerHTML = '<h4>Lectura ejecutiva</h4>' +
          '<p>La planta ' + escLocal(data.plantLabel || data.plant || "") + ' registra <strong>' + (s.plannedMaintenanceTotal || 0) + '</strong> mantenciones programadas desde Plan Semanal y un avance de cierre de <strong>' + pct + '%</strong> para ' + escLocal(data.week || "") + '.</p>' +
          '<ul>' +
          '<li><span class="report-dot"></span><span>' + (s.planOk || 0) + ' programadas marcadas Ok, ' + (s.planProcess || 0) + ' en proceso, ' + (s.planPending || 0) + ' pendientes y ' + (s.planCancelled || 0) + ' canceladas.</span></li>' +
          '<li><span class="report-dot"></span><span>' + ((s.emergencyTotal || 0) + (s.improvementTotal || 0)) + ' actividades fueron registradas esta semana.</span></li>' +
          '<li><span class="report-dot"></span><span>' + (s.equationsTotal || 0) + ' registros de ecuaciones/offset disponibles.</span></li>' +
          '</ul>';
      }
      if (detail) {
        var items = (data.latest || []).slice(0, 7);
        detail.innerHTML = '<h4>Ultimos hitos</h4>' + (items.length ? '<ul>' + items.map(function(item) {
          return '<li><span class="report-dot"></span><span><strong>' + escLocal(item.title || "Registro") + '</strong><br><small>' + escLocal(item.meta || "") + '</small></span></li>';
        }).join("") + '</ul>' : '<p class="hint">Sin hitos registrados para esta vista.</p>');
      }
    }

    function renderCharts(data) {
      if (!window.Chart) return;
      var s = data.summary || {};
      var completionCanvas = document.getElementById("reportCompletionChart");
      var causeCanvas = document.getElementById("reportCauseChart");
      var aforoCanvas = document.getElementById("reportAforoChart");
      var thermoCanvas = document.getElementById("reportThermoChart");
      var completionLabel = document.getElementById("reportCompletionLabel");
      var open = Math.max(0, (s.planPending || 0) + (s.planProcess || 0));
      var pct = s.planCompliance || 0;
      if (completionLabel) completionLabel.textContent = pct + "%";
      if (completionChart) completionChart.destroy();
      if (causeChart) causeChart.destroy();
      if (aforoChart) aforoChart.destroy();
      if (thermoChart) thermoChart.destroy();
      if (completionCanvas) {
        completionChart = new Chart(completionCanvas, {
          type: "doughnut",
          data: { labels: ["Ok", "Pendiente/proceso", "Cancelada"], datasets: [{ data: [s.planOk || 0, open, s.planCancelled || 0], backgroundColor: ["#ff6a13", "#dce8ef", "#c0392b"], borderWidth: 0 }] },
          options: { cutout: "72%", plugins: { legend: { position: "bottom" } } }
        });
        window.__metsoReportCompletionChart = completionChart;
      }
      if (causeCanvas) {
        var causes = data.operationalCauseSummary || data.planCauseSummary || [];
        causeChart = new Chart(causeCanvas, {
          type: "doughnut",
          data: {
            labels: causes.map(function(row) { return row.label; }),
            datasets: [{ data: causes.map(function(row) { return row.total; }), backgroundColor: ["#0d344f", "#ff6a13", "#1873ab", "#2e7d32", "#c0392b", "#6a5acd"], borderWidth: 0 }]
          },
          options: { cutout: "58%", plugins: { legend: { position: "bottom" } } }
        });
        window.__metsoReportCauseChart = causeChart;
      }
      if (aforoCanvas) {
        var aforoRows = data.aforoChart || [];
        aforoChart = new Chart(aforoCanvas, {
          type: "bar",
          data: { labels: aforoRows.map(function(r) { return r.label; }), datasets: [{ label: "Litros", data: aforoRows.map(function(r) { return r.liters; }), backgroundColor: "#1873ab", borderRadius: 10 }] },
          options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
        });
        window.__metsoReportAforoChart = aforoChart;
      }
      renderClassicAforoChart(data.aforoChart || []);
      if (thermoCanvas) {
        var thermoRows = data.thermoPumps || [];
        var pumpLabel = document.getElementById("reportThermoPumpLabel");
        if (pumpLabel) pumpLabel.textContent = thermoRows.length ? thermoRows.length + " bombas" : "Sin datos";
        thermoChart = new Chart(thermoCanvas, {
          type: "bar",
          data: { labels: thermoRows.map(function(r) { return r.tag; }), datasets: [
            { label: "Promedio (°C)", data: thermoRows.map(function(r) { return r.avg; }), backgroundColor: "#ff6a13", borderRadius: 8 },
            { label: "Maxima (°C)", data: thermoRows.map(function(r) { return r.max; }), backgroundColor: "#c0392b", borderRadius: 8 }
          ] },
          options: { plugins: { legend: { position: "bottom" } }, scales: { y: { beginAtZero: false }, x: { ticks: { maxRotation: 55, minRotation: 35 } } } }
        });
        window.__metsoReportThermoChart = thermoChart;
      }
    }

    function renderClassicAforoChart(rows) {
      var target = document.getElementById("reportAforoClassic");
      if (!target) return;
      if (!rows.length) { target.innerHTML = '<p class="report-section-empty">Sin datos de aforo para esta semana.</p>'; return; }
      var maxLiters = Math.max.apply(null, rows.map(function(r) { return Number(r.liters) || 0; }).concat([1]));
      target.innerHTML = '<div class="aforo-excel-chart">' + rows.map(function(r) {
        var liters = Number(r.liters) || 0;
        var pct = Math.max(2, (liters / maxLiters) * 100);
        return '<div class="aforo-excel-bar-row"><span>' + escLocal(r.label || "") + '</span><div class="aforo-excel-bar-track"><i style="width:' + pct.toFixed(1) + '%"></i></div><strong>' + liters.toFixed(2).replace(/\.00$/, "") + ' L</strong></div>';
      }).join("") + '</div>';
    }

    function table(headers, rows) {
      if (!rows.length) return '<p class="report-section-empty">Sin datos para mostrar.</p>';
      return '<div class="report-table-wrap"><table class="report-table"><thead><tr>' + headers.map(function(h) { return '<th>' + escLocal(h) + '</th>'; }).join("") + '</tr></thead><tbody>' + rows.join("") + '</tbody></table></div>';
    }

    function renderReportSections(data) {
      var planPanel = document.getElementById("reportPlanPanel");
      var activitiesPanel = document.getElementById("reportActivitiesPanel");
      var equationsPanel = document.getElementById("reportEquationsPanel");
      if (planPanel) {
        var s = data.summary || {};
        var dayRows = (data.maintenanceDaySummary || []).map(function(row) {
          return '<tr><td>' + escLocal(row.day || "") + '</td><td>' + row.total + '</td><td>' + row.ok + '</td><td>' + row.process + '</td><td>' + row.pending + '</td><td>' + row.cancelled + '</td></tr>';
        });
        var causes = data.operationalCauseSummary || data.planCauseSummary || [];
        var maxCause = Math.max.apply(null, causes.map(function(row) { return row.total; }).concat([1]));
        var causeBars = '<div class="report-cause-bars">' + causes.map(function(row) {
          var pct = Math.max(2, (row.total / maxCause) * 100);
          return '<div class="report-cause-row"><span>' + escLocal(row.label) + '</span><div class="report-cause-track"><i style="width:' + pct.toFixed(1) + '%"></i></div><strong>' + row.total + '</strong></div>';
        }).join("") + '</div>';
        planPanel.innerHTML = '<div class="report-panel-title"><span>Resumen mantenciones programadas</span><strong>Plan semanal</strong></div>' +
          '<div class="report-maint-summary">' +
          '<div class="report-maint-card"><span>Total</span><strong>' + (s.plannedMaintenanceTotal || 0) + '</strong></div>' +
          '<div class="report-maint-card"><span>Cumplimiento</span><strong>' + (s.planCompliance || 0) + '%</strong></div>' +
          '<div class="report-maint-card"><span>En proceso</span><strong>' + (s.planProcess || 0) + '</strong></div>' +
          '<div class="report-maint-card"><span>Canceladas</span><strong>' + (s.planCancelled || 0) + '</strong></div>' +
          '</div>' +
          table(["Fecha", "Total", "Ok", "Proceso", "Pend.", "Canc."], dayRows) + causeBars;
      }
      if (activitiesPanel) {
        var acts = [];
        (data.emergencies || []).forEach(function(item) { acts.push({ kind: "Emergente", item: item }); });
        (data.improvements || []).forEach(function(item) { acts.push({ kind: "Mejora", item: item }); });
        var actRows = acts.map(function(row) {
          return '<tr><td><span class="report-mini-badge">' + escLocal(row.kind) + '</span></td><td>' + escLocal(row.item.date || "") + '</td><td><strong>' + escLocal(row.item.equipment || "") + '</strong><br>' + escLocal(row.item.description || "") + '</td><td>' + escLocal(row.item.workOrder || row.item.workOrderSgscm || "") + '</td></tr>';
        });
        activitiesPanel.innerHTML = '<div class="report-panel-title"><span>Emergentes y mejoras</span><strong>' + acts.length + '</strong></div>' + table(["Tipo", "Fecha", "Detalle", "OT"], actRows);
      }
      if (equationsPanel) {
        var eqRows = (data.equations || []).map(function(eq) {
          var parsedElements = [];
          try { parsedElements = JSON.parse(eq.elements || "[]") || []; } catch (e) { parsedElements = []; }
          var elements = eq.is_psi ? (eq.offset || "") : parsedElements.join(", ");
          return '<tr><td>' + escLocal(eq.date || "") + '<br><small>' + escLocal(eq.time || "") + '</small></td><td><strong>' + escLocal(eq.tag || "") + '</strong><br>' + escLocal(eq.equipment || "") + '</td><td>' + escLocal(eq.flow || "") + '</td><td>' + escLocal(elements || "") + '</td></tr>';
        });
        equationsPanel.innerHTML = '<div class="report-panel-title"><span>Listado de ecuaciones</span><strong>' + (data.equations || []).length + '</strong></div>' + table(["Fecha", "Equipo", "Flujo", "Elementos / offset"], eqRows);
      }
      var thermoPanel = document.getElementById("reportThermoPanel");
      if (thermoPanel) {
        var pumpRows = (data.thermoPumps || []).map(function(row) {
          return '<tr><td>' + escLocal(row.fecha || "") + '</td><td><strong>' + escLocal(row.tag || "") + '</strong><br>' + escLocal(row.ubicacion || "") + '</td><td>' + escLocal(row.avg == null ? "Sin acceso" : row.avg + " °C") + '</td><td>' + escLocal(row.max == null ? "" : row.max + " °C") + '</td><td>' + escLocal(row.observacion || "") + '</td></tr>';
        });
        thermoPanel.innerHTML = '<div class="report-panel-title"><span>Bombas termografia de la semana</span><strong>' + (data.thermoPumps || []).length + '</strong></div>' + table(["Fecha", "Bomba", "Promedio", "Maxima", "Obs."], pumpRows);
      }
    }

    function updatePlantButtons() {
      section.querySelectorAll("[data-report-plant]").forEach(function(btn) {
        btn.classList.toggle("active", btn.dataset.reportPlant === activePlant);
      });
    }

    function loadDashboard() {
      var week = currentWeekValue();
      var type = typeSelect.value || "full";
      var pill = document.getElementById("reportWeekPill");
      if (pill) pill.textContent = week;
      setStatus("Cargando informe de semana actual...", "loading");
      updatePlantButtons();
      localApi("GET", "/api/report-preview?week=" + encodeURIComponent(week) + "&plant=" + encodeURIComponent(activePlant) + "&type=" + encodeURIComponent(type)).then(function(r) {
        if (!r.ok) throw new Error(r.data && r.data.error ? r.data.error : "No fue posible cargar informe.");
        var range = document.getElementById("reportWeekRange");
        if (range) range.textContent = (r.data.dateRange || "Semana actual") + " | " + (r.data.plantLabel || activePlant) + " | Vista " + type;
        renderKpis(r.data);
        renderBrief(r.data);
        renderReportSections(r.data);
        renderCharts(r.data);
        setStatus("Informe actualizado " + new Date().toLocaleTimeString(), "");
      }).catch(function(err) {
        setStatus(err.message || "Error al cargar informe.", "");
      });
    }

    if (!section.dataset.reportBound) {
      section.dataset.reportBound = "1";
      section.querySelectorAll("[data-report-plant]").forEach(function(btn) {
        btn.addEventListener("click", function() {
          activePlant = btn.dataset.reportPlant || "selectiva";
          section.dataset.reportPlant = activePlant;
          loadDashboard();
        });
      });
      if (refreshBtn) refreshBtn.addEventListener("click", loadDashboard);
      typeSelect.addEventListener("change", loadDashboard);
      if (generateBtn) {
        generateBtn.addEventListener("click", function() {
          var week = currentWeekValue();
          setStatus("Generando PDF ejecutivo...", "loading");
          localApi("POST", "/api/report-generate", { week: week, plant: activePlant, type: typeSelect.value || "full" }).then(function(r) {
            if (r.ok && r.data && r.data.downloadUrl) {
              setStatus("PDF generado correctamente.", "");
              window.open(r.data.downloadUrl, "_blank");
            } else {
              setStatus(r.data && r.data.error ? r.data.error : "Error al generar PDF.", "");
            }
          }).catch(function() { setStatus("Error al generar PDF.", ""); });
        });
      }
    }
    loadDashboard();
  }
