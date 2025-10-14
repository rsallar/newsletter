/**
 * Busca noticias recientes para un conjunto de palabras clave utilizando los feeds RSS de Google News.
 * Al combinar keywords con 'OR' y usar frases exactas, se mejora la relevancia de los resultados.
 * Incluye reintentos con backoff exponencial para manejar errores temporales del servidor (como 503).
 * @param {string[]} keywordsArray - Un array de palabras clave para buscar.
 * @returns {Array<Object>} Un array de objetos, donde cada objeto representa una noticia con título, enlace y snippet.
 */
function buscarNoticiasRecientes(keywordsArray) {
  const MAX_ARTICLES_TO_RETURN = 100;
  const language = 'es,en';
  const MAX_RETRIES = 4; // Intentar una vez + 3 reintentos
  const INITIAL_BACKOFF_MS = 1500; // Empezar con 1.5 segundos

  if (!keywordsArray || keywordsArray.length === 0) {
    return [];
  }

  const processedKeywords = keywordsArray.map(kw => kw.includes(' ') ? `"${kw.trim()}"` : kw.trim());
  const combinedKeywordsQuery = processedKeywords.join(' OR ');
  const finalQuery = `(${combinedKeywordsQuery}) when:7d`;
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(finalQuery)}&hl=${language}`;
  
  console.log(`Buscando noticias con la URL: ${url}`);
  
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = UrlFetchApp.fetch(url, { 'muteHttpExceptions': true });
      const responseCode = response.getResponseCode();
      const contentText = response.getContentText();

      if (responseCode === 200) {
        console.log(`Búsqueda de noticias exitosa en el intento ${attempt}.`);
        const articles = [];
        const uniqueUrls = new Set();
        const document = XmlService.parse(contentText);
        const root = document.getRootElement();
        const channel = root.getChild('channel');
        if (!channel) return [];
        const items = channel.getChildren('item');

        for (const item of items) {
          const link = item.getChild('link').getText();
          if (!uniqueUrls.has(link)) {
            articles.push({
              link: link,
              title: item.getChild('title').getText(),
              snippet: item.getChild('description').getText() 
            });
            uniqueUrls.add(link);
          }
        }
        
        const finalArticles = articles.slice(0, MAX_ARTICLES_TO_RETURN);
        console.log(`Se encontraron ${articles.length} artículos en total. Se devolverán hasta ${MAX_ARTICLES_TO_RETURN} artículos.`);
        return finalArticles; // Éxito, salir de la función
      }

      // Si es un error de servidor (5xx) lo consideramos reintentable
      if (responseCode >= 500 && responseCode < 600) {
        lastError = new Error(`El servidor de Google News respondió con un error temporal (Código: ${responseCode}).`);
        console.warn(`Intento ${attempt}/${MAX_RETRIES} falló. ${lastError.message}`);
      } else {
        // Otros errores (ej. 4xx) son permanentes, no reintentar.
        throw new Error(`Error no recuperable al obtener el feed RSS de Google News (Código: ${responseCode}). Consulta: ${finalQuery}`);
      }
    } catch (e) {
      lastError = e; // Guardar el error para el mensaje final
      console.error(`Intento ${attempt}/${MAX_RETRIES} falló con una excepción: ${e.message}`);
    }

    // Si no es el último intento, esperar antes de reintentar
    if (attempt < MAX_RETRIES) {
      const waitTime = INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 1000);
      console.log(`Esperando ${waitTime}ms antes del siguiente intento...`);
      Utilities.sleep(waitTime);
    }
  }

  // Si el bucle termina, todos los intentos fallaron.
  console.error(`Todos los ${MAX_RETRIES} intentos para buscar noticias fallaron.`);
  throw new Error(`Fallo en la búsqueda de noticias: ${lastError.message}`);
}

function test(){
  // Prueba con múltiples keywords, incluyendo una frase.
  buscarNoticiasRecientes(['inteligencia artificial', 'Google Apps Script']);
}
