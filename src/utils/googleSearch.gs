/**
 * Busca noticias recientes para un conjunto de palabras clave utilizando los feeds RSS de Google News.
 * Al combinar keywords con 'OR' y usar frases exactas, se mejora la relevancia de los resultados.
 * @param {string[]} keywordsArray - Un array de palabras clave para buscar.
 * @returns {Array<Object>} Un array de objetos, donde cada objeto representa una noticia con título, enlace y snippet.
 */
function buscarNoticiasRecientes(keywordsArray) {
  // Aumentamos el límite para tener una mejor selección. La IA luego resumirá las más importantes.
  const MAX_ARTICLES_TO_RETURN = 100; 
  const articles = [];
  const uniqueUrls = new Set();
  const language = 'es,en'; // Lenguaje de las noticias.
  

  if (!keywordsArray || keywordsArray.length === 0) {
    return [];
  }

  // 1. Preparamos las palabras clave para una búsqueda más precisa.
  //    - Las frases con espacios se encierran entre comillas para búsquedas exactas.
  const processedKeywords = keywordsArray.map(kw => {
    if (kw.includes(' ')) {
      return `"${kw.trim()}"`; // Encerrar frases en comillas
    }
    return kw.trim();
  });

  // 2. Creamos una única consulta uniendo las palabras clave con 'OR'.
  //    Esto permite a Google News encontrar los artículos más relevantes que cubran estos temas.
  //    Ejemplo: ("inteligencia artificial" OR "google apps script") when:7d
  const combinedKeywordsQuery = processedKeywords.join(' OR ');
  const finalQuery = `(${combinedKeywordsQuery}) when:7d`;

  // 3. Construimos la URL del feed RSS de Google News con parámetros de idioma y país para enfocar los resultados.
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(finalQuery)}&hl=${language}`;
  
  console.log(`Buscando noticias con la URL: ${url}`);

  try {
    // Usamos muteHttpExceptions para capturar cualquier error de red y manejarlo.
    const response = UrlFetchApp.fetch(url, { 'muteHttpExceptions': true });
    const responseCode = response.getResponseCode();
    const contentText = response.getContentText();

    if (responseCode !== 200) {
      throw new Error(`Error al obtener el feed RSS de Google News (Código: ${responseCode}). Consulta: ${finalQuery}`);
    }

    // Parseamos el contenido XML de la respuesta.
    const document = XmlService.parse(contentText);
    const root = document.getRootElement();
    const channel = root.getChild('channel');
    if (!channel) return []; // Si el feed está mal formado o no tiene canal.
    const items = channel.getChildren('item');

    for (const item of items) {
      const link = item.getChild('link').getText();
     
      // Evitar duplicados.
      if (!uniqueUrls.has(link)) {
        articles.push({
          link: link,
          title: item.getChild('title').getText(),
          snippet: item.getChild('description').getText() 
        });
        uniqueUrls.add(link);
      }
    }
  } catch (e) {
    console.error(`Error al procesar el feed de noticias para la consulta "${finalQuery}": ${e.message}`);
    // Re-lanzamos el error para que la ejecución manual se detenga y muestre el problema en la UI.
    throw new Error(`Fallo en la búsqueda de noticias: ${e.message}`);
  }
  
  // Devolvemos solo el número máximo de artículos configurado.
  const finalArticles = articles.slice(0, MAX_ARTICLES_TO_RETURN);
  console.log(`Se encontraron ${articles.length} artículos en total. Se devolverán hasta ${MAX_ARTICLES_TO_RETURN} artículos.`);
  
  return finalArticles;
}

function test(){
  // Prueba con múltiples keywords, incluyendo una frase.
  buscarNoticiasRecientes(['inteligencia artificial', 'Google Apps Script']);
}