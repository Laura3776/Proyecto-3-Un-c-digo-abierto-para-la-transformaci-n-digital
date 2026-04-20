/**
 * @fileoverview Persistence layer for SmartLog Monitor.
 * Handles all read/write operations to localStorage.
 * Replace the implementation of each function with API calls to migrate to a backend.
 * @module storage
 */
 
/** @type {string} localStorage key used to store the incidents array. */
const STORAGE_KEY = "smartlog_incidents_v1";
 
/**
 * Loads all incidents from localStorage.
 * Returns an empty array if storage is empty or if parsing fails.
 *
 * @returns {Array<Object>} Array of incident objects. Empty array on error or no data.
 *
 * @example
 * const incidents = loadIncidents();
 * console.log(incidents.length); // 12
 */
export function loadIncidents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
 
/**
 * Persists the full incidents array to localStorage.
 * Overwrites any previously stored data.
 *
 * @param {Array<Object>} incidents - The complete list of incident objects to save.
 * @returns {void}
 *
 * @example
 * saveIncidents(updatedIncidents);
 */
export function saveIncidents(incidents) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(incidents));
}
 
/**
 * Removes all incidents from localStorage.
 * This is a destructive admin action and cannot be undone.
 *
 * @returns {void}
 *
 * @example
 * clearIncidents(); // all incident data is deleted
 */
export function clearIncidents() {
  localStorage.removeItem(STORAGE_KEY);
}
 
/**
 * Serializes an array of incidents into a JSON string with version metadata.
 * The resulting string is suitable for file download or clipboard copy.
 *
 * @param {Array<Object>} incidents - The incidents to export.
 * @returns {string} Pretty-printed JSON string containing version, timestamp, and incidents.
 *
 * @example
 * const json = exportIncidents(incidents);
 * // {"version":1,"generatedAt":"2026-02-24T10:00:00.000Z","incidents":[...]}
 */
export function exportIncidents(incidents) {
  const payload = {
    version: 1,
    generatedAt: new Date().toISOString(),
    incidents
  };
  return JSON.stringify(payload, null, 2);
}
 
/**
 * Parses an exported JSON string and returns the incidents array.
 * Expects the format produced by {@link exportIncidents}.
 *
 * @param {string} text - JSON string containing a `{ version, generatedAt, incidents }` object.
 * @returns {Array<Object>} Parsed array of incident objects.
 * @throws {Error} If the JSON is malformed or the `incidents` array is missing.
 *
 * @example
 * const incidents = importIncidentsFromText(jsonString);
 */
export function importIncidentsFromText(text) {
  const parsed = JSON.parse(text);
  if (!parsed || !Array.isArray(parsed.incidents)) {
    throw new Error("Formato JSON invalido");
  }
  return parsed.incidents;
}