/**
 * Guarda la configuración (palabras clave, modelo de IA y prompt) y configura el trigger.
 * @param {Object} config - Un objeto con {keywords: string, model: string, prompt: string}.
 * @returns {Object} Un objeto con un mensaje de éxito e instrucciones para el usuario.
 */
function guardarConfiguracion(config) {
  const { keywords, model, prompt } = config;
  if (!model) {
    throw new Error("Se debe seleccionar un modelo de IA para guardar la configuración.");
  }
  if (!prompt || prompt.trim() === "") {
    throw new Error("El campo de prompt para la IA no puede estar vacío.");
  }

  const spreadsheet = getProjectSpreadsheet();
  const sheet = getSheet(spreadsheet, 'Configuracion');
  
  sheet.clear(); 
  sheet.getRange(1, 1).setValue('Keywords');
  sheet.getRange(1, 2).setValue(keywords || '');
  sheet.getRange(2, 1).setValue('AI_Model');
  sheet.getRange(2, 2).setValue(model);
  sheet.getRange(3, 1).setValue('Prompt');
  sheet.getRange(3, 2).setValue(prompt);


  const keywordsArray = (keywords || '').split(',').map(k => k.trim()).filter(Boolean);
  
  if (keywordsArray.length > 0) {
    configurarTriggerUnico();
  } else {
    eliminarTriggers(); 
  }

  const successMessage = `¡Éxito! Configuración guardada. El activador semanal ha sido ${keywordsArray.length > 0 ? 'creado o actualizado' : 'eliminado'}.`;
  
  return {
    successMessage: successMessage,
    instructions: "El sistema ahora buscará noticias y enviará la newsletter una vez por semana (Viernes a las 9 AM)."
  };
}


/**
 * Elimina una palabra clave específica de la configuración.
 * @param {string} keywordToDelete La palabra clave a eliminar.
 * @returns {string} Un mensaje de confirmación para el usuario.
 */
function eliminarKeyword(keywordToDelete) {
  const spreadsheet = getProjectSpreadsheet();
  const sheet = getSheet(spreadsheet, 'Configuracion');
  const currentKeywords = sheet.getRange(1, 2).getValue();
  
  let keywordsArray = currentKeywords.split(',').map(k => k.trim());
  
  const initialCount = keywordsArray.length;
  keywordsArray = keywordsArray.filter(k => k.toLowerCase() !== keywordToDelete.toLowerCase());
  
  if (keywordsArray.length === initialCount) {
    throw new Error(`La palabra clave "${keywordToDelete}" no se encontró.`);
  }

  const newKeywords = keywordsArray.join(', ');
  sheet.getRange(1, 2).setValue(newKeywords);
  
  // Si nos quedamos sin keywords, eliminamos el trigger.
  if (keywordsArray.filter(Boolean).length === 0) {
    eliminarTriggers();
  }

  return `Palabra clave "${keywordToDelete}" eliminada.`;
}


/**
 * Obtiene la configuración guardada actualmente.
 * @returns {Object} Un objeto con {keywords: string, model: string, prompt: string}, o valores por defecto.
 */
function obtenerConfiguracion() {
  const DEFAULT_PROMPT = `
Actúa como un experto redactor de newsletters. 
A partir de la siguiente lista de noticias, crea un borrador de newsletter en formato HTML.
La newsletter debe tener:
1.  Como máximo 10 notícias de la lista. Selecciona las que creas que son más relevantes para un perfil Agile, Project Manager o Delivery Lead o similares.
2.  Intenta que de las 10 al menos 3 sean en castellano.
3.  Un título principal atractivo dentro de una etiqueta <h1>. Al lado del título pon una bandera inglesa o española dependiendo del idioma de la notícia.
4.  Una breve introducción general que enganche al lector sobre los temas de la semana.
5.  Para cada noticia, crea una sección con un subtítulo (<h3>), un resumen conciso y bien redactado del contenido (basado en el título y el snippet de la notícia), y un enlace claro para "Leer más" que apunte a la URL original. No inventes información, básate en los datos proporcionados.
6.  Una breve conclusión o despedida.
7.  Utiliza etiquetas HTML semánticas como <p>, <ul>, <li>, y <a>. No incluyas las etiquetas <html>, <head>, o <body>. Solo el contenido interno para un email.

La newsletter tiene que ser en Castellano.

Aquí están las urls de las noticias para analizar:
---
{NOTICIAS_TEXTO}
---
  `;

  try {
    const spreadsheet = getProjectSpreadsheet();
    const sheet = spreadsheet.getSheetByName('Configuracion');
    if (!sheet || sheet.getLastRow() < 2) {
      return { keywords: "", model: "", prompt: DEFAULT_PROMPT };
    }
    const data = sheet.getRange("A1:B3").getValues();
    const config = {};
    data.forEach(row => {
        if (row[0] === 'Keywords') config.keywords = row[1];
        if (row[0] === 'AI_Model') config.model = row[1];
        if (row[0] === 'Prompt') config.prompt = row[1];
    });
    
    return {
        keywords: config.keywords || "",
        model: config.model || "",
        prompt: config.prompt || DEFAULT_PROMPT
    };
  } catch (e) {
    console.error("Error al obtener la configuración: " + e.message);
    return { keywords: "", model: "", prompt: DEFAULT_PROMPT }; 
  }
}

/**
 * Crea o actualiza el único trigger semanal del proyecto.
 */
function configurarTriggerUnico() {
  const handlerFunction = 'ejecutarProcesoCompleto';
  // Primero, eliminamos cualquier trigger existente para esta función para evitar duplicados.
  const triggers = ScriptApp.getProjectTriggers();
  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() === handlerFunction) {
      ScriptApp.deleteTrigger(trigger);
    }
  }

  // Crear el trigger semanal para ejecutar todo el proceso
  ScriptApp.newTrigger(handlerFunction)
      .timeBased()
      .onWeekDay(ScriptApp.WeekDay.FRIDAY) // Se ejecutará cada viernes
      .atHour(9) // a las 9 de la mañana
      .create();
  
  console.log(`Trigger semanal para la función '${handlerFunction}' creado/actualizado.`);
}

/**
 * Elimina todos los triggers gestionados por este script.
 */
function eliminarTriggers() {
    const triggers = ScriptApp.getProjectTriggers();
    const managedFunctions = ['ejecutarProcesoCompleto', 'recopilarContenido', 'generarNewsletter']; // Incluimos las antiguas por si acaso
    for (const trigger of triggers) {
        if (managedFunctions.includes(trigger.getHandlerFunction())) {
            ScriptApp.deleteTrigger(trigger);
        }
    }
    console.log("Todos los triggers gestionados han sido eliminados.");
}


/**
 * Obtiene y devuelve una lista de los activadores ("crons") actuales del proyecto.
 * @returns {Array<Object>} Un array de objetos, cada uno representando un activador.
 */
function obtenerTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  if (triggers.length === 0) {
    return [];
  }

  return triggers.map(trigger => {
    return {
      handlerFunction: trigger.getHandlerFunction(),
      eventType: trigger.getEventType().toString(),
      // Proporcionar más detalles sobre la programación para la UI
      triggerSource: trigger.getTriggerSource().toString(),
    };
  });
}
