/**
 * Llama a la API de Gemini para generar el contenido de la newsletter a partir de una lista de noticias.
 * @param {Array<Object>} noticias - Array de objetos con {title, link, snippet}.
 * @param {string} modelName - El nombre del modelo a utilizar (ej: 'models/gemini-1.5-pro-latest').
 * @param {string} promptTemplate - La plantilla del prompt que contiene el placeholder {NOTICIAS_TEXTO}.
 * @returns {string|null} - El contenido HTML de la newsletter, o null si hay un error.
 */
function generarContenidoNewsletterConGemini(noticias, modelName, promptTemplate) {
  const API_KEY = GEMINI_API_KEY;
  const modeloSeleccionado = modelName || 'models/gemini-1.5-pro-latest';
  
  if (!modeloSeleccionado.startsWith('models/')) {
      throw new Error(`El nombre del modelo es inválido: "${modeloSeleccionado}". Debe empezar con "models/".`);
  }
  if (!promptTemplate || !promptTemplate.includes('{NOTICIAS_TEXTO}')) {
      throw new Error('El prompt es inválido. Debe ser un string y contener el placeholder {NOTICIAS_TEXTO}.');
  }

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/${modeloSeleccionado}:generateContent?key=${API_KEY}`;
  console.log(`Usando el modelo de IA: ${modeloSeleccionado}`);

  const noticiasTexto = noticias.map((n, index) => 
    `Noticia ${index + 1}:\n - Título: ${n.title}\n - Enlace: ${n.link}\n - Fragmento: ${n.snippet}`
  ).join('\n\n');

  // Reemplazamos el placeholder en la plantilla con las noticias formateadas.
  const prompt = promptTemplate.replace('{NOTICIAS_TEXTO}', noticiasTexto);
 
  const payload = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    tools: [
      {"url_context": {}},
    ]
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
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

    if (data && data.candidates && data.candidates.length > 0 &&
        data.candidates[0].content && data.candidates[0].content.parts &&
        data.candidates[0].content.parts.length > 0) {
      
      let content = data.candidates[0].content.parts[0].text;
      
      if (content.startsWith('```html')) {
        content = content.substring(7);
      }
      if (content.endsWith('```')) {
        content = content.slice(0, -3);
      }
      
      return content.trim();

    } else {
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
    
    if (data.models && data.models.length > 0) {
      return data.models.map(model => ({
        name: model.name,
        displayName: model.displayName,
        description: model.description,
        supportedMethods: model.supportedGenerationMethods || []
      }));
    } else {
      return [];
    }
  } catch (e) {
    console.error("Excepción al listar modelos de Gemini: " + e.message);
    throw e;
  }
}
