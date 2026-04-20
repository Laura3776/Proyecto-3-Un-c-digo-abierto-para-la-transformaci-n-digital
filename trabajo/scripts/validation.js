/**
 * @fileoverview Input validation and normalization for SmartLog Monitor.
 * All business rules for incident data live here.
 * No validation logic should exist outside this module.
 * @module validation
 */
 
/**
 * Set of valid incident origin values.
 * @type {Set<string>}
 */
const allowedOrigins = new Set(["Servidor", "Red", "Aplicacion", "IoT", "Usuario"]);
 
/**
 * Set of valid severity levels.
 * @type {Set<string>}
 */
const allowedSeverity = new Set(["Baja", "Media", "Alta", "Critica"]);
 
/**
 * Set of valid priority levels.
 * @type {Set<string>}
 */
const allowedPriority = new Set(["Baja", "Media", "Alta", "Critica"]);
 
/**
 * Set of valid incident categories.
 * @type {Set<string>}
 */
const allowedCategory = new Set(["General", "Red", "Aplicacion", "Seguridad", "Hardware"]);
 
/**
 * Set of valid team identifiers.
 * @type {Set<string>}
 */
const allowedTeams = new Set(["N1", "N2", "Infra", "OT"]);
 
/**
 * Trims and collapses internal whitespace from a string value.
 * Safely converts non-string inputs to empty string.
 *
 * @param {*} text - The value to sanitize.
 * @returns {string} Sanitized string with no leading/trailing spaces and no double spaces.
 */
function sanitize(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}
 
/**
 * Validates incident form data submitted by a reporter.
 * Checks required fields, minimum lengths, and allowed enum values.
 *
 * @param {FormData} formData - The raw FormData object from the incident creation form.
 * @returns {{ ok: boolean, message?: string, value?: Object }} Validation result.
 *   - `ok: true` with a `value` object containing sanitized fields on success.
 *   - `ok: false` with a `message` string describing the first validation error found.
 *
 * @example
 * const result = validateIncidentInput(formData);
 * if (!result.ok) {
 *   showError(result.message);
 * } else {
 *   createIncident(result.value);
 * }
 */
export function validateIncidentInput(formData) {
  const titulo = sanitize(formData.get("titulo"));
  const descripcion = sanitize(formData.get("descripcion"));
  const origen = sanitize(formData.get("origen"));
  const severidad = sanitize(formData.get("severidad"));
  const categoria = sanitize(formData.get("categoria")) || "General";
  const prioridad = sanitize(formData.get("prioridad")) || "Media";
  const equipo = sanitize(formData.get("equipo"));
  const adjunto = sanitize(formData.get("adjunto"));
 
  if (titulo.length < 4) {
    return { ok: false, message: "El titulo debe tener al menos 4 caracteres." };
  }
  if (descripcion.length < 10) {
    return { ok: false, message: "La descripcion debe tener al menos 10 caracteres." };
  }
  if (!allowedOrigins.has(origen)) {
    return { ok: false, message: "Selecciona un origen valido." };
  }
  if (!allowedSeverity.has(severidad)) {
    return { ok: false, message: "Selecciona una severidad valida." };
  }
  if (!allowedPriority.has(prioridad)) {
    return { ok: false, message: "Selecciona una prioridad valida." };
  }
  if (!allowedCategory.has(categoria)) {
    return { ok: false, message: "Selecciona una categoria valida." };
  }
  if (!allowedTeams.has(equipo)) {
    return { ok: false, message: "Selecciona un equipo valido." };
  }
 
  return {
    ok: true,
    value: { titulo, descripcion, origen, severidad, categoria, prioridad, equipo, adjunto }
  };
}
 
/**
 * Normalizes a raw incident object from an import file into a valid incident record.
 * Applies default values for optional fields and rejects records with invalid required fields.
 * Returns `null` for invalid records so callers can silently skip them during bulk import.
 *
 * @param {Object} raw - Raw incident object parsed from an import JSON file.
 * @param {string} raw.titulo - Incident title.
 * @param {string} raw.descripcion - Incident description.
 * @param {string} raw.origen - Incident origin (must be a value in allowedOrigins).
 * @param {string} raw.severidad - Severity level (must be a value in allowedSeverity).
 * @param {string} [raw.categoria="General"] - Category (defaults to "General" if missing).
 * @param {string} [raw.prioridad="Media"] - Priority (defaults to "Media" if missing).
 * @param {string} [raw.equipo="N1"] - Team identifier (defaults to "N1" if invalid).
 * @param {string} [raw.estado="Nueva"] - Incident state (defaults to "Nueva" if unrecognized).
 * @returns {Object|null} Normalized incident object ready for storage, or `null` if invalid.
 *
 * @example
 * const normalized = normalizeImportedIncident(rawObject);
 * if (normalized) {
 *   incidents.push(normalized);
 * }
 */
export function normalizeImportedIncident(raw) {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const titulo = sanitize(raw.titulo);
  const descripcion = sanitize(raw.descripcion);
  const origen = sanitize(raw.origen);
  const severidad = sanitize(raw.severidad);
  const categoria = sanitize(raw.categoria) || "General";
  const prioridad = sanitize(raw.prioridad) || "Media";
  const equipo = sanitize(raw.equipo) || "N1";
  const estadoSet = new Set([
    "Nueva",
    "En analisis",
    "En progreso",
    "Pendiente de informacion",
    "Resuelta",
    "Cerrada"
  ]);
  const estado = estadoSet.has(raw.estado) ? raw.estado : "Nueva";
 
  if (
    !titulo ||
    !descripcion ||
    !allowedOrigins.has(origen) ||
    !allowedSeverity.has(severidad) ||
    !allowedCategory.has(categoria) ||
    !allowedPriority.has(prioridad)
  ) {
    return null;
  }
 
  return {
    id: sanitize(raw.id) || crypto.randomUUID(),
    titulo,
    descripcion,
    origen,
    severidad,
    categoria,
    prioridad,
    equipo: allowedTeams.has(equipo) ? equipo : "N1",
    reportanteId: sanitize(raw.reportanteId) || "u-reportante-1",
    asignadoA: sanitize(raw.asignadoA) || "",
    adjunto: sanitize(raw.adjunto),
    estado,
    creadaEn: new Date(raw.creadaEn || Date.now()).toISOString(),
    cerradaEn: raw.cerradaEn ? new Date(raw.cerradaEn).toISOString() : null,
    timeline: Array.isArray(raw.timeline) ? raw.timeline : []
  };
}