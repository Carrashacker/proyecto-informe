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

  var currentPath = [];

  function getItemsAtPath(path) {
    var items = CATALOG;
    for (var i = 0; i < path.length; i += 1) {
      var next = items[path[i]];
      items = next && next.items ? next.items : [];
    }
    return items;
  }

  function getPathNames(path) {
    var names = [];
    var items = CATALOG;
    for (var i = 0; i < path.length; i += 1) {
      var item = items[path[i]];
      if (!item) break;
      names.push(item.name || item.code);
      items = item.items || [];
    }
    return names;
  }

  function shortName(name) {
    return String(name || "").replace(/^([A-Z0-9.\-]+)\s+-\s*/i, "$1 - ");
  }

  function collectMatches(items, term, trail, out) {
    items.forEach(function(item) {
      if (item.items) {
        var nextTrail = trail.concat(item.name);
        var parsed = parseGroupTag(item.name);
        if (parsed && item.name.toLowerCase().indexOf(term) >= 0) {
          out.push({ code: parsed.code, name: parsed.name, trail: trail.join(" / ") });
        }
        collectMatches(item.items, term, nextTrail, out);
        return;
      }
      var haystack = (item.code + " " + item.name + " " + trail.join(" ")).toLowerCase();
      if (haystack.indexOf(term) >= 0) out.push({ code: item.code, name: item.name, trail: trail.join(" / ") });
    });
  }

  function renderTree(items, level) {
    return '<div class="ats-tree-level" data-level="' + level + '">' + items.map(function(item) {
      if (item.items) {
        var parsed = parseGroupTag(item.name);
        var pick = parsed ? '<button type="button" class="ats-tree-pick" data-tag-pick="1" data-code="' + esc(parsed.code) + '" data-name="' + esc(parsed.name) + '">Usar</button>' : '';
        return '<details class="ats-tree-node"' + (level < 2 ? ' open' : '') + '><summary><span class="ats-tree-folder"></span><span class="ats-tree-label">' + esc(shortName(item.name)) + '</span><span class="ats-tree-count">' + item.items.length + '</span>' + pick + '</summary>' + renderTree(item.items, level + 1) + '</details>';
      }
      return '<button type="button" class="ats-tree-leaf" data-tag-pick="1" data-code="' + esc(item.code) + '" data-name="' + esc(item.name) + '"><span class="ats-tree-tag-icon">TAG</span><strong>' + esc(item.code) + '</strong><span>' + esc(item.name) + '</span></button>';
    }).join("") + '</div>';
  }

  function renderCurrentFolder() {
    var modal = ensureModal();
    var tree = modal.querySelector("#activityTagSelectorTree");
    var crumbs = modal.querySelector("#activityTagBreadcrumbs");
    var back = modal.querySelector("#activityTagBack");
    var search = modal.querySelector("#activityTagSelectorSearch");
    crumbs.innerHTML = '<span class="ats-crumb static">Inicio</span><span class="ats-sep">/</span><span class="ats-crumb static">Arbol completo</span>';
    back.disabled = true;
    if (search.value.trim()) {
      renderSearch(search.value);
      return;
    }
    tree.innerHTML = renderTree(CATALOG, 0);
  }

  function renderSearch(value) {
    var term = String(value || "").trim().toLowerCase();
    var tree = document.getElementById("activityTagSelectorTree");
    if (!term) {
      renderCurrentFolder();
      return;
    }
    var matches = [];
    collectMatches(CATALOG, term, [], matches);
    tree.innerHTML = matches.slice(0, 120).map(function(item) {
      return '<button type="button" class="ats-card-row ats-tag" data-tag-pick="1" data-code="' + esc(item.code) + '" data-name="' + esc(item.name) + '"><span class="ats-icon tag">TAG</span><span><strong>' + esc(item.code) + '</strong><small>' + esc(item.name) + '</small><em>' + esc(item.trail) + '</em></span></button>';
    }).join("") || '<p class="ats-empty">No se encontraron resultados.</p>';
  }

  function ensureModal() {
    var modal = document.getElementById("activityTagSelectorModal");
    if (modal) return modal;

    var style = document.createElement("style");
    style.textContent = "#activityTagSelectorModal{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:18px}#activityTagSelectorModal.hidden{display:none}.ats-backdrop{position:absolute;inset:0;background:rgba(0,0,0,0.8);backdrop-filter:blur(8px)}.ats-card{position:relative;z-index:1;width:min(1120px,calc(100vw - 28px));height:min(800px,calc(100vh - 28px));display:grid;grid-template-rows:auto auto auto 1fr;gap:12px;border-radius:18px;background:#0f1218;padding:18px;box-shadow:0 30px 90px rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.1)}.ats-head,.ats-tools,.ats-nav{display:flex;align-items:center;justify-content:space-between;gap:12px}.ats-head h2{margin:0;color:#fff;font-family:'Outfit',sans-serif}.ats-head p{margin:0;color:#ff6a13;font-weight:800;text-transform:uppercase;font-size:.76rem;letter-spacing:.08em}.ats-close{border:0;border-radius:999px;background:#ff6a13;color:white;font-weight:900;padding:11px 18px;cursor:pointer}.ats-tools input{width:min(460px,100%);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:12px 14px;background:#1a1e26;color:#fff;outline:none}.ats-picked{color:rgba(255,255,255,0.5);font-weight:800;text-align:right}.ats-back{border:1px solid rgba(255,255,255,0.1);border-radius:999px;background:rgba(255,255,255,0.05);color:white;font-weight:900;padding:9px 14px;cursor:pointer}.ats-back:disabled{opacity:.45;cursor:not-allowed}.ats-crumbs{display:flex;align-items:center;gap:7px;overflow:auto;white-space:nowrap}.ats-crumb{border:0;background:transparent;color:#0088cc;font-weight:900;cursor:pointer}.ats-sep{color:rgba(255,255,255,0.2)}.ats-tree{overflow:auto;border:1px solid rgba(255,255,255,0.05);border-radius:14px;background:rgba(0,0,0,0.2);padding:12px;display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:10px}.ats-card-row{min-height:72px;border:1px solid rgba(255,255,255,0.05);border-radius:14px;background:rgba(255,255,255,0.02);text-align:left;display:flex;align-items:center;gap:12px;padding:12px;color:#fff;cursor:pointer;transition:all 0.2s}.ats-card-row:hover{border-color:#0088cc;background:rgba(255,255,255,0.05)}.ats-folder{justify-content:space-between}.ats-open-folder{border:0;background:transparent;display:flex;align-items:center;gap:12px;text-align:left;cursor:pointer;color:inherit;min-width:0}.ats-icon{display:grid;place-items:center;flex:0 0 auto;width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,#0088cc,#004b7a);color:#fff;font-weight:900}.ats-icon.tag{background:linear-gradient(135deg,#ff6a13,#c84a00);font-size:11px}.ats-card-row strong{display:block;font-size:.93rem}.ats-card-row small,.ats-card-row em{display:block;color:rgba(255,255,255,0.5);margin-top:3px;font-size:.78rem;font-style:normal}.ats-pick-small{border:0;border-radius:999px;background:#ff6a13;color:white;font-weight:900;padding:8px 10px;cursor:pointer;white-space:nowrap}.ats-empty{color:rgba(255,255,255,0.4);font-weight:800;padding:16px}.ats-hide{display:none!important}@media(max-width:700px){#activityTagSelectorModal{padding:8px}.ats-card{height:calc(100vh - 16px);width:calc(100vw - 16px);padding:12px}.ats-head,.ats-tools,.ats-nav{align-items:stretch;flex-direction:column}.ats-picked{text-align:left}.ats-tree{grid-template-columns:1fr}}";
    style.textContent += "#activityTagSelectorModal.ats-pro-tree{padding:12px}.ats-pro-tree .ats-backdrop{background:rgba(0,0,0,0.85);backdrop-filter:blur(10px)}.ats-pro-tree .ats-card{width:min(1080px,calc(100vw - 24px));height:min(720px,calc(100vh - 24px));gap:10px;border-radius:20px;padding:16px;background:#0f1218;border:1px solid rgba(255,255,255,0.1);box-shadow:0 24px 70px rgba(0,0,0,0.4)}.ats-pro-tree .ats-head{border-bottom:1px solid rgba(255,255,255,0.05);padding-bottom:8px}.ats-pro-tree .ats-head h2{font-size:1.18rem;color:#fff}.ats-pro-tree .ats-head p{font-size:.7rem;color:#ff6a13}.ats-pro-tree .ats-close{padding:9px 14px;background:#ff6a13}.ats-pro-tree .ats-tools input{padding:10px 12px;width:min(420px,100%);background:#1a1e26;border-color:rgba(255,255,255,0.1)}.ats-pro-tree .ats-picked{font-size:.82rem;color:rgba(255,255,255,0.5)}.ats-pro-tree .ats-back{display:none}.ats-tree-actions{display:flex;gap:8px;align-items:center}.ats-tree-action{border:1px solid rgba(255,255,255,0.1);border-radius:999px;background:rgba(255,255,255,0.05);color:#0088cc;font-weight:900;padding:7px 11px;cursor:pointer}.ats-tree-action:hover{background:rgba(255,255,255,0.1)}.ats-pro-tree .ats-tree{display:block;background:rgba(0,0,0,0.15);border:1px solid rgba(255,255,255,0.05);border-radius:14px;padding:12px 12px 18px;overflow:auto;font-family:'Inter',sans-serif}.ats-tree-level{position:relative;margin-left:18px}.ats-tree-level:before{content:'';position:absolute;left:-10px;top:0;bottom:0;border-left:1px dashed rgba(255,255,255,0.1)}.ats-tree-node{position:relative;margin:2px 0}.ats-tree-node>summary{display:flex;align-items:center;gap:7px;min-height:28px;border-radius:8px;padding:3px 8px;list-style:none;cursor:pointer;color:rgba(255,255,255,0.9);transition:all 0.2s}.ats-tree-node>summary::-webkit-details-marker{display:none}.ats-tree-node>summary:before{content:'+';display:grid;place-items:center;width:15px;height:15px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.05);color:#fff;font-size:11px;line-height:1}.ats-tree-node[open]>summary:before{content:'-'}.ats-tree-node>summary:hover,.ats-tree-leaf:hover{background:rgba(255,255,255,0.03)}.ats-tree-folder{width:17px;height:13px;border-radius:2px;background:linear-gradient(#0088cc,#004b7a);flex:0 0 auto}.ats-tree-label{font-weight:700;font-size:.86rem;white-space:nowrap}.ats-tree-count{margin-left:auto;border-radius:999px;background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.4);font-size:.68rem;font-weight:900;padding:2px 7px}.ats-tree-pick{border:0;border-radius:999px;background:#ff6a13;color:#fff;font-weight:900;font-size:.68rem;padding:4px 8px;cursor:pointer}.ats-tree-leaf{position:relative;display:flex;align-items:center;gap:7px;width:max-content;min-width:min(680px,100%);margin:2px 0 2px 19px;border:0;border-radius:8px;background:transparent;color:rgba(255,255,255,0.8);text-align:left;padding:4px 8px;cursor:pointer;font:inherit}.ats-tree-leaf:before{content:'';position:absolute;left:-28px;top:50%;width:22px;border-top:1px dashed rgba(255,255,255,0.1)}.ats-tree-tag-icon{border-radius:5px;background:rgba(255,255,255,0.1);color:#ff6a13;font-size:.62rem;font-weight:900;padding:3px 5px;border:1px solid rgba(255,106,19,0.2)}.ats-tree-leaf strong{font-size:.84rem;min-width:88px;color:#fff}.ats-tree-leaf span:last-child{font-size:.82rem;white-space:nowrap;color:rgba(255,255,255,0.5)}.ats-pro-tree .ats-card-row{min-height:48px;box-shadow:none;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05)}.ats-pro-tree .ats-crumb.static{border:0;background:transparent;color:#0088cc;font-weight:900}.ats-pro-tree .ats-empty{font-size:.85rem;color:rgba(255,255,255,0.4)}@media(max-width:700px){.ats-pro-tree .ats-card{height:calc(100vh - 16px);width:calc(100vw - 16px);padding:12px}.ats-pro-tree .ats-head,.ats-pro-tree .ats-tools,.ats-pro-tree .ats-nav{align-items:stretch;flex-direction:column}.ats-tree-actions{flex-wrap:wrap}.ats-tree-leaf{min-width:0;width:100%}.ats-tree-leaf span:last-child{white-space:normal}}";
    document.head.appendChild(style);

    modal = document.createElement("div");
    modal.id = "activityTagSelectorModal";
    modal.className = "hidden ats-pro-tree";
    modal.innerHTML = '<div class="ats-backdrop" data-ats-close="1"></div><section class="ats-card" role="dialog" aria-modal="true"><header class="ats-head"><div><p>Arbol profesional de equipos</p><h2>Seleccione TAG</h2></div><button type="button" class="ats-close" data-ats-close="1">Cerrar</button></header><div class="ats-tools"><input id="activityTagSelectorSearch" type="search" placeholder="Buscar TAG o equipo en todo el arbol..." autocomplete="off"><span id="activityTagSelectorPicked" class="ats-picked">Seleccione un TAG del arbol</span></div><div class="ats-nav"><button id="activityTagBack" class="ats-back" type="button">Volver</button><nav id="activityTagBreadcrumbs" class="ats-crumbs"></nav><div class="ats-tree-actions"><button type="button" class="ats-tree-action" data-ats-expand="1">Expandir todo</button><button type="button" class="ats-tree-action" data-ats-collapse="1">Contraer</button></div></div><div id="activityTagSelectorTree" class="ats-tree"></div></section>';
    document.body.appendChild(modal);
    modal.addEventListener("click", function(event) {
      if (event.target.closest("[data-ats-close]")) closeModal();
      if (event.target.closest("[data-ats-expand]")) {
        modal.querySelectorAll("details").forEach(function(details) { details.open = true; });
        return;
      }
      if (event.target.closest("[data-ats-collapse]")) {
        modal.querySelectorAll("details").forEach(function(details, index) { details.open = index < 2; });
        return;
      }
      var folder = event.target.closest("[data-ats-open]");
      if (folder) {
        currentPath.push(Number(folder.dataset.atsOpen));
        modal.querySelector("#activityTagSelectorSearch").value = "";
        renderCurrentFolder();
        return;
      }
      var crumb = event.target.closest("[data-ats-path]");
      if (crumb) {
        currentPath = crumb.dataset.atsPath === "root" ? [] : currentPath.slice(0, Number(crumb.dataset.atsPath) + 1);
        modal.querySelector("#activityTagSelectorSearch").value = "";
        renderCurrentFolder();
        return;
      }
      var pick = event.target.closest("[data-tag-pick]");
      if (pick) selectTag(pick);
    });
    modal.querySelector("#activityTagSelectorSearch").addEventListener("input", function() {
      renderSearch(this.value);
    });
    modal.querySelector("#activityTagBack").addEventListener("click", function() {
      if (currentPath.length === 0) return;
      currentPath.pop();
      modal.querySelector("#activityTagSelectorSearch").value = "";
      renderCurrentFolder();
    });
    renderCurrentFolder();
    return modal;
  }

  function openModal(button) {
    activeButton = button;
    var modal = ensureModal();
    modal.classList.remove("hidden");
    var search = modal.querySelector("#activityTagSelectorSearch");
    search.value = "";
    renderCurrentFolder();
    setTimeout(function() { search.focus(); }, 0);
  }

  function closeModal() {
    var modal = document.getElementById("activityTagSelectorModal");
    if (modal) modal.classList.add("hidden");
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
