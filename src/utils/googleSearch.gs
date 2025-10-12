/**
 * Busca noticias recientes para un conjunto de palabras clave utilizando la API de Google Custom Search.
 * @param {string[]} keywordsArray - Un array de palabras clave para buscar.
 * @returns {Array<Object>} Un array de objetos, donde cada objeto representa una noticia con título, enlace y snippet.
 */
function buscarNoticiasRecientes(keywordsArray) {
  const API_KEY = GEMINI_API_KEY; // Reutilizamos la misma API key
  const SEARCH_ENGINE_ID = SEARCH_ENGINE_ID_CX; // Obtenido desde config.gs
  const BASE_URL = "https://www.googleapis.com/customsearch/v1";

  if (!SEARCH_ENGINE_ID || SEARCH_ENGINE_ID === 'TU_SEARCH_ENGINE_ID_CX') {
    throw new Error("El ID del Motor de Búsqueda Programable (CX) no está configurado en src/config.gs");
  }

  let articles = [];
  const uniqueUrls = new Set();

  for (const keyword of keywordsArray) {
    // CORRECCIÓN: La API de Google Custom Search requiere el parámetro 'sort=date'
    // cuando se utiliza 'dateRestrict' para filtrar por fecha. La ausencia de este
    // parámetro causa el error "400 - Invalid Argument".
    const url = `${BASE_URL}?key=${API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(keyword)}&dateRestrict=w1&sort=date`;
    
    try {
      // Usamos muteHttpExceptions para capturar el error completo en lugar de que el script se detenga.
      const options = {
        'muteHttpExceptions': true
      };
      const response = UrlFetchApp.fetch(url, options);
      const responseCode = response.getResponseCode();
      const contentText = response.getContentText();

      // Si la respuesta no es exitosa (código 200), lanzamos un error detallado.
      if (responseCode !== 200) {
        let errorMessage = `Error al llamar a la API de Búsqueda para "${keyword}" (Código: ${responseCode}).`;
        let apiMessage = '';
        try {
          const errorData = JSON.parse(contentText);
          if (errorData.error && errorData.error.message) {
            apiMessage = errorData.error.message;
            errorMessage += ` Mensaje: ${apiMessage}`;
          }
        } catch (e) {
          // El texto de respuesta no era JSON, lo añadimos tal cual.
          errorMessage += ` Respuesta: ${contentText}`;
        }
        
        // Ayuda contextual para el error 400
        if (responseCode === 400 && apiMessage.includes('invalid argument')) {
            errorMessage += ' --- POSIBLE SOLUCIÓN: Este error también puede ocurrir si tu "Motor de Búsqueda Programable" no está configurado para "Buscar en toda la web". Por favor, verifica su configuración en el panel de control de Google.';
        }
        
        // Lanzamos el error para que sea capturado por la interfaz de usuario.
        throw new Error(errorMessage);
      }

      const results = JSON.parse(contentText);

      if (results.items) {
        results.items.forEach(item => {
          // Evitar duplicados si diferentes keywords devuelven la misma noticia
          if (!uniqueUrls.has(item.link)) {
            articles.push({
              title: item.title,
              link: item.link,
              snippet: item.snippet
            });
            uniqueUrls.add(item.link);
          }
        });
      }
    } catch (e) {
      console.error(`Error al buscar noticias para la keyword "${keyword}": ${e.message}`);
      // Re-lanzamos el error para que la ejecución manual se detenga y muestre el problema en la UI.
      throw new Error(`Fallo en la búsqueda para la keyword "${keyword}": ${e.message}`);
    }
  }
  
  console.log(`Se encontraron ${articles.length} artículos únicos.`);
  return articles;
}

function testBuscar() {
  buscarNoticiasRecientes(['AI']);
}
