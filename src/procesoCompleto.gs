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

  // 1. Obtener Keywords
  const keywordsString = obtenerKeywordsActuales();
  if (!keywordsString) {
    console.warn("No hay palabras clave configuradas. El proceso no puede continuar.");
    // No lanzamos un error para que el trigger semanal no falle y envíe notificaciones,
    // simplemente se detiene silenciosamente.
    return "No hay palabras clave configuradas. Proceso detenido.";
  }
  const keywordsArray = keywordsString.split(',').map(k => k.trim()).filter(Boolean);

  // 2. Buscar Noticias
  const noticias = buscarNoticiasRecientes(keywordsArray);
  if (noticias.length === 0) {
    console.log("No se encontraron noticias nuevas esta semana para las keywords configuradas. Proceso finalizado.");
    return "No se encontraron noticias nuevas. No se enviará la newsletter.";
  }
  
  console.log(`Se encontraron ${noticias.length} noticias. Procediendo a generar contenido con Gemini.`);

  // 3. Generar Contenido con Gemini
  // La función generarContenidoNewsletterConGemini debería estar implementada en src/utils/gemini.gs
  const contenidoNewsletter = generarContenidoNewsletterConGemini(noticias);
  
  if (!contenidoNewsletter || contenidoNewsletter.trim() === "") {
      throw new Error("Gemini no devolvió contenido para la newsletter. Revisa la implementación o la API Key.");
  }

  console.log("Contenido de la newsletter generado. Procediendo al envío.");

  // 4. Enviar Newsletter
  enviarNewsletter(contenidoNewsletter, noticias);
  
  console.log("Proceso completo de newsletter finalizado con éxito.");
  return "¡Proceso completo ejecutado! La newsletter ha sido generada y enviada.";
}