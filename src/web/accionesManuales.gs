/**
 * Ejecuta la función de recopilación de contenido y devuelve un mensaje.
 * Esta es una función 'wrapper' para ser llamada desde la interfaz web.
 * @returns {string} Mensaje de éxito.
 */
function ejecutarRecopilacionManual() {
  try {
    recopilarContenido();
    return "¡Éxito! La recopilación de contenido se ha completado. El nuevo contenido está en la hoja de cálculo.";
  } catch (e) {
    console.error("Error en la recopilación manual: " + e.message);
    throw new Error("Ocurrió un error durante la recopilación: " + e.message);
  }
}

/**
 * Ejecuta la función de generación y envío de la newsletter y devuelve un mensaje.
 * Esta es una función 'wrapper' para ser llamada desde la interfaz web.
 * @returns {string} Mensaje de éxito.
 */
function ejecutarGeneracionNewsletterManual() {
  try {
    generarNewsletter();
    return "¡Éxito! La newsletter ha sido generada y enviada a la lista de correos.";
  } catch (e) {
    console.error("Error en la generación/envío manual: " + e.message);
    throw new Error("Ocurrió un error durante la generación o el envío: " + e.message);
  }
}