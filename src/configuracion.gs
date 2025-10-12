/**
 * Guarda las palabras clave y configura las alertas y filtros.
 * @param {string} keywords - Las palabras clave separadas por comas.
 * @returns {Object} Un objeto con un mensaje de éxito e instrucciones para el usuario.
 */
function guardarConfiguracion(keywords) {
  const spreadsheet = getProjectSpreadsheet();
  const sheet = getSheet(spreadsheet, 'Configuracion');
  
  sheet.clear(); 
  sheet.getRange(1, 1).setValue('Keywords');
  sheet.getRange(1, 2).setValue(keywords);

  const keywordsArray = keywords.split(',').map(k => k.trim()).filter(Boolean); // filter(Boolean) elimina strings vacíos
  
  if (keywordsArray.length > 0) {
    configurarTriggerUnico(); // Configura el único trigger semanal.
  } else {
    // Si no hay keywords, eliminamos los triggers para no ejecutar en vacío.
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
 * Obtiene las palabras clave guardadas actualmente.
 * @returns {string} Las palabras clave separadas por comas, o una cadena vacía.
 */
function obtenerKeywordsActuales() {
  try {
    const spreadsheet = getProjectSpreadsheet();
    const sheet = spreadsheet.getSheetByName('Configuracion');
    if (!sheet) {
      return "";
    }
    return sheet.getRange(1, 2).getValue();
  } catch (e) {
    console.error("Error al obtener keywords: " + e.message);
    return ""; 
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
