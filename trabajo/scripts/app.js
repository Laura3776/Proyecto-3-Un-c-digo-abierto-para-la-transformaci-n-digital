/**
 * @fileoverview Main SmartLog Monitor client application.
 * Coordinates persistence helpers, session state, incident workflows,
 * role-based rendering, notifications, dashboards, and administrative tools.
 * This module is loaded by `index.html` and drives the full browser UI.
 *
 * @module app
 */

/**
 * Loads incident records from localStorage.
 *
 * @returns {Array<Object>} Stored incident array, or an empty array on failure.
 */
function lsLoad() {
  try {
    const raw = localStorage.getItem("smartlog_incidents_v1");
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

/**
 * Persists the full incident collection to localStorage.
 *
 * @param {Array<Object>} arr - Incident records to store.
 * @returns {void}
 */
function lsSave(arr) {
  localStorage.setItem("smartlog_incidents_v1", JSON.stringify(arr));
}

/**
 * Loads user records from localStorage.
 *
 * @returns {Array<Object>|null} Stored users, or `null` when unavailable/invalid.
 */
function lsLoadUsers() {
  try {
    const raw = localStorage.getItem("smartlog_users_v1");
    const arr = raw ? JSON.parse(raw) : null;
    return Array.isArray(arr) ? arr : null;
  } catch {
    return null;
  }
}

/**
 * Persists the user collection to localStorage.
 *
 * @param {Array<Object>} arr - User records to store.
 * @returns {void}
 */
function lsSaveUsers(arr) {
  localStorage.setItem("smartlog_users_v1", JSON.stringify(arr || []));
}

/**
 * Loads role and permission policies from localStorage.
 *
 * @returns {Object|null} Policy object, or `null` when unavailable/invalid.
 */
function lsLoadPolicies() {
  try {
    const raw = localStorage.getItem("smartlog_policies_v1");
    const obj = raw ? JSON.parse(raw) : null;
    return obj && typeof obj === "object" ? obj : null;
  } catch {
    return null;
  }
}

/**
 * Persists the role and permission policy object.
 *
 * @param {Object} obj - Policy configuration to store.
 * @returns {void}
 */
function lsSavePolicies(obj) {
  localStorage.setItem("smartlog_policies_v1", JSON.stringify(obj || {}));
}

/**
 * Loads admin configuration data from localStorage.
 *
 * @returns {Object|null} Admin configuration object, or `null` on failure.
 */
function lsLoadAdminCfg() {
  try {
    const raw = localStorage.getItem("smartlog_admin_cfg_v1");
    const obj = raw ? JSON.parse(raw) : null;
    return obj && typeof obj === "object" ? obj : null;
  } catch {
    return null;
  }
}

/**
 * Persists administrative configuration data.
 *
 * @param {Object} obj - Admin configuration to store.
 * @returns {void}
 */
function lsSaveAdminCfg(obj) {
  localStorage.setItem("smartlog_admin_cfg_v1", JSON.stringify(obj || {}));
}

/**
 * Loads system log entries from localStorage.
 *
 * @returns {Array<Object>} Stored system logs, or an empty array on failure.
 */
function lsLoadSysLogs() {
  try {
    const raw = localStorage.getItem("smartlog_sys_logs_v1");
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

/**
 * Persists system log entries, keeping only the latest records.
 *
 * @param {Array<Object>} arr - System log entries to store.
 * @returns {void}
 */
function lsSaveSysLogs(arr) {
  localStorage.setItem("smartlog_sys_logs_v1", JSON.stringify((arr || []).slice(-500)));
}

/**
 * Loads pending catalog requests from localStorage.
 *
 * @returns {Array<Object>} Stored catalog requests, or an empty array on failure.
 */
function lsLoadCatalogReqs() {
  try {
    const raw = localStorage.getItem("smartlog_catalog_reqs_v1");
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

/**
 * Persists catalog requests, keeping a bounded history.
 *
 * @param {Array<Object>} arr - Catalog request entries to store.
 * @returns {void}
 */
function lsSaveCatalogReqs(arr) {
  localStorage.setItem("smartlog_catalog_reqs_v1", JSON.stringify((arr || []).slice(-300)));
}

/**
 * Loads the last selected UI theme.
 *
 * @returns {"light"|"dark"} Saved theme value.
 */
function lsLoadTheme() {
  try {
    const t = localStorage.getItem("smartlog_theme_v1");
    return t === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

/**
 * Persists the selected UI theme.
 *
 * @param {string} theme - Theme identifier to store.
 * @returns {void}
 */
function lsSaveTheme(theme) {
  localStorage.setItem("smartlog_theme_v1", theme === "dark" ? "dark" : "light");
}

/**
 * Normalizes arbitrary text by trimming and collapsing whitespace.
 *
 * @param {*} s - Raw value to normalize.
 * @returns {string} Sanitized string value.
 */
function x(s) {
  return String(s || "").replace(/\s+/g, " ").trim();
}

/**
 * Performs a lightweight email format validation.
 *
 * @param {string} email - Candidate email value.
 * @returns {boolean} `true` when the value matches the expected format.
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x(email));
}

/**
 * Displays a grouped validation/error alert built from a reason list.
 *
 * @param {string} title - Alert title.
 * @param {Array<string>} reasons - Reason lines to render under the title.
 * @returns {void}
 */
function showReasons(title, reasons) {
  const clean = (Array.isArray(reasons) ? reasons : []).filter(Boolean);
  if (!clean.length) return;
  alert(`${title}\n- ${clean.join("\n- ")}`);
}

/**
 * Formats a date-time value for Spanish locale display.
 *
 * @param {string|number|Date} d - Input date value.
 * @returns {string} Human-readable date-time string, or `"-"` when invalid.
 */
function fmt(d) {
  if (!d) return "-";
  const v = new Date(d);
  return Number.isNaN(v.getTime()) ? "-" : v.toLocaleString("es-ES");
}

/**
 * Formats a date value as an ISO-like `YYYY-MM-DD` string.
 *
 * @param {string|number|Date} d - Input date value.
 * @returns {string} Date-only string, or an empty string when invalid.
 */
function dOnly(d) {
  const v = new Date(d);
  return Number.isNaN(v.getTime()) ? "" : v.toISOString().slice(0, 10);
}

/**
 * Calculates a due date from a creation timestamp and priority level.
 *
 * @param {string} fromIso - Incident creation timestamp.
 * @param {string} p - Priority label.
 * @returns {string} Due date expressed as an ISO string.
 */
function deadline(fromIso, p) {
  const map = { Baja: 7, Normal: 5, Media: 5, Alta: 3, Critica: 1 };
  const d = new Date(fromIso || Date.now());
  d.setDate(d.getDate() + (map[p] || 5));
  return d.toISOString();
}

/**
 * Computes remaining days until a deadline.
 *
 * @param {string} limitIso - Due date as an ISO string.
 * @returns {number|null} Remaining whole days, or `null` when invalid.
 */
function remDays(limitIso) {
  const e = new Date(limitIso);
  if (Number.isNaN(e.getTime())) return null;
  return Math.ceil((e - new Date()) / 86400000);
}

/**
 * Builds an SLA status snapshot for a given incident.
 *
 * @param {Object} i - Incident record.
 * @returns {{
 *   responseRemaining:number,
 *   resolveRemaining:number,
 *   responseBreached:boolean,
 *   resolveBreached:boolean,
 *   responseSoon:boolean,
 *   resolveSoon:boolean
 * }} SLA timing information.
 */
function slaSnapshot(i) {
  const respDays = Number(s.adminCfg?.params?.maxResponseDays || 2);
  const resDays = Number(s.adminCfg?.params?.maxResolveDays || 7);
  const created = new Date(i.creadaEn || Date.now());
  const now = new Date();
  const firstTechTouch = (i.timeline || []).some((e) => (e.event || "").includes("estado_tecnico") || (e.event || "").includes("asignacion"));
  const responseDeadline = new Date(created);
  responseDeadline.setDate(responseDeadline.getDate() + respDays);
  const resolveDeadline = new Date(created);
  resolveDeadline.setDate(resolveDeadline.getDate() + resDays);
  const responseRemaining = Math.ceil((responseDeadline - now) / 86400000);
  const resolveRemaining = Math.ceil((resolveDeadline - now) / 86400000);
  const responseBreached = !firstTechTouch && responseRemaining < 0;
  const resolveBreached = !["Cerrada", "Cerrada por el usuario"].includes(i.estado) && resolveRemaining < 0;
  const responseSoon = !firstTechTouch && responseRemaining >= 0 && responseRemaining <= 1;
  const resolveSoon = !["Cerrada", "Cerrada por el usuario"].includes(i.estado) && resolveRemaining >= 0 && resolveRemaining <= 1;
  return { responseRemaining, resolveRemaining, responseBreached, resolveBreached, responseSoon, resolveSoon };
}

/**
 * Normalizes a raw incident-like object into the application schema.
 *
 * @param {Object} i - Raw incident candidate.
 * @returns {Object|null} Normalized incident object, or `null` when invalid.
 */
function norm(i) {
  if (!i || typeof i !== "object") return null;
  const out = {
    id: x(i.id) || `INC-${Date.now().toString(36).toUpperCase()}`,
    titulo: x(i.titulo) || "Sin resumen",
    descripcion: x(i.descripcion),
    origen: x(i.origen) || "Usuario",
    severidad: x(i.severidad) || "Media",
    categoria: x(i.categoria || i.tipoIncidencia) || "General",
    tipoIncidencia: x(i.tipoIncidencia || i.categoria) || "General",
    prioridad: x(i.prioridad) || "Normal",
    equipo: x(i.equipo || i.areaTecnica) || "N1",
    areaTecnica: x(i.areaTecnica || i.equipo) || "N1",
    reportanteId: x(i.reportanteId) || "rep-laura",
    asignadoA: x(i.asignadoA),
    estado: x(i.estado) || "Pendiente de asignacion",
    creadaEn: new Date(i.creadaEn || Date.now()).toISOString(),
    fechaLimite: i.fechaLimite ? new Date(i.fechaLimite).toISOString() : null,
    cerradaEn: i.cerradaEn ? new Date(i.cerradaEn).toISOString() : null,
    adjuntos: Array.isArray(i.adjuntos) ? i.adjuntos : x(i.adjunto) ? [x(i.adjunto)] : [],
    comentarios: Array.isArray(i.comentarios) ? i.comentarios : [],
    techNotes: Array.isArray(i.techNotes) ? i.techNotes : [],
    timeline: Array.isArray(i.timeline) ? i.timeline : []
  };
  if (!out.descripcion) return null;
  if (!out.fechaLimite) out.fechaLimite = deadline(out.creadaEn, out.prioridad);
  return out;
}

/**
 * Normalizes a raw user-like object into the application user schema.
 *
 * @param {Object} u - Raw user candidate.
 * @returns {Object|null} Normalized user object, or `null` when invalid.
 */
function normUser(u) {
  if (!u || typeof u !== "object") return null;
  const nameRaw = x(u.name) || "Sin nombre";
  const nameParts = nameRaw.split(" ");
  const defaultLast = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
  return {
    id: x(u.id).toLowerCase(),
    name: nameRaw,
    lastName: x(u.lastName) || defaultLast,
    role: x(u.role) || "reportante",
    team: x(u.team) || "N1",
    email: x(u.email) || `${x(u.id).toLowerCase() || "usuario"}@demo.com`,
    phone: x(u.phone) || "",
    photo: x(u.photo) || "",
    status: x(u.status) || "active",
    createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
    lastAccess: u.lastAccess ? new Date(u.lastAccess).toISOString() : "",
    tempPassword: x(u.tempPassword) || "",
    password: x(u.password) || "Smart1234",
    passwordHistory: Array.isArray(u.passwordHistory) ? u.passwordHistory.map((p) => x(p)).filter(Boolean).slice(-5) : [],
    notify: {
      internal: u.notify?.internal !== false,
      email: !!u.notify?.email,
      events: {
        newIncident: u.notify?.events?.newIncident !== false,
        stateChange: u.notify?.events?.stateChange !== false,
        comments: u.notify?.events?.comments !== false,
        dueSoon: u.notify?.events?.dueSoon !== false,
        reassign: u.notify?.events?.reassign !== false,
        systemAlerts: !!u.notify?.events?.systemAlerts
      }
    }
  };
}

/**
 * Creates the default administrative configuration object.
 *
 * @returns {Object} Default admin configuration with areas, types, and rules.
 */
function defaultAdminCfg() {
  const now = new Date().toISOString();
  const defaultTransitions = {
    "Pendiente de asignacion": ["En analisis"],
    "En analisis": ["En progreso", "Pendiente de informacion", "Resuelta", "Cerrada"],
    "En progreso": ["Pendiente de informacion", "Resuelta", "Cerrada"],
    "Pendiente de informacion": ["En progreso", "Resuelta", "Cerrada"],
    "Resuelta": ["Cerrada", "Cerrada por el usuario", "En analisis"],
    "Cerrada": ["En analisis"],
    "Cerrada por el usuario": ["En analisis"]
  };
  return {
    areas: [
      { name: "N1", description: "Nivel 1", status: "active", createdAt: now, updatedAt: now },
      { name: "N2", description: "Nivel 2", status: "active", createdAt: now, updatedAt: now },
      { name: "Infra", description: "Infraestructura", status: "active", createdAt: now, updatedAt: now },
      { name: "OT", description: "Operacion industrial", status: "active", createdAt: now, updatedAt: now }
    ],
    types: [
      { name: "Aplicacion", area: "N1", description: "", status: "active", createdAt: now, updatedAt: now },
      { name: "Red", area: "Infra", description: "", status: "active", createdAt: now, updatedAt: now },
      { name: "Hardware", area: "N2", description: "", status: "active", createdAt: now, updatedAt: now },
      { name: "Seguridad", area: "N2", description: "", status: "active", createdAt: now, updatedAt: now },
      { name: "Operacion", area: "OT", description: "", status: "active", createdAt: now, updatedAt: now }
    ],
    priorities: ["Baja", "Normal", "Alta", "Critica"],
    statuses: ["Pendiente de asignacion", "En analisis", "En progreso", "Pendiente de informacion", "Resuelta", "Cerrada"],
    params: { maxResponseDays: 2, maxResolveDays: 7, autoCloseDays: 3, notificationPolicy: "realtime" },
    priorityRules: [
      { tipo: "Seguridad", prioridad: "Alta" },
      { area: "Infra", tipo: "Red", prioridad: "Critica" }
    ],
    transitions: defaultTransitions
  };
}

/**
 * Normalizes a partially defined administrative configuration object.
 *
 * @param {Object} cfg - Raw admin configuration candidate.
 * @returns {Object} Normalized admin configuration.
 */
function normalizeAdminCfg(cfg) {
  const base = defaultAdminCfg();
  const out = { ...base, ...(cfg || {}) };
  const now = new Date().toISOString();
  out.areas = (Array.isArray(out.areas) ? out.areas : []).map((a) => {
    if (typeof a === "string") return { name: x(a), description: "", status: "active", createdAt: now, updatedAt: now };
    return {
      name: x(a.name),
      description: x(a.description),
      status: x(a.status) === "inactive" ? "inactive" : "active",
      createdAt: a.createdAt ? new Date(a.createdAt).toISOString() : now,
      updatedAt: a.updatedAt ? new Date(a.updatedAt).toISOString() : now
    };
  }).filter((a) => a.name);
  out.types = (Array.isArray(out.types) ? out.types : []).map((t) => {
    if (typeof t === "string") return { name: x(t), area: out.areas[0]?.name || "N1", description: "", status: "active", createdAt: now, updatedAt: now };
    return {
      name: x(t.name),
      area: x(t.area),
      description: x(t.description),
      status: x(t.status) === "inactive" ? "inactive" : "active",
      createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : now,
      updatedAt: t.updatedAt ? new Date(t.updatedAt).toISOString() : now
    };
  }).filter((t) => t.name && t.area);
  out.params = { ...base.params, ...(out.params || {}) };
  out.priorityRules = (Array.isArray(out.priorityRules) ? out.priorityRules : []).map((r) => ({
    area: x(r?.area),
    tipo: x(r?.tipo),
    prioridad: x(r?.prioridad)
  })).filter((r) => r.prioridad);
  const transitions = out.transitions && typeof out.transitions === "object" ? out.transitions : {};
  out.transitions = {};
  Object.entries(transitions).forEach(([from, tos]) => {
    const key = x(from);
    const next = Array.isArray(tos) ? tos.map((v) => x(v)).filter(Boolean) : [];
    if (key && next.length) out.transitions[key] = next;
  });
  if (!Object.keys(out.transitions).length) out.transitions = base.transitions;
  return out;
}

/**
 * Ensures the demo environment contains an expanded synthetic user set.
 *
 * @returns {void}
 */
function ensureRichDemoUsers() {
  const extra = [];
  for (let i = 1; i <= 12; i += 1) extra.push({ id: `rep-demo${String(i).padStart(2, "0")}`, name: `Reportante Demo ${i}`, role: "reportante", team: ["N1", "N2", "Infra", "OT"][i % 4] });
  for (let i = 1; i <= 10; i += 1) extra.push({ id: `tec-demo${String(i).padStart(2, "0")}`, name: `Tecnico Demo ${i}`, role: "tecnico", team: ["N1", "N2", "Infra", "OT"][i % 4] });
  for (let i = 1; i <= 4; i += 1) extra.push({ id: `sup-demo${String(i).padStart(2, "0")}`, name: `Supervisor Demo ${i}`, role: "supervisor", team: ["N1", "N2", "Infra", "OT"][i - 1] });
  extra.forEach((u) => {
    if (!s.users.some((xv) => xv.id === u.id)) s.users.push(normUser(u));
  });
}

/**
 * Ensures the demo environment contains a large synthetic incident dataset.
 *
 * @returns {void}
 */
function ensureRichDemoIncidents() {
  const already = s.incidents.filter((i) => (i.id || "").startsWith("INC-AUTO-")).length;
  if (already >= 80) return;
  const areas = ["N1", "N2", "Infra", "OT"];
  const tipos = { N1: ["Aplicacion", "Operacion", "Soporte"], N2: ["Hardware", "Seguridad", "Permisos"], Infra: ["Red", "Seguridad", "VPN"], OT: ["Operacion", "Hardware", "IoT"] };
  const prioridades = ["Baja", "Normal", "Alta", "Critica"];
  const estados = ["Pendiente de asignacion", "En analisis", "En progreso", "Pendiente de informacion", "Resuelta", "Cerrada", "Cerrada por el usuario"];
  const severidades = ["Baja", "Media", "Alta", "Critica"];
  const origenes = ["Usuario", "Aplicacion", "Red", "Servidor", "IoT"];
  const reps = s.users.filter((u) => u.role === "reportante");
  const techs = s.users.filter((u) => u.role === "tecnico");
  const sups = s.users.filter((u) => u.role === "supervisor");
  const base = new Date("2026-01-01T08:00:00.000Z");
  for (let i = already + 1; i <= 120; i += 1) {
    const area = areas[i % areas.length];
    const tipo = tipos[area][i % tipos[area].length];
    const prio = prioridades[i % prioridades.length];
    const sev = severidades[i % severidades.length];
    let estado = estados[i % estados.length];
    const creada = new Date(base);
    creada.setDate(creada.getDate() + i);
    creada.setHours(creada.getHours() + (i % 9));
    const rep = reps.find((r) => r.team === area) || reps[i % Math.max(1, reps.length)];
    const teamTech = techs.filter((t) => t.team === area);
    const asig = estado === "Pendiente de asignacion" ? "" : (teamTech[i % Math.max(1, teamTech.length)]?.id || techs[i % Math.max(1, techs.length)]?.id || "");
    const due = deadline(creada.toISOString(), prio);
    let cerradaEn = null;
    if (estado === "Cerrada" || estado === "Cerrada por el usuario") {
      const c = new Date(creada);
      c.setDate(c.getDate() + (1 + (i % 4)));
      cerradaEn = c.toISOString();
    }
    const timeline = [{ at: creada.toISOString(), event: "creada", detail: "Incidencia creada por reportante", by: `reportante:${rep?.id || "rep-laura"}` }];
    if (asig) {
      const at = new Date(creada); at.setMinutes(at.getMinutes() + 15);
      const sup = sups.find((s0) => s0.team === area) || sups[0];
      timeline.push({ at: at.toISOString(), event: "asignacion", detail: `Asignada a ${asig}`, by: `supervisor:${sup?.id || "sup-marta"}` });
    }
    if (estado === "En analisis" || estado === "En progreso" || estado === "Pendiente de informacion" || estado === "Resuelta") {
      const at = new Date(creada); at.setHours(at.getHours() + 2);
      timeline.push({ at: at.toISOString(), event: "estado_tecnico", detail: estado === "En progreso" ? "En analisis" : estado, by: `tecnico:${asig || "tec-ana"}` });
    }
    if (estado === "En progreso") {
      const at = new Date(creada); at.setHours(at.getHours() + 5);
      timeline.push({ at: at.toISOString(), event: "estado_tecnico", detail: "En progreso", by: `tecnico:${asig || "tec-ana"}` });
    }
    if (estado === "Pendiente de informacion") {
      const at = new Date(creada); at.setHours(at.getHours() + 4);
      timeline.push({ at: at.toISOString(), event: "solicitud_info_usuario", detail: "Pendiente de informacion", by: `tecnico:${asig || "tec-ana"}` });
    }
    if (estado === "Resuelta") {
      const at = new Date(creada); at.setHours(at.getHours() + 6);
      timeline.push({ at: at.toISOString(), event: "estado_tecnico", detail: "Resuelta", by: `tecnico:${asig || "tec-ana"}` });
    }
    if (estado === "Cerrada") timeline.push({ at: cerradaEn, event: "cierre_supervisor", detail: "Cerrada por supervisor", by: `supervisor:${(sups.find((s0) => s0.team === area) || sups[0] || { id: "sup-marta" }).id}` });
    if (estado === "Cerrada por el usuario") timeline.push({ at: cerradaEn, event: "cierre_confirmado_usuario", detail: "Cierre confirmado", by: `reportante:${rep?.id || "rep-laura"}` });
    if (i % 11 === 0) timeline.push({ at: new Date(creada.getTime() + 6 * 3600000).toISOString(), event: "cambio_prioridad", detail: "Alta", by: `supervisor:${(sups.find((s0) => s0.team === area) || sups[0] || { id: "sup-marta" }).id}` });
    if (i % 17 === 0) timeline.push({ at: new Date(creada.getTime() + 9 * 3600000).toISOString(), event: "solicitud_reasignacion", detail: "Solicitud por tecnico", by: `tecnico:${asig || "tec-ana"}` });
    if (i % 23 === 0 && ["Cerrada", "Cerrada por el usuario"].includes(estado)) {
      timeline.push({ at: new Date(creada.getTime() + 24 * 3600000).toISOString(), event: "reapertura", detail: "Reabierta por supervisor", by: `supervisor:${(sups.find((s0) => s0.team === area) || sups[0] || { id: "sup-marta" }).id}` });
      estado = "En analisis";
      cerradaEn = null;
    }
    const out = norm({
      id: `INC-AUTO-${String(i).padStart(3, "0")}`,
      titulo: `Caso auto ${i} - ${area} ${tipo}`,
      descripcion: `Incidencia automatica de prueba ${i} para validar dashboards, filtros, estados, SLA, auditoria y flujos de rol.`,
      origen: origenes[i % origenes.length],
      severidad: sev,
      categoria: tipo,
      tipoIncidencia: tipo,
      prioridad: prio,
      equipo: area,
      areaTecnica: area,
      reportanteId: rep?.id || "rep-laura",
      asignadoA: asig,
      estado,
      creadaEn: creada.toISOString(),
      fechaLimite: due,
      cerradaEn,
      adjuntos: [`captura-${String(i).padStart(3, "0")}.png`].concat(i % 3 === 0 ? [`log-${String(i).padStart(3, "0")}.txt`] : []),
      comentarios: [
        { user: rep?.id || "rep-laura", at: new Date(creada.getTime() + 8 * 60000).toISOString(), text: "Se detecta impacto en operacion." },
        ...(asig ? [{ user: asig, at: new Date(creada.getTime() + 2 * 3600000).toISOString(), text: "Analizando logs y contexto." }] : [])
      ],
      techNotes: asig ? [{ user: asig, at: new Date(creada.getTime() + 3 * 3600000).toISOString(), text: "Nota interna: revisada configuracion base." }] : [],
      timeline
    });
    if (out) s.incidents.push(out);
  }
}

const FALLBACK_USERS = [
  { id: "rep-alba", name: "Alba Romero", role: "reportante", team: "N1", email: "alba@demo.com", phone: "600100101" },
  { id: "rep-mario", name: "Mario Santos", role: "reportante", team: "OT", email: "mario@demo.com", phone: "600100102" },
  { id: "tec-luis", name: "Luis Ortega", role: "tecnico", team: "N1", email: "luis@demo.com" },
  { id: "tec-irene", name: "Irene Vega", role: "tecnico", team: "OT", email: "irene@demo.com" },
  { id: "sup-clara", name: "Clara Prieto", role: "supervisor", team: "N1", email: "clara@demo.com" },
  { id: "sup-diego", name: "Diego Rivas", role: "supervisor", team: "OT", email: "diego@demo.com" },
  { id: "aud-sofia", name: "Sofia Navas", role: "auditor", team: "QA", email: "sofia@demo.com" },
  { id: "adm-root", name: "Admin Root", role: "admin", team: "Core", email: "admin@demo.com" }
];
const FALLBACK_POLICIES = {
  reportante: { label: "Reportante", description: "Crea y sigue solo sus incidencias.", visibility: "own", permissions: { create_incident: true, export_data: false }, incident_actions: ["view"], menu: ["Mis incidencias", "Crear", "Detalle", "Notificaciones"] },
  tecnico: { label: "Tecnico", description: "Gestion tecnica de incidencias asignadas.", visibility: "team_or_assigned", permissions: { create_incident: false, export_data: false }, incident_actions: ["view", "comment", "to_analysis", "to_progress", "to_wait_info", "to_resolved", "request_reassign"], menu: ["Asignadas", "Estados", "Evidencias"] },
  supervisor: { label: "Supervisor", description: "Control operativo del area.", visibility: "team", permissions: { create_incident: false, export_data: false }, incident_actions: ["view", "assign", "change_priority", "change_category", "reopen", "supervisor_close"], menu: ["Asignar", "Prioridad", "Categoria", "Reabrir"] },
  auditor: { label: "Auditor", description: "Lectura global y exportacion.", visibility: "all", permissions: { create_incident: false, export_data: true }, incident_actions: ["view"], menu: ["Consulta", "Logs", "Exportacion"] },
  admin: { label: "Administrador", description: "Usuarios y politicas.", visibility: "all", permissions: { create_incident: false, export_data: false }, incident_actions: ["view"], menu: ["Usuarios", "Permisos"] }
};
const STATUS_CLASS = { "Pendiente de asignacion": "pendiente-info", "En analisis": "en-analisis", "En progreso": "en-progreso", "Pendiente de informacion": "pendiente-info", Resuelta: "resuelta", Cerrada: "cerrada", "Cerrada por el usuario": "cerrada", Nueva: "nueva" };
const PRIO_CLASS = { Baja: "prio-baja", Normal: "prio-media", Media: "prio-media", Alta: "prio-alta", Critica: "prio-critica" };

const s = {
  incidents: lsLoad().map(norm).filter(Boolean),
  users: [],
  policies: {},
  user: null,
  reportView: "mine",
  reportDetailId: null,
  techView: "assigned",
  techLayout: "dashboard",
  techChatTab: "team",
  techDetailId: null,
  techCalendarMode: "month",
  techCalendarFilter: "all",
  techCalendarCursor: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
  techCalendarSelectedDay: dOnly(new Date().toISOString()),
  supLayout: "dashboard",
  supDetailId: null,
  supChatTab: "team",
  supCalendarFilter: "all",
  supCalendarTech: "all",
  supCalendarCursor: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
  supCalendarSelectedDay: dOnly(new Date().toISOString()),
  audLayout: "dashboard",
  audDetailId: null,
  admLayout: "dashboard",
  admIncidentDetailId: null,
  admEditingUserId: "",
  admEditingAreaName: "",
  admEditingTypeKey: "",
  adminCfg: defaultAdminCfg(),
  catalogReqs: lsLoadCatalogReqs(),
  sysLogs: lsLoadSysLogs(),
  notifOpen: false,
  profileOpen: false,
  profileEditing: false,
  repF: { search: "", status: "all", tipo: "all", area: "all", date: "" },
  techF: { search: "", status: "all", priority: "all", tipo: "all", area: "all", days: "all", date: "" },
  supF: { search: "", status: "all", priority: "all", assignee: "all", tipo: "all", area: "all", days: "all", date: "" },
  audF: { search: "", status: "all", priority: "all", area: "all", days: "all", date: "" },
  audLogF: { search: "", role: "all", action: "all", incident: "", date: "" },
  audUserF: { search: "", role: "all", date: "" },
  admUserF: { search: "", role: "all", status: "all" },
  admIncF: { search: "", status: "all", area: "all" },
  admLogF: { search: "", type: "all", user: "", date: "" },
  gF: { search: "", status: "all", severity: "all" },
  techQuick: "all"
};
s.theme = lsLoadTheme();

const q = (id) => document.getElementById(id);
const E = {
  profileBtn: q("profileBtn"),
  tabTechProfileBtn: q("tabTechProfileBtn"), tabSupProfileBtn: q("tabSupProfileBtn"), tabAudProfileBtn: q("tabAudProfileBtn"), tabAdmProfileBtn: q("tabAdmProfileBtn"),
  themeToggleBtn: q("themeToggleBtn"),
  loginUserSelect: q("loginUserSelect"), loginBtn: q("loginBtn"), logoutBtn: q("logoutBtn"),
  notifBell: q("notifBell"), notifCount: q("notifCount"), notifPanel: q("notifPanel"),
  monitorTitle: q("monitorTitle"), sessionInfo: q("sessionInfo"), roleSummary: q("roleSummary"), roleMenu: q("roleMenu"),
  profileMain: q("profileMain"), pfName: q("pfName"), pfLastName: q("pfLastName"), pfEmail: q("pfEmail"), pfPhone: q("pfPhone"), pfPhoto: q("pfPhoto"), pfPhotoPreview: q("pfPhotoPreview"),
  pfEditBtn: q("pfEditBtn"), pfSaveBtn: q("pfSaveBtn"), pfCancelBtn: q("pfCancelBtn"), pfMsg: q("pfMsg"), pfReadOnly: q("pfReadOnly"),
  pfCurrentPass: q("pfCurrentPass"), pfNewPass: q("pfNewPass"), pfConfirmPass: q("pfConfirmPass"), pfChangePassBtn: q("pfChangePassBtn"),
  pfNotifInternal: q("pfNotifInternal"), pfNotifEmail: q("pfNotifEmail"), pfEvtNew: q("pfEvtNew"), pfEvtState: q("pfEvtState"), pfEvtComment: q("pfEvtComment"), pfEvtDue: q("pfEvtDue"), pfEvtReassign: q("pfEvtReassign"), pfEvtAlerts: q("pfEvtAlerts"), pfSaveNotifBtn: q("pfSaveNotifBtn"),
  reportanteMain: q("reportanteMain"), tecnicoMain: q("tecnicoMain"), supervisorMain: q("supervisorMain"), auditorMain: q("auditorMain"), adminMain: q("adminMain"), genericMain: q("genericMain"), reportStats: q("reportStats"), globalStats: q("globalStats"),
  summaryDock: q("summaryDock"),
  reportSummaryPanel: q("reportSummaryPanel"), techSummaryPanel: q("techSummaryPanel"), supSummaryPanel: q("supSummaryPanel"),
  supStats: q("supStats"), supDashboardKpis: q("supDashboardKpis"), supPerfKpis: q("supPerfKpis"), supIncidentBody: q("supIncidentBody"), supDetail: q("supDetail"),
  supVizGrid: q("supVizGrid"), supHeatmap: q("supHeatmap"),
  supUnassignedBody: q("supUnassignedBody"), supLoadMap: q("supLoadMap"), supReportsKpi: q("supReportsKpi"), supKanbanBoard: q("supKanbanBoard"),
  supCalendarPrevBtn: q("supCalendarPrevBtn"), supCalendarNextBtn: q("supCalendarNextBtn"), supCalendarMonthLabel: q("supCalendarMonthLabel"), supCalendarGrid: q("supCalendarGrid"), supCalendarList: q("supCalendarList"),
  supCalendarTechFilter: q("supCalendarTechFilter"), supCalendarFilter: q("supCalendarFilter"), assignSuggestion: q("assignSuggestion"),
  supChatList: q("supChatList"), supChatInput: q("supChatInput"), supChatSendBtn: q("supChatSendBtn"), supChatComposer: q("supChatComposer"),
  supChatType: q("supChatType"),
  supChatTabTeamBtn: q("supChatTabTeamBtn"), supChatTabAlertsBtn: q("supChatTabAlertsBtn"),
  supReqKind: q("supReqKind"), supReqArea: q("supReqArea"), supReqName: q("supReqName"), supReqDesc: q("supReqDesc"), supSendReqBtn: q("supSendReqBtn"), supReqMsg: q("supReqMsg"),
  tabSupDashboardBtn: q("tabSupDashboardBtn"), tabSupListBtn: q("tabSupListBtn"), tabSupCalendarBtn: q("tabSupCalendarBtn"), tabSupAssignBtn: q("tabSupAssignBtn"),
  tabSupLoadBtn: q("tabSupLoadBtn"), tabSupKanbanBtn: q("tabSupKanbanBtn"), tabSupReportsBtn: q("tabSupReportsBtn"), tabSupChatBtn: q("tabSupChatBtn"),
  supDashboardView: q("supDashboardView"), supListView: q("supListView"), supCalendarView: q("supCalendarView"), supAssignView: q("supAssignView"),
  supLoadView: q("supLoadView"), supKanbanView: q("supKanbanView"), supReportsView: q("supReportsView"), supChatView: q("supChatView"),
  supSearchInput: q("supSearchInput"), supStatusFilter: q("supStatusFilter"), supPriorityFilter: q("supPriorityFilter"), supAssigneeFilter: q("supAssigneeFilter"),
  supTipoFilter: q("supTipoFilter"), supAreaFilter: q("supAreaFilter"), supDaysFilter: q("supDaysFilter"), supDateFilter: q("supDateFilter"),
  techStats: q("techStats"), techIncidentBody: q("techIncidentBody"), techTeamBody: q("techTeamBody"), techDetail: q("techDetail"),
  techDayWidget: q("techDayWidget"), techWorkload: q("techWorkload"),
  techDashboardKpis: q("techDashboardKpis"), techDashboardViz: q("techDashboardViz"),
  tabTechDashboardBtn: q("tabTechDashboardBtn"), tabTechAssignedScreenBtn: q("tabTechAssignedScreenBtn"), tabTechTeamScreenBtn: q("tabTechTeamScreenBtn"),
  tabTechKanbanBtn: q("tabTechKanbanBtn"), tabTechCalendarBtn: q("tabTechCalendarBtn"), tabTechChatBtn: q("tabTechChatBtn"),
  techDashboardView: q("techDashboardView"), techAssignedView: q("techAssignedView"), techTeamView: q("techTeamView"),
  techKanbanView: q("techKanbanView"), techCalendarView: q("techCalendarView"), techChatView: q("techChatView"),
  techKanbanBoard: q("techKanbanBoard"), techCalendarMode: q("techCalendarMode"), techCalendarFilter: q("techCalendarFilter"), techCalendarList: q("techCalendarList"),
  techCalendarPrevBtn: q("techCalendarPrevBtn"), techCalendarNextBtn: q("techCalendarNextBtn"), techCalendarMonthLabel: q("techCalendarMonthLabel"), techCalendarGrid: q("techCalendarGrid"),
  techChatList: q("techChatList"), techChatInput: q("techChatInput"), techChatSendBtn: q("techChatSendBtn"), techChatComposer: q("techChatComposer"),
  techChatTabTeamBtn: q("techChatTabTeamBtn"), techChatTabAlertsBtn: q("techChatTabAlertsBtn"),
  tabMineBtn: q("tabMineBtn"), tabCreateBtn: q("tabCreateBtn"), tabProfileBtn: q("tabProfileBtn"), cancelCreateBtn: q("cancelCreateBtn"),
  tabTechAssignedBtn: q("tabTechAssignedBtn"), tabTechTeamBtn: q("tabTechTeamBtn"),
  incidentForm: q("incidentForm"), formMsg: q("formMsg"), reportProfile: q("reportProfile"), profileData: q("profileData"),
  reportDetail: q("reportDetail"), repIncidentBody: q("repIncidentBody"),
  areaTecnica: q("areaTecnica"), tipoIncidencia: q("tipoIncidencia"),
  tabAudDashboardBtn: q("tabAudDashboardBtn"), tabAudListBtn: q("tabAudListBtn"), tabAudLogBtn: q("tabAudLogBtn"), tabAudReportsBtn: q("tabAudReportsBtn"), tabAudUsersBtn: q("tabAudUsersBtn"),
  audStats: q("audStats"), audDashboardKpis: q("audDashboardKpis"), audActivityList: q("audActivityList"), audIncidentBody: q("audIncidentBody"), audDetail: q("audDetail"),
  audVizGrid: q("audVizGrid"), audReportsViz: q("audReportsViz"),
  audLogBody: q("audLogBody"), audReportsKpi: q("audReportsKpi"), audUserBody: q("audUserBody"),
  audDashboardView: q("audDashboardView"), audListView: q("audListView"), audLogView: q("audLogView"), audReportsView: q("audReportsView"), audUsersView: q("audUsersView"),
  audSearchInput: q("audSearchInput"), audStatusFilter: q("audStatusFilter"), audPriorityFilter: q("audPriorityFilter"), audAreaFilter: q("audAreaFilter"), audDaysFilter: q("audDaysFilter"), audDateFilter: q("audDateFilter"),
  audLogSearchInput: q("audLogSearchInput"), audLogRoleFilter: q("audLogRoleFilter"), audLogActionFilter: q("audLogActionFilter"), audLogIncidentInput: q("audLogIncidentInput"), audLogDateFilter: q("audLogDateFilter"), audExportLogBtn: q("audExportLogBtn"),
  audUserSearchInput: q("audUserSearchInput"), audUserRoleFilter: q("audUserRoleFilter"), audUserDateFilter: q("audUserDateFilter"),
  tabAdmDashboardBtn: q("tabAdmDashboardBtn"), tabAdmUsersBtn: q("tabAdmUsersBtn"), tabAdmRolesBtn: q("tabAdmRolesBtn"), tabAdmConfigBtn: q("tabAdmConfigBtn"), tabAdmIncidentsBtn: q("tabAdmIncidentsBtn"), tabAdmLogsBtn: q("tabAdmLogsBtn"), tabAdmMonitorBtn: q("tabAdmMonitorBtn"),
  admStats: q("admStats"), admDashboardKpis: q("admDashboardKpis"), admAlerts: q("admAlerts"), admUserBody: q("admUserBody"), admIncidentBody: q("admIncidentBody"), admIncidentDetail: q("admIncidentDetail"), admLogBody: q("admLogBody"), admMonitorKpis: q("admMonitorKpis"),
  admVizGrid: q("admVizGrid"),
  admDashboardView: q("admDashboardView"), admUsersView: q("admUsersView"), admRolesView: q("admRolesView"), admConfigView: q("admConfigView"), admIncidentsView: q("admIncidentsView"), admLogsView: q("admLogsView"), admMonitorView: q("admMonitorView"),
  admUserSearchInput: q("admUserSearchInput"), admUserRoleFilter: q("admUserRoleFilter"), admUserStatusFilter: q("admUserStatusFilter"),
  admFormId: q("admFormId"), admFormName: q("admFormName"), admFormEmail: q("admFormEmail"), admFormRole: q("admFormRole"), admFormTeam: q("admFormTeam"), admFormStatus: q("admFormStatus"), admSaveUserBtn: q("admSaveUserBtn"), admResetUserFormBtn: q("admResetUserFormBtn"), admUserMsg: q("admUserMsg"),
  admRoleSelect: q("admRoleSelect"), admRoleVisibility: q("admRoleVisibility"), admPermCreate: q("admPermCreate"), admPermExport: q("admPermExport"), admRoleActions: q("admRoleActions"), admSaveRoleBtn: q("admSaveRoleBtn"),
  admAreaSearchInput: q("admAreaSearchInput"), admAreaStatusFilter: q("admAreaStatusFilter"), admAreaBody: q("admAreaBody"), admAreaName: q("admAreaName"), admAreaStatus: q("admAreaStatus"), admAreaDesc: q("admAreaDesc"), admSaveAreaBtn: q("admSaveAreaBtn"), admResetAreaBtn: q("admResetAreaBtn"),
  admTypeSearchInput: q("admTypeSearchInput"), admTypeAreaFilter: q("admTypeAreaFilter"), admTypeStatusFilter: q("admTypeStatusFilter"), admTypeBody: q("admTypeBody"), admTypeName: q("admTypeName"), admTypeArea: q("admTypeArea"), admTypeStatus: q("admTypeStatus"), admTypeDesc: q("admTypeDesc"), admSaveTypeBtn: q("admSaveTypeBtn"), admResetTypeBtn: q("admResetTypeBtn"), admReqBody: q("admReqBody"),
  admParamResp: q("admParamResp"), admParamRes: q("admParamRes"), admParamAutoClose: q("admParamAutoClose"), admParamNotif: q("admParamNotif"), admPriorityRulesInput: q("admPriorityRulesInput"), admTransitionsInput: q("admTransitionsInput"), admSaveConfigBtn: q("admSaveConfigBtn"),
  admIncSearchInput: q("admIncSearchInput"), admIncStatusFilter: q("admIncStatusFilter"), admIncAreaFilter: q("admIncAreaFilter"),
  admLogSearchInput: q("admLogSearchInput"), admLogTypeFilter: q("admLogTypeFilter"), admLogUserInput: q("admLogUserInput"), admLogDateFilter: q("admLogDateFilter"), admExportLogsBtn: q("admExportLogsBtn"),
  repSearchInput: q("repSearchInput"), repStatusFilter: q("repStatusFilter"), repTipoFilter: q("repTipoFilter"), repAreaFilter: q("repAreaFilter"), repDateFilter: q("repDateFilter"),
  techSearchInput: q("techSearchInput"), techStatusFilter: q("techStatusFilter"), techPriorityFilter: q("techPriorityFilter"), techTipoFilter: q("techTipoFilter"), techAreaFilter: q("techAreaFilter"), techDaysFilter: q("techDaysFilter"), techDateFilter: q("techDateFilter"),
  incidentBody: q("incidentBody"), rowTemplate: q("rowTemplate"), searchInput: q("searchInput"), statusFilter: q("statusFilter"), severityFilter: q("severityFilter"),
  evidenceIncidentSelect: q("evidenceIncidentSelect"), evidenceInput: q("evidenceInput"), addEvidenceBtn: q("addEvidenceBtn"), tecnicoKpi: q("tecnicoKpi"),
  assignIncidentSelect: q("assignIncidentSelect"), assignTechSelect: q("assignTechSelect"), suggestAssignBtn: q("suggestAssignBtn"), assignBtn: q("assignBtn"), supervisorKpi: q("supervisorKpi"),
  exportBtn: q("exportBtn"), auditorKpi: q("auditorKpi"),
  adminUserForm: q("adminUserForm"), adminUsersList: q("adminUsersList"), adminPolicyRole: q("adminPolicyRole"), adminPolicyView: q("adminPolicyView")
};

/**
 * Retrieves the policy definition for a role.
 *
 * @param {string} role - Role identifier.
 * @returns {Object|null} Policy object for the requested role.
 */
function pol(role) { return s.policies[role] || null; }
/** @returns {boolean} Whether the current user can create incidents. */
function canCreate() { return !!pol(s.user?.role)?.permissions?.create_incident; }
/** @returns {boolean} Whether the current user can export data. */
function canExport() { return !!pol(s.user?.role)?.permissions?.export_data; }
/**
 * Determines whether the current user can view a given incident.
 *
 * @param {Object} i - Incident record to evaluate.
 * @returns {boolean} `true` when the incident is visible to the current user.
 */
function canView(i) {
  if (!s.user) return false;
  const v = pol(s.user.role)?.visibility || "none";
  if (v === "all") return true;
  if (v === "own") return i.reportanteId === s.user.id;
  if (v === "team") return i.equipo === s.user.team;
  if (v === "team_or_assigned") return i.equipo === s.user.team || i.asignadoA === s.user.id;
  return false;
}
/**
 * Retrieves the configured incident action list for a role.
 *
 * @param {string} role - Role identifier.
 * @returns {Array<string>} Allowed action identifiers.
 */
function act(role) { return Array.isArray(pol(role)?.incident_actions) ? pol(role).incident_actions : []; }
/** @returns {Array<Object>} Incidents visible to the current user. */
function visible() { return s.incidents.filter(canView); }
/** @returns {void} Persists the in-memory incident collection. */
function save() { lsSave(s.incidents); }
/**
 * Appends a timeline event to an incident.
 *
 * @param {Object} i - Incident record to update.
 * @param {string} ev - Event identifier.
 * @param {string} detail - Human-readable event detail.
 * @returns {void}
 */
function log(i, ev, detail) {
  i.timeline = i.timeline || [];
  i.timeline.push({ at: new Date().toISOString(), event: ev, detail: detail || "", by: `${s.user.role}:${s.user.id}` });
}
/**
 * Builds the localStorage key for a team chat thread.
 *
 * @param {string} team - Team identifier.
 * @returns {string} Chat storage key.
 */
function chatKey(team) { return `smartlog_team_chat_${team}`; }
/**
 * Builds the localStorage key for a user's chat read marker.
 *
 * @param {string} team - Team identifier.
 * @param {string} userId - User identifier.
 * @returns {string} Read-tracking storage key.
 */
function chatReadKey(team, userId) { return `smartlog_team_chat_read_${team}_${userId}`; }
/**
 * Loads stored chat messages for a team.
 *
 * @param {string} team - Team identifier.
 * @returns {Array<Object>} Stored chat messages.
 */
function loadTeamChat(team) {
  try {
    const raw = localStorage.getItem(chatKey(team));
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
/**
 * Persists chat messages for a team.
 *
 * @param {string} team - Team identifier.
 * @param {Array<Object>} arr - Chat message collection.
 * @returns {void}
 */
function saveTeamChat(team, arr) {
  localStorage.setItem(chatKey(team), JSON.stringify(arr.slice(-120)));
}
/**
 * Loads the last read timestamp for a user's team chat.
 *
 * @param {string} team - Team identifier.
 * @param {string} userId - User identifier.
 * @returns {string} Stored ISO timestamp, or an empty string.
 */
function loadChatReadAt(team, userId) {
  try {
    return localStorage.getItem(chatReadKey(team, userId)) || "";
  } catch {
    return "";
  }
}
/**
 * Saves the last read timestamp for a user's team chat.
 *
 * @param {string} team - Team identifier.
 * @param {string} userId - User identifier.
 * @param {string} iso - ISO timestamp to store.
 * @returns {void}
 */
function saveChatReadAt(team, userId, iso) {
  localStorage.setItem(chatReadKey(team, userId), iso || new Date().toISOString());
}
/**
 * Returns unread team chat messages for the current user.
 *
 * @param {string} team - Team identifier.
 * @returns {Array<Object>} Unread messages.
 */
function unreadTeamMessages(team) {
  if (!s.user) return [];
  const last = loadChatReadAt(team, s.user.id);
  const lastMs = last ? new Date(last).getTime() : 0;
  return loadTeamChat(team).filter((m) => {
    const atMs = new Date(m.at || 0).getTime();
    return atMs > lastMs && m.user !== s.user.id;
  });
}
/**
 * Returns unread supervisor/announcement chat messages for the current user.
 *
 * @param {string} team - Team identifier.
 * @returns {Array<Object>} Unread announcement messages.
 */
function unreadTeamAnnouncements(team) {
  return unreadTeamMessages(team).filter((m) => m.kind === "aviso" || m.role === "supervisor");
}
/**
 * Marks a team chat thread as read for the current user.
 *
 * @param {string} team - Team identifier.
 * @returns {void}
 */
function markTeamChatRead(team) {
  if (!s.user) return;
  saveChatReadAt(team, s.user.id, new Date().toISOString());
}
/**
 * Updates a button caption with an optional numeric suffix.
 *
 * @param {HTMLElement|null} btn - Button element to update.
 * @param {string} base - Base button label.
 * @param {number} count - Notification count.
 * @returns {void}
 */
function setBtnCount(btn, base, count) {
  if (!btn) return;
  btn.textContent = count > 0 ? `${base} (${count})` : base;
}
/** @returns {void} Closes the shared profile screen. */
function closeGlobalProfile() {
  s.profileOpen = false;
}
/** @returns {void} Opens the shared profile screen for the current user. */
function openGlobalProfile() {
  if (!s.user) return;
  s.profileOpen = true;
  s.profileEditing = false;
  if (E.pfMsg) E.pfMsg.textContent = "";
}
/**
 * Moves a detail section to the top of a main container and scrolls to it.
 *
 * @param {HTMLElement} mainEl - Main content container.
 * @param {HTMLElement} detailEl - Detail element to focus.
 * @returns {void}
 */
function showDetailAtTop(mainEl, detailEl) {
  if (!mainEl || !detailEl) return;
  if (mainEl.firstElementChild !== detailEl) mainEl.insertBefore(detailEl, mainEl.firstElementChild);
  detailEl.scrollIntoView({ behavior: "smooth", block: "start" });
}
/**
 * Builds the markup used for announcement badges.
 *
 * @param {string} kind - Message kind identifier.
 * @returns {string} Badge HTML snippet.
 */
function avisoBadge(kind) {
  return kind === "aviso" ? '<span class="msg-badge aviso">AVISO</span> ' : "";
}
/**
 * Serializes incidents to a JSON export payload.
 *
 * @param {Array<Object>} arr - Incidents to export.
 * @returns {string} Pretty-printed JSON string.
 */
function exportIncidents(arr) {
  return JSON.stringify({ exportedAt: new Date().toISOString(), incidents: arr || [] }, null, 2);
}
/**
 * Downloads plain text content as a file.
 *
 * @param {string} filename - Download filename.
 * @param {string} mime - MIME type.
 * @param {string} content - File contents.
 * @returns {void}
 */
function downloadText(filename, mime, content) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
/**
 * Pushes an entry into the application system log.
 *
 * @param {string} type - Log category.
 * @param {string} message - Human-readable message.
 * @param {string} userId - Related user identifier.
 * @param {Object} [meta={}] - Extra structured log metadata.
 * @returns {void}
 */
function pushSysLog(type, message, userId, meta = {}) {
  s.sysLogs.push({ at: new Date().toISOString(), type: x(type) || "info", user: x(userId) || "-", message: x(message), meta });
  lsSaveSysLogs(s.sysLogs);
}
/** @returns {Array<Object>} Active administrative area records. */
function activeAreas() {
  return (s.adminCfg.areas || []).filter((a) => a.status === "active");
}
/**
 * Returns active incident types configured for a specific area.
 *
 * @param {string} area - Area name.
 * @returns {Array<Object>} Active type records for the area.
 */
function activeTypesFor(area) {
  return (s.adminCfg.types || []).filter((t) => t.status === "active" && t.area === area);
}
/**
 * Checks whether an area exists and is active.
 *
 * @param {string} area - Area name.
 * @returns {boolean} `true` when the area exists and is active.
 */
function areaExistsActive(area) {
  return activeAreas().some((a) => a.name === area);
}
/**
 * Checks whether a type exists and is active inside an area.
 *
 * @param {string} area - Area name.
 * @param {string} typeName - Type name.
 * @returns {boolean} `true` when the type exists and is active.
 */
function typeExistsActive(area, typeName) {
  return activeTypesFor(area).some((t) => t.name === typeName);
}
/** @returns {Array<string>} Valid priority labels from admin configuration. */
function validPriorities() {
  return Array.isArray(s.adminCfg.priorities) && s.adminCfg.priorities.length ? s.adminCfg.priorities : ["Baja", "Normal", "Alta", "Critica"];
}
/** @returns {Object} State transition map from admin configuration. */
function transitionsCfg() {
  const raw = s.adminCfg.transitions;
  if (!raw || typeof raw !== "object") return defaultAdminCfg().transitions;
  return raw;
}
/**
 * Checks whether an incident state transition is allowed.
 *
 * @param {string} from - Current state.
 * @param {string} to - Target state.
 * @returns {boolean} `true` when the transition is configured.
 */
function canTransition(from, to) {
  if (!from || !to || from === to) return false;
  const map = transitionsCfg();
  const allowed = Array.isArray(map[from]) ? map[from] : [];
  return allowed.includes(to);
}
/**
 * Applies a validated state transition to an incident.
 *
 * @param {Object} i - Incident record to update.
 * @param {string} to - Target state.
 * @param {string} event - Timeline event name.
 * @param {string} detail - Human-readable event detail.
 * @returns {boolean} `true` when the transition was applied.
 */
function setIncidentState(i, to, event, detail) {
  if (!i || !to || i.estado === to) return false;
  if (!canTransition(i.estado, to)) {
    alert(`Transicion no permitida: "${i.estado}" -> "${to}"`);
    pushSysLog("warn", `Transicion bloqueada ${i.id}: ${i.estado} -> ${to}`, s.user?.id || "-");
    return false;
  }
  i.estado = to;
  if (["Cerrada", "Cerrada por el usuario"].includes(to)) i.cerradaEn = new Date().toISOString();
  if (!["Cerrada", "Cerrada por el usuario"].includes(to)) i.cerradaEn = null;
  log(i, event || "estado_actualizado", detail || to);
  return true;
}
/**
 * Resolves an automatic priority based on configured rules.
 *
 * @param {string} area - Area name.
 * @param {string} tipo - Incident type.
 * @returns {string} Resolved priority label.
 */
function applyPriorityRule(area, tipo) {
  const rules = Array.isArray(s.adminCfg.priorityRules) ? s.adminCfg.priorityRules : [];
  const priorities = validPriorities();
  const match = rules.find((r) => {
    const ruleArea = x(r.area);
    const ruleTipo = x(r.tipo);
    const okArea = !ruleArea || ruleArea === area;
    const okTipo = !ruleTipo || ruleTipo === tipo;
    return okArea && okTipo;
  });
  if (match && priorities.includes(match.prioridad)) return match.prioridad;
  return "Normal";
}
/**
 * Parses priority rules from raw JSON text.
 *
 * @param {string} raw - Raw JSON input.
 * @returns {Array<Object>} Parsed priority rule array.
 */
function parsePriorityRulesText(raw) {
  const parsed = JSON.parse(raw || "[]");
  if (!Array.isArray(parsed)) throw new Error("Reglas de prioridad: formato invalido.");
  const priorities = validPriorities();
  return parsed.map((r) => ({
    area: x(r?.area),
    tipo: x(r?.tipo),
    prioridad: x(r?.prioridad)
  })).filter((r) => {
    if (!r.prioridad || !priorities.includes(r.prioridad)) throw new Error(`Prioridad invalida en reglas: ${r.prioridad || "-"}`);
    return true;
  });
}
/**
 * Parses state transition rules from raw JSON text.
 *
 * @param {string} raw - Raw JSON input.
 * @returns {Object} Parsed transition map.
 */
function parseTransitionsText(raw) {
  const parsed = JSON.parse(raw || "{}");
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Transiciones: formato invalido.");
  const out = {};
  Object.entries(parsed).forEach(([from, tos]) => {
    const key = x(from);
    if (!key) return;
    if (!Array.isArray(tos)) throw new Error(`Transiciones de "${key}" deben ser una lista.`);
    const list = tos.map((v) => x(v)).filter(Boolean);
    if (!list.length) throw new Error(`"${key}" debe tener al menos un destino.`);
    out[key] = list;
  });
  if (!Object.keys(out).length) throw new Error("Debes definir al menos una transicion.");
  return out;
}
/** @returns {void} Applies the current theme to the document root. */
function applyTheme() {
  document.documentElement.setAttribute("data-theme", s.theme === "dark" ? "dark" : "light");
  if (E.themeToggleBtn) E.themeToggleBtn.textContent = s.theme === "dark" ? "Modo claro" : "Modo oscuro";
}
/**
 * Builds compact SLA progress markup for an incident.
 *
 * @param {Object} i - Incident record.
 * @returns {string} HTML snippet.
 */
function limitProgressHtml(i) {
  const total = Math.max(1, Number(s.adminCfg?.params?.maxResolveDays || 7));
  const elapsed = Math.max(0, Math.ceil((new Date() - new Date(i.creadaEn || Date.now())) / 86400000));
  const pct = Math.max(0, Math.min(100, Math.round((elapsed / total) * 100)));
  const cls = pct < 60 ? "ok" : pct < 90 ? "warn" : "danger";
  return `<div class="mini-progress ${cls}" title="SLA resolucion ${pct}%"><span style="width:${pct}%"></span></div>`;
}
/**
 * Builds an incident state indicator snippet.
 *
 * @param {Object} i - Incident record.
 * @returns {string} HTML snippet.
 */
function stateIconHtml(i) {
  const cls = i.estado === "Resuelta" || i.estado === "Cerrada" || i.estado === "Cerrada por el usuario" ? "ok" : i.prioridad === "Alta" || i.prioridad === "Critica" ? "danger" : i.estado === "Pendiente de asignacion" || i.estado === "Pendiente de informacion" ? "warn" : "info";
  return `<span class="state-dot ${cls}"></span>`;
}
/**
 * Builds donut-chart markup from summary rows.
 *
 * @param {Array<Object>} items - Chart source rows.
 * @param {string} valueKey - Property containing numeric values.
 * @param {string} labelKey - Property containing labels.
 * @returns {string} HTML chart markup.
 */
function donutChartHtml(items, valueKey, labelKey) {
  const total = items.reduce((a, b) => a + (Number(b[valueKey]) || 0), 0) || 1;
  let acc = 0;
  const colors = ["#0ea5e9", "#f59e0b", "#22c55e", "#ef4444", "#8b5cf6", "#14b8a6"];
  const stops = items.map((r, idx) => {
    const val = Number(r[valueKey]) || 0;
    const from = Math.round((acc / total) * 100);
    acc += val;
    const to = Math.round((acc / total) * 100);
    return `${colors[idx % colors.length]} ${from}% ${to}%`;
  }).join(", ");
  const legend = items.map((r, idx) => `<div class="chart-legend-item"><span class="legend-swatch" style="background:${colors[idx % colors.length]}"></span>${r[labelKey]}: <strong>${r[valueKey]}</strong></div>`).join("");
  return `<div class="donut-wrap"><div class="donut" style="background:conic-gradient(${stops || "#94a3b8 0 100%"})"></div><div class="donut-center">${total}</div></div><div class="chart-legend">${legend}</div>`;
}
/**
 * Builds bar-chart markup from summary rows.
 *
 * @param {Array<Object>} items - Chart source rows.
 * @param {string} valueKey - Property containing numeric values.
 * @param {string} labelKey - Property containing labels.
 * @returns {string} HTML chart markup.
 */
function barChartHtml(items, valueKey, labelKey) {
  const max = Math.max(1, ...items.map((r) => Number(r[valueKey]) || 0));
  const rows = items.map((r) => {
    const v = Number(r[valueKey]) || 0;
    const w = Math.round((v / max) * 100);
    return `<div class="bar-row"><span class="bar-label">${r[labelKey]}</span><div class="bar-track"><span class="bar-fill" style="width:${w}%"></span></div><strong>${v}</strong></div>`;
  }).join("");
  return `<div class="bar-chart">${rows || "<p class='hint'>Sin datos</p>"}</div>`;
}
/**
 * Builds line-chart markup from weekly or monthly points.
 *
 * @param {Array<Object>} points - Point collection to plot.
 * @returns {string} HTML chart markup.
 */
function lineChartHtml(points) {
  if (!points.length) return "<p class='hint'>Sin datos</p>";
  const width = 420; const height = 150; const pad = 18;
  const maxY = Math.max(1, ...points.map((p) => Math.max(p.in, p.out, p.late)));
  const mk = (getter) => points.map((p, i) => {
    const x = pad + (i * (width - pad * 2)) / Math.max(1, points.length - 1);
    const y = height - pad - (getter(p) * (height - pad * 2)) / maxY;
    return `${x},${y}`;
  }).join(" ");
  const labels = points.map((p) => `<span>${p.label}</span>`).join("");
  return `<svg viewBox="0 0 ${width} ${height}" class="line-chart" role="img" aria-label="Evolucion semanal"><polyline points="${mk((p) => p.in)}" class="line in"></polyline><polyline points="${mk((p) => p.out)}" class="line out"></polyline><polyline points="${mk((p) => p.late)}" class="line late"></polyline></svg><div class="line-labels" style="grid-template-columns:repeat(${points.length},minmax(0,1fr))">${labels}</div><div class="chart-legend"><div class="chart-legend-item"><span class="legend-swatch in"></span>Entran</div><div class="chart-legend-item"><span class="legend-swatch out"></span>Resueltas</div><div class="chart-legend-item"><span class="legend-swatch late"></span>Retrasadas</div></div>`;
}
/** @returns {void} Renders reporter area/type selectors from active catalogs. */
function renderReportCatalogSelectors() {
  if (!E.areaTecnica || !E.tipoIncidencia) return;
  const selectedArea = E.areaTecnica.value;
  const areas = activeAreas();
  E.areaTecnica.innerHTML = `<option value="">Selecciona...</option>` + areas.map((a) => `<option value="${a.name}">${a.name}</option>`).join("");
  if (selectedArea && areas.some((a) => a.name === selectedArea)) E.areaTecnica.value = selectedArea;
  const area = E.areaTecnica.value;
  const selectedType = E.tipoIncidencia.value;
  const types = area ? activeTypesFor(area) : [];
  E.tipoIncidencia.innerHTML = `<option value="">Selecciona...</option>` + types.map((t) => `<option value="${t.name}">${t.name}</option>`).join("");
  if (selectedType && types.some((t) => t.name === selectedType)) E.tipoIncidencia.value = selectedType;
}
/** @returns {void} Renders supervisor request area selectors from active catalogs. */
function renderSupervisorRequestAreas() {
  if (!E.supReqArea) return;
  const current = E.supReqArea.value;
  const areas = activeAreas();
  E.supReqArea.innerHTML = `<option value="">Selecciona...</option>` + areas.map((a) => `<option value="${a.name}">${a.name}</option>`).join("");
  if (current && areas.some((a) => a.name === current)) E.supReqArea.value = current;
}

/** @returns {void} Renders the top navigation and session summary area. */
function renderTop() {
  if (!s.user) {
    E.monitorTitle.textContent = "Monitor";
    E.sessionInfo.textContent = "Sin sesion activa.";
    E.roleSummary.textContent = "Inicia sesion para acceder.";
    E.roleMenu.innerHTML = "";
    E.roleMenu.style.display = "none";
    if (E.profileBtn) E.profileBtn.style.display = "none";
    return;
  }
  if (E.profileBtn) E.profileBtn.style.display = "inline-flex";
  const p = pol(s.user.role);
  E.monitorTitle.textContent = `Pantalla ${p?.label || s.user.role}`;
  E.sessionInfo.textContent = `Sesion: ${s.user.name} (${s.user.id})`;
  E.roleSummary.textContent = p?.description || "";
  E.roleMenu.innerHTML = "";
  E.roleMenu.style.display = "none";
}
/** @returns {void} Renders role panels and main workspace visibility. */
function renderPanels() {
  document.querySelectorAll(".role-panel").forEach((el) => { el.style.display = s.user && el.dataset.rolePanel === s.user.role ? "block" : "none"; });
  const rep = s.user?.role === "reportante";
  const tec = s.user?.role === "tecnico";
  const sup = s.user?.role === "supervisor";
  const aud = s.user?.role === "auditor";
  const adm = s.user?.role === "admin";
  E.reportanteMain.style.display = rep ? "block" : "none";
  E.tecnicoMain.style.display = tec ? "block" : "none";
  E.supervisorMain.style.display = sup ? "block" : "none";
  E.auditorMain.style.display = aud ? "block" : "none";
  E.adminMain.style.display = adm ? "block" : "none";
  if (E.summaryDock) E.summaryDock.style.display = rep || tec || sup ? "block" : "none";
  if (E.reportSummaryPanel) E.reportSummaryPanel.style.display = rep ? "block" : "none";
  if (E.techSummaryPanel) E.techSummaryPanel.style.display = tec ? "block" : "none";
  if (E.supSummaryPanel) E.supSummaryPanel.style.display = sup ? "block" : "none";
  E.genericMain.style.display = rep || tec || sup || aud || adm ? "none" : s.user ? "block" : "none";
  if (s.profileOpen && s.user) {
    E.reportanteMain.style.display = "none";
    E.tecnicoMain.style.display = "none";
    E.supervisorMain.style.display = "none";
    E.auditorMain.style.display = "none";
    E.adminMain.style.display = "none";
    if (E.summaryDock) E.summaryDock.style.display = "none";
    E.genericMain.style.display = "none";
  }
}
/**
 * Toggles editability of profile fields.
 *
 * @param {boolean} on - Whether the profile form should be editable.
 * @returns {void}
 */
function setProfileEditable(on) {
  s.profileEditing = !!on;
  [E.pfName, E.pfLastName, E.pfEmail, E.pfPhone, E.pfPhoto].forEach((el) => { if (el) el.disabled = !s.profileEditing; });
  if (E.pfSaveBtn) E.pfSaveBtn.style.display = s.profileEditing ? "inline-flex" : "none";
  if (E.pfCancelBtn) E.pfCancelBtn.style.display = s.profileEditing ? "inline-flex" : "none";
}
/** @returns {void} Renders the global profile management panel. */
function renderProfileMain() {
  if (!E.profileMain) return;
  if (!s.user || !s.profileOpen) {
    E.profileMain.style.display = "none";
    return;
  }
  E.profileMain.style.display = "block";
  E.pfName.value = s.user.name || "";
  E.pfLastName.value = s.user.lastName || "";
  E.pfEmail.value = s.user.email || "";
  E.pfPhone.value = s.user.phone || "";
  E.pfPhoto.value = s.user.photo || "";
  E.pfPhotoPreview.innerHTML = s.user.photo ? `<img src="${s.user.photo}" alt="Foto perfil" style="width:56px;height:56px;border-radius:999px;object-fit:cover;border:1px solid var(--line);">` : "Sin foto";
  E.pfNotifInternal.checked = !!s.user.notify?.internal;
  E.pfNotifEmail.checked = !!s.user.notify?.email;
  E.pfEvtNew.checked = !!s.user.notify?.events?.newIncident;
  E.pfEvtState.checked = !!s.user.notify?.events?.stateChange;
  E.pfEvtComment.checked = !!s.user.notify?.events?.comments;
  E.pfEvtDue.checked = !!s.user.notify?.events?.dueSoon;
  E.pfEvtReassign.checked = !!s.user.notify?.events?.reassign;
  E.pfEvtAlerts.checked = !!s.user.notify?.events?.systemAlerts;
  E.pfReadOnly.innerHTML = `<div class="kpi-item"><span>Rol</span><strong>${s.user.role}</strong></div><div class="kpi-item"><span>Area asignada</span><strong>${s.user.team || "-"}</strong></div><div class="kpi-item"><span>Fecha de creacion</span><strong>${fmt(s.user.createdAt)}</strong></div><div class="kpi-item"><span>Ultimo acceso</span><strong>${fmt(s.user.lastAccess)}</strong></div><div class="kpi-item"><span>Estado</span><strong>${s.user.status || "active"}</strong></div>`;
  setProfileEditable(false);
  E.pfCurrentPass.value = "";
  E.pfNewPass.value = "";
  E.pfConfirmPass.value = "";
}
/** @returns {Array<Object>} Incidents reported by the current reporter user. */
function ownReport() { return s.user?.role === "reportante" ? s.incidents.filter((i) => i.reportanteId === s.user.id) : []; }
/** @returns {Array<Object>} Reporter incidents after applying active reporter filters. */
function filtRep() {
  const t = s.repF.search.toLowerCase();
  return ownReport().filter((i) =>
    (!t || i.id.toLowerCase().includes(t) || i.titulo.toLowerCase().includes(t) || i.descripcion.toLowerCase().includes(t)) &&
    (s.repF.status === "all" || i.estado === s.repF.status) &&
    (s.repF.tipo === "all" || i.tipoIncidencia === s.repF.tipo) &&
    (s.repF.area === "all" || i.areaTecnica === s.repF.area) &&
    (!s.repF.date || dOnly(i.creadaEn) === s.repF.date)
  );
}
/**
 * Renders reporter summary statistics.
 *
 * @param {Array<Object>} list - Reporter incidents currently displayed.
 * @returns {void}
 */
function renderRepStats(list) {
  const all = ownReport();
  E.reportStats.innerHTML = `<article class="stat"><p>Mis incidencias</p><strong>${all.length}</strong></article><article class="stat"><p>Abiertas</p><strong>${all.filter((i)=>!["Cerrada","Cerrada por el usuario"].includes(i.estado)).length}</strong></article><article class="stat"><p>Pend. asignacion</p><strong>${all.filter((i)=>i.estado==="Pendiente de asignacion").length}</strong></article><article class="stat"><p>Mostrando</p><strong>${list.length}</strong></article>`;
}
/** @returns {void} Renders the reporter incident table. */
function renderRepTable() {
  if (s.user?.role !== "reportante") return;
  const list = filtRep().sort((a, b) => remDays(a.fechaLimite) - remDays(b.fechaLimite));
  renderRepStats(list);
  E.repIncidentBody.innerHTML = list.length ? list.map((i) => `<tr><td>${i.id}</td><td>${i.areaTecnica}</td><td>${i.tipoIncidencia}</td><td>${stateIconHtml(i)} <span class="badge state-${STATUS_CLASS[i.estado] || "nueva"}">${i.estado}</span></td><td><span class="badge ${PRIO_CLASS[i.prioridad] || "prio-media"}">${i.prioridad}</span></td><td>${i.asignadoA || "-"}</td><td>${fmt(i.fechaLimite)}</td><td>${remDays(i.fechaLimite)}${limitProgressHtml(i)}</td><td><button class="tiny" data-report-action="view-detail" data-id="${i.id}" type="button">Ver detalle</button></td></tr>`).join("") : `<tr><td colspan="9" class="empty">No tienes incidencias para este filtro.</td></tr>`;
}
/** @returns {void} Renders the reporter workspace layout. */
function renderRepView() {
  if (s.user?.role !== "reportante") return;
  const showMine = s.reportView === "mine" || s.reportView === "detail";
  const tabState = s.profileOpen ? "profile" : (showMine ? "mine" : s.reportView);
  [[E.tabMineBtn, "mine"], [E.tabCreateBtn, "create"], [E.tabProfileBtn, "profile"]].forEach(([btn, key]) => {
    if (!btn) return;
    const active = tabState === key;
    btn.classList.toggle("primary", active);
    btn.classList.toggle("ghost", !active);
  });
  E.incidentForm.style.display = s.reportView === "create" ? "block" : "none";
  E.reportProfile.style.display = s.reportView === "profile" ? "block" : "none";
  document.querySelector(".report-filters").style.display = showMine ? "grid" : "none";
  E.repIncidentBody.parentElement.parentElement.style.display = showMine ? "table" : "none";
  if (E.reportStats) E.reportStats.style.display = "grid";
}
/** @returns {void} Renders the reporter profile summary card. */
function renderProfile() {
  if (s.user?.role !== "reportante" || s.reportView !== "profile") return;
  E.profileData.innerHTML = `<div class="kpi-item"><span>Nombre</span><strong>${s.user.name}</strong></div><div class="kpi-item"><span>Email</span><strong>${s.user.email || "no-definido@demo.com"}</strong></div><div class="kpi-item"><span>Telefono</span><strong>${s.user.phone || "600000000"}</strong></div>`;
}
/** @returns {void} Renders the reporter incident detail panel. */
function renderDetail() {
  if (s.user?.role !== "reportante" || s.reportView !== "detail") { E.reportDetail.style.display = "none"; E.reportDetail.innerHTML = ""; return; }
  const i = s.incidents.find((v) => v.id === s.reportDetailId && v.reportanteId === s.user.id);
  if (!i) { E.reportDetail.style.display = "none"; return; }
  E.reportDetail.style.display = "block";
  showDetailAtTop(E.reportanteMain, E.reportDetail);
  const hist = (i.timeline || []).map((e) => `<li>${fmt(e.at)} | ${e.event} | ${e.by}${e.detail ? ` | ${e.detail}` : ""}</li>`).join("");
  const com = (i.comentarios || []).map((c) => `<li>${fmt(c.at)} | ${c.user}: ${c.text}</li>`).join("");
  const adj = (i.adjuntos || []).map((a) => `<li>${a}</li>`).join("");
  E.reportDetail.innerHTML = `<h3>Detalle ${i.id}</h3><div class="detail-grid"><p><strong>Area:</strong> ${i.areaTecnica}</p><p><strong>Tipo:</strong> ${i.tipoIncidencia}</p><p><strong>Estado:</strong> ${i.estado}</p><p><strong>Prioridad:</strong> ${i.prioridad}</p><p><strong>Asignado:</strong> ${i.asignadoA || "-"}</p><p><strong>Fecha limite:</strong> ${fmt(i.fechaLimite)}</p><p><strong>Dias restantes:</strong> ${remDays(i.fechaLimite)}</p><p><strong>Creada:</strong> ${fmt(i.creadaEn)}</p></div><p><strong>Descripcion:</strong> ${i.descripcion}</p><h4>Comentarios</h4><ul>${com || "<li>Sin comentarios</li>"}</ul><div class="row"><div class="field"><label>Nuevo comentario</label><textarea id="detailCommentInput" rows="3"></textarea></div><div class="field"><label>Adjunto</label><input id="detailAttachInput" placeholder="archivo.pdf"></div></div><div class="actions"><button class="btn ghost" id="sendDetailCommentBtn" type="button">Enviar comentario</button><button class="btn ghost" id="sendDetailAttachBtn" type="button">Anadir archivo</button>${i.estado === "Resuelta" ? '<button class="btn primary" id="confirmCloseBtn" type="button">Confirmar cierre</button>' : ""}<button class="btn ghost" id="backToMineBtn" type="button">Volver</button></div><h4>Historial</h4><ul>${hist || "<li>Sin historial</li>"}</ul><h4>Adjuntos</h4><ul>${adj || "<li>Sin adjuntos</li>"}</ul>`;
  q("sendDetailCommentBtn").onclick = () => { const t = x(q("detailCommentInput").value); if (!t) return; i.comentarios.push({ user: s.user.id, at: new Date().toISOString(), text: t }); log(i, "comentario_reportante", t); save(); renderDetail(); renderRepTable(); };
  q("sendDetailAttachBtn").onclick = () => { const a = x(q("detailAttachInput").value); if (!a) return; i.adjuntos.push(a); log(i, "adjunto_reportante", a); save(); renderDetail(); };
  const c = q("confirmCloseBtn"); if (c) c.onclick = () => {
    if (!setIncidentState(i, "Cerrada por el usuario", "cierre_confirmado_usuario", "Cierre confirmado")) return;
    save();
    s.reportView = "mine";
    s.reportDetailId = null;
    refresh();
  };
  q("backToMineBtn").onclick = () => { s.reportView = "mine"; s.reportDetailId = null; refresh(); };
}
/** @returns {Array<Object>} Notification items for the current user. */
function buildNotifs() {
  if (!s.user) return [];
  const out = [];
  if (s.user.role === "reportante") {
    ownReport().forEach((i) => {
      if (i.asignadoA) out.push({ id: `${i.id}-asg`, incidentId: i.id, text: `${i.id} asignada a ${i.asignadoA}` });
      if (i.estado === "Pendiente de informacion") out.push({ id: `${i.id}-info`, incidentId: i.id, text: `${i.id} requiere mas informacion` });
      if (i.estado === "Resuelta") out.push({ id: `${i.id}-res`, incidentId: i.id, text: `${i.id} marcada como resuelta` });
      const d = remDays(i.fechaLimite);
      if (d !== null && d <= 1 && !["Cerrada", "Cerrada por el usuario"].includes(i.estado)) out.push({ id: `${i.id}-due`, incidentId: i.id, text: `${i.id} proxima a vencer (${d} dias)` });
    });
  }
  if (s.user.role === "tecnico") {
    const mine = s.incidents.filter((i) => i.asignadoA === s.user.id);
    mine.forEach((i) => {
      const sla = slaSnapshot(i);
      out.push({ id: `${i.id}-mine`, incidentId: i.id, text: `${i.id} asignada para ti` });
      if ((i.comentarios || []).some((c) => c.user === i.reportanteId)) out.push({ id: `${i.id}-resp`, incidentId: i.id, text: `${i.id} tiene respuesta del reportante` });
      if ((i.timeline || []).some((e) => e.event === "cambio_prioridad")) out.push({ id: `${i.id}-prio`, incidentId: i.id, text: `${i.id} tuvo cambio de prioridad` });
      if ((i.timeline || []).some((e) => e.event === "estado_tecnico" || e.event === "estado_tecnico_kanban")) out.push({ id: `${i.id}-st`, incidentId: i.id, text: `${i.id} cambio de estado reciente` });
      const d = remDays(i.fechaLimite);
      if (d !== null && d <= 1 && i.estado !== "Resuelta") out.push({ id: `${i.id}-due`, incidentId: i.id, text: `${i.id} proxima a vencer (${d} dias)` });
      if (sla.resolveSoon) out.push({ id: `${i.id}-sla-soon`, incidentId: i.id, text: `${i.id} SLA de resolucion proximo a vencer` });
      if (sla.resolveBreached) out.push({ id: `${i.id}-sla-breach`, incidentId: i.id, text: `${i.id} SLA de resolucion incumplido` });
    });
    unreadTeamAnnouncements(s.user.team).slice(0, 6).forEach((m, idx) => {
      out.push({ id: `aviso-${idx}-${m.at}`, incidentId: "", text: `Aviso supervisor: ${m.text}`, kind: "aviso" });
    });
  }
  if (s.user.role === "supervisor") {
    const area = supAreaIncidents();
    area.forEach((i) => {
      const sla = slaSnapshot(i);
      if (!i.asignadoA) out.push({ id: `${i.id}-new`, incidentId: i.id, text: `${i.id} nueva sin asignar` });
      if ((i.prioridad === "Alta" || i.prioridad === "Critica") && !["En analisis", "En progreso", "Resuelta", "Cerrada", "Cerrada por el usuario"].includes(i.estado)) out.push({ id: `${i.id}-urg`, incidentId: i.id, text: `${i.id} urgente sin atender` });
      if ((i.timeline || []).some((e) => e.event === "solicitud_reasignacion")) out.push({ id: `${i.id}-reasg`, incidentId: i.id, text: `${i.id} con solicitud de reasignacion` });
      if (remDays(i.fechaLimite) <= 1 && !["Cerrada", "Cerrada por el usuario"].includes(i.estado)) out.push({ id: `${i.id}-due`, incidentId: i.id, text: `${i.id} proxima a vencer` });
      if (i.estado === "Resuelta") out.push({ id: `${i.id}-res`, incidentId: i.id, text: `${i.id} marcada como resuelta` });
      if (i.estado === "Cerrada por el usuario") out.push({ id: `${i.id}-ok`, incidentId: i.id, text: `${i.id} cierre confirmado por reportante` });
      if (sla.responseSoon) out.push({ id: `${i.id}-sla-r-soon`, incidentId: i.id, text: `${i.id} SLA de respuesta proximo a vencer` });
      if (sla.responseBreached) out.push({ id: `${i.id}-sla-r-breach`, incidentId: i.id, text: `${i.id} SLA de respuesta incumplido` });
      if (sla.resolveBreached) out.push({ id: `${i.id}-sla-x`, incidentId: i.id, text: `${i.id} SLA de resolucion incumplido` });
    });
    unreadTeamAnnouncements(s.user.team).slice(0, 6).forEach((m, idx) => {
      out.push({ id: `aviso-sup-${idx}-${m.at}`, incidentId: "", text: `Aviso del equipo: ${m.text}`, kind: "aviso" });
    });
  }
  if (s.user.role === "auditor") {
    s.incidents.forEach((i) => {
      const sla = slaSnapshot(i);
      if (i.estado === "Cerrada" && !(i.timeline || []).some((e) => e.event === "cierre_confirmado_usuario")) out.push({ id: `${i.id}-nocfm`, incidentId: i.id, text: `${i.id} cerrada sin confirmacion de usuario` });
      if ((i.timeline || []).filter((e) => /estado_/.test(e.event)).length >= 6) out.push({ id: `${i.id}-many`, incidentId: i.id, text: `${i.id} con demasiados cambios de estado` });
      if ((i.timeline || []).filter((e) => e.event === "solicitud_reasignacion").length >= 3) out.push({ id: `${i.id}-reax`, incidentId: i.id, text: `${i.id} con demasiadas solicitudes de reasignacion` });
      if ((i.timeline || []).filter((e) => e.event === "cambio_prioridad" && (e.by || "").startsWith("supervisor:")).length >= 4) out.push({ id: `${i.id}-priox`, incidentId: i.id, text: `${i.id} con cambios de prioridad anomalos` });
      if ((i.prioridad === "Alta" || i.prioridad === "Critica") && !i.asignadoA && remDays(i.fechaLimite) <= 1) out.push({ id: `${i.id}-urgna`, incidentId: i.id, text: `${i.id} urgente sin asignar` });
      if ((i.timeline || []).some((e) => (e.by || "").startsWith("admin:") && e.event !== "creada")) out.push({ id: `${i.id}-adm`, incidentId: i.id, text: `${i.id} modificada por administrador` });
      if (sla.responseBreached || sla.resolveBreached) out.push({ id: `${i.id}-sla-audit`, incidentId: i.id, text: `${i.id} con incumplimiento de SLA` });
    });
  }
  if (s.user.role === "admin") {
    const recentErrors = s.sysLogs.filter((l) => l.type === "error").slice(-4);
    recentErrors.forEach((l, idx) => out.push({ id: `syserr-${idx}`, incidentId: "", text: `Error tecnico: ${l.message}` }));
    s.incidents.filter((i) => !i.id || !i.estado || !i.prioridad).forEach((i) => out.push({ id: `${i.id}-corrupt`, incidentId: i.id, text: `${i.id || "INC-SIN-ID"} con estructura incompleta` }));
    s.sysLogs.filter((l) => l.type === "auth" && /denegado|invalido|fallo/i.test(l.message)).slice(-3).forEach((l, idx) => out.push({ id: `auth-${idx}`, incidentId: "", text: `Acceso fallido: ${l.message}` }));
    s.incidents.forEach((i) => {
      if ((i.timeline || []).some((e) => e.event === "solicitud_intervencion_tecnica" || (e.event === "solicitud_reasignacion" && (e.by || "").startsWith("supervisor:")))) out.push({ id: `${i.id}-intv`, incidentId: i.id, text: `${i.id} solicita intervencion tecnica` });
    });
    s.catalogReqs.filter((r) => r.status === "pending").forEach((r) => out.push({ id: `${r.id}-req`, incidentId: "", text: `Solicitud pendiente: ${r.kind} ${r.name}` }));
  }
  return out.slice(0, 12);
}
/** @returns {void} Renders the notification bell state and notification panel. */
function renderNotifs() {
  const list = buildNotifs();
  E.notifBell.style.display = ["reportante", "tecnico", "supervisor", "auditor", "admin"].includes(s.user?.role || "") ? "inline-flex" : "none";
  E.notifCount.textContent = `${list.length}`;
  E.notifPanel.style.display = s.notifOpen && list.length ? "block" : "none";
  E.notifPanel.innerHTML = list.map((n) => `<button class="notif-item ${n.kind === "aviso" ? "notif-aviso" : ""}" data-notif-id="${n.incidentId}" type="button">${avisoBadge(n.kind)}${n.text}</button>`).join("");
}

/** @returns {Array<Object>} Incidents assigned to the current technician. */
function techAssigned() {
  return s.user?.role === "tecnico" ? s.incidents.filter((i) => i.asignadoA === s.user.id) : [];
}

/** @returns {Array<Object>} Team incidents visible to the technician in read-only mode. */
function techTeamReadOnly() {
  return s.user?.role === "tecnico" ? s.incidents.filter((i) => i.equipo === s.user.team && i.asignadoA !== s.user.id && i.asignadoA) : [];
}

/**
 * Filters technician incidents according to the active technician view and filters.
 *
 * @param {string} [mode=s.techView] - Technician source mode.
 * @returns {Array<Object>} Filtered technician incidents.
 */
function filtTech(mode = s.techView) {
  const pool = mode === "assigned" ? techAssigned() : techTeamReadOnly();
  const t = s.techF.search.toLowerCase();
  return pool.filter((i) =>
    (!t || i.id.toLowerCase().includes(t) || i.titulo.toLowerCase().includes(t) || i.descripcion.toLowerCase().includes(t)) &&
    (s.techF.status === "all" || i.estado === s.techF.status) &&
    (s.techF.priority === "all" || i.prioridad === s.techF.priority) &&
    (s.techF.tipo === "all" || i.tipoIncidencia === s.techF.tipo) &&
    (s.techF.area === "all" || i.areaTecnica === s.techF.area) &&
    (s.techF.days === "all" || (s.techF.days === "overdue" && remDays(i.fechaLimite) < 0) || (s.techF.days === "soon" && remDays(i.fechaLimite) >= 0 && remDays(i.fechaLimite) <= 1) || (s.techF.days === "week" && remDays(i.fechaLimite) >= 2 && remDays(i.fechaLimite) <= 5) || (s.techF.days === "later" && remDays(i.fechaLimite) >= 6)) &&
    (!s.techF.date || dOnly(i.fechaLimite) === s.techF.date) &&
    (s.techQuick === "all" ||
      (s.techQuick === "open" && !["Resuelta", "Cerrada", "Cerrada por el usuario"].includes(i.estado)) ||
      (s.techQuick === "urgent" && (i.prioridad === "Alta" || i.prioridad === "Critica")) ||
      (s.techQuick === "due_today" && dOnly(i.fechaLimite) === dOnly(new Date().toISOString())) ||
      (s.techQuick === "overdue" && remDays(i.fechaLimite) < 0 && !["Resuelta", "Cerrada", "Cerrada por el usuario"].includes(i.estado)) ||
      (s.techQuick === "sla_breached" && (() => { const sla = slaSnapshot(i); return sla.responseBreached || sla.resolveBreached; })()))
  );
}

/**
 * Renders technician summary statistics.
 *
 * @param {Array<Object>} list - Technician incidents currently displayed.
 * @returns {void}
 */
function renderTechStats(list) {
  const mine = techAssigned();
  E.techStats.innerHTML = `<article class="stat"><p>Asignadas</p><strong>${mine.length}</strong></article><article class="stat"><p>Equipo lectura</p><strong>${techTeamReadOnly().length}</strong></article><article class="stat"><p>Mostrando</p><strong>${list.length}</strong></article><article class="stat"><p>Pend. info</p><strong>${mine.filter((i)=>i.estado==="Pendiente de informacion").length}</strong></article>`;
}

/** @returns {void} Renders technician day-level summary widgets. */
function renderTechDayWidget() {
  if (s.user?.role !== "tecnico") return;
  const mine = techAssigned();
  const today = dOnly(new Date().toISOString());
  const dueToday = mine.filter((i) => dOnly(i.fechaLimite) === today).length;
  const urg = mine.filter((i) => i.prioridad === "Alta" || i.prioridad === "Critica").length;
  E.techDayWidget.innerHTML = `<div class="kpi-item"><span>Vencen hoy</span><strong>${dueToday}</strong></div><div class="kpi-item"><span>Urgentes</span><strong>${urg}</strong></div>`;
}

/** @returns {void} Renders technician workload distribution widgets. */
function renderTechWorkload() {
  if (s.user?.role !== "tecnico") return;
  const mine = techAssigned();
  const rows = [
    { key: "En progreso", label: "En progreso", value: mine.filter((i) => i.estado === "En progreso").length },
    { key: "Resuelta", label: "Resueltas", value: mine.filter((i) => i.estado === "Resuelta").length }
  ];
  E.techWorkload.innerHTML = rows.map((r) => `<button class="kpi-item" data-workload="${r.key}" type="button"><span>${r.label}</span><strong>${r.value}</strong></button>`).join("");
}

/** @returns {void} Renders the technician dashboard view. */
function renderTechDashboard() {
  if (s.user?.role !== "tecnico") return;
  const mine = techAssigned();
  const open = mine.filter((i) => !["Resuelta", "Cerrada", "Cerrada por el usuario"].includes(i.estado)).length;
  const overdue = mine.filter((i) => remDays(i.fechaLimite) < 0 && !["Resuelta", "Cerrada", "Cerrada por el usuario"].includes(i.estado)).length;
  const dueToday = mine.filter((i) => dOnly(i.fechaLimite) === dOnly(new Date().toISOString())).length;
  const urgent = mine.filter((i) => i.prioridad === "Alta" || i.prioridad === "Critica").length;
  const slaBreached = mine.filter((i) => {
    const sla = slaSnapshot(i);
    return sla.responseBreached || sla.resolveBreached;
  }).length;

  if (E.techDashboardKpis) {
    E.techDashboardKpis.innerHTML = `<button class="kpi-item" data-tech-kpi="all" type="button"><span>Asignadas</span><strong>${mine.length}</strong></button><button class="kpi-item" data-tech-kpi="open" type="button"><span>Abiertas</span><strong>${open}</strong></button><button class="kpi-item" data-tech-kpi="urgent" type="button"><span>Urgentes</span><strong>${urgent}</strong></button><button class="kpi-item" data-tech-kpi="due_today" type="button"><span>Vencen hoy</span><strong>${dueToday}</strong></button><button class="kpi-item" data-tech-kpi="overdue" type="button"><span>Fuera de plazo</span><strong>${overdue}</strong></button><button class="kpi-item" data-tech-kpi="sla_breached" type="button"><span>SLA incumplido</span><strong>${slaBreached}</strong></button>`;
  }

  if (E.techDashboardViz) {
    const byStatusObj = {};
    const byPrioObj = {};
    mine.forEach((i) => {
      byStatusObj[i.estado] = (byStatusObj[i.estado] || 0) + 1;
      byPrioObj[i.prioridad] = (byPrioObj[i.prioridad] || 0) + 1;
    });
    const byStatus = Object.entries(byStatusObj).map(([label, value]) => ({ label, value }));
    const byPrio = Object.entries(byPrioObj).map(([label, value]) => ({ label, value }));
    const points = Array.from({ length: 6 }, (_, idx) => {
      const start = new Date();
      start.setDate(start.getDate() - ((5 - idx) * 7 + 6));
      const end = new Date(start); end.setDate(end.getDate() + 6);
      const inCount = mine.filter((i) => new Date(i.creadaEn) >= start && new Date(i.creadaEn) <= end).length;
      const outCount = mine.filter((i) => i.cerradaEn && new Date(i.cerradaEn) >= start && new Date(i.cerradaEn) <= end).length;
      const late = mine.filter((i) => remDays(i.fechaLimite) < 0 && !["Resuelta", "Cerrada", "Cerrada por el usuario"].includes(i.estado) && new Date(i.creadaEn) <= end).length;
      return { label: `${start.getDate()}/${start.getMonth() + 1}`, in: inCount, out: outCount, late };
    });
    E.techDashboardViz.innerHTML = `<article class="chart-card"><h4>Incidencias por estado</h4>${barChartHtml(byStatus, "value", "label")}</article><article class="chart-card"><h4>Incidencias por prioridad</h4>${donutChartHtml(byPrio, "value", "label")}</article><article class="chart-card chart-span-2"><h4>Evolucion semanal</h4>${lineChartHtml(points)}</article>`;
  }
}

/** @returns {void} Renders the technician assigned-incidents table. */
function renderTechTable() {
  if (s.user?.role !== "tecnico") return;
  const list = filtTech("assigned").sort((a, b) => remDays(a.fechaLimite) - remDays(b.fechaLimite));
  renderTechDashboard();
  renderTechStats(list);
  renderTechDayWidget();
  renderTechWorkload();
  E.techIncidentBody.innerHTML = list.length ? list.map((i) => `<tr><td>${i.id}</td><td>${i.areaTecnica}</td><td>${i.tipoIncidencia}</td><td>${i.descripcion.slice(0, 56)}${i.descripcion.length > 56 ? "..." : ""}</td><td><span class="badge state-${STATUS_CLASS[i.estado] || "nueva"}">${i.estado}</span></td><td><span class="badge ${PRIO_CLASS[i.prioridad] || "prio-media"}">${i.prioridad}</span></td><td>${fmt(i.fechaLimite)}</td><td>${remDays(i.fechaLimite)}${limitProgressHtml(i)}</td><td><button class="tiny" data-tech-action="view" data-id="${i.id}" type="button">Ver detalle</button>${i.asignadoA === s.user.id ? ` <button class="tiny" data-tech-action="change" data-id="${i.id}" type="button">Cambiar estado</button>` : ""}</td></tr>`).join("") : `<tr><td colspan="9" class="empty">No hay incidencias para este filtro.</td></tr>`;
}

/** @returns {void} Renders the technician team table. */
function renderTechTeamTable() {
  if (s.user?.role !== "tecnico") return;
  const list = filtTech("team").sort((a, b) => remDays(a.fechaLimite) - remDays(b.fechaLimite));
  E.techTeamBody.innerHTML = list.length ? list.map((i) => `<tr><td>${i.id}</td><td>${i.areaTecnica}</td><td>${i.tipoIncidencia}</td><td>${i.descripcion.slice(0, 56)}${i.descripcion.length > 56 ? "..." : ""}</td><td><span class="badge state-${STATUS_CLASS[i.estado] || "nueva"}">${i.estado}</span></td><td><span class="badge ${PRIO_CLASS[i.prioridad] || "prio-media"}">${i.prioridad}</span></td><td>${fmt(i.fechaLimite)}</td><td>${remDays(i.fechaLimite)}</td><td><button class="tiny" data-tech-team-action="view" data-id="${i.id}" type="button">Ver detalle</button></td></tr>`).join("") : `<tr><td colspan="9" class="empty">Sin incidencias del equipo.</td></tr>`;
}

/** @returns {void} Renders the technician Kanban board. */
function renderTechKanban() {
  if (s.user?.role !== "tecnico") return;
  const cols = ["Pendiente de asignacion", "En analisis", "En progreso", "Pendiente de informacion", "Resuelta"];
  const mine = techAssigned();
  E.techKanbanBoard.innerHTML = cols.map((c) => {
    const cards = mine.filter((i) => i.estado === c).map((i) => `<article class="kanban-card" draggable="true" data-kanban-id="${i.id}"><strong>${i.titulo}</strong><p>${i.prioridad} | ${fmt(i.fechaLimite)}</p><button class="tiny" data-tech-action="view" data-id="${i.id}" type="button">Detalle</button></article>`).join("");
    return `<section class="kanban-col" data-drop-status="${c}"><h4>${c}</h4>${cards || "<p class='hint'>Sin incidencias</p>"}</section>`;
  }).join("");
}

/** @returns {void} Renders the technician calendar interface. */
function renderTechCalendar() {
  if (s.user?.role !== "tecnico") return;
  const f = s.techCalendarFilter;
  let items = techAssigned();
  if (f === "urgent") items = items.filter((i) => i.prioridad === "Alta" || i.prioridad === "Critica");
  if (f === "in_progress") items = items.filter((i) => i.estado === "En progreso");
  if (f === "due_soon") items = items.filter((i) => remDays(i.fechaLimite) <= 1);

  const cursor = new Date(s.techCalendarCursor || Date.now());
  const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  if (E.techCalendarMonthLabel) E.techCalendarMonthLabel.textContent = monthStart.toLocaleDateString("es-ES", { month: "long", year: "numeric" });

  const offset = (monthStart.getDay() + 6) % 7;
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - offset);

  const today = dOnly(new Date().toISOString());
  const selected = s.techCalendarSelectedDay;

  if (E.techCalendarGrid) {
    const cells = [];
    for (let n = 0; n < 42; n += 1) {
      const day = new Date(gridStart);
      day.setDate(gridStart.getDate() + n);
      const dayIso = dOnly(day.toISOString());
      const dayItems = items.filter((i) => dOnly(i.fechaLimite) === dayIso).sort((a, b) => new Date(a.fechaLimite) - new Date(b.fechaLimite));
      const dots = dayItems.slice(0, 2).map((i) => `<span class="day-dot ${PRIO_CLASS[i.prioridad] || "prio-media"}">${i.id}</span>`).join("");
      const more = dayItems.length > 2 ? `<span class="more">+${dayItems.length - 2} mas</span>` : "";
      const cls = [
        "calendar-day",
        day.getMonth() !== monthStart.getMonth() ? "other-month" : "",
        dayIso === today ? "today" : "",
        dayIso === selected ? "selected" : ""
      ].filter(Boolean).join(" ");
      cells.push(`<button class="${cls}" data-cal-day="${dayIso}" type="button"><span class="day-num">${day.getDate()}</span>${dots}${more}</button>`);
    }
    E.techCalendarGrid.innerHTML = cells.join("");
  }

  const selectedInMonth = selected && new Date(selected).getMonth() === monthStart.getMonth() && new Date(selected).getFullYear() === monthStart.getFullYear();
  const safeSelected = selectedInMonth ? selected : dOnly(monthStart.toISOString());
  if (s.techCalendarSelectedDay !== safeSelected) s.techCalendarSelectedDay = safeSelected;
  const dayList = items.filter((i) => dOnly(i.fechaLimite) === safeSelected).sort((a, b) => new Date(a.fechaLimite) - new Date(b.fechaLimite));
  const listTitle = `<p><strong>Incidencias del ${new Date(safeSelected).toLocaleDateString("es-ES")}</strong></p>`;
  E.techCalendarList.innerHTML = listTitle + (dayList.length ? dayList.map((i) => `<button class="cal-item ${PRIO_CLASS[i.prioridad] || ""}" data-cal-id="${i.id}" type="button"><strong>${i.titulo}</strong><p>${fmt(i.fechaLimite)} | ${i.estado}</p></button>`).join("") : `<p class="hint">Sin incidencias para este dia.</p>`);
}

/** @returns {void} Renders the technician chat and alerts panel. */
function renderTechChat() {
  if (s.user?.role !== "tecnico") return;
  if (E.techChatTabTeamBtn && E.techChatTabAlertsBtn) {
    const isTeam = s.techChatTab === "team";
    E.techChatTabTeamBtn.classList.toggle("primary", isTeam);
    E.techChatTabTeamBtn.classList.toggle("ghost", !isTeam);
    E.techChatTabAlertsBtn.classList.toggle("primary", !isTeam);
    E.techChatTabAlertsBtn.classList.toggle("ghost", isTeam);
  }
  if (s.techChatTab === "team") {
    markTeamChatRead(s.user.team);
    const msgs = loadTeamChat(s.user.team);
    E.techChatList.innerHTML = msgs.length ? msgs.map((m) => {
      const own = m.user === s.user.id ? "own-msg" : "";
      const sup = m.kind === "aviso" || m.role === "supervisor" ? "sup-msg" : "";
      const label = m.kind === "aviso" ? " | Aviso" : "";
      return `<div class="chat-item ${own} ${sup}"><strong>${m.user}${label}</strong> <small>${fmt(m.at)}</small><div>${m.text}</div></div>`;
    }).join("") : `<p class="hint">Sin mensajes del equipo.</p>`;
    E.techChatComposer.style.display = "grid";
  } else {
    const alerts = buildNotifs();
    E.techChatList.innerHTML = alerts.length ? alerts.map((a) => `<div class="chat-item alert ${a.kind === "aviso" ? "alert-aviso" : ""}"><strong>${avisoBadge(a.kind)}${a.text}</strong><small>${a.incidentId}</small></div>`).join("") : `<p class="hint">Sin avisos tecnicos.</p>`;
    E.techChatComposer.style.display = "none";
  }
}

/** @returns {void} Renders the technician incident detail panel. */
function renderTechDetail() {
  if (s.user?.role !== "tecnico" || !s.techDetailId) {
    E.techDetail.style.display = "none";
    E.techDetail.innerHTML = "";
    return;
  }
  const i = s.incidents.find((v) => v.id === s.techDetailId && v.equipo === s.user.team && v.asignadoA);
  if (!i) {
    E.techDetail.style.display = "none";
    return;
  }
  const canEdit = i.asignadoA === s.user.id;
  E.techDetail.style.display = "block";
  showDetailAtTop(E.tecnicoMain, E.techDetail);
  const hist = (i.timeline || []).map((e) => `<li>${fmt(e.at)} | ${e.event} | ${e.by}${e.detail ? ` | ${e.detail}` : ""}</li>`).join("");
  const com = (i.comentarios || []).map((c) => `<li>${fmt(c.at)} | ${c.user}: ${c.text}</li>`).join("");
  const adj = (i.adjuntos || []).map((a) => `<li>${a}</li>`).join("");
  const notes = (i.techNotes || []).map((n) => `<li>${fmt(n.at)} | ${n.user}: ${n.text}</li>`).join("");
  E.techDetail.innerHTML = `<h3>Detalle tecnico ${i.id}</h3><div class="detail-grid"><p><strong>Area:</strong> ${i.areaTecnica}</p><p><strong>Tipo:</strong> ${i.tipoIncidencia}</p><p><strong>Estado:</strong> ${i.estado}</p><p><strong>Prioridad:</strong> ${i.prioridad}</p><p><strong>Fecha limite:</strong> ${fmt(i.fechaLimite)}</p><p><strong>Dias restantes:</strong> ${remDays(i.fechaLimite)}</p><p><strong>Tecnico:</strong> ${i.asignadoA || "-"}</p><p><strong>Creada:</strong> ${fmt(i.creadaEn)}</p></div><p><strong>Descripcion:</strong> ${i.descripcion}</p>${canEdit ? `<h4>Cambiar estado</h4><div class="actions"><button class="tiny" id="stAnalisisBtn" type="button">En analisis</button><button class="tiny" id="stProgresoBtn" type="button">En progreso</button><button class="tiny" id="stInfoBtn" type="button">Pendiente de informacion</button><button class="tiny" id="stResueltaBtn" type="button">Resuelta</button><button class="tiny danger" id="stReasignacionBtn" type="button">Solicitar reasignacion</button></div><div class="row"><div class="field"><label>Comentario</label><textarea id="techCommentInput" rows="3"></textarea></div><div class="field"><label>Adjunto</label><input id="techAttachInput" placeholder="log.txt o captura.png"></div></div><div class="row"><div class="field"><label>Nota interna (solo tecnico/supervisor)</label><textarea id="techNoteInput" rows="3"></textarea></div><div class="field"><label>&nbsp;</label><button class="btn ghost" id="techSendNoteBtn" type="button">Guardar nota</button></div></div><div class="actions"><button class="btn ghost" id="techSendCommentBtn" type="button">Enviar comentario</button><button class="btn ghost" id="techSendAttachBtn" type="button">Anadir archivo</button></div>` : `<p class="hint">Vista de equipo en solo lectura.</p>`}<div class="actions"><button class="btn ghost" id="techBackBtn" type="button">Volver</button></div><h4>Historial</h4><ul>${hist || "<li>Sin historial</li>"}</ul><h4>Comentarios</h4><ul>${com || "<li>Sin comentarios</li>"}</ul><h4>Adjuntos</h4><ul>${adj || "<li>Sin adjuntos</li>"}</ul><h4>Notas internas</h4><ul>${notes || "<li>Sin notas</li>"}</ul>`;

  if (canEdit) {
    const setSt = (st, ev) => {
      if (!setIncidentState(i, st, ev, st)) return;
      save();
      renderTechTable();
      renderTechDetail();
    };
    q("stAnalisisBtn").onclick = () => setSt("En analisis", "estado_tecnico");
    q("stProgresoBtn").onclick = () => setSt("En progreso", "estado_tecnico");
    q("stInfoBtn").onclick = () => setSt("Pendiente de informacion", "solicitud_info_usuario");
    q("stResueltaBtn").onclick = () => setSt("Resuelta", "estado_tecnico");
    q("stReasignacionBtn").onclick = () => { log(i, "solicitud_reasignacion", "Solicitada por tecnico"); save(); renderTechDetail(); };
    q("techSendCommentBtn").onclick = () => { const t = x(q("techCommentInput").value); if (!t) return; i.comentarios.push({ user: s.user.id, at: new Date().toISOString(), text: t }); log(i, "comentario_tecnico", t); save(); renderTechDetail(); };
    q("techSendAttachBtn").onclick = () => { const a = x(q("techAttachInput").value); if (!a) return; i.adjuntos.push(a); log(i, "adjunto_tecnico", a); save(); renderTechDetail(); };
    q("techSendNoteBtn").onclick = () => { const n = x(q("techNoteInput").value); if (!n) return; i.techNotes = i.techNotes || []; i.techNotes.push({ user: s.user.id, at: new Date().toISOString(), text: n }); log(i, "nota_interna", "Nota interna agregada"); save(); renderTechDetail(); };
  }
  q("techBackBtn").onclick = () => { s.techDetailId = null; renderTechDetail(); };
}

/** @returns {Array<Object>} Supervisor-visible incidents for the current area. */
function supAreaIncidents() {
  return s.user?.role === "supervisor" ? s.incidents.filter((i) => i.equipo === s.user.team) : [];
}

/** @returns {Array<Object>} Technicians that belong to the current supervisor area. */
function supTechs() {
  return s.user?.role === "supervisor" ? s.users.filter((u) => u.role === "tecnico" && u.team === s.user.team) : [];
}

/**
 * Counts incidents closed within a rolling time window.
 *
 * @param {Array<Object>} list - Incident collection to inspect.
 * @param {number} days - Rolling window length in days.
 * @returns {number} Number of incidents closed during the period.
 */
function supPerformance(list, days) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - days);
  return list.filter((i) => i.cerradaEn && new Date(i.cerradaEn) >= start).length;
}

/**
 * Suggests the most suitable technician for an incident.
 *
 * @param {Object} i - Incident to assign.
 * @returns {Object|null} Suggested technician user, or `null`.
 */
function supSuggestTech(i) {
  const techs = supTechs();
  if (!techs.length || !i) return null;
  const loads = techs.map((t) => {
    const mine = supAreaIncidents().filter((v) => v.asignadoA === t.id && !["Cerrada", "Cerrada por el usuario"].includes(v.estado));
    const urg = mine.filter((v) => v.prioridad === "Alta" || v.prioridad === "Critica").length;
    const avgClose = mine.filter((v) => v.cerradaEn).reduce((acc, v, _, arr) => acc + ((new Date(v.cerradaEn) - new Date(v.creadaEn)) / 86400000) / (arr.length || 1), 0);
    const score = mine.length * 5 + urg * 7 + avgClose;
    return { tech: t, score };
  });
  loads.sort((a, b) => a.score - b.score);
  return loads[0]?.tech || null;
}

/** @returns {Array<Object>} Supervisor incidents after active filters are applied. */
function filtSup() {
  const t = s.supF.search.toLowerCase();
  return supAreaIncidents().filter((i) =>
    (!t || i.id.toLowerCase().includes(t) || i.titulo.toLowerCase().includes(t) || i.descripcion.toLowerCase().includes(t)) &&
    (s.supF.status === "all" || i.estado === s.supF.status) &&
    (s.supF.priority === "all" || i.prioridad === s.supF.priority) &&
    (s.supF.assignee === "all" || (s.supF.assignee === "none" ? !i.asignadoA : i.asignadoA === s.supF.assignee)) &&
    (s.supF.tipo === "all" || i.tipoIncidencia === s.supF.tipo) &&
    (s.supF.area === "all" || i.areaTecnica === s.supF.area) &&
    (s.supF.days === "all" || (s.supF.days === "overdue" && remDays(i.fechaLimite) < 0) || (s.supF.days === "soon" && remDays(i.fechaLimite) >= 0 && remDays(i.fechaLimite) <= 1) || (s.supF.days === "week" && remDays(i.fechaLimite) >= 2 && remDays(i.fechaLimite) <= 5) || (s.supF.days === "later" && remDays(i.fechaLimite) >= 6)) &&
    (!s.supF.date || dOnly(i.fechaLimite) === s.supF.date)
  );
}

/** @returns {void} Renders supervisor summary statistics. */
function renderSupStats() {
  if (s.user?.role !== "supervisor" || !E.supStats) return;
  E.supStats.style.display = "grid";
  const area = supAreaIncidents();
  const visible = filtSup();
  const withoutAssign = area.filter((i) => !i.asignadoA).length;
  const dueSoon = visible.filter((i) => remDays(i.fechaLimite) <= 1 && !["Cerrada", "Cerrada por el usuario"].includes(i.estado)).length;
  const reassignReq = area.filter((i) => (i.timeline || []).some((e) => e.event === "solicitud_reasignacion")).length;
  E.supStats.innerHTML = `<article class="stat"><p>Mostrando</p><strong>${visible.length}</strong></article><article class="stat"><p>Sin asignar</p><strong>${withoutAssign}</strong></article><article class="stat"><p>Prox. vencer</p><strong>${dueSoon}</strong></article><article class="stat"><p>Req. reasignacion</p><strong>${reassignReq}</strong></article>`;
}

/** @returns {void} Renders the supervisor dashboard. */
function renderSupDashboard() {
  if (s.user?.role !== "supervisor") return;
  const area = supAreaIncidents();
  const kpi = [
    { key: "all", label: "Incidencias totales", value: area.length },
    { key: "none", label: "Sin asignar", value: area.filter((i) => !i.asignadoA).length },
    { key: "urgent", label: "Urgentes", value: area.filter((i) => i.prioridad === "Alta" || i.prioridad === "Critica").length },
    { key: "due", label: "Proximas a vencer", value: area.filter((i) => remDays(i.fechaLimite) <= 1).length }
  ];
  E.supDashboardKpis.innerHTML = kpi.map((r) => `<button class="kpi-item" data-sup-kpi="${r.key}" type="button"><span>${r.label}</span><strong>${r.value}</strong></button>`).join("");
  E.supPerfKpis.innerHTML = `<div class="kpi-item"><span>Resueltas hoy</span><strong>${supPerformance(area, 1)}</strong></div><div class="kpi-item"><span>Resueltas semana</span><strong>${supPerformance(area, 7)}</strong></div><div class="kpi-item"><span>Resueltas mes</span><strong>${supPerformance(area, 30)}</strong></div>`;
  if (E.supVizGrid) {
    const byTech = supTechs().map((t) => ({ label: t.name, value: area.filter((i) => i.asignadoA === t.id).length }));
    const byStatusObj = {};
    area.forEach((i) => { byStatusObj[i.estado] = (byStatusObj[i.estado] || 0) + 1; });
    const byStatus = Object.entries(byStatusObj).map(([label, value]) => ({ label, value }));
    const points = Array.from({ length: 6 }, (_, idx) => {
      const start = new Date();
      start.setDate(start.getDate() - ((5 - idx) * 7 + 6));
      const end = new Date(start); end.setDate(end.getDate() + 6);
      const inCount = area.filter((i) => new Date(i.creadaEn) >= start && new Date(i.creadaEn) <= end).length;
      const outCount = area.filter((i) => i.cerradaEn && new Date(i.cerradaEn) >= start && new Date(i.cerradaEn) <= end).length;
      const late = area.filter((i) => remDays(i.fechaLimite) < 0 && !["Cerrada", "Cerrada por el usuario"].includes(i.estado) && new Date(i.creadaEn) <= end).length;
      return { label: `${start.getDate()}/${start.getMonth() + 1}`, in: inCount, out: outCount, late };
    });
    E.supVizGrid.innerHTML = `<article class="chart-card"><h4>Incidencias por tecnico</h4>${barChartHtml(byTech, "value", "label")}</article><article class="chart-card"><h4>Incidencias por estado</h4>${donutChartHtml(byStatus, "value", "label")}</article><article class="chart-card chart-span-2"><h4>Evolucion semanal</h4>${lineChartHtml(points)}</article>`;
  }
}

/** @returns {void} Renders the supervisor filtered incident list. */
function renderSupList() {
  if (s.user?.role !== "supervisor") return;
  const list = filtSup().sort((a, b) => remDays(a.fechaLimite) - remDays(b.fechaLimite));
  E.supIncidentBody.innerHTML = list.length ? list.map((i) => `<tr><td>${i.id}</td><td>${i.areaTecnica}</td><td>${i.tipoIncidencia}</td><td><span class="badge state-${STATUS_CLASS[i.estado] || "nueva"}">${i.estado}</span></td><td><span class="badge ${PRIO_CLASS[i.prioridad] || "prio-media"}">${i.prioridad}</span></td><td>${i.asignadoA || "-"}</td><td>${fmt(i.fechaLimite)}</td><td>${remDays(i.fechaLimite)}</td><td><button class="tiny" data-sup-action="detail" data-id="${i.id}" type="button">Detalle</button></td></tr>`).join("") : `<tr><td colspan="9" class="empty">No hay incidencias para este filtro.</td></tr>`;
  const techOptions = [`<option value="all">Todos los tecnicos</option>`, `<option value="none">Sin asignar</option>`].concat(supTechs().map((t) => `<option value="${t.id}">${t.id} - ${t.name}</option>`));
  E.supAssigneeFilter.innerHTML = techOptions.join("");
  E.supAssigneeFilter.value = s.supF.assignee;
}

/** @returns {void} Renders the supervisor assignment workspace. */
function renderSupAssign() {
  if (s.user?.role !== "supervisor") return;
  const area = supAreaIncidents();
  const unassigned = area.filter((i) => !i.asignadoA);
  E.assignIncidentSelect.innerHTML = unassigned.map((i) => `<option value="${i.id}">${i.id} - ${i.titulo}</option>`).join("");
  E.assignTechSelect.innerHTML = supTechs().map((u) => `<option value="${u.id}">${u.id} - ${u.name}</option>`).join("");
  renderSupervisorRequestAreas();
  if (E.supReqArea && E.supReqKind) E.supReqArea.disabled = E.supReqKind.value !== "type";
  E.supUnassignedBody.innerHTML = unassigned.length ? unassigned.map((i) => {
    const sug = supSuggestTech(i);
    return `<tr><td>${i.id}</td><td>${i.titulo}</td><td><span class="badge ${PRIO_CLASS[i.prioridad] || "prio-media"}">${i.prioridad}</span></td><td>${remDays(i.fechaLimite)}</td><td>${sug ? sug.id : "-"}</td><td><button class="tiny" data-sup-assign-id="${i.id}" data-sup-assign-tech="${sug ? sug.id : ""}" type="button">Asignar sugerido</button></td></tr>`;
  }).join("") : `<tr><td colspan="6" class="empty">Sin incidencias pendientes de asignacion.</td></tr>`;
}

/** @returns {void} Renders supervisor team-load widgets. */
function renderSupLoad() {
  if (s.user?.role !== "supervisor") return;
  const area = supAreaIncidents();
  E.supLoadMap.innerHTML = supTechs().map((t) => {
    const mine = area.filter((i) => i.asignadoA === t.id);
    const urg = mine.filter((i) => i.prioridad === "Alta" || i.prioridad === "Critica").length;
    const due = mine.filter((i) => remDays(i.fechaLimite) <= 1).length;
    const progress = mine.filter((i) => i.estado === "En progreso").length;
    return `<button class="kpi-item" data-sup-tech-load="${t.id}" type="button"><span>${t.name} | Total ${mine.length} | Urg ${urg} | Vence ${due} | Progreso ${progress}</span><strong>${t.id}</strong></button>`;
  }).join("") || `<p class="hint">No hay tecnicos en este equipo.</p>`;
  if (E.supHeatmap) {
    const cells = supTechs().map((t) => {
      const load = area.filter((i) => i.asignadoA === t.id && !["Cerrada", "Cerrada por el usuario"].includes(i.estado)).length;
      const cls = load >= 8 ? "hot" : load >= 4 ? "warm" : "cool";
      return `<div class="heat-cell ${cls}"><span>${t.name}</span><strong>${load}</strong></div>`;
    }).join("");
    E.supHeatmap.innerHTML = `<h4>Heatmap de carga del equipo</h4><div class="heat-grid">${cells || "<p class='hint'>Sin tecnicos</p>"}</div>`;
  }
}

/** @returns {void} Renders the supervisor Kanban board. */
function renderSupKanban() {
  if (s.user?.role !== "supervisor") return;
  const cols = ["Pendiente de asignacion", "En analisis", "En progreso", "Pendiente de informacion", "Resuelta", "Cerrada"];
  const area = supAreaIncidents();
  E.supKanbanBoard.innerHTML = cols.map((c) => {
    const cards = area.filter((i) => i.estado === c || (c === "Cerrada" && i.estado === "Cerrada por el usuario")).map((i) => `<article class="kanban-card" draggable="true" data-sup-kanban-id="${i.id}"><strong>${i.titulo}</strong><p>${i.prioridad} | ${i.asignadoA || "sin asignar"}</p><div class="row-actions"><button class="tiny" data-sup-action="detail" data-id="${i.id}" type="button">Detalle</button><button class="tiny" data-sup-action="prio" data-id="${i.id}" type="button">Prioridad</button></div></article>`).join("");
    return `<section class="kanban-col" data-sup-drop-status="${c}"><h4>${c}</h4>${cards || "<p class='hint'>Sin incidencias</p>"}</section>`;
  }).join("");
}

/**
 * Moves an incident through the supervisor Kanban board workflow.
 *
 * @param {string} id - Incident identifier.
 * @param {string} to - Target state.
 * @returns {void}
 */
function moveSupKanban(id, to) {
  if (s.user?.role !== "supervisor") return;
  const allowed = ["Pendiente de asignacion", "En analisis", "En progreso", "Pendiente de informacion", "Resuelta", "Cerrada"];
  if (!allowed.includes(to)) return;
  const i = s.incidents.find((v) => v.id === id && v.equipo === s.user.team);
  if (!i) return;
  if (!setIncidentState(i, to === "Cerrada" ? "Cerrada" : to, "estado_supervisor_kanban", to)) return;
  save();
  refresh();
}

/** @returns {void} Renders the supervisor reporting view. */
function renderSupReports() {
  if (s.user?.role !== "supervisor") return;
  const area = supAreaIncidents();
  const byType = {};
  const byArea = {};
  const byTech = {};
  area.forEach((i) => {
    byType[i.tipoIncidencia] = (byType[i.tipoIncidencia] || 0) + 1;
    byArea[i.areaTecnica] = (byArea[i.areaTecnica] || 0) + 1;
    byTech[i.asignadoA || "sin_asignar"] = (byTech[i.asignadoA || "sin_asignar"] || 0) + 1;
  });
  const reopened = area.filter((i) => (i.timeline || []).some((e) => e.event === "reapertura")).length;
  const avg = area.filter((i) => i.cerradaEn).reduce((acc, i, _, arr) => acc + ((new Date(i.cerradaEn) - new Date(i.creadaEn)) / 86400000) / (arr.length || 1), 0).toFixed(1);
  E.supReportsKpi.innerHTML = `<div class="kpi-item"><span>Rendimiento por tecnico</span><strong>${Object.entries(byTech).map(([k,v]) => `${k}:${v}`).join(" | ") || "-"}</strong></div><div class="kpi-item"><span>Incidencias por tipo</span><strong>${Object.entries(byType).map(([k,v]) => `${k}:${v}`).join(" | ") || "-"}</strong></div><div class="kpi-item"><span>Incidencias por area tecnica</span><strong>${Object.entries(byArea).map(([k,v]) => `${k}:${v}`).join(" | ") || "-"}</strong></div><div class="kpi-item"><span>Urgentes (7 dias)</span><strong>${area.filter((i) => (i.prioridad === "Alta" || i.prioridad === "Critica") && new Date(i.creadaEn) >= new Date(Date.now() - 7 * 86400000)).length}</strong></div><div class="kpi-item"><span>Tiempo medio cierre (dias)</span><strong>${avg}</strong></div><div class="kpi-item"><span>Reabiertas</span><strong>${reopened}</strong></div>`;
}

/** @returns {void} Renders the supervisor team chat and announcements panel. */
function renderSupChat() {
  if (s.user?.role !== "supervisor") return;
  const isTeam = s.supChatTab === "team";
  E.supChatTabTeamBtn.classList.toggle("primary", isTeam);
  E.supChatTabTeamBtn.classList.toggle("ghost", !isTeam);
  E.supChatTabAlertsBtn.classList.toggle("primary", !isTeam);
  E.supChatTabAlertsBtn.classList.toggle("ghost", isTeam);
  if (isTeam) {
    markTeamChatRead(s.user.team);
    const msgs = loadTeamChat(s.user.team);
    E.supChatList.innerHTML = msgs.length ? msgs.map((m) => {
      const own = m.user === s.user.id ? "own-msg" : "";
      const sup = m.kind === "aviso" || m.role === "supervisor" ? "sup-msg" : "";
      const label = m.kind === "aviso" ? " | Aviso del Supervisor" : "";
      return `<div class="chat-item ${own} ${sup}"><strong>${m.user}${label}</strong> <small>${fmt(m.at)}</small><div>${m.text}</div></div>`;
    }).join("") : `<p class="hint">Sin mensajes del equipo.</p>`;
    E.supChatComposer.style.display = "grid";
  } else {
    const alerts = buildNotifs();
    E.supChatList.innerHTML = alerts.length ? alerts.map((a) => `<div class="chat-item alert ${a.kind === "aviso" ? "alert-aviso" : ""}"><strong>${avisoBadge(a.kind)}${a.text}</strong><small>${a.incidentId}</small></div>`).join("") : `<p class="hint">Sin avisos del area.</p>`;
    E.supChatComposer.style.display = "none";
  }
}

/** @returns {void} Renders the supervisor calendar interface. */
function renderSupCalendar() {
  if (s.user?.role !== "supervisor") return;
  const area = supAreaIncidents();
  const techs = supTechs();
  E.supCalendarTechFilter.innerHTML = [`<option value="all">Vista global del area</option>`].concat(techs.map((t) => `<option value="${t.id}">${t.id} - ${t.name}</option>`)).join("");
  E.supCalendarTechFilter.value = s.supCalendarTech;
  let items = area;
  if (s.supCalendarTech !== "all") items = items.filter((i) => i.asignadoA === s.supCalendarTech);
  if (s.supCalendarFilter === "urgent") items = items.filter((i) => i.prioridad === "Alta" || i.prioridad === "Critica");
  if (s.supCalendarFilter === "in_progress") items = items.filter((i) => i.estado === "En progreso");
  if (s.supCalendarFilter === "due_soon") items = items.filter((i) => remDays(i.fechaLimite) <= 1);

  const cursor = new Date(s.supCalendarCursor || Date.now());
  const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  E.supCalendarMonthLabel.textContent = monthStart.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  const offset = (monthStart.getDay() + 6) % 7;
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - offset);
  const today = dOnly(new Date().toISOString());
  const selected = s.supCalendarSelectedDay;
  const cells = [];
  for (let n = 0; n < 42; n += 1) {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + n);
    const dayIso = dOnly(day.toISOString());
    const dayItems = items.filter((i) => dOnly(i.fechaLimite) === dayIso).sort((a, b) => new Date(a.fechaLimite) - new Date(b.fechaLimite));
    const dots = dayItems.slice(0, 2).map((i) => `<span class="day-dot ${PRIO_CLASS[i.prioridad] || "prio-media"}">${i.id}</span>`).join("");
    const more = dayItems.length > 2 ? `<span class="more">+${dayItems.length - 2} mas</span>` : "";
    const cls = ["calendar-day", day.getMonth() !== monthStart.getMonth() ? "other-month" : "", dayIso === today ? "today" : "", dayIso === selected ? "selected" : ""].filter(Boolean).join(" ");
    cells.push(`<button class="${cls}" data-sup-cal-day="${dayIso}" type="button"><span class="day-num">${day.getDate()}</span>${dots}${more}</button>`);
  }
  E.supCalendarGrid.innerHTML = cells.join("");
  const sel = selected || dOnly(monthStart.toISOString());
  const dayList = items.filter((i) => dOnly(i.fechaLimite) === sel).sort((a, b) => new Date(a.fechaLimite) - new Date(b.fechaLimite));
  E.supCalendarList.innerHTML = `<p><strong>Incidencias del ${new Date(sel).toLocaleDateString("es-ES")}</strong></p>` + (dayList.length ? dayList.map((i) => `<button class="cal-item ${PRIO_CLASS[i.prioridad] || ""}" data-sup-cal-id="${i.id}" type="button"><strong>${i.titulo}</strong><p>${fmt(i.fechaLimite)} | ${i.estado} | ${i.asignadoA || "sin asignar"}</p></button>`).join("") : `<p class="hint">Sin incidencias para este dia.</p>`);
}

/** @returns {void} Renders the supervisor incident detail panel. */
function renderSupDetail() {
  if (s.user?.role !== "supervisor" || !s.supDetailId) {
    E.supDetail.style.display = "none";
    E.supDetail.innerHTML = "";
    return;
  }
  const i = s.incidents.find((v) => v.id === s.supDetailId && v.equipo === s.user.team);
  if (!i) return;
  E.supDetail.style.display = "block";
  showDetailAtTop(E.supervisorMain, E.supDetail);
  const hist = (i.timeline || []).map((e) => `<li>${fmt(e.at)} | ${e.event} | ${e.by}${e.detail ? ` | ${e.detail}` : ""}</li>`).join("");
  const com = (i.comentarios || []).map((c) => `<li>${fmt(c.at)} | ${c.user}: ${c.text}</li>`).join("");
  const notes = (i.techNotes || []).map((n) => `<li>${fmt(n.at)} | ${n.user}: ${n.text}</li>`).join("");
  E.supDetail.innerHTML = `<h3>Detalle supervisor ${i.id}</h3><div class="detail-grid"><p><strong>Area:</strong> ${i.areaTecnica}</p><p><strong>Tipo:</strong> ${i.tipoIncidencia}</p><p><strong>Estado:</strong> ${i.estado}</p><p><strong>Prioridad:</strong> ${i.prioridad}</p><p><strong>Asignado:</strong> ${i.asignadoA || "-"}</p><p><strong>Fecha limite:</strong> ${fmt(i.fechaLimite)}</p><p><strong>Dias:</strong> ${remDays(i.fechaLimite)}</p><p><strong>Creada:</strong> ${fmt(i.creadaEn)}</p></div><p><strong>Descripcion:</strong> ${i.descripcion}</p><div class="row"><div class="field"><label>Prioridad</label><select id="supDetailPriority"><option ${i.prioridad==="Baja"?"selected":""}>Baja</option><option ${i.prioridad==="Normal"?"selected":""}>Normal</option><option ${i.prioridad==="Alta"?"selected":""}>Alta</option><option ${i.prioridad==="Critica"?"selected":""}>Critica</option></select></div><div class="field"><label>Tecnico asignado</label><select id="supDetailAssignee"><option value="">Sin asignar</option>${supTechs().map((t) => `<option value="${t.id}" ${i.asignadoA===t.id?"selected":""}>${t.id} - ${t.name}</option>`).join("")}</select></div></div><div class="actions"><button class="btn ghost" id="supSaveAssignBtn" type="button">Guardar cambios</button><button class="btn ghost" id="supReopenBtn" type="button">Reabrir</button><button class="btn ghost" id="supCloseBtn" type="button">Cerrar por supervisor</button></div><div class="field"><label>Nota interna supervisor</label><textarea id="supInternalNote" rows="3" placeholder="Decision de gestion, instrucciones internas"></textarea></div><div class="actions"><button class="btn ghost" id="supSaveNoteBtn" type="button">Guardar nota</button><button class="btn ghost" id="supBackBtn" type="button">Volver</button></div><h4>Comentarios</h4><ul>${com || "<li>Sin comentarios</li>"}</ul><h4>Historial</h4><ul>${hist || "<li>Sin historial</li>"}</ul><h4>Notas internas tecnico/supervisor</h4><ul>${notes || "<li>Sin notas</li>"}</ul>`;

  q("supSaveAssignBtn").onclick = () => {
    const p = x(q("supDetailPriority").value);
    const a = x(q("supDetailAssignee").value);
    if (p && p !== i.prioridad) { i.prioridad = p; log(i, "cambio_prioridad", p); }
    if (a !== i.asignadoA) { i.asignadoA = a; log(i, "reasignacion_supervisor", a || "sin_asignar"); }
    save();
    refresh();
  };
  q("supReopenBtn").onclick = () => {
    if (!setIncidentState(i, "En analisis", "reapertura", "Reabierta por supervisor")) return;
    save();
    refresh();
  };
  q("supCloseBtn").onclick = () => {
    if (!setIncidentState(i, "Cerrada", "cierre_supervisor", "Cerrada por supervisor")) return;
    save();
    refresh();
  };
  q("supSaveNoteBtn").onclick = () => {
    const n = x(q("supInternalNote").value);
    if (!n) return;
    i.techNotes = i.techNotes || [];
    i.techNotes.push({ user: s.user.id, at: new Date().toISOString(), text: `[SUP] ${n}` });
    log(i, "nota_interna_supervisor", "Nota interna agregada");
    save();
    refresh();
  };
  q("supBackBtn").onclick = () => { s.supDetailId = null; renderSupDetail(); };
}

/** @returns {void} Renders supervisor layout visibility and active subview state. */
function renderSupLayout() {
  if (s.user?.role !== "supervisor") return;
  const activeTab = s.profileOpen ? "profile" : s.supLayout;
  const tabs = [
    [E.tabSupDashboardBtn, "dashboard"],
    [E.tabSupListBtn, "list"],
    [E.tabSupCalendarBtn, "calendar"],
    [E.tabSupAssignBtn, "assign"],
    [E.tabSupLoadBtn, "load"],
    [E.tabSupKanbanBtn, "kanban"],
    [E.tabSupReportsBtn, "reports"],
    [E.tabSupChatBtn, "chat"],
    [E.tabSupProfileBtn, "profile"]
  ];
  tabs.forEach(([btn, key]) => {
    if (!btn) return;
    const active = activeTab === key;
    btn.classList.toggle("primary", active);
    btn.classList.toggle("ghost", !active);
  });
  setBtnCount(E.tabSupChatBtn, "Chat", unreadTeamMessages(s.user.team).length);
  E.supDashboardView.style.display = s.supLayout === "dashboard" ? "block" : "none";
  E.supListView.style.display = s.supLayout === "list" ? "block" : "none";
  E.supCalendarView.style.display = s.supLayout === "calendar" ? "block" : "none";
  E.supAssignView.style.display = s.supLayout === "assign" ? "block" : "none";
  E.supLoadView.style.display = s.supLayout === "load" ? "block" : "none";
  E.supKanbanView.style.display = s.supLayout === "kanban" ? "block" : "none";
  E.supReportsView.style.display = s.supLayout === "reports" ? "block" : "none";
  E.supChatView.style.display = s.supLayout === "chat" ? "block" : "none";
}

/** @returns {void} Renders the complete supervisor workspace. */
function renderSupervisor() {
  if (s.user?.role !== "supervisor") return;
  renderSupLayout();
  renderSupStats();
  renderSupDashboard();
  renderSupList();
  renderSupAssign();
  renderSupLoad();
  renderSupKanban();
  renderSupReports();
  renderSupChat();
  renderSupCalendar();
  renderSupDetail();
}

/**
 * Resolves the supervisor responsible for an incident.
 *
 * @param {Object} i - Incident record.
 * @returns {Object|undefined} Supervisor user for the incident area.
 */
function audSupervisorFor(i) {
  return s.users.find((u) => u.role === "supervisor" && u.team === i.equipo)?.id || "-";
}

/** @returns {Array<Object>} Full incident set for the auditor role. */
function audAll() {
  return s.incidents.slice();
}

/** @returns {Array<Object>} Flattened global audit log derived from incident timelines. */
function audGlobalLog() {
  const out = [];
  s.incidents.forEach((i) => {
    (i.timeline || []).forEach((e) => {
      const [role = "-", user = "-"] = String(e.by || "-:-").split(":");
      out.push({ at: e.at, incidentId: i.id, role, user, action: e.event, value: e.detail || "-" });
    });
  });
  return out.sort((a, b) => new Date(b.at) - new Date(a.at));
}

/** @returns {Array<Object>} Auditor incident list after active filters are applied. */
function filtAudList() {
  const t = s.audF.search.toLowerCase();
  return audAll().filter((i) =>
    (!t || i.id.toLowerCase().includes(t) || i.titulo.toLowerCase().includes(t) || i.descripcion.toLowerCase().includes(t)) &&
    (s.audF.status === "all" || i.estado === s.audF.status) &&
    (s.audF.priority === "all" || i.prioridad === s.audF.priority) &&
    (s.audF.area === "all" || i.areaTecnica === s.audF.area) &&
    (s.audF.days === "all" || (s.audF.days === "overdue" && remDays(i.fechaLimite) < 0) || (s.audF.days === "soon" && remDays(i.fechaLimite) >= 0 && remDays(i.fechaLimite) <= 1) || (s.audF.days === "week" && remDays(i.fechaLimite) >= 2 && remDays(i.fechaLimite) <= 5) || (s.audF.days === "later" && remDays(i.fechaLimite) >= 6)) &&
    (!s.audF.date || dOnly(i.fechaLimite) === s.audF.date)
  );
}

/** @returns {Array<Object>} Auditor global log after active filters are applied. */
function filtAudLog() {
  const t = s.audLogF.search.toLowerCase();
  return audGlobalLog().filter((e) =>
    (!t || e.incidentId.toLowerCase().includes(t) || e.user.toLowerCase().includes(t) || String(e.value).toLowerCase().includes(t) || e.action.toLowerCase().includes(t)) &&
    (s.audLogF.role === "all" || e.role === s.audLogF.role) &&
    (s.audLogF.action === "all" || e.action === s.audLogF.action) &&
    (!s.audLogF.incident || e.incidentId.toLowerCase().includes(s.audLogF.incident.toLowerCase())) &&
    (!s.audLogF.date || dOnly(e.at) === s.audLogF.date)
  );
}

/** @returns {void} Renders auditor layout visibility and active subview state. */
function renderAudLayout() {
  if (s.user?.role !== "auditor") return;
  const activeTab = s.profileOpen ? "profile" : s.audLayout;
  const tabs = [
    [E.tabAudDashboardBtn, "dashboard"],
    [E.tabAudListBtn, "list"],
    [E.tabAudLogBtn, "log"],
    [E.tabAudReportsBtn, "reports"],
    [E.tabAudUsersBtn, "users"],
    [E.tabAudProfileBtn, "profile"]
  ];
  tabs.forEach(([btn, key]) => {
    if (!btn) return;
    const active = activeTab === key;
    btn.classList.toggle("primary", active);
    btn.classList.toggle("ghost", !active);
  });
  E.audDashboardView.style.display = s.audLayout === "dashboard" ? "block" : "none";
  E.audListView.style.display = s.audLayout === "list" ? "block" : "none";
  E.audLogView.style.display = s.audLayout === "log" ? "block" : "none";
  E.audReportsView.style.display = s.audLayout === "reports" ? "block" : "none";
  E.audUsersView.style.display = s.audLayout === "users" ? "block" : "none";
}

/** @returns {void} Renders the auditor dashboard. */
function renderAudDashboard() {
  if (s.user?.role !== "auditor") return;
  if (E.audStats) {
    E.audStats.style.display = "none";
    E.audStats.innerHTML = "";
  }
  const all = audAll();
  const reopened = all.filter((i) => (i.timeline || []).some((e) => e.event === "reapertura")).length;
  const overdue = all.filter((i) => remDays(i.fechaLimite) < 0 && !["Cerrada", "Cerrada por el usuario"].includes(i.estado)).length;
  const byState = {};
  const byPrio = {};
  const byArea = {};
  all.forEach((i) => {
    byState[i.estado] = (byState[i.estado] || 0) + 1;
    byPrio[i.prioridad] = (byPrio[i.prioridad] || 0) + 1;
    byArea[i.areaTecnica] = (byArea[i.areaTecnica] || 0) + 1;
  });
  const kpis = [
    { key: "total", label: "Total incidencias", value: all.length },
    { key: "reopened", label: "Reabiertas", value: reopened },
    { key: "overdue", label: "Fuera de plazo", value: overdue }
  ];
  E.audDashboardKpis.innerHTML = kpis.map((k) => `<button class="kpi-item" data-aud-kpi="${k.key}" type="button"><span>${k.label}</span><strong>${k.value}</strong></button>`).join("") + `<div class="kpi-item"><span>Por area tecnica</span><strong>${Object.entries(byArea).map(([k, v]) => `${k}:${v}`).join(" | ") || "-"}</strong></div>`;
  const recent = audGlobalLog().slice(0, 14);
  E.audActivityList.innerHTML = recent.length ? recent.map((e) => `<div class="list-row"><span>${fmt(e.at)}</span><span>${e.incidentId}</span><span>${e.role}:${e.user}</span><span>${e.action}</span></div>`).join("") : `<p class="hint">Sin actividad registrada.</p>`;
  if (E.audVizGrid) {
    const monthly = {};
    all.forEach((i) => {
      if (remDays(i.fechaLimite) < 0 && !["Cerrada", "Cerrada por el usuario"].includes(i.estado)) {
        const d = new Date(i.creadaEn);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        monthly[key] = (monthly[key] || 0) + 1;
      }
    });
    const monthlyRows = Object.entries(monthly).sort(([a], [b]) => a.localeCompare(b)).slice(-6).map(([label, value]) => ({ label, value }));
    const reByType = {};
    all.filter((i) => (i.timeline || []).some((e) => e.event === "reapertura")).forEach((i) => { reByType[i.tipoIncidencia] = (reByType[i.tipoIncidencia] || 0) + 1; });
    const reRows = Object.entries(reByType).map(([label, value]) => ({ label, value }));
    E.audVizGrid.innerHTML = `<article class="chart-card"><h4>Fuera de plazo por mes</h4>${barChartHtml(monthlyRows, "value", "label")}</article><article class="chart-card"><h4>Reabiertas por tipo</h4>${donutChartHtml(reRows, "value", "label")}</article>`;
  }
}

/** @returns {void} Renders the auditor incident table. */
function renderAudList() {
  if (s.user?.role !== "auditor") return;
  const list = filtAudList().sort((a, b) => new Date(b.creadaEn) - new Date(a.creadaEn));
  E.audIncidentBody.innerHTML = list.length ? list.map((i) => `<tr><td>${i.id}</td><td>${i.areaTecnica}</td><td>${i.tipoIncidencia}</td><td>${i.descripcion.slice(0, 56)}${i.descripcion.length > 56 ? "..." : ""}</td><td><span class="badge state-${STATUS_CLASS[i.estado] || "nueva"}">${i.estado}</span></td><td><span class="badge ${PRIO_CLASS[i.prioridad] || "prio-media"}">${i.prioridad}</span></td><td>${i.asignadoA || "-"}</td><td>${audSupervisorFor(i)}</td><td>${fmt(i.fechaLimite)}</td><td>${remDays(i.fechaLimite)}</td><td>${fmt(i.creadaEn)}</td><td>${fmt(i.cerradaEn)}</td><td><button class="tiny" data-aud-action="detail" data-id="${i.id}" type="button">Ver detalle</button></td></tr>`).join("") : `<tr><td colspan="13" class="empty">No hay incidencias para este filtro.</td></tr>`;
}

/** @returns {void} Renders the auditor incident detail panel. */
function renderAudDetail() {
  if (s.user?.role !== "auditor" || !s.audDetailId) {
    E.audDetail.style.display = "none";
    E.audDetail.innerHTML = "";
    return;
  }
  const i = s.incidents.find((v) => v.id === s.audDetailId);
  if (!i) return;
  E.audDetail.style.display = "block";
  showDetailAtTop(E.auditorMain, E.audDetail);
  const hist = (i.timeline || []).map((e) => `<li>${fmt(e.at)} | ${e.event} | ${e.by}${e.detail ? ` | ${e.detail}` : ""}</li>`).join("");
  const com = (i.comentarios || []).map((c) => `<li>${fmt(c.at)} | ${c.user}: ${c.text}</li>`).join("");
  const adj = (i.adjuntos || []).map((a) => `<li>${a}</li>`).join("");
  const byState = {};
  (i.timeline || []).filter((e) => /estado_/.test(e.event)).forEach((e) => { byState[e.detail || e.event] = (byState[e.detail || e.event] || 0) + 1; });
  E.audDetail.innerHTML = `<h3>Detalle auditor ${i.id}</h3><div class="detail-grid"><p><strong>Area:</strong> ${i.areaTecnica}</p><p><strong>Tipo:</strong> ${i.tipoIncidencia}</p><p><strong>Estado:</strong> ${i.estado}</p><p><strong>Prioridad:</strong> ${i.prioridad}</p><p><strong>Tecnico:</strong> ${i.asignadoA || "-"}</p><p><strong>Supervisor:</strong> ${audSupervisorFor(i)}</p><p><strong>Fecha limite:</strong> ${fmt(i.fechaLimite)}</p><p><strong>Dias:</strong> ${remDays(i.fechaLimite)}</p><p><strong>Creada:</strong> ${fmt(i.creadaEn)}</p><p><strong>Cerrada:</strong> ${fmt(i.cerradaEn)}</p></div><p><strong>Descripcion:</strong> ${i.descripcion}</p><p><strong>Tiempos por estado:</strong> ${Object.entries(byState).map(([k, v]) => `${k}(${v})`).join(" | ") || "-"}</p><div class="actions"><button class="btn ghost" id="audExportIncidentBtn" type="button">Exportar incidencia</button><button class="btn ghost" id="audOpenLogBtn" type="button">Ver historial completo</button><button class="btn ghost" id="audBackBtn" type="button">Volver</button></div><h4>Historial completo</h4><ul>${hist || "<li>Sin historial</li>"}</ul><h4>Comentarios</h4><ul>${com || "<li>Sin comentarios</li>"}</ul><h4>Adjuntos</h4><ul>${adj || "<li>Sin adjuntos</li>"}</ul>`;
  q("audExportIncidentBtn").onclick = () => downloadText(`incidencia-${i.id}.json`, "application/json", exportIncidents([i]));
  q("audOpenLogBtn").onclick = () => { s.audLayout = "log"; s.audLogF.incident = i.id; refresh(); };
  q("audBackBtn").onclick = () => { s.audDetailId = null; renderAudDetail(); };
}

/** @returns {void} Renders the auditor global log table. */
function renderAudLog() {
  if (s.user?.role !== "auditor") return;
  const list = filtAudLog();
  E.audLogBody.innerHTML = list.length ? list.map((e) => `<tr><td>${fmt(e.at)}</td><td>${e.incidentId}</td><td>${e.user}</td><td>${e.role}</td><td>${e.action}</td><td>${x(e.value)}</td></tr>`).join("") : `<tr><td colspan="6" class="empty">Sin eventos para este filtro.</td></tr>`;
}

/** @returns {void} Renders the auditor reports view. */
function renderAudReports() {
  if (s.user?.role !== "auditor") return;
  const all = audAll();
  const overdue = all.filter((i) => remDays(i.fechaLimite) < 0 && !["Cerrada", "Cerrada por el usuario"].includes(i.estado)).length;
  const reopened = all.filter((i) => (i.timeline || []).some((e) => e.event === "reapertura")).length;
  const manyState = all.filter((i) => (i.timeline || []).filter((e) => /estado_/.test(e.event)).length >= 6).length;
  const urgentNoAction = all.filter((i) => (i.prioridad === "Alta" || i.prioridad === "Critica") && !i.asignadoA).length;
  const closedNoConfirm = all.filter((i) => i.estado === "Cerrada" && !(i.timeline || []).some((e) => e.event === "cierre_confirmado_usuario")).length;
  const adminTouched = all.filter((i) => (i.timeline || []).some((e) => (e.by || "").startsWith("admin:") && e.event !== "creada")).length;
  E.audReportsKpi.innerHTML = `<div class="kpi-item"><span>Incidencias fuera de plazo</span><strong>${overdue}</strong></div><div class="kpi-item"><span>Incidencias reabiertas</span><strong>${reopened}</strong></div><div class="kpi-item"><span>Incidencias con muchos cambios de estado</span><strong>${manyState}</strong></div><div class="kpi-item"><span>Urgentes sin atender</span><strong>${urgentNoAction}</strong></div><div class="kpi-item"><span>Cerradas sin confirmacion</span><strong>${closedNoConfirm}</strong></div><div class="kpi-item"><span>Modificadas por administradores</span><strong>${adminTouched}</strong></div>`;
  if (E.audReportsViz) {
    const byIncidentChanges = all.map((i) => ({ label: i.id, value: (i.timeline || []).filter((e) => /estado_/.test(e.event)).length })).sort((a, b) => b.value - a.value).slice(0, 8);
    const resolved = all.filter((i) => i.cerradaEn).sort((a, b) => new Date(a.cerradaEn) - new Date(b.cerradaEn)).slice(-10);
    const points = resolved.map((i) => ({ label: dOnly(i.cerradaEn).slice(5), in: 0, out: Math.max(0, Math.round((new Date(i.cerradaEn) - new Date(i.creadaEn)) / 86400000)), late: 0 }));
    E.audReportsViz.innerHTML = `<article class="chart-card"><h4>Cambios de estado por incidencia (top)</h4>${barChartHtml(byIncidentChanges, "value", "label")}</article><article class="chart-card"><h4>Tiempos medios de resolucion</h4>${lineChartHtml(points.map((p) => ({ ...p, in: p.out, late: 0 })))}</article>`;
  }
}

/** @returns {void} Renders the auditor user activity view. */
function renderAudUsers() {
  if (s.user?.role !== "auditor") return;
  let users = s.users.slice();
  const t = s.audUserF.search.toLowerCase();
  if (t) users = users.filter((u) => u.id.toLowerCase().includes(t) || u.name.toLowerCase().includes(t));
  if (s.audUserF.role !== "all") users = users.filter((u) => u.role === s.audUserF.role);
  const logs = audGlobalLog();
  E.audUserBody.innerHTML = users.length ? users.map((u) => {
    let userLogs = logs.filter((e) => e.user === u.id && (s.audUserF.date ? dOnly(e.at) === s.audUserF.date : true));
    const touched = new Set(userLogs.map((e) => e.incidentId)).size;
    const unusual = userLogs.filter((e) => e.action === "solicitud_reasignacion" || e.action === "cambio_prioridad").length;
    const closeTimes = s.incidents.filter((i) => i.asignadoA === u.id && i.cerradaEn).map((i) => (new Date(i.cerradaEn) - new Date(i.creadaEn)) / 86400000);
    const avg = closeTimes.length ? (closeTimes.reduce((a, b) => a + b, 0) / closeTimes.length).toFixed(1) : "-";
    return `<tr><td>${u.id} - ${u.name}</td><td>${u.role}</td><td>${userLogs.length}</td><td>${touched}</td><td>${avg}</td><td>${unusual}</td></tr>`;
  }).join("") : `<tr><td colspan="6" class="empty">Sin usuarios para este filtro.</td></tr>`;
}

/** @returns {void} Renders the complete auditor workspace. */
function renderAuditor() {
  if (s.user?.role !== "auditor") return;
  renderAudLayout();
  renderAudDashboard();
  renderAudList();
  renderAudDetail();
  renderAudLog();
  renderAudReports();
  renderAudUsers();
}

/** @returns {Array<Object>} Incident collection visible to the administrator. */
function admIncidents() {
  return s.incidents.slice();
}

/** @returns {Array<Object>} Filtered administrative user list. */
function admUsersFiltered() {
  const t = s.admUserF.search.toLowerCase();
  return s.users.filter((u) =>
    (!t || u.id.toLowerCase().includes(t) || u.name.toLowerCase().includes(t) || (u.email || "").toLowerCase().includes(t)) &&
    (s.admUserF.role === "all" || u.role === s.admUserF.role) &&
    (s.admUserF.status === "all" || (u.status || "active") === s.admUserF.status)
  );
}

/** @returns {Array<Object>} Filtered administrative incident list. */
function admIncFiltered() {
  const t = s.admIncF.search.toLowerCase();
  return admIncidents().filter((i) =>
    (!t || i.id.toLowerCase().includes(t) || i.titulo.toLowerCase().includes(t) || i.descripcion.toLowerCase().includes(t)) &&
    (s.admIncF.status === "all" || i.estado === s.admIncF.status) &&
    (s.admIncF.area === "all" || i.areaTecnica === s.admIncF.area)
  );
}

/** @returns {Array<Object>} Filtered system log entries for the admin logs view. */
function admLogsFiltered() {
  const t = s.admLogF.search.toLowerCase();
  return s.sysLogs.filter((l) =>
    (!t || l.message.toLowerCase().includes(t) || String(l.type).toLowerCase().includes(t)) &&
    (s.admLogF.type === "all" || l.type === s.admLogF.type) &&
    (!s.admLogF.user || String(l.user || "").toLowerCase().includes(s.admLogF.user.toLowerCase())) &&
    (!s.admLogF.date || dOnly(l.at) === s.admLogF.date)
  ).sort((a, b) => new Date(b.at) - new Date(a.at));
}

/** @returns {void} Renders admin layout visibility and active subview state. */
function renderAdmLayout() {
  if (s.user?.role !== "admin") return;
  const activeTab = s.profileOpen ? "profile" : s.admLayout;
  const tabs = [
    [E.tabAdmDashboardBtn, "dashboard"],
    [E.tabAdmUsersBtn, "users"],
    [E.tabAdmRolesBtn, "roles"],
    [E.tabAdmConfigBtn, "config"],
    [E.tabAdmIncidentsBtn, "incidents"],
    [E.tabAdmLogsBtn, "logs"],
    [E.tabAdmMonitorBtn, "monitor"],
    [E.tabAdmProfileBtn, "profile"]
  ];
  tabs.forEach(([btn, key]) => {
    if (!btn) return;
    const active = activeTab === key;
    btn.classList.toggle("primary", active);
    btn.classList.toggle("ghost", !active);
  });
  E.admDashboardView.style.display = s.admLayout === "dashboard" ? "block" : "none";
  E.admUsersView.style.display = s.admLayout === "users" ? "block" : "none";
  E.admRolesView.style.display = s.admLayout === "roles" ? "block" : "none";
  E.admConfigView.style.display = s.admLayout === "config" ? "block" : "none";
  E.admIncidentsView.style.display = s.admLayout === "incidents" ? "block" : "none";
  E.admLogsView.style.display = s.admLayout === "logs" ? "block" : "none";
  E.admMonitorView.style.display = s.admLayout === "monitor" ? "block" : "none";
}

/** @returns {void} Renders the administrator dashboard. */
function renderAdmDashboard() {
  if (s.user?.role !== "admin") return;
  if (E.admStats) {
    E.admStats.style.display = "none";
    E.admStats.innerHTML = "";
  }
  const byRole = {};
  const byState = {};
  const byArea = {};
  s.users.forEach((u) => { byRole[u.role] = (byRole[u.role] || 0) + 1; });
  s.incidents.forEach((i) => {
    byState[i.estado] = (byState[i.estado] || 0) + 1;
    byArea[i.areaTecnica] = (byArea[i.areaTecnica] || 0) + 1;
  });
  const kpi = [
    { key: "users", label: "Gestion de usuarios", value: s.users.length },
    { key: "roles", label: "Roles y permisos", value: Object.keys(s.policies || {}).length },
    { key: "config", label: "Configuracion sistema", value: (s.adminCfg.areas || []).length + (s.adminCfg.types || []).length },
    { key: "logs", label: "Logs tecnicos", value: s.sysLogs.length }
  ];
  E.admDashboardKpis.innerHTML = kpi.map((k) => `<button class="kpi-item" data-adm-kpi="${k.key}" type="button"><span>${k.label}</span><strong>${k.value}</strong></button>`).join("");
  const alerts = [];
  if (!s.users.some((u) => u.role === "admin" && (u.status || "active") === "active")) alerts.push("No hay administradores activos");
  if (!(s.adminCfg.areas || []).length) alerts.push("Catalogo de areas vacio");
  if (!(s.adminCfg.types || []).length) alerts.push("Catalogo de tipos vacio");
  if (s.incidents.some((i) => !i.id || !i.estado || !i.prioridad)) alerts.push("Se detectaron incidencias con estructura incompleta");
  const recentAdmin = s.sysLogs.filter((l) => l.type === "admin_action" || l.type === "config").slice(-6).reverse();
  const alertRows = alerts.map((a) => `<div class="list-row"><strong>ALERTA</strong><span>${a}</span><span>-</span><span>-</span></div>`).join("");
  const adminRows = recentAdmin.map((l) => `<div class="list-row"><strong>${fmt(l.at)}</strong><span>${l.message}</span><span>${l.type}</span><span>${l.user || "-"}</span></div>`).join("");
  E.admAlerts.innerHTML = (alertRows || `<p class="hint">Sin alertas criticas del sistema.</p>`) + (adminRows || `<p class="hint">Sin acciones administrativas recientes.</p>`);
  if (E.admVizGrid) {
    const roles = Object.entries(byRole).map(([label, value]) => ({ label, value }));
    const areas = Object.entries(byArea).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 8);
    E.admVizGrid.innerHTML = `<article class="chart-card"><h4>Usuarios por rol</h4>${donutChartHtml(roles, "value", "label")}</article><article class="chart-card"><h4>Areas mas utilizadas</h4>${barChartHtml(areas, "value", "label")}</article>`;
  }
}

/** @returns {void} Resets the administrator user form state. */
function resetAdmUserForm() {
  E.admFormId.value = "";
  E.admFormId.disabled = false;
  E.admFormName.value = "";
  E.admFormEmail.value = "";
  E.admFormRole.value = "reportante";
  E.admFormTeam.value = "N1";
  E.admFormStatus.value = "active";
  E.admUserMsg.textContent = "";
  s.admEditingUserId = "";
}

/** @returns {void} Renders the administrator user management view. */
function renderAdmUsers() {
  if (s.user?.role !== "admin") return;
  const list = admUsersFiltered().sort((a, b) => a.name.localeCompare(b.name));
  E.admUserBody.innerHTML = list.length ? list.map((u) => `<tr><td>${u.name} (${u.id})</td><td>${u.email || "-"}</td><td>${u.role}</td><td>${u.status || "active"}</td><td>${fmt(u.createdAt)}</td><td>${fmt(u.lastAccess)}</td><td><button class="tiny" data-adm-user="edit" data-id="${u.id}" type="button">Editar</button> <button class="tiny" data-adm-user="reset" data-id="${u.id}" type="button">Reset pass</button> <button class="tiny danger" data-adm-user="toggle" data-id="${u.id}" type="button">${(u.status || "active") === "active" ? "Desactivar" : "Activar"}</button></td></tr>`).join("") : `<tr><td colspan="7" class="empty">Sin usuarios para este filtro.</td></tr>`;
}

/** @returns {void} Renders the administrator role/policy editor. */
function renderAdmRoles() {
  if (s.user?.role !== "admin") return;
  const role = E.admRoleSelect.value || "reportante";
  const p = pol(role) || { visibility: "own", permissions: { create_incident: false, export_data: false }, incident_actions: [] };
  E.admRoleVisibility.value = p.visibility || "own";
  E.admPermCreate.checked = !!p.permissions?.create_incident;
  E.admPermExport.checked = !!p.permissions?.export_data;
  E.admRoleActions.value = (p.incident_actions || []).join(", ");
}

/** @returns {void} Renders the administrator configuration/catalog view. */
function renderAdmConfig() {
  if (s.user?.role !== "admin") return;
  const areaSearch = x(E.admAreaSearchInput?.value || "").toLowerCase();
  const areaStatus = E.admAreaStatusFilter?.value || "all";
  const areas = (s.adminCfg.areas || []).filter((a) =>
    (!areaSearch || a.name.toLowerCase().includes(areaSearch) || (a.description || "").toLowerCase().includes(areaSearch)) &&
    (areaStatus === "all" || a.status === areaStatus)
  );
  if (E.admAreaBody) E.admAreaBody.innerHTML = areas.length ? areas.map((a) => `<tr><td>${a.name}</td><td>${a.status === "active" ? "Activa" : "Inactiva"}</td><td>${fmt(a.createdAt)}</td><td>${fmt(a.updatedAt)}</td><td><button class="tiny" data-adm-area="edit" data-name="${a.name}" type="button">Editar</button> <button class="tiny danger" data-adm-area="toggle" data-name="${a.name}" type="button">${a.status === "active" ? "Desactivar" : "Activar"}</button></td></tr>`).join("") : `<tr><td colspan="5" class="empty">Sin areas para este filtro.</td></tr>`;

  const areaOpts = (s.adminCfg.areas || []).map((a) => `<option value="${a.name}">${a.name}${a.status === "inactive" ? " (inactiva)" : ""}</option>`).join("");
  if (E.admTypeAreaFilter) {
    const old = E.admTypeAreaFilter.value;
    E.admTypeAreaFilter.innerHTML = `<option value="all">Todas las areas</option>${areaOpts}`;
    if (old && (old === "all" || (s.adminCfg.areas || []).some((a) => a.name === old))) E.admTypeAreaFilter.value = old;
  }
  if (E.admTypeArea) {
    const old = E.admTypeArea.value;
    E.admTypeArea.innerHTML = `<option value="">Selecciona...</option>${areaOpts}`;
    if (old && (s.adminCfg.areas || []).some((a) => a.name === old)) E.admTypeArea.value = old;
  }

  const typeSearch = x(E.admTypeSearchInput?.value || "").toLowerCase();
  const typeArea = E.admTypeAreaFilter?.value || "all";
  const typeStatus = E.admTypeStatusFilter?.value || "all";
  const types = (s.adminCfg.types || []).filter((t) =>
    (!typeSearch || t.name.toLowerCase().includes(typeSearch) || (t.description || "").toLowerCase().includes(typeSearch)) &&
    (typeArea === "all" || t.area === typeArea) &&
    (typeStatus === "all" || t.status === typeStatus)
  );
  if (E.admTypeBody) E.admTypeBody.innerHTML = types.length ? types.map((t) => `<tr><td>${t.name}</td><td>${t.area}</td><td>${t.status === "active" ? "Activo" : "Inactivo"}</td><td>${fmt(t.createdAt)}</td><td><button class="tiny" data-adm-type="edit" data-key="${t.area}__${t.name}" type="button">Editar</button> <button class="tiny danger" data-adm-type="toggle" data-key="${t.area}__${t.name}" type="button">${t.status === "active" ? "Desactivar" : "Activar"}</button></td></tr>`).join("") : `<tr><td colspan="5" class="empty">Sin tipos para este filtro.</td></tr>`;

  if (E.admReqBody) E.admReqBody.innerHTML = s.catalogReqs.length ? s.catalogReqs.slice().reverse().map((r) => `<tr><td>${fmt(r.createdAt)}</td><td>${r.requestedBy}</td><td>${r.kind === "area" ? "Area" : "Tipo"}</td><td>${r.name}</td><td>${r.area || "-"}</td><td>${r.status}</td><td>${r.status === "pending" ? `<button class="tiny" data-adm-req="approve" data-id="${r.id}" type="button">Aprobar</button> <button class="tiny danger" data-adm-req="reject" data-id="${r.id}" type="button">Rechazar</button>` : "-"}</td></tr>`).join("") : `<tr><td colspan="7" class="empty">Sin solicitudes.</td></tr>`;

  if (E.admParamResp) E.admParamResp.value = `${s.adminCfg.params?.maxResponseDays || 2}`;
  if (E.admParamRes) E.admParamRes.value = `${s.adminCfg.params?.maxResolveDays || 7}`;
  if (E.admParamAutoClose) E.admParamAutoClose.value = `${s.adminCfg.params?.autoCloseDays || 3}`;
  if (E.admParamNotif) E.admParamNotif.value = s.adminCfg.params?.notificationPolicy || "realtime";
  if (E.admPriorityRulesInput) E.admPriorityRulesInput.value = JSON.stringify(s.adminCfg.priorityRules || [], null, 2);
  if (E.admTransitionsInput) E.admTransitionsInput.value = JSON.stringify(s.adminCfg.transitions || {}, null, 2);
}

/** @returns {void} Renders the administrator incident management view. */
function renderAdmIncidents() {
  if (s.user?.role !== "admin") return;
  const list = admIncFiltered().sort((a, b) => new Date(b.creadaEn) - new Date(a.creadaEn));
  E.admIncidentBody.innerHTML = list.length ? list.map((i) => `<tr><td>${i.id}</td><td>${i.areaTecnica}</td><td>${i.tipoIncidencia}</td><td><span class="badge state-${STATUS_CLASS[i.estado] || "nueva"}">${i.estado}</span></td><td><span class="badge ${PRIO_CLASS[i.prioridad] || "prio-media"}">${i.prioridad}</span></td><td>${i.asignadoA || "-"}</td><td>${fmt(i.fechaLimite)}</td><td><button class="tiny" data-adm-inc="detail" data-id="${i.id}" type="button">Ver</button> <button class="tiny" data-adm-inc="repair" data-id="${i.id}" type="button">Corregir</button></td></tr>`).join("") : `<tr><td colspan="8" class="empty">No hay incidencias para este filtro.</td></tr>`;
  if (!s.admIncidentDetailId) {
    E.admIncidentDetail.innerHTML = "";
    return;
  }
  const i = s.incidents.find((v) => v.id === s.admIncidentDetailId);
  if (!i) return;
  showDetailAtTop(E.adminMain, E.admIncidentDetail);
  const hist = (i.timeline || []).map((e) => `<li>${fmt(e.at)} | ${e.event} | ${e.by}${e.detail ? ` | ${e.detail}` : ""}</li>`).join("");
  E.admIncidentDetail.innerHTML = `<h3>Detalle tecnico ${i.id} (solo soporte)</h3><div class="detail-grid"><p><strong>Area:</strong> ${i.areaTecnica}</p><p><strong>Tipo:</strong> ${i.tipoIncidencia}</p><p><strong>Estado:</strong> ${i.estado}</p><p><strong>Prioridad:</strong> ${i.prioridad}</p><p><strong>Asignado:</strong> ${i.asignadoA || "-"}</p><p><strong>Fecha limite:</strong> ${fmt(i.fechaLimite)}</p></div><p><strong>Descripcion:</strong> ${i.descripcion}</p><h4>Historial</h4><ul>${hist || "<li>Sin historial</li>"}</ul>`;
}

/** @returns {void} Renders the administrator system log table. */
function renderAdmLogs() {
  if (s.user?.role !== "admin") return;
  const logs = admLogsFiltered();
  E.admLogBody.innerHTML = logs.length ? logs.map((l) => `<tr><td>${fmt(l.at)}</td><td>${l.type}</td><td>${l.user || "-"}</td><td>${l.message}</td></tr>`).join("") : `<tr><td colspan="4" class="empty">Sin logs para este filtro.</td></tr>`;
}

/** @returns {void} Renders the administrator monitoring view. */
function renderAdmMonitor() {
  if (s.user?.role !== "admin") return;
  const activeUsers = s.users.filter((u) => (u.status || "active") === "active").length;
  const cpu = Math.min(95, 22 + Math.floor((s.incidents.length * 2 + activeUsers) % 55));
  const mem = Math.min(95, 30 + Math.floor((s.sysLogs.length + s.incidents.length) % 50));
  const disk = Math.min(95, 45 + Math.floor((s.incidents.length + s.users.length) % 45));
  const db = s.incidents.length ? "operativa" : "sin datos";
  const latency = 80 + (s.sysLogs.length % 120);
  E.admMonitorKpis.innerHTML = `<div class="kpi-item"><span>Estado servidor</span><strong>${cpu < 85 ? "OK" : "ALTO USO"}</strong></div><div class="kpi-item"><span>Uso CPU</span><strong>${cpu}%</strong></div><div class="kpi-item"><span>Uso memoria</span><strong>${mem}%</strong></div><div class="kpi-item"><span>Espacio disco</span><strong>${disk}%</strong></div><div class="kpi-item"><span>Base de datos</span><strong>${db}</strong></div><div class="kpi-item"><span>Latencia</span><strong>${latency} ms</strong></div>`;
}

/** @returns {void} Renders the complete administrator workspace. */
function renderAdmin() {
  if (s.user?.role !== "admin") return;
  renderAdmLayout();
  renderAdmDashboard();
  renderAdmUsers();
  renderAdmRoles();
  renderAdmConfig();
  renderAdmIncidents();
  renderAdmLogs();
  renderAdmMonitor();
}

/** @returns {Array<Object>} Generic incident list after global filters are applied. */
function filtGen() {
  const t = s.gF.search.toLowerCase();
  return visible().filter((i) => (!t || i.id.toLowerCase().includes(t) || i.titulo.toLowerCase().includes(t) || (i.asignadoA || "").toLowerCase().includes(t)) && (s.gF.status === "all" || i.estado === s.gF.status) && (s.gF.severity === "all" || i.severidad === s.gF.severity));
}
/** @returns {void} Renders the generic fallback incident table. */
function renderGeneric() {
  if (!s.user || s.user.role === "reportante") return;
  const list = filtGen().sort((a, b) => new Date(b.creadaEn) - new Date(a.creadaEn));
  E.globalStats.style.display = ["supervisor", "auditor"].includes(s.user.role) ? "grid" : "none";
  if (E.globalStats.style.display === "grid") E.globalStats.innerHTML = `<article class="stat"><p>Visibles</p><strong>${list.length}</strong></article><article class="stat"><p>Abiertas</p><strong>${list.filter((i)=>!["Cerrada","Cerrada por el usuario"].includes(i.estado)).length}</strong></article><article class="stat"><p>Resueltas</p><strong>${list.filter((i)=>i.estado==="Resuelta").length}</strong></article>`;
  if (!list.length) { E.incidentBody.innerHTML = `<tr><td colspan="12" class="empty">No hay incidencias.</td></tr>`; return; }
  E.incidentBody.innerHTML = "";
  const aa = act(s.user.role);
  const frag = document.createDocumentFragment();
  list.forEach((i) => {
    const row = E.rowTemplate.content.firstElementChild.cloneNode(true);
    row.querySelector('[data-col="id"]').textContent = i.id;
    row.querySelector('[data-col="titulo"]').textContent = i.titulo;
    row.querySelector('[data-col="categoria"]').textContent = i.categoria;
    row.querySelector('[data-col="prioridad"]').innerHTML = `<span class="badge ${PRIO_CLASS[i.prioridad] || "prio-media"}">${i.prioridad}</span>`;
    row.querySelector('[data-col="origen"]').textContent = i.origen;
    row.querySelector('[data-col="equipo"]').textContent = i.equipo;
    row.querySelector('[data-col="asignado"]').textContent = i.asignadoA || "-";
    row.querySelector('[data-col="severidad"]').innerHTML = `<span class="badge sev-${i.severidad.toLowerCase()}">${i.severidad}</span>`;
    row.querySelector('[data-col="estado"]').innerHTML = `<span class="badge state-${STATUS_CLASS[i.estado] || "nueva"}">${i.estado}</span>`;
    row.querySelector('[data-col="creada"]').textContent = fmt(i.creadaEn);
    row.querySelector('[data-col="cerrada"]').textContent = fmt(i.cerradaEn);
    row.querySelector('[data-col="acciones"]').innerHTML = aa.map((a) => `<button class="tiny" data-action="${a}" data-id="${i.id}" type="button">${a}</button>`).join("");
    frag.appendChild(row);
  });
  E.incidentBody.appendChild(frag);
}
/** @returns {void} Renders all non-reporter role workspaces. */
function renderTechSupAudAdmin() {
  if (E.tecnicoKpi) E.tecnicoKpi.innerHTML = "";
  if (E.supervisorKpi) E.supervisorKpi.innerHTML = "";
  if (E.auditorKpi) E.auditorKpi.innerHTML = "";
  if (s.user?.role === "admin") {
    if (E.adminUsersList) E.adminUsersList.innerHTML = s.users.map((u) => `<div class="list-row"><strong>${u.id}</strong><span>${u.name}</span><span>${u.role}</span><span>${u.team}</span></div>`).join("");
    if (E.adminPolicyView && E.adminPolicyRole) E.adminPolicyView.textContent = JSON.stringify(pol(E.adminPolicyRole.value), null, 2);
  } else if (E.adminUsersList) E.adminUsersList.innerHTML = "";
}

/** @returns {void} Renders technician layout visibility and active subview state. */
function renderTechLayout() {
  if (s.user?.role !== "tecnico") return;
  const activeTab = s.profileOpen ? "profile" : s.techLayout;
  const tabs = [
    [E.tabTechDashboardBtn, "dashboard"],
    [E.tabTechAssignedScreenBtn, "assigned"],
    [E.tabTechTeamScreenBtn, "team"],
    [E.tabTechKanbanBtn, "kanban"],
    [E.tabTechCalendarBtn, "calendar"],
    [E.tabTechChatBtn, "chat"],
    [E.tabTechProfileBtn, "profile"]
  ];
  tabs.forEach(([btn, key]) => {
    if (!btn) return;
    const active = activeTab === key;
    btn.classList.toggle("primary", active);
    btn.classList.toggle("ghost", !active);
  });
  setBtnCount(E.tabTechChatBtn, "Chat", unreadTeamMessages(s.user.team).length);
  E.techDashboardView.style.display = s.techLayout === "dashboard" ? "block" : "none";
  E.techAssignedView.style.display = s.techLayout === "assigned" ? "block" : "none";
  E.techTeamView.style.display = s.techLayout === "team" ? "block" : "none";
  E.techChatView.style.display = s.techLayout === "chat" ? "block" : "none";
  E.techKanbanView.style.display = s.techLayout === "kanban" ? "block" : "none";
  E.techCalendarView.style.display = s.techLayout === "calendar" ? "block" : "none";
}

/**
 * Moves an incident through the technician Kanban board workflow.
 *
 * @param {string} id - Incident identifier.
 * @param {string} to - Target state.
 * @returns {void}
 */
function moveKanbanTech(id, to) {
  if (s.user?.role !== "tecnico") return;
  const allowed = ["En analisis", "En progreso", "Pendiente de informacion", "Resuelta"];
  if (!allowed.includes(to)) return;
  const i = s.incidents.find((v) => v.id === id && v.asignadoA === s.user.id);
  if (!i || i.estado === to) return;
  if (!setIncidentState(i, to, "estado_tecnico_kanban", to)) return;
  save();
  refresh();
}

/** @returns {void} Re-renders the full application shell and active views. */
function refresh() {
  applyTheme();
  renderTop();
  renderPanels();
  renderProfileMain();
  renderNotifs();
  if (s.user?.role === "reportante") {
    renderReportCatalogSelectors();
    renderRepView();
    renderRepTable();
    renderProfile();
    renderDetail();
  } else if (s.user?.role === "tecnico") {
    renderTechLayout();
    renderTechTable();
    renderTechTeamTable();
    renderTechKanban();
    renderTechCalendar();
    renderTechChat();
    renderTechDetail();
    renderTechSupAudAdmin();
  } else if (s.user?.role === "supervisor") {
    renderSupervisor();
    renderTechSupAudAdmin();
  } else if (s.user?.role === "auditor") {
    renderAuditor();
    renderTechSupAudAdmin();
  } else if (s.user?.role === "admin") {
    renderAdmin();
    renderTechSupAudAdmin();
  } else if (s.user) {
    renderGeneric();
    renderTechSupAudAdmin();
  }
}

async function loadJson(path) {
  const r = await fetch(path);
  if (!r.ok) throw new Error(path);
  return r.json();
}

/** @returns {void} Removes legacy localStorage keys from previous demo versions. */
function clearLegacyData() {
  try {
    localStorage.removeItem("smartlog_incidents_v1");
    localStorage.removeItem("smartlog_sys_logs_v1");
    localStorage.removeItem("smartlog_catalog_reqs_v1");
    const toDelete = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const k = localStorage.key(i) || "";
      if (k.startsWith("smartlog_team_chat_") || k.startsWith("smartlog_team_chat_read_")) toDelete.push(k);
    }
    toDelete.forEach((k) => localStorage.removeItem(k));
  } catch {}
}

/** @returns {Array<Object>} Builds a compact seeded demo incident dataset. */
function buildCompactDemoIncidents() {
  const now = new Date();
  const iso = (d) => d.toISOString();
  const plusDays = (n) => { const d = new Date(now); d.setDate(d.getDate() + n); return d; };
  const minusDays = (n) => { const d = new Date(now); d.setDate(d.getDate() - n); return d; };
  const mk = (base) => norm(base);
  const list = [
    mk({
      id: "INC-1001",
      titulo: "VPN de sede N1 inestable",
      descripcion: "Cortes intermitentes de VPN en sede principal.",
      areaTecnica: "N1",
      equipo: "N1",
      tipoIncidencia: "Aplicacion",
      categoria: "Aplicacion",
      prioridad: "Alta",
      estado: "En progreso",
      reportanteId: "rep-alba",
      asignadoA: "tec-luis",
      creadaEn: iso(minusDays(1)),
      fechaLimite: iso(plusDays(1)),
      comentarios: [{ user: "rep-alba", at: iso(minusDays(1)), text: "Afecta a todo el turno de manana." }],
      timeline: [
        { at: iso(minusDays(1)), event: "creada", detail: "Incidencia creada por reportante", by: "reportante:rep-alba" },
        { at: iso(minusDays(1)), event: "asignacion", detail: "Asignada a tec-luis", by: "supervisor:sup-clara" },
        { at: iso(minusDays(1)), event: "estado_tecnico", detail: "En progreso", by: "tecnico:tec-luis" }
      ]
    }),
    mk({
      id: "INC-1002",
      titulo: "Terminal OT sin sincronizacion",
      descripcion: "El terminal de planta no sincroniza datos desde ayer.",
      areaTecnica: "OT",
      equipo: "OT",
      tipoIncidencia: "Operacion",
      categoria: "Operacion",
      prioridad: "Normal",
      estado: "Pendiente de informacion",
      reportanteId: "rep-mario",
      asignadoA: "tec-irene",
      creadaEn: iso(minusDays(2)),
      fechaLimite: iso(plusDays(2)),
      timeline: [
        { at: iso(minusDays(2)), event: "creada", detail: "Incidencia creada por reportante", by: "reportante:rep-mario" },
        { at: iso(minusDays(2)), event: "asignacion", detail: "Asignada a tec-irene", by: "supervisor:sup-diego" },
        { at: iso(minusDays(1)), event: "solicitud_info_usuario", detail: "Pendiente de informacion", by: "tecnico:tec-irene" }
      ]
    }),
    mk({
      id: "INC-1003",
      titulo: "Alerta de seguridad en servidor N1",
      descripcion: "Se detecta intento de acceso no autorizado en servidor interno.",
      areaTecnica: "N1",
      equipo: "N1",
      tipoIncidencia: "Seguridad",
      categoria: "Seguridad",
      prioridad: "Critica",
      estado: "Pendiente de asignacion",
      reportanteId: "rep-alba",
      asignadoA: "",
      creadaEn: iso(minusDays(0)),
      fechaLimite: iso(plusDays(0)),
      timeline: [{ at: iso(minusDays(0)), event: "creada", detail: "Incidencia creada por reportante", by: "reportante:rep-alba" }]
    }),
    mk({
      id: "INC-1004",
      titulo: "Sensor OT recalibrado",
      descripcion: "Tras ajuste remoto, el sensor vuelve a reportar valores correctos.",
      areaTecnica: "OT",
      equipo: "OT",
      tipoIncidencia: "Operacion",
      categoria: "Operacion",
      prioridad: "Baja",
      estado: "Resuelta",
      reportanteId: "rep-mario",
      asignadoA: "tec-irene",
      creadaEn: iso(minusDays(3)),
      fechaLimite: iso(plusDays(3)),
      timeline: [
        { at: iso(minusDays(3)), event: "creada", detail: "Incidencia creada por reportante", by: "reportante:rep-mario" },
        { at: iso(minusDays(3)), event: "asignacion", detail: "Asignada a tec-irene", by: "supervisor:sup-diego" },
        { at: iso(minusDays(2)), event: "estado_tecnico", detail: "Resuelta", by: "tecnico:tec-irene" }
      ]
    }),
    mk({
      id: "INC-1005",
      titulo: "Impresora N1 sin atasco tras mantenimiento",
      descripcion: "Incidencia cerrada tras confirmar funcionamiento correcto.",
      areaTecnica: "N1",
      equipo: "N1",
      tipoIncidencia: "Hardware",
      categoria: "Hardware",
      prioridad: "Normal",
      estado: "Cerrada por el usuario",
      reportanteId: "rep-alba",
      asignadoA: "tec-luis",
      creadaEn: iso(minusDays(5)),
      fechaLimite: iso(minusDays(2)),
      cerradaEn: iso(minusDays(1)),
      timeline: [
        { at: iso(minusDays(5)), event: "creada", detail: "Incidencia creada por reportante", by: "reportante:rep-alba" },
        { at: iso(minusDays(5)), event: "asignacion", detail: "Asignada a tec-luis", by: "supervisor:sup-clara" },
        { at: iso(minusDays(3)), event: "estado_tecnico", detail: "Resuelta", by: "tecnico:tec-luis" },
        { at: iso(minusDays(1)), event: "cierre_confirmado_usuario", detail: "Cierre confirmado", by: "reportante:rep-alba" }
      ]
    }),
    mk({
      id: "INC-1006",
      titulo: "Lentitud en aplicacion de inventario",
      descripcion: "Tiempo de respuesta superior a 20 segundos en modulo principal.",
      areaTecnica: "N1",
      equipo: "N1",
      tipoIncidencia: "Aplicacion",
      categoria: "Aplicacion",
      prioridad: "Alta",
      estado: "En analisis",
      reportanteId: "rep-mario",
      asignadoA: "tec-luis",
      creadaEn: iso(minusDays(1)),
      fechaLimite: iso(plusDays(2)),
      timeline: [
        { at: iso(minusDays(1)), event: "creada", detail: "Incidencia creada por reportante", by: "reportante:rep-mario" },
        { at: iso(minusDays(1)), event: "asignacion", detail: "Asignada a tec-luis", by: "supervisor:sup-clara" },
        { at: iso(minusDays(1)), event: "estado_tecnico", detail: "En analisis", by: "tecnico:tec-luis" }
      ]
    }),
    mk({
      id: "INC-1007",
      titulo: "Latencia alta en enlace OT",
      descripcion: "Retrasos de comunicacion entre PLC y pasarela.",
      areaTecnica: "OT",
      equipo: "OT",
      tipoIncidencia: "Operacion",
      categoria: "Operacion",
      prioridad: "Alta",
      estado: "En progreso",
      reportanteId: "rep-mario",
      asignadoA: "tec-irene",
      creadaEn: iso(minusDays(4)),
      fechaLimite: iso(plusDays(1)),
      timeline: [
        { at: iso(minusDays(4)), event: "creada", detail: "Incidencia creada por reportante", by: "reportante:rep-mario" },
        { at: iso(minusDays(4)), event: "asignacion", detail: "Asignada a tec-irene", by: "supervisor:sup-diego" },
        { at: iso(minusDays(3)), event: "estado_tecnico", detail: "En progreso", by: "tecnico:tec-irene" }
      ]
    }),
    mk({
      id: "INC-1008",
      titulo: "Usuario N1 sin acceso al portal",
      descripcion: "Error de permisos en modulo de autenticacion.",
      areaTecnica: "N1",
      equipo: "N1",
      tipoIncidencia: "Seguridad",
      categoria: "Seguridad",
      prioridad: "Normal",
      estado: "Pendiente de informacion",
      reportanteId: "rep-alba",
      asignadoA: "tec-luis",
      creadaEn: iso(minusDays(2)),
      fechaLimite: iso(plusDays(2)),
      timeline: [
        { at: iso(minusDays(2)), event: "creada", detail: "Incidencia creada por reportante", by: "reportante:rep-alba" },
        { at: iso(minusDays(2)), event: "asignacion", detail: "Asignada a tec-luis", by: "supervisor:sup-clara" },
        { at: iso(minusDays(1)), event: "solicitud_info_usuario", detail: "Pendiente de informacion", by: "tecnico:tec-luis" }
      ]
    }),
    mk({
      id: "INC-1009",
      titulo: "Caida puntual de servicio N1",
      descripcion: "Servicio recuperado tras reinicio del componente.",
      areaTecnica: "N1",
      equipo: "N1",
      tipoIncidencia: "Aplicacion",
      categoria: "Aplicacion",
      prioridad: "Alta",
      estado: "Resuelta",
      reportanteId: "rep-mario",
      asignadoA: "tec-luis",
      creadaEn: iso(minusDays(6)),
      fechaLimite: iso(minusDays(1)),
      timeline: [
        { at: iso(minusDays(6)), event: "creada", detail: "Incidencia creada por reportante", by: "reportante:rep-mario" },
        { at: iso(minusDays(6)), event: "asignacion", detail: "Asignada a tec-luis", by: "supervisor:sup-clara" },
        { at: iso(minusDays(5)), event: "estado_tecnico", detail: "En analisis", by: "tecnico:tec-luis" },
        { at: iso(minusDays(4)), event: "estado_tecnico", detail: "Resuelta", by: "tecnico:tec-luis" }
      ]
    }),
    mk({
      id: "INC-1010",
      titulo: "Solicitud de nuevo tipo OT",
      descripcion: "Incidencia en seguimiento mientras se valida categoria tecnica.",
      areaTecnica: "OT",
      equipo: "OT",
      tipoIncidencia: "Hardware",
      categoria: "Hardware",
      prioridad: "Baja",
      estado: "En analisis",
      reportanteId: "rep-mario",
      asignadoA: "tec-irene",
      creadaEn: iso(minusDays(1)),
      fechaLimite: iso(plusDays(5)),
      timeline: [
        { at: iso(minusDays(1)), event: "creada", detail: "Incidencia creada por reportante", by: "reportante:rep-mario" },
        { at: iso(minusDays(1)), event: "asignacion", detail: "Asignada a tec-irene", by: "supervisor:sup-diego" },
        { at: iso(minusDays(1)), event: "estado_tecnico", detail: "En analisis", by: "tecnico:tec-irene" }
      ]
    }),
    mk({
      id: "INC-1011",
      titulo: "Alarma de disco en servidor N1",
      descripcion: "Uso de disco por encima del umbral configurado.",
      areaTecnica: "N1",
      equipo: "N1",
      tipoIncidencia: "Hardware",
      categoria: "Hardware",
      prioridad: "Critica",
      estado: "En progreso",
      reportanteId: "rep-alba",
      asignadoA: "tec-luis",
      creadaEn: iso(minusDays(0)),
      fechaLimite: iso(plusDays(0)),
      timeline: [
        { at: iso(minusDays(0)), event: "creada", detail: "Incidencia creada por reportante", by: "reportante:rep-alba" },
        { at: iso(minusDays(0)), event: "asignacion", detail: "Asignada a tec-luis", by: "supervisor:sup-clara" },
        { at: iso(minusDays(0)), event: "estado_tecnico", detail: "En progreso", by: "tecnico:tec-luis" }
      ]
    }),
    mk({
      id: "INC-1012",
      titulo: "Error intermitente en lectura de sensor",
      descripcion: "Se requiere verificacion en terreno por tecnico OT.",
      areaTecnica: "OT",
      equipo: "OT",
      tipoIncidencia: "Operacion",
      categoria: "Operacion",
      prioridad: "Normal",
      estado: "Pendiente de asignacion",
      reportanteId: "rep-mario",
      asignadoA: "",
      creadaEn: iso(minusDays(0)),
      fechaLimite: iso(plusDays(3)),
      timeline: [{ at: iso(minusDays(0)), event: "creada", detail: "Incidencia creada por reportante", by: "reportante:rep-mario" }]
    }),
    mk({
      id: "INC-1013",
      titulo: "Permiso de usuario restablecido",
      descripcion: "El acceso se restablece y se confirma cierre.",
      areaTecnica: "N1",
      equipo: "N1",
      tipoIncidencia: "Seguridad",
      categoria: "Seguridad",
      prioridad: "Baja",
      estado: "Cerrada por el usuario",
      reportanteId: "rep-alba",
      asignadoA: "tec-luis",
      creadaEn: iso(minusDays(8)),
      fechaLimite: iso(minusDays(5)),
      cerradaEn: iso(minusDays(2)),
      timeline: [
        { at: iso(minusDays(8)), event: "creada", detail: "Incidencia creada por reportante", by: "reportante:rep-alba" },
        { at: iso(minusDays(8)), event: "asignacion", detail: "Asignada a tec-luis", by: "supervisor:sup-clara" },
        { at: iso(minusDays(4)), event: "estado_tecnico", detail: "Resuelta", by: "tecnico:tec-luis" },
        { at: iso(minusDays(2)), event: "cierre_confirmado_usuario", detail: "Cierre confirmado", by: "reportante:rep-alba" }
      ]
    }),
    mk({
      id: "INC-1014",
      titulo: "Actualizacion de firmware OT completada",
      descripcion: "Proceso finalizado sin errores.",
      areaTecnica: "OT",
      equipo: "OT",
      tipoIncidencia: "Hardware",
      categoria: "Hardware",
      prioridad: "Normal",
      estado: "Resuelta",
      reportanteId: "rep-mario",
      asignadoA: "tec-irene",
      creadaEn: iso(minusDays(7)),
      fechaLimite: iso(minusDays(2)),
      timeline: [
        { at: iso(minusDays(7)), event: "creada", detail: "Incidencia creada por reportante", by: "reportante:rep-mario" },
        { at: iso(minusDays(7)), event: "asignacion", detail: "Asignada a tec-irene", by: "supervisor:sup-diego" },
        { at: iso(minusDays(6)), event: "estado_tecnico", detail: "En progreso", by: "tecnico:tec-irene" },
        { at: iso(minusDays(5)), event: "estado_tecnico", detail: "Resuelta", by: "tecnico:tec-irene" }
      ]
    })
  ].filter(Boolean);
  return list;
}

/**
 * Seeds compact demo users, incidents, and policies when storage is empty.
 *
 * @param {Object} policiesSource - Policy source used during seeding.
 * @returns {void}
 */
function seedCompactDemoData(policiesSource) {
  clearLegacyData();
  s.users = FALLBACK_USERS.map(normUser).filter(Boolean);
  s.policies = policiesSource || FALLBACK_POLICIES;
  s.incidents = buildCompactDemoIncidents();
  s.catalogReqs = [];
  s.sysLogs = [];
  lsSaveUsers(s.users);
  lsSavePolicies(s.policies);
  lsSave(s.incidents);
  lsSaveCatalogReqs([]);
  lsSaveSysLogs([]);
  const nowIso = new Date().toISOString();
  saveTeamChat("N1", [
    { user: "sup-clara", role: "supervisor", kind: "aviso", at: nowIso, text: "Priorizar incidencias criticas de N1 esta manana." },
    { user: "tec-luis", role: "tecnico", kind: "msg", at: nowIso, text: "Recibido. Inicio revision de INC-1003." }
  ]);
  saveTeamChat("OT", [
    { user: "sup-diego", role: "supervisor", kind: "aviso", at: nowIso, text: "Validar sensores OT antes de cierre de turno." },
    { user: "tec-irene", role: "tecnico", kind: "msg", at: nowIso, text: "He solicitado datos extra al reportante en INC-1002." }
  ]);
}

async function boot() {
  let cfgPolicies = null;
  try {
    const [u, p, z] = await Promise.all([loadJson("./config/users.json"), loadJson("./config/policies.json"), loadJson("./config/incidents.seed.json")]);
    cfgPolicies = p.roles || FALLBACK_POLICIES;
  } catch {
    cfgPolicies = FALLBACK_POLICIES;
  }
  s.adminCfg = normalizeAdminCfg(defaultAdminCfg());
  seedCompactDemoData(cfgPolicies);
  if (!s.sysLogs.length) pushSysLog("alert", "Inicio de monitorizacion del sistema", "system");
  E.loginUserSelect.innerHTML = s.users.map((u) => `<option value="${u.id}">${u.name} - ${u.role} (${u.team})</option>`).join("");
  applyTheme();
  refresh();
}

E.loginBtn.onclick = () => {
  const u = s.users.find((v) => v.id === E.loginUserSelect.value);
  if (!u) {
    const selected = x(E.loginUserSelect.value) || "(sin seleccionar)";
    pushSysLog("auth", "Intento de acceso con usuario invalido", "-");
    return alert(`Usuario invalido: no existe un usuario con ID "${selected}".`);
  }
  if ((u.status || "active") !== "active") { pushSysLog("auth", `Acceso denegado para usuario inactivo ${u.id}`, u.id); return alert("Usuario inactivo."); }
  s.user = u;
  s.user.lastAccess = new Date().toISOString();
  lsSaveUsers(s.users);
  s.reportView = "mine";
  s.reportDetailId = null;
  s.techView = "assigned";
  s.techLayout = "dashboard";
  s.techChatTab = "team";
  s.techDetailId = null;
  s.supLayout = "dashboard";
  s.supChatTab = "team";
  s.supDetailId = null;
  s.supCalendarTech = "all";
  s.supCalendarFilter = "all";
  s.supCalendarCursor = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  s.supCalendarSelectedDay = dOnly(new Date().toISOString());
  s.supF = { search: "", status: "all", priority: "all", assignee: "all", tipo: "all", area: "all", days: "all", date: "" };
  s.audLayout = "dashboard";
  s.audDetailId = null;
  s.audF = { search: "", status: "all", priority: "all", area: "all", days: "all", date: "" };
  s.audLogF = { search: "", role: "all", action: "all", incident: "", date: "" };
  s.audUserF = { search: "", role: "all", date: "" };
  s.admLayout = "dashboard";
  s.admIncidentDetailId = null;
  s.admEditingUserId = "";
  s.admUserF = { search: "", role: "all", status: "all" };
  s.admIncF = { search: "", status: "all", area: "all" };
  s.admLogF = { search: "", type: "all", user: "", date: "" };
  s.notifOpen = false;
  s.profileOpen = false;
  s.profileEditing = false;
  pushSysLog("auth", `Inicio de sesion`, s.user.id, { role: s.user.role });
  refresh();
};
E.logoutBtn.onclick = () => { if (s.user) pushSysLog("auth", "Cierre de sesion", s.user.id); s.user = null; s.notifOpen = false; s.profileOpen = false; s.profileEditing = false; s.techDetailId = null; s.techLayout = "dashboard"; s.supLayout = "dashboard"; s.supDetailId = null; s.audLayout = "dashboard"; s.audDetailId = null; s.admLayout = "dashboard"; s.admIncidentDetailId = null; refresh(); };
if (E.themeToggleBtn) E.themeToggleBtn.onclick = () => { s.theme = s.theme === "dark" ? "light" : "dark"; lsSaveTheme(s.theme); applyTheme(); };
if (E.profileBtn) E.profileBtn.onclick = () => { if (!s.user) return alert("Inicia sesion primero."); s.profileOpen = !s.profileOpen; s.profileEditing = false; if (E.pfMsg) E.pfMsg.textContent = ""; refresh(); };
if (E.pfEditBtn) E.pfEditBtn.onclick = () => { if (!s.user) return; setProfileEditable(true); };
if (E.pfCancelBtn) E.pfCancelBtn.onclick = () => { if (!s.user) return; renderProfileMain(); };
if (E.pfSaveBtn) E.pfSaveBtn.onclick = () => {
  if (!s.user) return;
  const name = x(E.pfName.value);
  const lastName = x(E.pfLastName.value);
  const email = x(E.pfEmail.value);
  const phone = x(E.pfPhone.value);
  const photo = x(E.pfPhoto.value);
  const reasons = [];
  if (!name) reasons.push("El nombre es obligatorio.");
  if (!lastName) reasons.push("Los apellidos son obligatorios.");
  if (!email) reasons.push("El email es obligatorio.");
  if (email && !isValidEmail(email)) reasons.push("El email no tiene un formato valido (ejemplo: usuario@dominio.com).");
  if (phone && !/^[0-9+()\\-\\s]{7,20}$/.test(phone)) reasons.push("El telefono solo puede contener numeros, espacios y + ( ) -.");
  if (reasons.length) return showReasons("No se pudo guardar el perfil.", reasons);
  s.user.name = name;
  s.user.lastName = lastName;
  s.user.email = email;
  s.user.phone = phone;
  s.user.photo = photo;
  lsSaveUsers(s.users);
  E.loginUserSelect.innerHTML = s.users.map((u) => `<option value="${u.id}">${u.name} - ${u.role} (${u.team})</option>`).join("");
  E.loginUserSelect.value = s.user.id;
  if (E.pfMsg) E.pfMsg.textContent = "Perfil actualizado.";
  setProfileEditable(false);
  renderProfileMain();
};
if (E.pfChangePassBtn) E.pfChangePassBtn.onclick = () => {
  if (!s.user) return;
  const current = x(E.pfCurrentPass.value);
  const next = x(E.pfNewPass.value);
  const confirm = x(E.pfConfirmPass.value);
  if (current !== (s.user.password || "Smart1234")) return alert("Contrasena actual incorrecta.");
  if (next !== confirm) return alert("La confirmacion no coincide.");
  if (next.length < 8 || !/[A-Z]/.test(next) || !/[a-z]/.test(next) || !/[0-9]/.test(next)) return alert("La nueva contrasena debe tener minimo 8 caracteres, mayuscula, minuscula y numero.");
  if ((s.user.passwordHistory || []).includes(next)) return alert("No puedes reutilizar una contrasena reciente.");
  s.user.passwordHistory = (Array.isArray(s.user.passwordHistory) ? s.user.passwordHistory : []).concat([s.user.password || "Smart1234"]).slice(-5);
  s.user.password = next;
  lsSaveUsers(s.users);
  E.pfCurrentPass.value = "";
  E.pfNewPass.value = "";
  E.pfConfirmPass.value = "";
  if (E.pfMsg) E.pfMsg.textContent = "Contrasena actualizada.";
};
if (E.pfSaveNotifBtn) E.pfSaveNotifBtn.onclick = () => {
  if (!s.user) return;
  s.user.notify = {
    internal: !!E.pfNotifInternal.checked,
    email: !!E.pfNotifEmail.checked,
    events: {
      newIncident: !!E.pfEvtNew.checked,
      stateChange: !!E.pfEvtState.checked,
      comments: !!E.pfEvtComment.checked,
      dueSoon: !!E.pfEvtDue.checked,
      reassign: !!E.pfEvtReassign.checked,
      systemAlerts: !!E.pfEvtAlerts.checked
    }
  };
  lsSaveUsers(s.users);
  if (E.pfMsg) E.pfMsg.textContent = "Preferencias guardadas.";
};
E.notifBell.onclick = () => { s.notifOpen = !s.notifOpen; renderNotifs(); };
E.notifPanel.onclick = (e) => {
  const t = e.target;
  if (!(t instanceof HTMLElement)) return;
  const id = t.getAttribute("data-notif-id");
  if (s.user?.role === "reportante") {
    if (!id) return;
    s.reportDetailId = id;
    s.reportView = "detail";
  } else if (s.user?.role === "tecnico") {
    if (!id) return;
    s.techDetailId = id;
    s.techView = "assigned";
    s.techLayout = "assigned";
  } else if (s.user?.role === "supervisor") {
    if (!id) return;
    s.supDetailId = id;
    s.supLayout = "list";
  } else if (s.user?.role === "auditor") {
    if (!id) return;
    s.audDetailId = id;
    s.audLayout = "list";
  } else if (s.user?.role === "admin") {
    if (id) { s.admIncidentDetailId = id; s.admLayout = "incidents"; }
    else s.admLayout = "logs";
  }
  s.notifOpen = false;
  refresh();
};

if (E.tabMineBtn) E.tabMineBtn.onclick = () => { closeGlobalProfile(); s.reportView = "mine"; refresh(); };
if (E.tabCreateBtn) E.tabCreateBtn.onclick = () => { closeGlobalProfile(); s.reportView = "create"; refresh(); };
if (E.tabProfileBtn) E.tabProfileBtn.onclick = () => { openGlobalProfile(); refresh(); };
if (E.cancelCreateBtn) E.cancelCreateBtn.onclick = () => { if (E.incidentForm) E.incidentForm.reset(); s.reportView = "mine"; refresh(); };
if (E.tabTechAssignedBtn) E.tabTechAssignedBtn.onclick = () => { closeGlobalProfile(); s.techView = "assigned"; s.techLayout = "assigned"; s.techDetailId = null; refresh(); };
if (E.tabTechTeamBtn) E.tabTechTeamBtn.onclick = () => { closeGlobalProfile(); s.techView = "team"; s.techLayout = "team"; s.techDetailId = null; refresh(); };
if (E.tabTechDashboardBtn) E.tabTechDashboardBtn.onclick = () => { closeGlobalProfile(); s.techLayout = "dashboard"; s.techDetailId = null; refresh(); };
if (E.tabTechAssignedScreenBtn) E.tabTechAssignedScreenBtn.onclick = () => { closeGlobalProfile(); s.techLayout = "assigned"; s.techView = "assigned"; refresh(); };
if (E.tabTechTeamScreenBtn) E.tabTechTeamScreenBtn.onclick = () => { closeGlobalProfile(); s.techLayout = "team"; s.techView = "team"; refresh(); };
if (E.tabTechKanbanBtn) E.tabTechKanbanBtn.onclick = () => { closeGlobalProfile(); s.techLayout = "kanban"; refresh(); };
if (E.tabTechCalendarBtn) E.tabTechCalendarBtn.onclick = () => { closeGlobalProfile(); s.techLayout = "calendar"; refresh(); };
if (E.tabTechChatBtn) E.tabTechChatBtn.onclick = () => { closeGlobalProfile(); s.techLayout = "chat"; refresh(); };
if (E.tabTechProfileBtn) E.tabTechProfileBtn.onclick = () => { openGlobalProfile(); refresh(); };
if (E.techChatTabTeamBtn) E.techChatTabTeamBtn.onclick = () => { s.techChatTab = "team"; renderTechChat(); };
if (E.techChatTabAlertsBtn) E.techChatTabAlertsBtn.onclick = () => { s.techChatTab = "alerts"; renderTechChat(); };
if (E.tabSupDashboardBtn) E.tabSupDashboardBtn.onclick = () => { closeGlobalProfile(); s.supLayout = "dashboard"; refresh(); };
if (E.tabSupListBtn) E.tabSupListBtn.onclick = () => { closeGlobalProfile(); s.supLayout = "list"; refresh(); };
if (E.tabSupCalendarBtn) E.tabSupCalendarBtn.onclick = () => { closeGlobalProfile(); s.supLayout = "calendar"; refresh(); };
if (E.tabSupAssignBtn) E.tabSupAssignBtn.onclick = () => { closeGlobalProfile(); s.supLayout = "assign"; refresh(); };
if (E.tabSupLoadBtn) E.tabSupLoadBtn.onclick = () => { closeGlobalProfile(); s.supLayout = "load"; refresh(); };
if (E.tabSupKanbanBtn) E.tabSupKanbanBtn.onclick = () => { closeGlobalProfile(); s.supLayout = "kanban"; refresh(); };
if (E.tabSupReportsBtn) E.tabSupReportsBtn.onclick = () => { closeGlobalProfile(); s.supLayout = "reports"; refresh(); };
if (E.tabSupChatBtn) E.tabSupChatBtn.onclick = () => { closeGlobalProfile(); s.supLayout = "chat"; refresh(); };
if (E.tabSupProfileBtn) E.tabSupProfileBtn.onclick = () => { openGlobalProfile(); refresh(); };
if (E.supChatTabTeamBtn) E.supChatTabTeamBtn.onclick = () => { s.supChatTab = "team"; renderSupChat(); };
if (E.supChatTabAlertsBtn) E.supChatTabAlertsBtn.onclick = () => { s.supChatTab = "alerts"; renderSupChat(); };
if (E.tabAudDashboardBtn) E.tabAudDashboardBtn.onclick = () => { closeGlobalProfile(); s.audLayout = "dashboard"; refresh(); };
if (E.tabAudListBtn) E.tabAudListBtn.onclick = () => { closeGlobalProfile(); s.audLayout = "list"; refresh(); };
if (E.tabAudLogBtn) E.tabAudLogBtn.onclick = () => { closeGlobalProfile(); s.audLayout = "log"; refresh(); };
if (E.tabAudReportsBtn) E.tabAudReportsBtn.onclick = () => { closeGlobalProfile(); s.audLayout = "reports"; refresh(); };
if (E.tabAudUsersBtn) E.tabAudUsersBtn.onclick = () => { closeGlobalProfile(); s.audLayout = "users"; refresh(); };
if (E.tabAudProfileBtn) E.tabAudProfileBtn.onclick = () => { openGlobalProfile(); refresh(); };
if (E.tabAdmDashboardBtn) E.tabAdmDashboardBtn.onclick = () => { closeGlobalProfile(); s.admLayout = "dashboard"; refresh(); };
if (E.tabAdmUsersBtn) E.tabAdmUsersBtn.onclick = () => { closeGlobalProfile(); s.admLayout = "users"; refresh(); };
if (E.tabAdmRolesBtn) E.tabAdmRolesBtn.onclick = () => { closeGlobalProfile(); s.admLayout = "roles"; refresh(); };
if (E.tabAdmConfigBtn) E.tabAdmConfigBtn.onclick = () => { closeGlobalProfile(); s.admLayout = "config"; refresh(); };
if (E.tabAdmIncidentsBtn) E.tabAdmIncidentsBtn.onclick = () => { closeGlobalProfile(); s.admLayout = "incidents"; refresh(); };
if (E.tabAdmLogsBtn) E.tabAdmLogsBtn.onclick = () => { closeGlobalProfile(); s.admLayout = "logs"; refresh(); };
if (E.tabAdmMonitorBtn) E.tabAdmMonitorBtn.onclick = () => { closeGlobalProfile(); s.admLayout = "monitor"; refresh(); };
if (E.tabAdmProfileBtn) E.tabAdmProfileBtn.onclick = () => { openGlobalProfile(); refresh(); };

if (E.incidentForm) E.incidentForm.onsubmit = (ev) => {
  ev.preventDefault();
  if (!canCreate() || s.user?.role !== "reportante") return;
  const fd = new FormData(E.incidentForm);
  const area = x(fd.get("areaTecnica")), tipo = x(fd.get("tipoIncidencia")), descripcion = x(fd.get("descripcion")), resumen = x(fd.get("resumen")) || "Incidencia sin resumen", adj = x(fd.get("adjunto"));
  const reasons = [];
  if (!area) reasons.push("Debes seleccionar un area tecnica.");
  if (!tipo) reasons.push("Debes seleccionar un tipo de incidencia.");
  if (!descripcion) reasons.push("La descripcion es obligatoria.");
  if (descripcion && descripcion.length < 10) reasons.push(`La descripcion es demasiado corta (${descripcion.length}/10 caracteres minimos).`);
  if (reasons.length) {
    E.formMsg.textContent = `No se pudo crear la incidencia: ${reasons.join(" ")}`;
    E.formMsg.classList.add("error");
    return;
  }
  if (!areaExistsActive(area)) { E.formMsg.textContent = `No se pudo crear la incidencia: el area "${area}" no existe o esta inactiva.`; E.formMsg.classList.add("error"); return; }
  if (!typeExistsActive(area, tipo)) { E.formMsg.textContent = `No se pudo crear la incidencia: el tipo "${tipo}" no esta activo para el area "${area}".`; E.formMsg.classList.add("error"); return; }
  const autoPriority = applyPriorityRule(area, tipo);
  const now = new Date().toISOString();
  s.incidents.push(norm({ id: `INC-${Date.now().toString(36).toUpperCase()}`, titulo: resumen, descripcion, origen: "Usuario", severidad: "Media", categoria: tipo, tipoIncidencia: tipo, prioridad: autoPriority, equipo: area, areaTecnica: area, reportanteId: s.user.id, asignadoA: "", estado: "Pendiente de asignacion", creadaEn: now, fechaLimite: deadline(now, autoPriority), adjuntos: adj ? adj.split(",").map((v) => x(v)).filter(Boolean) : [], timeline: [{ at: now, event: "creada", detail: "Incidencia creada por reportante", by: `reportante:${s.user.id}` }] }));
  save();
  E.formMsg.textContent = "Incidencia enviada.";
  E.formMsg.classList.remove("error");
  E.incidentForm.reset();
  s.reportView = "mine";
  refresh();
};

if (E.repIncidentBody) E.repIncidentBody.onclick = (ev) => { const t = ev.target; if (!(t instanceof HTMLElement)) return; if (t.getAttribute("data-report-action") === "view-detail") { s.reportDetailId = t.getAttribute("data-id"); s.reportView = "detail"; refresh(); } };

if (E.repSearchInput) E.repSearchInput.oninput = () => { s.repF.search = E.repSearchInput.value.trim(); renderRepTable(); };
if (E.repStatusFilter) E.repStatusFilter.onchange = () => { s.repF.status = E.repStatusFilter.value; renderRepTable(); };
if (E.repTipoFilter) E.repTipoFilter.onchange = () => { s.repF.tipo = E.repTipoFilter.value; renderRepTable(); };
if (E.repAreaFilter) E.repAreaFilter.onchange = () => { s.repF.area = E.repAreaFilter.value; renderRepTable(); };
if (E.repDateFilter) E.repDateFilter.onchange = () => { s.repF.date = E.repDateFilter.value; renderRepTable(); };
if (E.areaTecnica) E.areaTecnica.onchange = () => { renderReportCatalogSelectors(); };

if (E.techSearchInput) E.techSearchInput.oninput = () => { s.techF.search = E.techSearchInput.value.trim(); s.techQuick = "all"; refresh(); };
if (E.techStatusFilter) E.techStatusFilter.onchange = () => { s.techF.status = E.techStatusFilter.value; s.techQuick = "all"; refresh(); };
if (E.techPriorityFilter) E.techPriorityFilter.onchange = () => { s.techF.priority = E.techPriorityFilter.value; s.techQuick = "all"; refresh(); };
if (E.techTipoFilter) E.techTipoFilter.onchange = () => { s.techF.tipo = E.techTipoFilter.value; s.techQuick = "all"; refresh(); };
if (E.techAreaFilter) E.techAreaFilter.onchange = () => { s.techF.area = E.techAreaFilter.value; s.techQuick = "all"; refresh(); };
if (E.techDaysFilter) E.techDaysFilter.onchange = () => { s.techF.days = E.techDaysFilter.value; s.techQuick = "all"; refresh(); };
if (E.techDateFilter) E.techDateFilter.onchange = () => { s.techF.date = E.techDateFilter.value; s.techQuick = "all"; refresh(); };
if (E.techCalendarMode) E.techCalendarMode.onchange = () => { s.techCalendarMode = E.techCalendarMode.value; renderTechCalendar(); };
if (E.techCalendarFilter) E.techCalendarFilter.onchange = () => { s.techCalendarFilter = E.techCalendarFilter.value; renderTechCalendar(); };
if (E.supSearchInput) E.supSearchInput.oninput = () => { s.supF.search = E.supSearchInput.value.trim(); refresh(); };
if (E.supStatusFilter) E.supStatusFilter.onchange = () => { s.supF.status = E.supStatusFilter.value; refresh(); };
if (E.supPriorityFilter) E.supPriorityFilter.onchange = () => { s.supF.priority = E.supPriorityFilter.value; refresh(); };
if (E.supAssigneeFilter) E.supAssigneeFilter.onchange = () => { s.supF.assignee = E.supAssigneeFilter.value; refresh(); };
if (E.supTipoFilter) E.supTipoFilter.onchange = () => { s.supF.tipo = E.supTipoFilter.value; refresh(); };
if (E.supAreaFilter) E.supAreaFilter.onchange = () => { s.supF.area = E.supAreaFilter.value; refresh(); };
if (E.supDaysFilter) E.supDaysFilter.onchange = () => { s.supF.days = E.supDaysFilter.value; refresh(); };
if (E.supDateFilter) E.supDateFilter.onchange = () => { s.supF.date = E.supDateFilter.value; refresh(); };
if (E.supCalendarFilter) E.supCalendarFilter.onchange = () => { s.supCalendarFilter = E.supCalendarFilter.value; renderSupCalendar(); };
if (E.supCalendarTechFilter) E.supCalendarTechFilter.onchange = () => { s.supCalendarTech = E.supCalendarTechFilter.value; renderSupCalendar(); };
if (E.audSearchInput) E.audSearchInput.oninput = () => { s.audF.search = E.audSearchInput.value.trim(); refresh(); };
if (E.audStatusFilter) E.audStatusFilter.onchange = () => { s.audF.status = E.audStatusFilter.value; refresh(); };
if (E.audPriorityFilter) E.audPriorityFilter.onchange = () => { s.audF.priority = E.audPriorityFilter.value; refresh(); };
if (E.audAreaFilter) E.audAreaFilter.onchange = () => { s.audF.area = E.audAreaFilter.value; refresh(); };
if (E.audDaysFilter) E.audDaysFilter.onchange = () => { s.audF.days = E.audDaysFilter.value; refresh(); };
if (E.audDateFilter) E.audDateFilter.onchange = () => { s.audF.date = E.audDateFilter.value; refresh(); };
if (E.audLogSearchInput) E.audLogSearchInput.oninput = () => { s.audLogF.search = E.audLogSearchInput.value.trim(); refresh(); };
if (E.audLogRoleFilter) E.audLogRoleFilter.onchange = () => { s.audLogF.role = E.audLogRoleFilter.value; refresh(); };
if (E.audLogActionFilter) E.audLogActionFilter.onchange = () => { s.audLogF.action = E.audLogActionFilter.value; refresh(); };
if (E.audLogIncidentInput) E.audLogIncidentInput.oninput = () => { s.audLogF.incident = E.audLogIncidentInput.value.trim(); refresh(); };
if (E.audLogDateFilter) E.audLogDateFilter.onchange = () => { s.audLogF.date = E.audLogDateFilter.value; refresh(); };
if (E.audUserSearchInput) E.audUserSearchInput.oninput = () => { s.audUserF.search = E.audUserSearchInput.value.trim(); refresh(); };
if (E.audUserRoleFilter) E.audUserRoleFilter.onchange = () => { s.audUserF.role = E.audUserRoleFilter.value; refresh(); };
if (E.audUserDateFilter) E.audUserDateFilter.onchange = () => { s.audUserF.date = E.audUserDateFilter.value; refresh(); };
if (E.admUserSearchInput) E.admUserSearchInput.oninput = () => { s.admUserF.search = E.admUserSearchInput.value.trim(); refresh(); };
if (E.admUserRoleFilter) E.admUserRoleFilter.onchange = () => { s.admUserF.role = E.admUserRoleFilter.value; refresh(); };
if (E.admUserStatusFilter) E.admUserStatusFilter.onchange = () => { s.admUserF.status = E.admUserStatusFilter.value; refresh(); };
if (E.admAreaSearchInput) E.admAreaSearchInput.oninput = () => { renderAdmConfig(); };
if (E.admAreaStatusFilter) E.admAreaStatusFilter.onchange = () => { renderAdmConfig(); };
if (E.admTypeSearchInput) E.admTypeSearchInput.oninput = () => { renderAdmConfig(); };
if (E.admTypeAreaFilter) E.admTypeAreaFilter.onchange = () => { renderAdmConfig(); };
if (E.admTypeStatusFilter) E.admTypeStatusFilter.onchange = () => { renderAdmConfig(); };
if (E.admIncSearchInput) E.admIncSearchInput.oninput = () => { s.admIncF.search = E.admIncSearchInput.value.trim(); refresh(); };
if (E.admIncStatusFilter) E.admIncStatusFilter.onchange = () => { s.admIncF.status = E.admIncStatusFilter.value; refresh(); };
if (E.admIncAreaFilter) E.admIncAreaFilter.onchange = () => { s.admIncF.area = E.admIncAreaFilter.value; refresh(); };
if (E.admLogSearchInput) E.admLogSearchInput.oninput = () => { s.admLogF.search = E.admLogSearchInput.value.trim(); refresh(); };
if (E.admLogTypeFilter) E.admLogTypeFilter.onchange = () => { s.admLogF.type = E.admLogTypeFilter.value; refresh(); };
if (E.admLogUserInput) E.admLogUserInput.oninput = () => { s.admLogF.user = E.admLogUserInput.value.trim(); refresh(); };
if (E.admLogDateFilter) E.admLogDateFilter.onchange = () => { s.admLogF.date = E.admLogDateFilter.value; refresh(); };
if (E.techCalendarPrevBtn) E.techCalendarPrevBtn.onclick = () => {
  const d = new Date(s.techCalendarCursor || Date.now());
  d.setMonth(d.getMonth() - 1);
  s.techCalendarCursor = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
  s.techCalendarSelectedDay = dOnly(s.techCalendarCursor);
  renderTechCalendar();
};
if (E.techCalendarNextBtn) E.techCalendarNextBtn.onclick = () => {
  const d = new Date(s.techCalendarCursor || Date.now());
  d.setMonth(d.getMonth() + 1);
  s.techCalendarCursor = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
  s.techCalendarSelectedDay = dOnly(s.techCalendarCursor);
  renderTechCalendar();
};
if (E.supCalendarPrevBtn) E.supCalendarPrevBtn.onclick = () => {
  const d = new Date(s.supCalendarCursor || Date.now());
  d.setMonth(d.getMonth() - 1);
  s.supCalendarCursor = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
  s.supCalendarSelectedDay = dOnly(s.supCalendarCursor);
  renderSupCalendar();
};
if (E.supCalendarNextBtn) E.supCalendarNextBtn.onclick = () => {
  const d = new Date(s.supCalendarCursor || Date.now());
  d.setMonth(d.getMonth() + 1);
  s.supCalendarCursor = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
  s.supCalendarSelectedDay = dOnly(s.supCalendarCursor);
  renderSupCalendar();
};

if (E.techIncidentBody) E.techIncidentBody.onclick = (ev) => {
  const t = ev.target;
  if (!(t instanceof HTMLElement)) return;
  const actn = t.getAttribute("data-tech-action");
  if (actn === "view" || actn === "change") {
    s.techDetailId = t.getAttribute("data-id");
    if (actn === "change") s.techView = "assigned";
    refresh();
  }
};
if (E.techTeamBody) E.techTeamBody.onclick = (ev) => {
  const t = ev.target;
  if (!(t instanceof HTMLElement)) return;
  if (t.getAttribute("data-tech-team-action") === "view") {
    s.techDetailId = t.getAttribute("data-id");
    refresh();
  }
};
if (E.techKanbanBoard) E.techKanbanBoard.onclick = (ev) => {
  const t = ev.target;
  if (!(t instanceof HTMLElement)) return;
  if (t.getAttribute("data-tech-action") === "view") {
    s.techDetailId = t.getAttribute("data-id");
    refresh();
  }
};
if (E.techKanbanBoard) E.techKanbanBoard.ondragstart = (ev) => {
  const t = ev.target;
  if (!(t instanceof HTMLElement)) return;
  const card = t.closest(".kanban-card");
  if (!card) return;
  const id = card.getAttribute("data-kanban-id");
  if (!id) return;
  ev.dataTransfer?.setData("text/plain", id);
  ev.dataTransfer.effectAllowed = "move";
  E.techKanbanBoard.dataset.dragId = id;
};
if (E.techKanbanBoard) E.techKanbanBoard.ondragover = (ev) => {
  const t = ev.target;
  if (!(t instanceof HTMLElement)) return;
  const col = t.closest(".kanban-col");
  if (!col) return;
  ev.preventDefault();
  col.classList.add("drag-over");
};
if (E.techKanbanBoard) E.techKanbanBoard.ondragleave = (ev) => {
  const t = ev.target;
  if (!(t instanceof HTMLElement)) return;
  const col = t.closest(".kanban-col");
  if (!col) return;
  col.classList.remove("drag-over");
};
if (E.techKanbanBoard) E.techKanbanBoard.ondrop = (ev) => {
  const t = ev.target;
  if (!(t instanceof HTMLElement)) return;
  const col = t.closest(".kanban-col");
  if (!col) return;
  ev.preventDefault();
  col.classList.remove("drag-over");
  const to = col.getAttribute("data-drop-status");
  const fromTransfer = ev.dataTransfer?.getData("text/plain");
  const id = fromTransfer || E.techKanbanBoard.dataset.dragId || "";
  if (!id || !to) return;
  moveKanbanTech(id, to);
  delete E.techKanbanBoard.dataset.dragId;
};
if (E.techCalendarList) E.techCalendarList.onclick = (ev) => {
  const t = ev.target;
  if (!(t instanceof HTMLElement)) return;
  const btn = t.closest(".cal-item");
  if (!btn) return;
  const id = btn.getAttribute("data-cal-id");
  if (!id) return;
  s.techDetailId = id;
  s.techLayout = "assigned";
  refresh();
};
if (E.techCalendarGrid) E.techCalendarGrid.onclick = (ev) => {
  const t = ev.target;
  if (!(t instanceof HTMLElement)) return;
  const dayBtn = t.closest("[data-cal-day]");
  if (!dayBtn) return;
  const day = dayBtn.getAttribute("data-cal-day");
  if (!day) return;
  s.techCalendarSelectedDay = day;
  renderTechCalendar();
};
if (E.techWorkload) E.techWorkload.onclick = (ev) => {
  const t = ev.target;
  if (!(t instanceof HTMLElement)) return;
  const btn = t.closest("[data-workload]");
  if (!btn) return;
  const key = btn.getAttribute("data-workload");
  if (!key) return;
  s.techView = "assigned";
  s.techLayout = "assigned";
  s.techF.status = key === "all" ? "all" : key === "due" ? "all" : key;
  s.techF.days = key === "due" ? "soon" : "all";
  s.techQuick = "all";
  refresh();
};
if (E.techDashboardKpis) E.techDashboardKpis.onclick = (ev) => {
  const t = ev.target;
  if (!(t instanceof HTMLElement)) return;
  const btn = t.closest("[data-tech-kpi]");
  if (!btn) return;
  const key = btn.getAttribute("data-tech-kpi") || "all";
  s.techView = "assigned";
  s.techLayout = "assigned";
  s.techQuick = key;
  s.techF = { search: "", status: "all", priority: "all", tipo: "all", area: "all", days: "all", date: "" };
  if (E.techSearchInput) E.techSearchInput.value = "";
  if (E.techStatusFilter) E.techStatusFilter.value = "all";
  if (E.techPriorityFilter) E.techPriorityFilter.value = "all";
  if (E.techTipoFilter) E.techTipoFilter.value = "all";
  if (E.techAreaFilter) E.techAreaFilter.value = "all";
  if (E.techDaysFilter) E.techDaysFilter.value = "all";
  if (E.techDateFilter) E.techDateFilter.value = "";
  refresh();
};
if (E.techChatSendBtn) E.techChatSendBtn.onclick = () => {
  if (s.user?.role !== "tecnico") return;
  const text = x(E.techChatInput.value);
  if (!text) return;
  if (/inc-|@|dni|telefono|correo|email/i.test(text)) {
    alert("El chat interno no permite datos sensibles ni referencias directas de incidencia.");
    return;
  }
  const msgs = loadTeamChat(s.user.team);
  msgs.push({ user: s.user.id, role: "tecnico", kind: "msg", at: new Date().toISOString(), text });
  saveTeamChat(s.user.team, msgs);
  E.techChatInput.value = "";
  renderTechChat();
};

if (E.supDashboardKpis) E.supDashboardKpis.onclick = (ev) => {
  const t = ev.target;
  if (!(t instanceof HTMLElement)) return;
  const btn = t.closest("[data-sup-kpi]");
  if (!btn) return;
  const key = btn.getAttribute("data-sup-kpi");
  if (!key) return;
  s.supLayout = "list";
  s.supF.status = "all";
  s.supF.assignee = "all";
  s.supF.priority = key === "urgent" ? "Alta" : "all";
  s.supF.days = key === "due" ? "soon" : "all";
  if (key === "none") s.supF.assignee = "none";
  refresh();
};
if (E.audDashboardKpis) E.audDashboardKpis.onclick = (ev) => {
  const t = ev.target;
  if (!(t instanceof HTMLElement)) return;
  const btn = t.closest("[data-aud-kpi]");
  if (!btn) return;
  const key = btn.getAttribute("data-aud-kpi");
  if (!key) return;
  s.audLayout = "list";
  s.audLogF.action = "all";
  s.audF.days = "all";
  if (key === "reopened") { s.audLayout = "log"; s.audLogF.action = "reapertura"; }
  if (key === "overdue") s.audF.days = "overdue";
  refresh();
};
if (E.supLoadMap) E.supLoadMap.onclick = (ev) => {
  const t = ev.target;
  if (!(t instanceof HTMLElement)) return;
  const btn = t.closest("[data-sup-tech-load]");
  if (!btn) return;
  const techId = btn.getAttribute("data-sup-tech-load");
  if (!techId) return;
  s.supLayout = "list";
  s.supF.assignee = techId;
  refresh();
};
if (E.supIncidentBody) E.supIncidentBody.onclick = (ev) => {
  const t = ev.target;
  if (!(t instanceof HTMLElement)) return;
  if (t.getAttribute("data-sup-action") === "detail") {
    s.supDetailId = t.getAttribute("data-id");
    refresh();
  }
};
if (E.audIncidentBody) E.audIncidentBody.onclick = (ev) => {
  const t = ev.target;
  if (!(t instanceof HTMLElement)) return;
  if (t.getAttribute("data-aud-action") === "detail") {
    s.audDetailId = t.getAttribute("data-id");
    refresh();
  }
};
if (E.supUnassignedBody) E.supUnassignedBody.onclick = (ev) => {
  const t = ev.target;
  if (!(t instanceof HTMLElement)) return;
  const id = t.getAttribute("data-sup-assign-id");
  const techId = t.getAttribute("data-sup-assign-tech");
  if (!id || !techId) return;
  const i = s.incidents.find((v) => v.id === id && v.equipo === s.user?.team);
  if (!i) return;
  i.asignadoA = techId;
  if (i.estado === "Pendiente de asignacion") setIncidentState(i, "En analisis", "asignacion_supervisor", "Cambio automatico a En analisis");
  log(i, "asignacion_sugerida", `Asignada a ${techId}`);
  save();
  refresh();
};
if (E.suggestAssignBtn) E.suggestAssignBtn.onclick = () => {
  if (s.user?.role !== "supervisor") return;
  const i = s.incidents.find((v) => v.id === E.assignIncidentSelect.value && v.equipo === s.user.team);
  if (!i) {
    if (E.assignSuggestion) E.assignSuggestion.textContent = "Selecciona primero una incidencia sin asignar.";
    return;
  }
  const sug = supSuggestTech(i);
  if (!sug) {
    if (E.assignSuggestion) E.assignSuggestion.textContent = "No hay tecnicos disponibles para sugerencia.";
    return;
  }
  E.assignTechSelect.value = sug.id;
  E.assignSuggestion.textContent = `Sugerencia: ${sug.id} - ${sug.name}`;
};
if (E.assignBtn) E.assignBtn.onclick = () => {
  if (s.user?.role !== "supervisor") return;
  const i = s.incidents.find((v) => v.id === E.assignIncidentSelect.value && v.equipo === s.user.team);
  const t = s.users.find((u) => u.id === E.assignTechSelect.value && u.role === "tecnico" && u.team === s.user.team);
  if (!i || !t) return alert("Seleccion invalida.");
  i.asignadoA = t.id;
  if (i.estado === "Pendiente de asignacion") setIncidentState(i, "En analisis", "asignacion_supervisor", "Cambio automatico a En analisis");
  log(i, "asignacion", `Asignada a ${t.id}`);
  save();
  refresh();
};
if (E.supCalendarGrid) E.supCalendarGrid.onclick = (ev) => {
  const t = ev.target;
  if (!(t instanceof HTMLElement)) return;
  const dayBtn = t.closest("[data-sup-cal-day]");
  if (!dayBtn) return;
  const day = dayBtn.getAttribute("data-sup-cal-day");
  if (!day) return;
  s.supCalendarSelectedDay = day;
  renderSupCalendar();
};
if (E.supCalendarList) E.supCalendarList.onclick = (ev) => {
  const t = ev.target;
  if (!(t instanceof HTMLElement)) return;
  const btn = t.closest("[data-sup-cal-id]");
  if (!btn) return;
  const id = btn.getAttribute("data-sup-cal-id");
  if (!id) return;
  s.supDetailId = id;
  s.supLayout = "list";
  refresh();
};
if (E.supKanbanBoard) E.supKanbanBoard.onclick = (ev) => {
  const t = ev.target;
  if (!(t instanceof HTMLElement)) return;
  const action = t.getAttribute("data-sup-action");
  const id = t.getAttribute("data-id");
  if (!action || !id) return;
  const i = s.incidents.find((v) => v.id === id && v.equipo === s.user?.team);
  if (!i) return;
  if (action === "detail") {
    s.supDetailId = id;
    refresh();
  }
  if (action === "prio") {
    const next = i.prioridad === "Baja" ? "Normal" : i.prioridad === "Normal" ? "Alta" : i.prioridad === "Alta" ? "Critica" : "Baja";
    i.prioridad = next;
    log(i, "cambio_prioridad", next);
    save();
    refresh();
  }
};
if (E.supKanbanBoard) E.supKanbanBoard.ondragstart = (ev) => {
  const t = ev.target;
  if (!(t instanceof HTMLElement)) return;
  const card = t.closest(".kanban-card");
  if (!card) return;
  const id = card.getAttribute("data-sup-kanban-id");
  if (!id) return;
  ev.dataTransfer?.setData("text/plain", id);
  ev.dataTransfer.effectAllowed = "move";
  E.supKanbanBoard.dataset.dragId = id;
};
if (E.supKanbanBoard) E.supKanbanBoard.ondragover = (ev) => {
  const t = ev.target;
  if (!(t instanceof HTMLElement)) return;
  const col = t.closest(".kanban-col");
  if (!col) return;
  ev.preventDefault();
  col.classList.add("drag-over");
};
if (E.supKanbanBoard) E.supKanbanBoard.ondragleave = (ev) => {
  const t = ev.target;
  if (!(t instanceof HTMLElement)) return;
  const col = t.closest(".kanban-col");
  if (!col) return;
  col.classList.remove("drag-over");
};
if (E.supKanbanBoard) E.supKanbanBoard.ondrop = (ev) => {
  const t = ev.target;
  if (!(t instanceof HTMLElement)) return;
  const col = t.closest(".kanban-col");
  if (!col) return;
  ev.preventDefault();
  col.classList.remove("drag-over");
  const to = col.getAttribute("data-sup-drop-status");
  const id = ev.dataTransfer?.getData("text/plain") || E.supKanbanBoard.dataset.dragId || "";
  if (!id || !to) return;
  moveSupKanban(id, to);
  delete E.supKanbanBoard.dataset.dragId;
};
if (E.supChatSendBtn) E.supChatSendBtn.onclick = () => {
  if (s.user?.role !== "supervisor") return;
  const text = x(E.supChatInput.value);
  const kind = x(E.supChatType?.value || "msg");
  if (!text) return;
  if (/inc-|@|dni|telefono|correo|email/i.test(text)) {
    alert("El chat interno no permite datos sensibles ni referencias directas de incidencia.");
    return;
  }
  const msgs = loadTeamChat(s.user.team);
  msgs.push({ user: s.user.id, role: "supervisor", kind: kind === "aviso" ? "aviso" : "msg", at: new Date().toISOString(), text });
  saveTeamChat(s.user.team, msgs);
  E.supChatInput.value = "";
  if (E.supChatType) E.supChatType.value = "msg";
  renderSupChat();
  renderNotifs();
  renderTechLayout();
  renderSupLayout();
};
if (E.supReqKind) E.supReqKind.onchange = () => {
  const isType = E.supReqKind.value === "type";
  if (E.supReqArea) E.supReqArea.disabled = !isType;
  if (!isType && E.supReqArea) E.supReqArea.value = "";
};
if (E.supSendReqBtn) E.supSendReqBtn.onclick = () => {
  if (s.user?.role !== "supervisor") return;
  const kind = x(E.supReqKind?.value || "area");
  const name = x(E.supReqName?.value || "");
  const area = x(E.supReqArea?.value || "");
  const description = x(E.supReqDesc?.value || "");
  if (!name) { if (E.supReqMsg) E.supReqMsg.textContent = "Indica el nombre solicitado."; return; }
  if (!/^[a-zA-Z0-9 _-]{2,40}$/.test(name)) { if (E.supReqMsg) E.supReqMsg.textContent = "Nombre no valido: usa 2-40 caracteres (letras, numeros, espacio, _ o -)."; return; }
  if (kind === "type" && !area) { if (E.supReqMsg) E.supReqMsg.textContent = "Selecciona el area asociada."; return; }
  const existsPending = s.catalogReqs.some((r) => r.status === "pending" && r.kind === kind && r.name.toLowerCase() === name.toLowerCase() && (kind === "area" || r.area === area));
  if (existsPending) { if (E.supReqMsg) E.supReqMsg.textContent = "Ya existe una solicitud pendiente igual."; return; }
  s.catalogReqs.push({ id: `REQ-${Date.now().toString(36).toUpperCase()}`, kind, name, area: kind === "type" ? area : "", description, requestedBy: s.user.id, team: s.user.team, status: "pending", createdAt: new Date().toISOString(), processedAt: "", processedBy: "" });
  lsSaveCatalogReqs(s.catalogReqs);
  pushSysLog("alert", `Solicitud de catalogo ${kind}:${name} enviada por ${s.user.id}`, s.user.id);
  if (E.supReqMsg) E.supReqMsg.textContent = "Solicitud enviada al Administrador.";
  if (E.supReqName) E.supReqName.value = "";
  if (E.supReqDesc) E.supReqDesc.value = "";
};
if (E.audExportLogBtn) E.audExportLogBtn.onclick = () => {
  if (s.user?.role !== "auditor") return;
  const rows = filtAudLog();
  const header = "fecha,incidencia,usuario,rol,accion,valor";
  const csv = [header].concat(rows.map((r) => `"${dOnly(r.at)} ${new Date(r.at).toLocaleTimeString("es-ES")}","${r.incidentId}","${r.user}","${r.role}","${r.action}","${String(r.value).replace(/"/g, "'")}"`)).join("\n");
  downloadText(`auditoria-log-${new Date().toISOString().slice(0, 10)}.csv`, "text/csv", csv);
};
if (E.admDashboardKpis) E.admDashboardKpis.onclick = (ev) => {
  const t = ev.target;
  if (!(t instanceof HTMLElement)) return;
  const btn = t.closest("[data-adm-kpi]");
  if (!btn) return;
  const key = btn.getAttribute("data-adm-kpi");
  if (!key) return;
  s.admLayout = key === "users" ? "users" : key === "roles" ? "roles" : key === "config" ? "config" : "logs";
  refresh();
};
if (E.admUserBody) E.admUserBody.onclick = (ev) => {
  const t = ev.target;
  if (!(t instanceof HTMLElement)) return;
  const id = t.getAttribute("data-id");
  const action = t.getAttribute("data-adm-user");
  if (!id || !action) return;
  const u = s.users.find((v) => v.id === id);
  if (!u) return;
  if (action === "edit") {
    s.admEditingUserId = u.id;
    E.admFormId.value = u.id;
    E.admFormId.disabled = true;
    E.admFormName.value = u.name;
    E.admFormEmail.value = u.email || "";
    E.admFormRole.value = u.role;
    E.admFormTeam.value = u.team || "N1";
    E.admFormStatus.value = u.status || "active";
    E.admUserMsg.textContent = `Editando usuario ${u.id}`;
  }
  if (action === "reset") {
    u.tempPassword = `Tmp-${Math.random().toString(36).slice(2, 8)}`;
    pushSysLog("admin_action", `Reset de contrasena temporal para ${u.id}`, s.user?.id || "-");
    lsSaveUsers(s.users);
    E.admUserMsg.textContent = `Contrasena temporal para ${u.id}: ${u.tempPassword}`;
  }
  if (action === "toggle") {
    if (u.id === s.user?.id && (u.status || "active") === "active") return alert("No puedes desactivarte a ti mismo.");
    u.status = (u.status || "active") === "active" ? "inactive" : "active";
    pushSysLog("admin_action", `Cambio de estado de usuario ${u.id} a ${u.status}`, s.user?.id || "-");
    lsSaveUsers(s.users);
    refresh();
  }
};
if (E.admSaveUserBtn) E.admSaveUserBtn.onclick = () => {
  if (s.user?.role !== "admin") return;
  const id = x(E.admFormId.value).toLowerCase();
  const name = x(E.admFormName.value);
  const email = x(E.admFormEmail.value);
  const role = x(E.admFormRole.value);
  const team = x(E.admFormTeam.value || "N1");
  const status = x(E.admFormStatus.value || "active");
  const reasons = [];
  if (!id) reasons.push("El ID es obligatorio.");
  if (id && !/^[a-z0-9._-]{3,30}$/.test(id)) reasons.push("El ID debe tener 3-30 caracteres y usar solo minusculas, numeros, punto, guion o guion bajo.");
  if (!name) reasons.push("El nombre es obligatorio.");
  if (!role) reasons.push("El rol es obligatorio.");
  if (email && !isValidEmail(email)) reasons.push("El email no tiene formato valido.");
  if (reasons.length) return showReasons("No se pudo guardar el usuario.", reasons);
  if (!s.admEditingUserId && s.users.some((u) => u.id === id)) return alert(`No se pudo crear el usuario: el ID "${id}" ya existe.`);
  if (s.admEditingUserId) {
    const u = s.users.find((v) => v.id === s.admEditingUserId);
    if (!u) return;
    if (u.id === s.user?.id && role !== "admin") return alert("No puedes quitarte rol admin a ti mismo.");
    u.name = name; u.email = email || u.email; u.role = role; u.team = team; u.status = status;
    pushSysLog("admin_action", `Edicion de usuario ${u.id}`, s.user?.id || "-");
  } else {
    const nu = normUser({ id, name, email, role, team, status, createdAt: new Date().toISOString(), tempPassword: `Tmp-${Math.random().toString(36).slice(2, 8)}` });
    s.users.push(nu);
    pushSysLog("admin_action", `Creacion de usuario ${nu.id}`, s.user?.id || "-");
    E.admUserMsg.textContent = `Usuario creado. Password temporal: ${nu.tempPassword}`;
  }
  lsSaveUsers(s.users);
  E.loginUserSelect.innerHTML = s.users.map((u) => `<option value="${u.id}">${u.name} - ${u.role} (${u.team})</option>`).join("");
  resetAdmUserForm();
  refresh();
};
if (E.admResetUserFormBtn) E.admResetUserFormBtn.onclick = () => resetAdmUserForm();
if (E.admRoleSelect) E.admRoleSelect.onchange = () => renderAdmRoles();
if (E.admSaveRoleBtn) E.admSaveRoleBtn.onclick = () => {
  if (s.user?.role !== "admin") return;
  const role = E.admRoleSelect.value;
  if (!role) return;
  if (role === "admin" && !E.admPermExport.checked && !E.admPermCreate.checked && x(E.admRoleActions.value) === "") return alert("No puedes dejar admin sin permisos base.");
  const actions = x(E.admRoleActions.value).split(",").map((v) => x(v)).filter(Boolean);
  s.policies[role] = s.policies[role] || {};
  s.policies[role].visibility = E.admRoleVisibility.value;
  s.policies[role].permissions = { create_incident: !!E.admPermCreate.checked, export_data: !!E.admPermExport.checked };
  s.policies[role].incident_actions = actions;
  lsSavePolicies(s.policies);
  pushSysLog("config", `Actualizacion de permisos para rol ${role}`, s.user?.id || "-");
  refresh();
};
if (E.admSaveConfigBtn) E.admSaveConfigBtn.onclick = () => {
  if (s.user?.role !== "admin") return;
  let parsedRules = s.adminCfg.priorityRules || [];
  let parsedTransitions = s.adminCfg.transitions || defaultAdminCfg().transitions;
  try {
    if (E.admPriorityRulesInput) parsedRules = parsePriorityRulesText(E.admPriorityRulesInput.value);
    if (E.admTransitionsInput) parsedTransitions = parseTransitionsText(E.admTransitionsInput.value);
  } catch (err) {
    alert(err instanceof Error ? err.message : "Error en configuracion JSON.");
    return;
  }
  s.adminCfg.params = {
    maxResponseDays: Number(E.admParamResp.value || 2),
    maxResolveDays: Number(E.admParamRes.value || 7),
    autoCloseDays: Number(E.admParamAutoClose.value || 3),
    notificationPolicy: x(E.admParamNotif.value) || "realtime"
  };
  s.adminCfg.priorityRules = parsedRules;
  s.adminCfg.transitions = parsedTransitions;
  lsSaveAdminCfg(s.adminCfg);
  pushSysLog("config", "Actualizacion de catalogos y parametros del sistema", s.user?.id || "-");
  refresh();
};
if (E.admAreaBody) E.admAreaBody.onclick = (ev) => {
  const t = ev.target;
  if (!(t instanceof HTMLElement)) return;
  const action = t.getAttribute("data-adm-area");
  const name = t.getAttribute("data-name");
  if (!action || !name) return;
  const a = (s.adminCfg.areas || []).find((v) => v.name === name);
  if (!a) return;
  if (action === "edit") {
    s.admEditingAreaName = a.name;
    if (E.admAreaName) E.admAreaName.value = a.name;
    if (E.admAreaStatus) E.admAreaStatus.value = a.status;
    if (E.admAreaDesc) E.admAreaDesc.value = a.description || "";
  }
  if (action === "toggle") {
    a.status = a.status === "active" ? "inactive" : "active";
    a.updatedAt = new Date().toISOString();
    lsSaveAdminCfg(s.adminCfg);
    pushSysLog("config", `Cambio de estado de area ${a.name} a ${a.status}`, s.user?.id || "-");
    refresh();
  }
};
if (E.admSaveAreaBtn) E.admSaveAreaBtn.onclick = () => {
  if (s.user?.role !== "admin") return;
  const name = x(E.admAreaName?.value || "");
  const status = x(E.admAreaStatus?.value || "active");
  const description = x(E.admAreaDesc?.value || "");
  if (!name) return alert("No se pudo guardar el area: el nombre es obligatorio.");
  if (!/^[a-zA-Z0-9 _-]{2,30}$/.test(name)) return alert("No se pudo guardar el area: el nombre debe tener 2-30 caracteres y solo letras, numeros, espacio, _ o -.");
  const now = new Date().toISOString();
  const duplicate = (s.adminCfg.areas || []).some((a) => a.name.toLowerCase() === name.toLowerCase() && a.name !== s.admEditingAreaName);
  if (duplicate) return alert(`No se pudo guardar el area: ya existe otra area llamada "${name}".`);
  if (s.admEditingAreaName) {
    const a = (s.adminCfg.areas || []).find((v) => v.name === s.admEditingAreaName);
    if (!a) return;
    a.name = name; a.status = status; a.description = description; a.updatedAt = now;
    (s.adminCfg.types || []).forEach((t) => { if (t.area === s.admEditingAreaName) t.area = name; });
    pushSysLog("config", `Edicion de area ${name}`, s.user?.id || "-");
  } else {
    s.adminCfg.areas.push({ name, status, description, createdAt: now, updatedAt: now });
    pushSysLog("config", `Creacion de area ${name}`, s.user?.id || "-");
  }
  s.admEditingAreaName = "";
  if (E.admAreaName) E.admAreaName.value = "";
  if (E.admAreaDesc) E.admAreaDesc.value = "";
  if (E.admAreaStatus) E.admAreaStatus.value = "active";
  lsSaveAdminCfg(s.adminCfg);
  refresh();
};
if (E.admResetAreaBtn) E.admResetAreaBtn.onclick = () => {
  s.admEditingAreaName = "";
  if (E.admAreaName) E.admAreaName.value = "";
  if (E.admAreaDesc) E.admAreaDesc.value = "";
  if (E.admAreaStatus) E.admAreaStatus.value = "active";
};
if (E.admTypeBody) E.admTypeBody.onclick = (ev) => {
  const t = ev.target;
  if (!(t instanceof HTMLElement)) return;
  const action = t.getAttribute("data-adm-type");
  const key = t.getAttribute("data-key");
  if (!action || !key) return;
  const [area, name] = key.split("__");
  const tp = (s.adminCfg.types || []).find((v) => v.area === area && v.name === name);
  if (!tp) return;
  if (action === "edit") {
    s.admEditingTypeKey = `${tp.area}__${tp.name}`;
    if (E.admTypeName) E.admTypeName.value = tp.name;
    if (E.admTypeArea) E.admTypeArea.value = tp.area;
    if (E.admTypeStatus) E.admTypeStatus.value = tp.status;
    if (E.admTypeDesc) E.admTypeDesc.value = tp.description || "";
  }
  if (action === "toggle") {
    tp.status = tp.status === "active" ? "inactive" : "active";
    tp.updatedAt = new Date().toISOString();
    lsSaveAdminCfg(s.adminCfg);
    pushSysLog("config", `Cambio de estado de tipo ${tp.name} (${tp.area}) a ${tp.status}`, s.user?.id || "-");
    refresh();
  }
};
if (E.admSaveTypeBtn) E.admSaveTypeBtn.onclick = () => {
  if (s.user?.role !== "admin") return;
  const name = x(E.admTypeName?.value || "");
  const area = x(E.admTypeArea?.value || "");
  const status = x(E.admTypeStatus?.value || "active");
  const description = x(E.admTypeDesc?.value || "");
  if (!name || !area) return showReasons("No se pudo guardar el tipo.", [
    !name ? "El nombre del tipo es obligatorio." : "",
    !area ? "Debes seleccionar un area asociada." : ""
  ]);
  if (!/^[a-zA-Z0-9 _-]{2,30}$/.test(name)) return alert("No se pudo guardar el tipo: el nombre debe tener 2-30 caracteres y solo letras, numeros, espacio, _ o -.");
  const now = new Date().toISOString();
  const duplicate = (s.adminCfg.types || []).some((t) => t.name.toLowerCase() === name.toLowerCase() && t.area === area && `${t.area}__${t.name}` !== s.admEditingTypeKey);
  if (duplicate) return alert(`No se pudo guardar el tipo: "${name}" ya existe en el area "${area}".`);
  if (s.admEditingTypeKey) {
    const [oldArea, oldName] = s.admEditingTypeKey.split("__");
    const tp = (s.adminCfg.types || []).find((v) => v.area === oldArea && v.name === oldName);
    if (!tp) return;
    tp.name = name; tp.area = area; tp.status = status; tp.description = description; tp.updatedAt = now;
    pushSysLog("config", `Edicion de tipo ${name} (${area})`, s.user?.id || "-");
  } else {
    s.adminCfg.types.push({ name, area, status, description, createdAt: now, updatedAt: now });
    pushSysLog("config", `Creacion de tipo ${name} (${area})`, s.user?.id || "-");
  }
  s.admEditingTypeKey = "";
  if (E.admTypeName) E.admTypeName.value = "";
  if (E.admTypeArea) E.admTypeArea.value = "";
  if (E.admTypeStatus) E.admTypeStatus.value = "active";
  if (E.admTypeDesc) E.admTypeDesc.value = "";
  lsSaveAdminCfg(s.adminCfg);
  refresh();
};
if (E.admResetTypeBtn) E.admResetTypeBtn.onclick = () => {
  s.admEditingTypeKey = "";
  if (E.admTypeName) E.admTypeName.value = "";
  if (E.admTypeArea) E.admTypeArea.value = "";
  if (E.admTypeStatus) E.admTypeStatus.value = "active";
  if (E.admTypeDesc) E.admTypeDesc.value = "";
};
if (E.admReqBody) E.admReqBody.onclick = (ev) => {
  const t = ev.target;
  if (!(t instanceof HTMLElement)) return;
  const action = t.getAttribute("data-adm-req");
  const id = t.getAttribute("data-id");
  if (!action || !id) return;
  const r = s.catalogReqs.find((v) => v.id === id);
  if (!r || r.status !== "pending") return;
  if (action === "reject") {
    r.status = "rejected";
    r.processedBy = s.user?.id || "-";
    r.processedAt = new Date().toISOString();
    lsSaveCatalogReqs(s.catalogReqs);
    pushSysLog("admin_action", `Solicitud ${id} rechazada`, s.user?.id || "-");
    refresh();
    return;
  }
  if (action === "approve") {
    const now = new Date().toISOString();
    if (r.kind === "area") {
      const exists = (s.adminCfg.areas || []).some((a) => a.name.toLowerCase() === r.name.toLowerCase());
      if (!exists) s.adminCfg.areas.push({ name: r.name, description: r.description || `Solicitada por ${r.requestedBy}`, status: "active", createdAt: now, updatedAt: now });
    } else {
      const area = r.area;
      const areaActive = (s.adminCfg.areas || []).some((a) => a.name === area);
      if (areaActive) {
        const exists = (s.adminCfg.types || []).some((tp) => tp.area === area && tp.name.toLowerCase() === r.name.toLowerCase());
        if (!exists) s.adminCfg.types.push({ name: r.name, area, description: r.description || `Solicitado por ${r.requestedBy}`, status: "active", createdAt: now, updatedAt: now });
      }
    }
    r.status = "approved";
    r.processedBy = s.user?.id || "-";
    r.processedAt = now;
    lsSaveCatalogReqs(s.catalogReqs);
    lsSaveAdminCfg(s.adminCfg);
    pushSysLog("admin_action", `Solicitud ${id} aprobada`, s.user?.id || "-");
    refresh();
  }
};
if (E.admIncidentBody) E.admIncidentBody.onclick = (ev) => {
  const t = ev.target;
  if (!(t instanceof HTMLElement)) return;
  const id = t.getAttribute("data-id");
  const action = t.getAttribute("data-adm-inc");
  if (!id || !action) return;
  const i = s.incidents.find((v) => v.id === id);
  if (!i) return;
  if (action === "detail") {
    s.admIncidentDetailId = id;
    refresh();
  }
  if (action === "repair") {
    let fixed = false;
    if (!i.fechaLimite) { i.fechaLimite = deadline(i.creadaEn, i.prioridad); fixed = true; }
    if (!i.estado) { i.estado = "Pendiente de asignacion"; fixed = true; }
    if (!i.prioridad) { i.prioridad = "Normal"; fixed = true; }
    if (fixed) {
      log(i, "reparacion_tecnica_admin", "Correccion estructural de campos");
      pushSysLog("admin_action", `Reparacion tecnica de incidencia ${i.id}`, s.user?.id || "-");
      save();
      refresh();
    } else alert("No se detectaron campos danados en esta incidencia.");
  }
};
if (E.admExportLogsBtn) E.admExportLogsBtn.onclick = () => {
  if (s.user?.role !== "admin") return;
  const rows = admLogsFiltered();
  const csv = ["fecha,tipo,usuario,mensaje"].concat(rows.map((r) => `"${fmt(r.at)}","${r.type}","${r.user || "-"}","${String(r.message).replace(/"/g, "'")}"`)).join("\n");
  downloadText(`syslogs-${new Date().toISOString().slice(0, 10)}.csv`, "text/csv", csv);
};

if (E.searchInput) E.searchInput.oninput = () => { s.gF.search = E.searchInput.value.trim(); renderGeneric(); };
if (E.statusFilter) E.statusFilter.onchange = () => { s.gF.status = E.statusFilter.value; renderGeneric(); };
if (E.severityFilter) E.severityFilter.onchange = () => { s.gF.severity = E.severityFilter.value; renderGeneric(); };

if (E.addEvidenceBtn) E.addEvidenceBtn.onclick = () => {
  if (s.user?.role !== "tecnico") return;
  const i = s.incidents.find((v) => v.id === E.evidenceIncidentSelect.value && v.asignadoA === s.user.id);
  const text = x(E.evidenceInput.value);
  if (!i || !text) return alert("Selecciona incidencia y evidencia.");
  i.adjuntos.push(text); log(i, "evidencia_tecnica", text); save(); E.evidenceInput.value = ""; refresh();
};
if (E.exportBtn) E.exportBtn.onclick = () => {
  if (s.user?.role !== "auditor" || !canExport()) return alert("Solo auditor puede exportar.");
  const blob = new Blob([exportIncidents(visible())], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `smartlog-auditoria-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
if (E.adminUserForm) E.adminUserForm.onsubmit = (ev) => {
  ev.preventDefault();
  if (s.user?.role !== "admin") return;
  const id = x(q("adminUserId").value).toLowerCase(), name = x(q("adminUserName").value), role = x(q("adminUserRole").value), team = x(q("adminUserTeam").value || "N1");
  const reasons = [];
  if (!id) reasons.push("El ID es obligatorio.");
  if (id && !/^[a-z0-9._-]{3,30}$/.test(id)) reasons.push("El ID debe tener 3-30 caracteres y solo minusculas, numeros, punto, guion o guion bajo.");
  if (!name) reasons.push("El nombre es obligatorio.");
  if (!role) reasons.push("El rol es obligatorio.");
  if (!team) reasons.push("El equipo es obligatorio.");
  if (reasons.length) return showReasons("No se pudo crear el usuario.", reasons);
  if (s.users.some((u) => u.id === id)) return alert(`No se pudo crear el usuario: el ID "${id}" ya existe.`);
  s.users.push(normUser({ id, name, role, team, createdAt: new Date().toISOString(), tempPassword: `Tmp-${Math.random().toString(36).slice(2, 8)}` }));
  lsSaveUsers(s.users);
  pushSysLog("admin_action", `Creacion de usuario ${id} desde panel lateral`, s.user.id);
  E.adminUserForm.reset();
  E.loginUserSelect.innerHTML = s.users.map((u) => `<option value="${u.id}">${u.name} - ${u.role} (${u.team})</option>`).join("");
  renderTechSupAudAdmin();
};
if (E.adminPolicyRole) E.adminPolicyRole.onchange = () => { if (s.user?.role === "admin" && E.adminPolicyView) E.adminPolicyView.textContent = JSON.stringify(pol(E.adminPolicyRole.value), null, 2); };

boot();
