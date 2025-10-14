    /**
     * PASO 1: Obtiene la configuración para una newsletter específica.
     * @param {string} newsletterId - El ID de la newsletter a ejecutar.
     * @returns {Object} El objeto de configuración.
     */
    function iniciarProcesoManual_Paso1_GetConfig(newsletterId) {
      console.log(`Paso 1 Manual (ID: ${newsletterId}): Obteniendo configuración...`);
      const config = getNewsletterConfig(newsletterId);
      if (!config.keywords) throw new Error("No hay palabras clave configuradas para esta newsletter.");
      if (!config.model) throw new Error("No hay un modelo de IA configurado. Edita y guarda la configuración primero.");
      
      console.log(`Paso 1 Manual completado. Configuración encontrada para "${config.name}"`);
      return config;
    }
    
    /**
     * PASO 2: Busca noticias para las palabras clave dadas.
     * @param {Object} config - El objeto de configuración del paso 1.
     * @returns {Object} Un objeto con las noticias encontradas y la configuración original.
     */
    function iniciarProcesoManual_Paso2_SearchNews(config) {
      console.log(`Paso 2 Manual (ID: ${config.id}): Buscando noticias...`);
      const keywordsArray = config.keywords.split(',').map(k => k.trim()).filter(Boolean);
      const noticias = buscarNoticiasRecientes(keywordsArray);
      if (noticias.length === 0) {
        throw new Error("No se encontraron noticias nuevas para las keywords configuradas.");
      }
      console.log(`Paso 2 Manual completado. Se encontraron ${noticias.length} noticias.`);
      return { noticias: noticias, config: config };
    }
    
    /**
     * PASO 3: Genera el contenido de la newsletter usando Gemini.
     * @param {Object} data - Objeto del paso 2 con {noticias, config}.
     * @returns {Object} Un objeto con el contenido, la lista de noticias y la configuración.
     */
    function iniciarProcesoManual_Paso3_GenerateContent(data) {
      console.log(`Paso 3 Manual (ID: ${data.config.id}): Generando contenido...`);
      const { noticias, config } = data;
      const keywordsArray = (config.keywords || '').split(',').map(k => k.trim()).filter(Boolean);
    
      const contenidoNewsletter = generarContenidoNewsletterConGemini(noticias, config.model, config.prompt, keywordsArray);
      
      if (!contenidoNewsletter || contenidoNewsletter.trim() === "") {
        throw new Error("La IA (Gemini) no devolvió contenido para la newsletter.");
      }
      console.log("Paso 3 Manual completado. Contenido generado.");
      return { contenidoNewsletter: contenidoNewsletter, noticiasCompletas: noticias, config: config };
    }
    
    /**
     * PASO 4: Envía la newsletter a la lista de correos.
     * @param {Object} data - Un objeto que contiene {contenidoNewsletter, noticiasCompletas, config}.
     * @returns {string} Mensaje de éxito final.
     */
    function iniciarProcesoManual_Paso4_SendEmails(data) {
      console.log(`Paso 4 Manual (ID: ${data.config.id}): Enviando la newsletter...`);
      // Se captura el resultado de enviarNewsletter, que ahora puede ser un resumen o lanzar un error.
      const resultadoEnvio = enviarNewsletter(data.contenidoNewsletter, data.noticiasCompletas, data.config.id);
      
      console.log("Paso 4 Manual completado. Newsletter enviada.");
      
      // Se devuelve un mensaje final más informativo para la interfaz de usuario.
      return `¡Proceso completo ejecutado! ${resultadoEnvio}`;
    }
    
    
    /**
     * Función de prueba para ejecutar el flujo completo desde el editor de Apps Script.
     * Es necesario reemplazar 'TU_ID_DE_PRUEBA' con un ID real de una newsletter existente.
     * @param {string} [id='TU_ID_DE_PRUEBA'] - El ID de la newsletter a probar.
     */
    function testProcesoCompleto(id = 'jnsacweco') { // Puedes reemplazar 'jnsacweco' por otro ID válido para tus pruebas
      if (!id) {
        console.error("Proporciona un ID de newsletter válido para probar el flujo.");
        return;
      }
      
      console.log(`--- INICIANDO TEST MANUAL PARA ID: ${id} ---`);
      
      try {
        // Paso 1
        const config = iniciarProcesoManual_Paso1_GetConfig(id);
        
        // Paso 2
        const dataPaso2 = iniciarProcesoManual_Paso2_SearchNews(config);
        
        // Paso 3
        const dataPaso3 = iniciarProcesoManual_Paso3_GenerateContent(dataPaso2);
        
        // Paso 4
        iniciarProcesoManual_Paso4_SendEmails(dataPaso3);
        
        console.log(`--- TEST MANUAL PARA ID: ${id} COMPLETADO EXITOSAMENTE ---`);
      } catch (e) {
        console.error(`--- TEST MANUAL PARA ID: ${id} FALLÓ: ${e.message} ---`);
        console.error(e.stack); // Muestra más detalles del error
      }
    }
