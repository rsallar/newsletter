/**
 * Orquesta el proceso completo para UNA newsletter específica.
 * Esta función es llamada por el trigger o por una acción manual.
 * @param {Object} config - El objeto de configuración completo de la newsletter.
 */
function ejecutarProcesoParaNewsletter(config) {
  console.log(`Iniciando proceso para newsletter: "${config.name}"`);

  if (!config.keywords) {
    console.warn(`Newsletter "${config.name}" no tiene keywords. Proceso detenido.`);
    return;
  }
  if (!config.model) {
    console.warn(`Newsletter "${config.name}" no tiene modelo de IA. Proceso detenido.`);
    return;
  }

  const keywordsArray = config.keywords.split(',').map(k => k.trim()).filter(Boolean);
  const noticias = buscarNoticiasRecientes(keywordsArray);
  
  if (noticias.length === 0) {
    console.log(`No se encontraron noticias para "${config.name}". No se enviará newsletter.`);
    return;
  }
  
  console.log(`Se encontraron ${noticias.length} noticias para "${config.name}". Generando contenido.`);

  const contenidoNewsletter = generarContenidoNewsletterConGemini(noticias, config.model, config.prompt, keywordsArray);
  
  if (!contenidoNewsletter || contenidoNewsletter.trim() === "") {
      throw new Error(`Gemini no devolvió contenido para la newsletter "${config.name}".`);
  }

  console.log(`Contenido generado. Enviando newsletter "${config.name}".`);

  enviarNewsletter(contenidoNewsletter, noticias, config.id);
  
  console.log(`Proceso para "${config.name}" finalizado con éxito.`);
}
