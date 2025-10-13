/**
 * Orquesta el proceso completo de la newsletter:
 * 1. Obtiene las keywords.
 * 2. Busca noticias recientes para esas keywords.
 * 3. Usa Gemini para generar el contenido de la newsletter.
 * 4. Envía la newsletter a la lista de correos.
 * Esta función es llamada tanto por el trigger semanal como por la acción manual.
 */
function ejecutarProcesoCompleto() {
  console.log("Iniciando el proceso completo de generación de newsletter...");

  // 1. Obtener Configuración completa
  const config = obtenerConfiguracion();
  if (!config.keywords) {
    console.warn("No hay palabras clave configuradas. El proceso no puede continuar.");
    return "No hay palabras clave configuradas. Proceso detenido.";
  }
  if (!config.model) {
    console.warn("No hay un modelo de IA configurado. El proceso no puede continuar.");
    return "No hay un modelo de IA configurado. Proceso detenido.";
  }
  if (!config.prompt) {
    console.warn("No hay un prompt de IA configurado. El proceso no puede continuar.");
    return "No hay un prompt de IA configurado. Proceso detenido.";
  }
  const keywordsArray = config.keywords.split(',').map(k => k.trim()).filter(Boolean);

  // 2. Buscar Noticias
  const noticias = buscarNoticiasRecientes(keywordsArray);
  if (noticias.length === 0) {
    console.log("No se encontraron noticias nuevas esta semana para las keywords configuradas. Proceso finalizado.");
    return "No se encontraron noticias nuevas. No se enviará la newsletter.";
  }
  
  console.log(`Se encontraron ${noticias.length} noticias. Procediendo a generar contenido con Gemini.`);

  // 3. Generar Contenido con Gemini, pasando el modelo y el prompt seleccionados
  const contenidoNewsletter = generarContenidoNewsletterConGemini(noticias, config.model, config.prompt);
  
  if (!contenidoNewsletter || contenidoNewsletter.trim() === "") {
      throw new Error("Gemini no devolvió contenido para la newsletter. Revisa la implementación, la API Key o el modelo seleccionado.");
  }

  console.log("Contenido de la newsletter generado. Procediendo al envío.");

  // 4. Enviar Newsletter
  enviarNewsletter(contenidoNewsletter, noticias);
  
  console.log("Proceso completo de newsletter finalizado con éxito.");
  return "¡Proceso completo ejecutado! La newsletter ha sido generada y enviada.";
}
