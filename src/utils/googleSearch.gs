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
    // dateRestrict=w1 busca en los últimos 7 días.
    const url = `${BASE_URL}?key=${API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(keyword)}&dateRestrict=w1`;
    
    try {
      const response = UrlFetchApp.fetch(url);
      const results = JSON.parse(response.getContentText());

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
      // Continuamos con la siguiente keyword en lugar de detener todo el proceso
    }
  }
  
  console.log(`Se encontraron ${articles.length} artículos únicos.`);
  return articles;
}