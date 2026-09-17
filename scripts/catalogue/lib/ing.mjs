/** @param {string} ref @param {string} name @param {string} type @param {number} amount @param {string} [unit] */
export function ing(ref, name, type, amount, unit = "ml") {
  return { ref, name, type, amount, unit };
}
