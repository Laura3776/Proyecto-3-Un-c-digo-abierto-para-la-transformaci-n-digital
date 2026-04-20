/**
 * @fileoverview UI utility functions for SmartLog Monitor.
 * Handles navigation menu toggling and copy-to-clipboard interactions.
 * Loaded on all pages of the application.
 * @module main
 */
 
/**
 * Mobile navigation menu toggle button.
 * @type {HTMLElement|null}
 */
const menuBtn = document.getElementById("menuBtn");
 
/**
 * Main navigation element shown/hidden on mobile.
 * @type {HTMLElement|null}
 */
const mainNav = document.getElementById("mainNav");
 
/**
 * Toggles the mobile navigation menu open/closed.
 * Adds or removes the `open` CSS class on `#mainNav` when `#menuBtn` is clicked.
 * Does nothing if either element is not present in the DOM.
 *
 * @listens HTMLElement#click
 */
if (menuBtn && mainNav) {
  menuBtn.addEventListener("click", () => {
    mainNav.classList.toggle("open");
  });
}
 
/**
 * Initializes copy-to-clipboard behaviour for all `.copy-btn` elements.
 * Reads the target text from the element's `data-copy` attribute.
 * Temporarily replaces the button label with "Copiado" for 1.2 seconds as feedback.
 * Silently fails if the Clipboard API is unavailable.
 *
 * @example
 * // HTML usage:
 * // <button class="copy-btn" data-copy="npm install">Copy</button>
 */
document.querySelectorAll(".copy-btn").forEach((button) => {
  button.addEventListener("click", async () => {
    const text = button.getAttribute("data-copy");
    if (!text || !navigator.clipboard) {
      return;
    }
 
    try {
      await navigator.clipboard.writeText(text);
      const prev = button.textContent;
      button.textContent = "Copiado";
      setTimeout(() => {
        button.textContent = prev;
      }, 1200);
    } catch (err) {
      console.error("No se pudo copiar el comando", err);
    }
  });
});