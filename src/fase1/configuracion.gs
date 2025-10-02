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
  
  const instruccionesAlertas = crearAlertaGoogle(keywordsArray);
  crearOActualizarFiltroGmail(keywordsArray);
  configurarTriggers(); // Se llama a la función actualizada que crea AMBOS triggers
  
  const successMessage = `¡Éxito! Configuración guardada. El filtro de Gmail y los activadores (diario y semanal) han sido actualizados.`;
  
  // Devolvemos un objeto para separar el mensaje temporal de las instrucciones permanentes
  return {
    successMessage: successMessage,
    instructions: instruccionesAlertas
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
  
  crearOActualizarFiltroGmail(keywordsArray);

  return `Palabra clave "${keywordToDelete}" eliminada. El filtro de Gmail ha sido actualizado. Recuerda eliminar también la alerta manual en Google Alerts.`;
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
 * Crea o actualiza los triggers del proyecto: uno diario y uno semanal.
 */
function configurarTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  const managedFunctions = ['recopilarContenido', 'generarNewsletter'];

  // Eliminar todos los triggers gestionados por este script para evitar duplicados
  for (const trigger of triggers) {
    if (managedFunctions.includes(trigger.getHandlerFunction())) {
      ScriptApp.deleteTrigger(trigger);
    }
  }

  // Crear el trigger diario para recopilar contenido
  ScriptApp.newTrigger('recopilarContenido')
      .timeBased()
      .everyDays(1)
      .atHour(3)
      .create();

  // Crear el trigger semanal para generar y enviar la newsletter
  ScriptApp.newTrigger('generarNewsletter')
      .timeBased()
      .onWeekDay(ScriptApp.WeekDay.FRIDAY) // Se ejecutará cada viernes
      .atHour(9) // a las 9 de la mañana
      .create();
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
