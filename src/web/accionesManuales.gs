/**
 * PASO 1: Obtiene la configuración completa (keywords, modelo y prompt).
 * Esta es la primera función llamada por la interfaz en el proceso manual.
 * @returns {Object} Un objeto de configuración {keywords: string, model: string, prompt: string}.
 * @throws {Error} Si no hay configuración guardada.
 */
function iniciarProcesoManual_Paso1_GetConfig() {
  console.log("Paso 1 Manual: Obteniendo configuración...");
  const config = obtenerConfiguracion();
  if (!config.keywords) {
    throw new Error("No hay palabras clave configuradas. El proceso no puede continuar.");
  }
  if (!config.model) {
    throw new Error("No hay un modelo de IA configurado. Guarda la configuración primero.");
  }
   if (!config.prompt) {
    throw new Error("No hay un prompt de IA configurado. Guarda la configuración primero.");
  }
  console.log(`Paso 1 Manual completado. Configuración encontrada: Keywords: "${config.keywords}", Modelo: "${config.model}"`);
  return config;
}

/**
 * PASO 2: Busca noticias para las palabras clave dadas.
 * @param {Object} config - El objeto de configuración del paso 1.
 * @returns {Object} Un objeto con las noticias encontradas y la configuración original.
 * @throws {Error} Si no se encuentran noticias.
 */
function iniciarProcesoManual_Paso2_SearchNews(config) {
  console.log("Paso 2 Manual: Buscando noticias...");
  const keywordsArray = config.keywords.split(',').map(k => k.trim()).filter(Boolean);
  const noticias = buscarNoticiasRecientes(keywordsArray);
  if (noticias.length === 0) {
    // Esto es un error para el proceso manual, ya que el usuario espera un resultado.
    throw new Error("No se encontraron noticias nuevas esta semana para las keywords configuradas.");
  }
  console.log(`Paso 2 Manual completado. Se encontraron ${noticias.length} noticias.`);
  // Pasamos la config y las noticias al siguiente paso.
  return { noticias: noticias, config: config };
}

/**
 * PASO 3: Genera el contenido de la newsletter usando Gemini.
 * @param {Object} data - Objeto del paso 2 con {noticias, config}.
 * @returns {{contenidoNewsletter: string, noticiasCompletas: Array<Object>}} Un objeto con el contenido y la lista de noticias.
 * @throws {Error} Si Gemini no devuelve contenido.
 */
function iniciarProcesoManual_Paso3_GenerateContent(data) {
  console.log("Paso 3 Manual: Generando contenido con Gemini...");
  const { noticias, config } = data;
  const contenidoNewsletter = generarContenidoNewsletterConGemini(noticias, config.model, config.prompt);
  if (!contenidoNewsletter || contenidoNewsletter.trim() === "") {
    throw new Error("La IA (Gemini) no devolvió contenido para la newsletter. Revisa la API Key o el modelo seleccionado.");
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
