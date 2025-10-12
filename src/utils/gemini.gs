/**
 * Llama a la API de Gemini para resumir el contenido de una URL.
 * @param {string} url - La URL a resumir.
 * @returns {string} - El resumen del contenido.
 */
function resumirContenidoConGemini(url) {
  // La clave de la API ahora se obtiene desde el fichero src/config.gs
  const API_KEY = GEMINI_API_KEY;
  // ACTUALIZACIÓN: Se cambia 'gemini-pro' por 'gemini-1.0-pro' que es un modelo más estable y común.
  // El error original indicaba que 'gemini-pro' no se encontraba en la versión 'v1beta'.
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${API_KEY}`;

  const prompt = `Por favor, resume el contenido de la siguiente URL en un párrafo conciso: ${url}`;
  
  const payload = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }]
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  };

  const response = UrlFetchApp.fetch(API_URL, options);
  const data = JSON.parse(response.getContentText());
  return data.candidates[0].content.parts[0].text;
}

/**
 * Llama a la API de Gemini para generar el contenido de la newsletter a partir de una lista de noticias.
 * @param {Array<Object>} noticias - Array de objetos con {title, link, snippet}.
 * @returns {string|null} - El contenido HTML de la newsletter, o null si hay un error.
 */
function generarContenidoNewsletterConGemini(noticias) {
  const API_KEY = GEMINI_API_KEY;
  // ACTUALIZACIÓN: Se cambia 'gemini-pro' por 'gemini-1.0-pro' para solucionar el error "model not found".
  // La nueva función 'listarModelosGemini' permite al usuario ver qué modelos tiene disponibles.
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${API_KEY}`;

  // 1. Formatear las noticias para que la IA las entienda fácilmente.
  const noticiasTexto = noticias.map((n, index) => 
    `Noticia ${index + 1}:\n - Título: ${n.title}\n - Enlace: ${n.link}\n - Fragmento: ${n.snippet}`
  ).join('\n\n');

  // 2. Crear un prompt detallado pidiendo una newsletter en HTML.
  const prompt = `
    Actúa como un experto redactor de newsletters.
    A partir de la siguiente lista de noticias, crea un borrador de newsletter en formato HTML.
    La newsletter debe tener:
    1.  Un título principal atractivo dentro de una etiqueta <h1>.
    2.  Una breve introducción general que enganche al lector sobre los temas de la semana.
    3.  Para cada noticia, crea una sección con un subtítulo (<h3>), un resumen conciso y bien redactado del contenido (basado en el título y el fragmento), y un enlace claro para "Leer más" que apunte a la URL original. No inventes información, básate en los datos proporcionados.
    4.  Una breve conclusión o despedida.
    5.  Utiliza etiquetas HTML semánticas como <p>, <ul>, <li>, y <a>. No incluyas las etiquetas <html>, <head>, o <body>. Solo el contenido interno para un email.

    Aquí están las noticias para analizar:
    ---
    ${noticiasTexto}
    ---
  `;

  // 3. Configurar la llamada a la API
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true // Muy importante para capturar errores de la API
  };

  try {
    const response = UrlFetchApp.fetch(API_URL, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    if (responseCode !== 200) {
      console.error(`Error en la llamada a Gemini API (Código: ${responseCode}): ${responseText}`);
      return null;
    }

    const data = JSON.parse(responseText);

    // 4. Extraer el contenido de forma segura, verificando que la respuesta es válida.
    if (data && data.candidates && data.candidates.length > 0 &&
        data.candidates[0].content && data.candidates[0].content.parts &&
        data.candidates[0].content.parts.length > 0) {
      
      let content = data.candidates[0].content.parts[0].text;
      
      // A veces la IA envuelve el HTML en bloques de código markdown, los limpiamos.
      if (content.startsWith('```html')) {
        content = content.substring(7);
      }
      if (content.endsWith('```')) {
        content = content.slice(0, -3);
      }
      
      return content.trim();

    } else {
      // Esto ocurre si el contenido fue bloqueado por seguridad o la respuesta vino vacía.
      console.warn("La respuesta de Gemini no contenía candidatos válidos. Esto puede deberse a filtros de seguridad. Respuesta completa:", responseText);
      return null;
    }
  } catch (e) {
    console.error("Excepción al llamar o procesar la respuesta de Gemini: " + e.message);
    return null;
  }
}


/**
 * Llama a la API de Gemini para listar los modelos disponibles.
 * Esto es útil para depurar si el modelo por defecto no funciona.
 * @returns {Array<Object>} Una lista de objetos, donde cada objeto representa un modelo disponible.
 */
function listarModelosGemini() {
  const API_KEY = GEMINI_API_KEY;
  if (!API_KEY || API_KEY === 'YOUR_GEMINI_API_KEY_GOES_HERE') {
      throw new Error("La API Key de Gemini no está configurada en src/config.gs");
  }
  // Este es el endpoint para listar modelos.
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
  
  const options = {
    method: 'get',
    contentType: 'application/json',
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(API_URL, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    if (responseCode !== 200) {
      console.error(`Error al listar modelos de Gemini (Código: ${responseCode}): ${responseText}`);
      throw new Error(`Error al contactar la API de Gemini para listar modelos (Código: ${responseCode}). Revisa tu API Key y la consola para más detalles. Respuesta: ${responseText}`);
    }

    const data = JSON.parse(responseText);
    
    // Formateamos la respuesta para que sea más útil en el front-end.
    if (data.models && data.models.length > 0) {
      return data.models.map(model => ({
        name: model.name,
        displayName: model.displayName,
        description: model.description,
        supportedMethods: model.supportedGenerationMethods || [] // Asegurarnos de que sea un array
      }));
    } else {
      return [];
    }
  } catch (e) {
    console.error("Excepción al listar modelos de Gemini: " + e.message);
    throw e; // Re-lanzar para que la UI lo muestre
  }
}
