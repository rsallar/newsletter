/**
 * Obtiene la hoja de cálculo del proyecto. Si no existe, la crea y guarda su ID.
 * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet} El objeto Spreadsheet.
 */
function getProjectSpreadsheet() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const spreadsheetId = scriptProperties.getProperty('SPREADSHEET_ID');

  if (spreadsheetId) {
    try {
      return SpreadsheetApp.openById(spreadsheetId);
    } catch (e) {
      console.error("No se pudo abrir la hoja de cálculo con el ID guardado. Se creará una nueva. Error: " + e.message);
      scriptProperties.deleteProperty('SPREADSHEET_ID');
    }
  }

  const spreadsheet = SpreadsheetApp.create('Base de Datos Newsletter (Automatizada)');
  const newId = spreadsheet.getId();
  
  scriptProperties.setProperty('SPREADSHEET_ID', newId);

  // Borramos la hoja inicial por defecto
  const defaultSheet = spreadsheet.getSheetByName('Sheet1');
  if (defaultSheet) {
    spreadsheet.deleteSheet(defaultSheet);
  }

  console.log(`Nueva hoja de cálculo creada con ID: ${newId}. URL: ${spreadsheet.getUrl()}`);
  return spreadsheet;
}

/**
 * Obtiene una hoja específica de la hoja de cálculo. Si no existe, la crea.
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet - La hoja de cálculo principal.
 * @param {string} sheetName - El nombre de la hoja a obtener o crear.
 * @returns {GoogleAppsScript.Spreadsheet.Sheet} La hoja de cálculo encontrada o creada.
 */
function getSheet(spreadsheet, sheetName) {
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }
  return sheet;
}

/**
 * Guarda una fila de datos en la hoja de cálculo especificada.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - La hoja de cálculo.
 * @param {Array} fila - Los datos a guardar.
 */
function guardarEnSpreadsheet(sheet, fila) {
  if (!sheet) {
    throw new Error("El argumento 'sheet' no puede ser nulo en guardarEnSpreadsheet.");
  }
  sheet.appendRow(fila);
}

/**
 * Obtiene la URL de la hoja de cálculo del proyecto para mostrarla en la UI.
 * @returns {string} La URL de la hoja de cálculo.
 */
function getSpreadsheetUrl() {
  const spreadsheet = getProjectSpreadsheet();
  return spreadsheet.getUrl();
}

/**
 * NUEVO: Obtiene la URL del editor del proyecto de Apps Script.
 * @returns {string} La URL del editor del proyecto.
 */
function getAppsScriptUrl() {
  const scriptId = ScriptApp.getScriptId();
  return `https://script.google.com/d/${scriptId}/edit`;
}
