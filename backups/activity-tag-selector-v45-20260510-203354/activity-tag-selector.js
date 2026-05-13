(function() {
  "use strict";

  var activeButton = null;

  function tag(code, name) {
    return { code: code, name: name };
  }

  function group(name, items) {
    return { name: name, items: items || [] };
  }

  function cameras(prefix, label, start, end, ipBase, ipStart) {
    var out = [];
    for (var i = start; i <= end; i += 1) {
      var code = prefix + "-" + String(i).padStart(3, "0");
      var number = String(i - start + 1).padStart(3, "0");
      out.push(tag(code, label + " " + number + " (IP " + ipBase + "." + (ipStart + i - start) + " )"));
    }
    return out;
  }

  var CATALOG = [
    group("3000 - Sistema de Muestreo e Instrumentacion Sierra Gorda", [
      group("3200-PC-001 - Planta Colectiva", [
        group("3221-AZ-011 - PSI Alimentacion", []),
        group("3221-AZ-012 - Courier de Alimentacion", [
          group("3221-MU-001 - Multiplexor Molienda", [
            tag("3221-SA-011", "Muestreador Primario Molino No 1 MSA 3/140 Outlet 42\""),
            tag("3221-SA-021", "Muestreador Primario Molino No 2 MSA 3/140 Outlet 42\""),
            tag("3221-SA-022", "Muestreador Secundario Molino No 2 LMC 80"),
            tag("3221-SA-012", "Muestreador Secundario Molino No 1 LMC 80"),
            tag("3221-SA-031", "Muestreador Primario Molino No 3 MSA 3/140 Outlet 42\""),
            tag("3221-SA-032", "Muestreador Secundario Molino No 3 LMC 80")
          ]),
          tag("3221-PC-001", "Panel de Control de Analizador"),
          tag("3221-PP-001", "Bomba de rechazo (Out of Service)"),
          tag("3221-SO-001", "Sonda de Analizador")
        ]),
        group("3311-AZ-012 - Courier de Concentrados Rougher", [
          group("3311-MU-001 - Multiplexor Concentrado Rougher", [
            group("3311-SA-012 - Muestreador concentrado fila 1 LSA 24\"", [tag("3311-PP-013", "Bomba Estanumi WEIR ST 1,5-9-A*")]),
            group("3311-SA-022 - Muestreador concentrado fila 2 LSA 24\"", [tag("3311-PP-014", "Bomba Estanumi WEIR ST 1,5-9-A*")]),
            group("3311-SA-032 - Muestreador concentrado fila 3 LSA 24\"", [tag("3311-PP-015", "Bomba Estanumi WEIR ST 1,5-9-A*")]),
            group("3511-SA-011 - Muestreador concentrado limpieza colectiva LSA 28\" TSC", [tag("3511-PP-019", "Bomba Estanumi WEIR ST 1,5-9-A*")]),
            group("3511-SA-013 - Muestreador concentrado limpieza gruesa colectiva LSA 28\" TSC", [tag("3511-PP-018", "Bomba Estanumi WEIR ST 1,5-9-A*")]),
            group("3511-SA-014 - Muestreador relaves primera limpieza colectiva SPA 50 2\"", [tag("3511-PP-012", "Bomba Estanumi WEIR ST 1,5-9-A*")])
          ]),
          tag("3311-PC-002", "Panel de Control de Analizador"),
          tag("3311-SO-002", "Sonda de Analizador")
        ]),
        group("3311-AZ-031 - Courier de Relaves Rougher", [
          group("3311-MU-002 - Multiplexor Relaves", [
            group("3311-SA-011 - Muestreador relave fila 1 CPS-160 30\"", [tag("3311-PP-007", "Bomba Estansumi WEIR ST 1,5-9-A")]),
            group("3311-SA-021 - Muestreador relave fila 2 CPS-160 30\"", [tag("3311-PP-008", "Bomba Estansumi WEIR ST 1,5-9-A")]),
            group("3311-SA-031 - Muestreador relave fila 3 CPS-160 30\"", [tag("3311-PP-009", "Bomba Estansumi WEIR ST 1,5-9-A")]),
            group("3511-SA-012 - Muestreador relave Limpieza CPS-160 30\"", [tag("3311-PP-006", "Bomba Estansumi WEIR ST 1,5-9-A")]),
            tag("5111-PP-007", "Bomba Estansumi WEIR ST 3-16-A"),
            tag("5111-SA-001", "Muestreador primario relave final MSA 3/300"),
            tag("5111-SA-002", "Muestreador secundario relave final LMC 80")
          ]),
          tag("3311-PC-001", "Panel de Control de Analizador"),
          tag("3311-SO-001", "Sonda de Analizador")
        ]),
        group("3511-AZ-001 - Courier de Relave Remolienda", [
          group("3511-MU-002 - Multiplexor Planta Colas-Relave", [
            tag("3511-SA-001", "Muestreador alimentacion primera limpieza fila 1 LSA 24\""),
            tag("3511-SA-003", "Muestreador relaves columna 1 LSA 12\""),
            tag("3511-SA-005", "Muestreador relaves columna 2 LSA 12\""),
            tag("3511-SA-007", "Muestreador relaves columna 3 LSA 12\""),
            tag("3511-SA-009", "Muestreador relaves columna 4 LSA 12\"")
          ]),
          tag("3511-PC-001", "Panel de Control de Analizador"),
          tag("3511-PP-024", "Bomba de rechazo Estansumi WEIR ST-3-16-C"),
          tag("3511-SO-001", "Sonda de Analizador")
        ]),
        group("3511-AZ-002 - Courier de Concentrados de Remolienda", [
          group("3511-MU-001 - Multiplexor Planta Re-Molienda", [
            tag("3411-SA-001", "Muestreador over hidrociclones molino No 1 remolienda LSA 32\" - TSC"),
            tag("3411-SA-002", "Muestreador over hidrociclones molino No 2 remolienda LSA 32\" - TSC"),
            tag("3511-SA-004", "Muestreador celda columna 1 MSA 1/40"),
            tag("3511-SA-006", "Muestreador celda columna 2 MSA 1/40"),
            tag("3511-SA-008", "Muestreador celda columna 3 MSA 1/40"),
            tag("3511-SA-010", "Muestreador celda columna 4 MSA 1/40"),
            tag("3511-SA-015", "Muestreador alimentacion primera limpieza fila 2 LSA 24\""),
            tag("3611-SA-002", "Muestreador primario concentrado bulk MSA 2/250"),
            tag("3611-SA-003", "Muestreador secundario concentrado bulk LMC80")
          ]),
          tag("3511-PC-002", "Panel de Control de Analizador"),
          tag("3511-PP-023", "Bomba de rechazo Estansumi WEIR ST-2-10,5-C"),
          tag("3511-SO-002", "Sonda de Analizador")
        ]),
        group("3511-AZ-004 - PSI Re-Molienda", []),
        group("3600-SC-000 - Sistema de Camaras Planta Colectiva", [
          group("3600-SC-000.2 - Sistema de Camaras Cleaner - Scavenger", cameras("CF", "Camara Primera Limpieza", 1, 5, "192.168.15", 125).concat(cameras("CF", "Camara Scavenger", 6, 10, "192.168.15", 130))),
          group("3600-SC-000.3 - Sistema de Camaras Rougher Fila 1", cameras("CF", "Camara Rougher", 11, 18, "192.168.15", 101)),
          group("3600-SC-000.4 - Sistema de Camaras Rougher Fila 2", cameras("CF", "Camara Rougher", 21, 28, "192.168.15", 109)),
          group("3600-SC-000.5 - Sistema de Camaras Rougher Fila 3", cameras("CF", "Camara Rougher", 31, 38, "192.168.15", 117)),
          group("3600-SC-000.6 - Sistema de Camaras Cleaner", cameras("CM", "Camara Remolienda", 1, 6, "192.168.15", 135))
        ])
      ]),
      group("3800-PS-000 - Planta Selectiva", [
        group("3811-AZ-601 - Courier de Molibdeno", [
          tag("3811-PC-001", "Panel de Control de Analizador"),
          tag("3811-SO-001", "Sonda de Analizador"),
          group("3811-ZM-601 - Multiplexor # 1", [
            tag("3811-PP-636", "Bomba Rechazo ATLAS 2X1,5B WXR"),
            tag("3811-PP-637", "Bomba rechazo ATLAS 2X1,5B WXR"),
            group("3811-SA-006 - Muestreador concentrado rougher selectivo linea 2", [tag("3811-PP-620", "Bomba ATLAS 2X1,5B WXR")]),
            group("3811-SA-007 - Muestreador concentrado rougher selectivo linea 1", [tag("3811-PP-621", "Bomba ATLAS 2X1,5B WXR")]),
            group("3811-SA-008 - Muestreador relave rougher selectivo linea 2", [tag("3811-PP-622", "Bomba ATLAS 2X1,5B WXR")]),
            group("3811-SA-009 - Muestreador relave rougher selectivo linea 1", [tag("3811-PP-623", "Bomba ATLAS 2X1,5B WXR")]),
            group("3811-SA-012 - Muestreador concentrado pre-rougher selectivo", [tag("3811-PP-624", "Bomba ATLAS 2X1,5B WXR")]),
            group("3811-SA-031 - Muestreador Concentrado colectivo", [tag("3811-PP-625", "Bomba ATLAS 2X1,5B WXR")])
          ]),
          group("3811-ZM-602 - Multiplexor # 2", [
            tag("3811-PP-631", "Bomba ATLAS 2X1,5B WXR"),
            tag("3811-PP-638", "Bomba Rechazo ATLAS 2X1,5B WXR"),
            tag("3811-PP-639", "Bomba rechazo ATLAS 2X1,5B WXR"),
            tag("3811-PP-640", "Bomba Rechazo ATLAS 2X1,5B WXR"),
            tag("3811-PP-641", "Bomba Rechazo ATLAS 2X1,5B WXR"),
            tag("3811-SA-001", "Muestreador Metalurgico primario alimentacion a espesador moly"),
            tag("3811-SA-002", "Muestreador Metalurgico secundario alimentacion a espesador moly"),
            group("3811-SA-018 - Muestreador concentrado primera limpieza LSA", [tag("3811-PP-626", "Bomba ATLAS 2X1,5B WXR")]),
            group("3811-SA-023 - Muestreador concentrado segunda limpieza LSA", [tag("3811-PP-627", "Bomba ATLAS 2X1,5B WXR")]),
            group("3811-SA-028 - Muestreador concentrado tercera limpieza LSA", [tag("3811-PP-628", "Bomba ATLAS 2X1,5B WXR")]),
            group("3811-SA-029 - Muestreador concentrado cuarta limpieza 1 LSA", [tag("3811-PP-629", "Bomba ATLAS 2X1,5B WXR")]),
            group("3811-SA-034 - Muestreador concentrado cuarta limpieza 2 LSA", [tag("3811-PP-630", "Bomba ATLAS 2X1,5B WXR")])
          ])
        ]),
        group("3900-SC-000 - Sistema de Camaras Planta Selectiva", [
          group("3900-SC-000.1 - Sistema de Camaras Cleaner 1", cameras("CL", "Camara Cleaner 1 - Cell", 1, 6, "192.168.2", 127)),
          group("3900-SC-000.2 - Sistema de Camaras Cleaner 2", cameras("CL", "Camara Cleaner 2 - Cell", 7, 14, "192.168.2", 119)),
          group("3900-SC-000.3 - Sistema de Camaras Cleaner 3", cameras("CL", "Camara Cleaner 3 - Cell", 15, 22, "192.168.2", 111)),
          group("3900-SC-000.4 - Sistema de Camaras Column Cells", cameras("CM", "Camara Column Cell", 1, 4, "192.168.2", 133)),
          group("3900-SC-000.5 - Sistema de Camaras Rougher Cells", cameras("CF", "Camara Rougher Cell", 1, 10, "192.168.2", 101))
        ])
      ])
    ])
  ];

  function esc(value) {
    return String(value || "").replace(/[&<>\"]/g, function(ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[ch];
    });
  }

  function parseGroupTag(name) {
    var match = String(name || "").match(/^([A-Z0-9.\-]+)\s+-\s+(.+)$/i);
    return match ? { code: match[1], name: match[2] } : null;
  }

  function render(items) {
    return items.map(function(item) {
      if (item.items) {
        var parsed = parseGroupTag(item.name);
        var pick = parsed ? ' data-tag-pick="1" data-code="' + esc(parsed.code) + '" data-name="' + esc(parsed.name) + '"' : "";
        return '<details class="activity-tag-branch" open><summary' + pick + '><span>' + esc(item.name) + '</span></summary>' + render(item.items) + '</details>';
      }
      return '<button type="button" class="activity-tag-row" data-tag-pick="1" data-code="' + esc(item.code) + '" data-name="' + esc(item.name) + '"><strong>' + esc(item.code) + '</strong><span>' + esc(item.name) + '</span></button>';
    }).join("");
  }

  function ensureModal() {
    var modal = document.getElementById("activityTagSelectorModal");
    if (modal) return modal;

    var style = document.createElement("style");
    style.textContent = "#activityTagSelectorModal{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:18px}#activityTagSelectorModal.hidden{display:none}.ats-backdrop{position:absolute;inset:0;background:rgba(0,20,35,.62);backdrop-filter:blur(3px)}.ats-card{position:relative;z-index:1;width:min(1120px,calc(100vw - 28px));height:min(800px,calc(100vh - 28px));display:grid;grid-template-rows:auto auto 1fr;gap:12px;border-radius:18px;background:#f6fbfe;padding:18px;box-shadow:0 30px 90px rgba(0,0,0,.38);border:1px solid rgba(0,119,183,.35)}.ats-head,.ats-tools{display:flex;align-items:center;justify-content:space-between;gap:12px}.ats-head h2{margin:0;color:#17252f}.ats-head p{margin:0;color:#687783;font-weight:800;text-transform:uppercase;font-size:.76rem;letter-spacing:.08em}.ats-close{border:0;border-radius:999px;background:#ff6a13;color:white;font-weight:900;padding:11px 18px;cursor:pointer}.ats-tools input{width:min(460px,100%);border:1px solid #d8e2e8;border-radius:12px;padding:12px 14px}.ats-picked{color:#687783;font-weight:800;text-align:right}.ats-tree{overflow:auto;border:1px solid rgba(0,119,183,.18);border-radius:12px;background:white;padding:10px 14px 16px 4px;font-family:Tahoma,Verdana,sans-serif;font-size:13px}.activity-tag-branch{margin-left:19px;padding-left:12px;border-left:1px dotted #888}.activity-tag-branch summary{list-style:none;cursor:pointer;white-space:nowrap;line-height:1.35;color:#111}.activity-tag-branch summary::-webkit-details-marker{display:none}.activity-tag-branch summary:before{content:'-';display:inline-grid;place-items:center;width:13px;height:13px;margin-right:4px;border:1px solid #777;background:white;font-size:11px}.activity-tag-branch:not([open])>summary:before{content:'+'}.activity-tag-branch summary span:before,.activity-tag-row:after{content:'';display:inline-block;width:16px;height:12px;margin-right:5px;background:linear-gradient(#259bd3,#0077b7);box-shadow:-2px -4px 0 -2px rgba(255,106,19,.6);vertical-align:-1px}.activity-tag-row{display:block;position:relative;width:max-content;min-width:360px;margin-left:31px;border:0;background:transparent;text-align:left;cursor:pointer;white-space:nowrap;font:inherit;color:#111;padding:1px 8px 1px 0}.activity-tag-row:after{position:absolute;left:-22px;top:4px}.activity-tag-row:hover,.activity-tag-branch summary:hover span{background:rgba(0,119,183,.13)}.activity-tag-row strong{margin-right:5px}.ats-hide{display:none!important}@media(max-width:700px){#activityTagSelectorModal{padding:8px}.ats-card{height:calc(100vh - 16px);width:calc(100vw - 16px);padding:12px}.ats-head,.ats-tools{align-items:stretch;flex-direction:column}.ats-picked{text-align:left}.activity-tag-row{min-width:280px}}";
    document.head.appendChild(style);

    modal = document.createElement("div");
    modal.id = "activityTagSelectorModal";
    modal.className = "hidden";
    modal.innerHTML = '<div class="ats-backdrop" data-ats-close="1"></div><section class="ats-card" role="dialog" aria-modal="true"><header class="ats-head"><div><p>Menu de equipos</p><h2>Seleccione TAG</h2></div><button type="button" class="ats-close" data-ats-close="1">Cerrar</button></header><div class="ats-tools"><input id="activityTagSelectorSearch" type="search" placeholder="Buscar TAG o equipo..." autocomplete="off"><span id="activityTagSelectorPicked" class="ats-picked">Seleccione un elemento del menu</span></div><div id="activityTagSelectorTree" class="ats-tree">' + render(CATALOG) + '</div></section>';
    document.body.appendChild(modal);
    modal.addEventListener("click", function(event) {
      if (event.target.closest("[data-ats-close]")) closeModal();
      var pick = event.target.closest("[data-tag-pick]");
      if (pick) selectTag(pick);
    });
    modal.querySelector("#activityTagSelectorSearch").addEventListener("input", function() {
      filterRows(this.value);
    });
    return modal;
  }

  function openModal(button) {
    activeButton = button;
    var modal = ensureModal();
    modal.classList.remove("hidden");
    filterRows("");
    var search = modal.querySelector("#activityTagSelectorSearch");
    search.value = "";
    setTimeout(function() { search.focus(); }, 0);
  }

  function closeModal() {
    var modal = document.getElementById("activityTagSelectorModal");
    if (modal) modal.classList.add("hidden");
  }

  function filterRows(value) {
    var term = String(value || "").trim().toLowerCase();
    var modal = ensureModal();
    modal.querySelectorAll("[data-tag-pick]").forEach(function(row) {
      row.classList.toggle("ats-hide", term && row.textContent.toLowerCase().indexOf(term) < 0);
    });
    if (term) modal.querySelectorAll("details").forEach(function(details) { details.open = true; });
  }

  function selectTag(row) {
    if (!activeButton) return;
    var form = activeButton.closest("form");
    if (!form) return;
    var tagInput = form.elements.tag;
    var equipmentInput = form.elements.equipment;
    if (tagInput) {
      tagInput.value = row.dataset.code || "";
      tagInput.dispatchEvent(new Event("input", { bubbles: true }));
      tagInput.dispatchEvent(new Event("change", { bubbles: true }));
    }
    if (equipmentInput) {
      equipmentInput.value = row.dataset.name || "";
      equipmentInput.dispatchEvent(new Event("input", { bubbles: true }));
      equipmentInput.dispatchEvent(new Event("change", { bubbles: true }));
    }
    activeButton.textContent = row.dataset.code || "Seleccione TAG";
    var picked = document.getElementById("activityTagSelectorPicked");
    if (picked) picked.textContent = (row.dataset.code || "") + " - " + (row.dataset.name || "");
    closeModal();
  }

  document.addEventListener("click", function(event) {
    var button = event.target.closest && event.target.closest("#emergencyForm .tag-tree-toggle, #improvementForm .tag-tree-toggle");
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openModal(button);
  }, true);

  document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") closeModal();
  });

  window.activityTagSelectorOpen = function(formId) {
    var form = document.getElementById(formId);
    var button = form && form.querySelector(".tag-tree-toggle");
    if (button) openModal(button);
  };
})();
