/**
 * PASO 1: Obtiene las palabras clave.
 * Esta es la primera función llamada por la interfaz en el proceso manual.
 * @returns {Array<string>} Un array de palabras clave.
 * @throws {Error} Si no hay palabras clave configuradas.
 */
function iniciarProcesoManual_Paso1_GetKeywords() {
  console.log("Paso 1 Manual: Obteniendo keywords...");
  const keywordsString = obtenerKeywordsActuales();
  if (!keywordsString) {
    throw new Error("No hay palabras clave configuradas. El proceso no puede continuar.");
  }
  const keywordsArray = keywordsString.split(',').map(k => k.trim()).filter(Boolean);
  console.log(`Paso 1 Manual completado. Keywords encontradas: ${keywordsArray.join(', ')}`);
  return keywordsArray;
}

/**
 * PASO 2: Busca noticias para las palabras clave dadas.
 * @param {Array<string>} keywordsArray - Las palabras clave para buscar.
 * @returns {Array<Object>} Un array de objetos de noticias.
 * @throws {Error} Si no se encuentran noticias.
 */
function iniciarProcesoManual_Paso2_SearchNews(keywordsArray) {
  console.log("Paso 2 Manual: Buscando noticias...");
  const noticias = buscarNoticiasRecientes(keywordsArray);
  if (noticias.length === 0) {
    // Esto es un error para el proceso manual, ya que el usuario espera un resultado.
    throw new Error("No se encontraron noticias nuevas esta semana para las keywords configuradas.");
  }
  console.log(`Paso 2 Manual completado. Se encontraron ${noticias.length} noticias.`);
  return noticias;
}

/**
 * PASO 3: Genera el contenido de la newsletter usando Gemini.
 * @param {Array<Object>} noticias - La lista de noticias encontradas.
 * @returns {{contenidoNewsletter: string, noticiasCompletas: Array<Object>}} Un objeto con el contenido y la lista de noticias.
 * @throws {Error} Si Gemini no devuelve contenido.
 */
function iniciarProcesoManual_Paso3_GenerateContent(noticias) {
  console.log("Paso 3 Manual: Generando contenido con Gemini...");
  const contenidoNewsletter = generarContenidoNewsletterConGemini(noticias);
  if (!contenidoNewsletter || contenidoNewsletter.trim() === "") {
    throw new Error("La IA (Gemini) no devolvió contenido para la newsletter. Revisa la API Key o el servicio.");
  }
  console.log("Paso 3 Manual completado. Contenido generado.");
  // Devolvemos tanto el contenido como las noticias originales para el siguiente paso.
  return { contenidoNewsletter: contenidoNewsletter, noticiasCompletas: noticias };
}

/**
 * PASO 4: Envía la newsletter a la lista de correos.
 * @param {Object} data - Un objeto que contiene {contenidoNewsletter: string, noticiasCompletas: Array<Object>}.
 * @returns {string} Mensaje de éxito final.
 */
function iniciarProcesoManual_Paso4_SendEmails(data) {
  console.log("Paso 4 Manual: Enviando la newsletter...");
  enviarNewsletter(data.contenidoNewsletter, data.noticiasCompletas);
  console.log("Paso 4 Manual completado. Newsletter enviada.");
  return "¡Proceso completo ejecutado! La newsletter ha sido generada y enviada.";
}
