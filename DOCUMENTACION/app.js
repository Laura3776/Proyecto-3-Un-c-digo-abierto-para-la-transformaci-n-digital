/**
 * @fileoverview Scroll-spy TOC controller for SmartLog Monitor documentation page.
 * Highlights the active section link in the sidebar as the user scrolls.
 * Used exclusively by DOCUMENTATION/documentacion.html.
 * @module docs/app
 */
 
/**
 * All section elements tracked for scroll-spy.
 * @type {NodeListOf<HTMLElement>}
 */
const sections = document.querySelectorAll(".content .card");
 
/**
 * All anchor links inside the sidebar TOC.
 * @type {NodeListOf<HTMLAnchorElement>}
 */
const tocLinks = document.querySelectorAll("#docToc a");
 
/**
 * Updates the active TOC link based on the current scroll position.
 * Highlights the link corresponding to the section nearest the top of the viewport.
 *
 * @returns {void}
 */
const setActiveLink = () => {
  let currentId = sections[0]?.id || "";
 
  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= 140) currentId = section.id;
  });
 
  tocLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${currentId}`;
    link.classList.toggle("active", isActive);
  });
};
 
/** Updates the active TOC link on every scroll event. */
window.addEventListener("scroll", setActiveLink);
 
/** Sets initial active link on page load. */
window.addEventListener("load", setActiveLink);
 
/**
 * Print button — triggers the browser print dialog.
 * @type {HTMLElement|null}
 */
const printBtn = document.getElementById("printBtn");
if (printBtn) {
  printBtn.addEventListener("click", () => window.print());
}