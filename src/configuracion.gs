/**
 * Guarda la configuración (palabras clave, modelo, prompt, día y hora) y configura el trigger.
 * @param {Object} config - Un objeto con {keywords: string, model: string, prompt: string, dayOfWeek: string, hour: number}.
 * @returns {Object} Un objeto con un mensaje de éxito e instrucciones para el usuario.
 */
function guardarConfiguracion(config) {
  const { keywords, model, prompt, dayOfWeek, hour } = config;
  if (!model) {
    throw new Error("Se debe seleccionar un modelo de IA para guardar la configuración.");
  }
  if (!prompt || prompt.trim() === "") {
    throw new Error("El campo de prompt para la IA no puede estar vacío.");
  }
  if (!dayOfWeek || !hour) {
    throw new Error("Se debe especificar un día y una hora para el activador.");
  }


  const spreadsheet = getProjectSpreadsheet();
  const sheet = getSheet(spreadsheet, 'Configuracion');
  
  sheet.clear(); 
  sheet.getRange('A1:B5').setValues([
    ['Keywords', keywords || ''],
    ['AI_Model', model],
    ['Prompt', prompt],
    ['DayOfWeek', dayOfWeek],
    ['Hour', hour]
  ]);


  const keywordsArray = (keywords || '').split(',').map(k => k.trim()).filter(Boolean);
  
  if (keywordsArray.length > 0) {
    configurarTriggerUnico(dayOfWeek, hour);
  } else {
    eliminarTriggers(); 
  }

  // Formato de la hora para que siempre tenga dos dígitos (e.g., 09:00)
  const formattedHour = String(hour).padStart(2, '0') + ':00';
  // Mapeo de nombres de días en inglés a español para el mensaje
  const diasSemana = {
      MONDAY: 'Lunes', TUESDAY: 'Martes', WEDNESDAY: 'Miércoles', 
      THURSDAY: 'Jueves', FRIDAY: 'Viernes', SATURDAY: 'Sábado', SUNDAY: 'Domingo'
  };
  const diaEnEspanol = diasSemana[dayOfWeek.toUpperCase()] || dayOfWeek;

  const successMessage = `¡Éxito! Configuración guardada. El activador semanal ha sido ${keywordsArray.length > 0 ? 'creado o actualizado' : 'eliminado'}.`;
  
  return {
    successMessage: successMessage,
    instructions: `El sistema ahora buscará noticias y enviará la newsletter cada ${diaEnEspanol} a las ${formattedHour}.`
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
  
  if (keywordsArray.filter(Boolean).length === 0) {
    eliminarTriggers();
  }

  return `Palabra clave "${keywordToDelete}" eliminada.`;
}


/**
 * Obtiene la configuración guardada actualmente.
 * @returns {Object} Un objeto con {keywords: string, model: string, prompt: string, dayOfWeek: string, hour: number}, o valores por defecto.
 */
function obtenerConfiguracion() {
  const DEFAULT_PROMPT = `Actúa como un experto redactor de newsletters.
A partir de la siguiente lista de noticias, crea un borrador de newsletter en formato HTML.
Los temas de interés para esta newsletter son: {KEYWORDS}.

La newsletter debe tener:
1.  Como máximo 10 notícias de la lista. Selecciona las que creas que son más relevantes para un perfil Agile, Project Manager o Delivery Lead o similares. No menciones estos roles si no es estrictamente necesario.
2.  Un título principal atractivo dentro de una etiqueta <h1>.
3.  Una breve introducción general que enganche al lector sobre los temas de la semana, mencionando los temas principales.
4.  Para cada noticia, crea una sección con un subtítulo (<h3>), un resumen conciso y bien redactado del contenido (basado en el título y el snippet de la notícia), y un enlace claro para "Leer más" que apunte a la URL original. 
5.  No inventes información, básate en los datos proporcionados.
5.  Una breve conclusión o despedida.
6.  Utiliza etiquetas HTML semánticas como <p>, <ul>, <li>, y <a>. No incluyas las etiquetas <html>, <head>, o <body>. Solo el contenido interno para un email.

La newsletter tiene que ser en Castellano.

Aquí están las noticias para analizar:
---
{NOTICIAS}
---
`;

  const defaults = { 
    keywords: "", 
    model: "", 
    prompt: DEFAULT_PROMPT.trim(),
    dayOfWeek: "FRIDAY",
    hour: 9
  };

  try {
    const spreadsheet = getProjectSpreadsheet();
    const sheet = spreadsheet.getSheetByName('Configuracion');
    if (!sheet || sheet.getLastRow() < 2) {
      return defaults;
    }
    const data = sheet.getRange("A1:B5").getValues();
    const config = {};
    data.forEach(row => {
        if (row[0] === 'Keywords') config.keywords = row[1];
        if (row[0] === 'AI_Model') config.model = row[1];
        if (row[0] === 'Prompt') config.prompt = row[1];
        if (row[0] === 'DayOfWeek') config.dayOfWeek = row[1];
        if (row[0] === 'Hour') config.hour = row[1];
    });
    
    return {
        keywords: config.keywords || defaults.keywords,
        model: config.model || defaults.model,
        prompt: (config.prompt || defaults.prompt).trim(),
        dayOfWeek: config.dayOfWeek || defaults.dayOfWeek,
        hour: config.hour !== '' && !isNaN(config.hour) ? Number(config.hour) : defaults.hour
    };
  } catch (e) {
    console.error("Error al obtener la configuración: " + e.message);
    return defaults; 
  }
}

/**
 * Crea o actualiza el único trigger semanal del proyecto.
 * @param {string} dayOfWeek El día de la semana para ejecutar el trigger (ej: 'FRIDAY').
 * @param {number} hour La hora del día (0-23) para ejecutar el trigger.
 */
function configurarTriggerUnico(dayOfWeek, hour) {
  const handlerFunction = 'ejecutarProcesoCompleto';
  
  // Elimina triggers existentes para esta función
  const triggers = ScriptApp.getProjectTriggers();
  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() === handlerFunction) {
      ScriptApp.deleteTrigger(trigger);
    }
  }

  // Valida el día de la semana
  const weekDayEnum = ScriptApp.WeekDay[dayOfWeek.toUpperCase()];
  if (!weekDayEnum) {
    throw new Error(`Día de la semana inválido: "${dayOfWeek}".`);
  }

  // Valida la hora
  const numericHour = parseInt(hour, 10);
  if (isNaN(numericHour) || numericHour < 0 || numericHour > 23) {
      throw new Error(`Hora inválida: "${hour}". Debe ser un número entre 0 y 23.`);
  }

  // Crea el nuevo trigger
  ScriptApp.newTrigger(handlerFunction)
      .timeBased()
      .onWeekDay(weekDayEnum)
      .atHour(numericHour)
      .create();
  
  console.log(`Trigger semanal para la función '${handlerFunction}' creado/actualizado para ${dayOfWeek} a las ${hour}:00.`);
}

/**
 * Elimina todos los triggers gestionados por este script.
 */
function eliminarTriggers() {
    const triggers = ScriptApp.getProjectTriggers();
    const managedFunctions = ['ejecutarProcesoCompleto', 'recopilarContenido', 'generarNewsletter'];
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
      triggerSource: trigger.getTriggerSource().toString(),
    };
  });
}
