    const NEWSLETTERS_SHEET_NAME = 'Newsletters';
    const RECIPIENTS_SHEET_NAME = 'Recipients';
    const NEWSLETTER_HEADERS = ['ID', 'Name', 'IsEnabled', 'Keywords', 'AI_Model', 'Prompt', 'DayOfWeek', 'Hour'];
    const RECIPIENTS_HEADERS = ['NewsletterID', 'Email'];
    const MASTER_TRIGGER_HANDLER = 'masterTriggerHandler';
    
    /**
     * Obtiene o crea una hoja de cálculo y asegura que tenga las cabeceras correctas.
     * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet La hoja de cálculo principal.
     * @param {string} sheetName El nombre de la hoja.
     * @param {Array<string>} headers Las cabeceras esperadas.
     * @returns {GoogleAppsScript.Spreadsheet.Sheet} La hoja de cálculo.
     */
    function _getSheetAndEnsureHeaders(spreadsheet, sheetName, headers) {
      let sheet = spreadsheet.getSheetByName(sheetName);
      if (!sheet) {
        sheet = spreadsheet.insertSheet(sheetName);
        sheet.appendRow(headers);
        sheet.setFrozenRows(1);
        if (sheetName === NEWSLETTERS_SHEET_NAME) {
          sheet.getRange('C:C').insertCheckboxes(); // Columna IsEnabled
        }
      }
      return sheet;
    }
    
    /** Genera un ID corto y único. */
    function _generateId() {
      return Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * Obtiene todas las newsletters y su lista de correos.
     * Es la función principal para cargar los datos en la interfaz.
     * @returns {Array<Object>} Un array de objetos, cada uno representando una newsletter.
     */
    function getNewslettersWithData() {
      setupMainTrigger(); // Asegura que el trigger principal exista al cargar la app.
      
      const spreadsheet = getProjectSpreadsheet();
      const newslettersSheet = _getSheetAndEnsureHeaders(spreadsheet, NEWSLETTERS_SHEET_NAME, NEWSLETTER_HEADERS);
      const recipientsSheet = _getSheetAndEnsureHeaders(spreadsheet, RECIPIENTS_SHEET_NAME, RECIPIENTS_HEADERS);
    
      const newsletterData = newslettersSheet.getDataRange().getValues();
      const recipientData = recipientsSheet.getDataRange().getValues();
    
      const newslettersMap = {};
    
      // Procesar newsletters (empezar desde la fila 1 para saltar cabecera)
      for (let i = 1; i < newsletterData.length; i++) {
        const row = newsletterData[i];
        
        // Si la fila no tiene un ID (columna 0), se considera vacía y se salta.
        if (!row[0] || String(row[0]).trim() === '') {
          continue;
        }
        
        const newsletter = {
          id: row[0],
          name: row[1],
          isEnabled: row[2] === true,
          keywords: row[3],
          model: row[4],
          prompt: row[5],
          dayOfWeek: row[6],
          hour: row[7],
          recipients: []
        };
        newslettersMap[newsletter.id] = newsletter;
      }
    
      // Procesar destinatarios y asociarlos
      for (let i = 1; i < recipientData.length; i++) {
        const newsletterId = recipientData[i][0];
        const email = recipientData[i][1];
        if (newslettersMap[newsletterId]) {
          newslettersMap[newsletterId].recipients.push(email);
        }
      }
      
      return Object.values(newslettersMap);
    }
    
    
    /**
     * Obtiene la configuración de una sola newsletter por su ID.
     * @param {string} id El ID de la newsletter.
     * @returns {Object} El objeto de configuración de la newsletter.
     */
    function getNewsletterConfig(id) {
        const spreadsheet = getProjectSpreadsheet();
        const sheet = _getSheetAndEnsureHeaders(spreadsheet, NEWSLETTERS_SHEET_NAME, NEWSLETTER_HEADERS);
        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        const idColIndex = headers.indexOf('ID');
    
        for (let i = 1; i < data.length; i++) {
            if (data[i][idColIndex] === id) {
                const config = {};
                headers.forEach((header, index) => {
                    // FIX: Se fuerza la conversión del 'header' a String.
                    // Esto previene un error si una celda de la cabecera en la hoja de cálculo
                    // contiene un valor que no es de tipo texto (ej. un número o una fecha),
                    // lo que causaba el fallo en `header.charAt()`.
                    const headerAsString = String(header || '');
    
                    if (headerAsString.trim() !== '') {
                        let key;
                        switch (headerAsString) {
                            case 'ID': key = 'id'; break; // <<< CORRECCIÓN: Mapear 'ID' a 'id'.
                            case 'AI_Model': key = 'model'; break;
                            case 'DayOfWeek': key = 'dayOfWeek'; break;
                            default: key = headerAsString.charAt(0).toLowerCase() + headerAsString.slice(1); break;
                        }
                        
                        let value = data[i][index];
                        if (headerAsString === 'IsEnabled') value = value === true;
                        config[key] = value;
                    }
                });
                return config;
            }
        }
        throw new Error(`No se encontró la newsletter con ID: ${id}`);
    }
    
    
    /**
     * Guarda (crea o actualiza) una configuración de newsletter.
     * @param {Object} config - El objeto de configuración de la newsletter.
     * @returns {Object} La configuración guardada.
     */
    function saveNewsletter(config) {
      if (!config.name || config.name.trim() === '') throw new Error('El nombre de la newsletter no puede estar vacío.');
    
      const spreadsheet = getProjectSpreadsheet();
      const sheet = _getSheetAndEnsureHeaders(spreadsheet, NEWSLETTERS_SHEET_NAME, NEWSLETTER_HEADERS);
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const idColIndex = headers.indexOf('ID');
    
      let targetRow = -1;
    
      if (config.id) {
        // MODO ACTUALIZACIÓN: Buscar la fila por ID existente.
        for (let i = 1; i < data.length; i++) {
          if (data[i][idColIndex] === config.id) {
            targetRow = i + 1; // Las filas son 1-indexed.
            break;
          }
        }
        if (targetRow === -1) {
            throw new Error(`No se pudo encontrar la newsletter con ID ${config.id} para actualizar.`);
        }
      } else {
        // MODO CREACIÓN: Buscar la primera fila con un ID vacío.
        for (let i = 1; i < data.length; i++) {
          // Si la celda del ID está vacía o solo contiene espacios en blanco.
          if (!data[i][idColIndex] || String(data[i][idColIndex]).trim() === '') {
            targetRow = i + 1;
            break;
          }
        }
        
        // Si no se encontró ninguna fila vacía dentro del rango de datos existente, se añade al final.
        if (targetRow === -1) {
          targetRow = sheet.getLastRow() + 1;
        }
      }
    
      // Preparamos los datos a escribir
      const newRowData = headers.map(header => {
          switch(header) {
              case 'ID': return config.id || _generateId();
              case 'Name': return config.name;
              case 'IsEnabled': return config.isEnabled === true;
              case 'Keywords': return config.keywords || '';
              case 'AI_Model': return config.model || '';
              case 'Prompt': return config.prompt || getDefaultPrompt();
              case 'DayOfWeek': return config.dayOfWeek || 'FRIDAY';
              case 'Hour': return config.hour || 9;
              default: return '';
          }
      });
    
      // Escribimos en la fila objetivo (sea de actualización o de creación).
      sheet.getRange(targetRow, 1, 1, newRowData.length).setValues([newRowData]);
      
      config.id = newRowData[0]; // Asegura que el ID se devuelva si es una nueva creación
      return config;
    }
    
    /**
     * Elimina una newsletter y todos sus destinatarios asociados.
     * @param {string} id - El ID de la newsletter a eliminar.
     * @returns {string} Mensaje de éxito.
     */
    function deleteNewsletter(id) {
      const spreadsheet = getProjectSpreadsheet();
      
      // Eliminar de Newsletters
      const newslettersSheet = _getSheetAndEnsureHeaders(spreadsheet, NEWSLETTERS_SHEET_NAME, NEWSLETTER_HEADERS);
      const newsletterData = newslettersSheet.getDataRange().getValues();
      for (let i = newsletterData.length - 1; i > 0; i--) {
        if (newsletterData[i][0] === id) {
          newslettersSheet.deleteRow(i + 1);
          break;
        }
      }
    
      // Eliminar destinatarios asociados
      const recipientsSheet = _getSheetAndEnsureHeaders(spreadsheet, RECIPIENTS_SHEET_NAME, RECIPIENTS_HEADERS);
      const recipientData = recipientsSheet.getDataRange().getValues();
      for (let i = recipientData.length - 1; i > 0; i--) {
        if (recipientData[i][0] === id) {
          recipientsSheet.deleteRow(i + 1);
        }
      }
    
      return `Newsletter con ID '${id}' eliminada exitosamente.`;
    }
    
    /**
     * Cambia el estado de activación (IsEnabled) de una newsletter.
     * @param {string} id - El ID de la newsletter a cambiar.
     * @returns {boolean} El nuevo estado de 'IsEnabled' (true si está activada, false si no).
     */
    function toggleNewsletterStatus(id) {
      if (!id) {
        throw new Error('Se requiere un ID para cambiar el estado de la newsletter.');
      }
    
      const spreadsheet = getProjectSpreadsheet();
      const sheet = _getSheetAndEnsureHeaders(spreadsheet, NEWSLETTERS_SHEET_NAME, NEWSLETTER_HEADERS);
      const dataRange = sheet.getDataRange();
      const values = dataRange.getValues();
      const headers = values[0];
      
      const idColIndex = headers.indexOf('ID');
      const isEnabledColIndex = headers.indexOf('IsEnabled');
    
      if (idColIndex === -1 || isEnabledColIndex === -1) {
        throw new Error('No se encontraron las columnas "ID" o "IsEnabled" en la hoja de cálculo.');
      }
    
      for (let i = 1; i < values.length; i++) {
        if (values[i][idColIndex] === id) {
          const currentRow = i + 1; // getRange es 1-indexed
          const isEnabledCell = sheet.getRange(currentRow, isEnabledColIndex + 1);
          const currentStatus = isEnabledCell.getValue() === true;
          const newStatus = !currentStatus;
          
          isEnabledCell.setValue(newStatus);
          
          console.log(`Estado de la newsletter '${id}' cambiado a: ${newStatus}`);
          return newStatus;
        }
      }
    
      throw new Error(`No se encontró la newsletter con ID: ${id}`);
    }
    
    /**
     * Agrega un destinatario a una newsletter específica.
     * @param {string} newsletterId El ID de la newsletter.
     * @param {string} email El correo a agregar.
     * @returns {string} Mensaje de éxito.
     */
    function addRecipient(newsletterId, email) {
      if (!email || !email.includes('@')) throw new Error('Correo electrónico no válido.');
      
      const spreadsheet = getProjectSpreadsheet();
      const sheet = _getSheetAndEnsureHeaders(spreadsheet, RECIPIENTS_SHEET_NAME, RECIPIENTS_HEADERS);
      
      const data = sheet.getDataRange().getValues();
      const isDuplicate = data.some(row => row[0] === newsletterId && row[1].trim().toLowerCase() === email.trim().toLowerCase());
    
      if (isDuplicate) throw new Error('El correo ya existe para esta newsletter.');
    
      sheet.appendRow([newsletterId, email]);
      return `Correo '${email}' agregado.`;
    }
    
    /**
     * Elimina un destinatario de una newsletter.
     * @param {string} newsletterId El ID de la newsletter.
     * @param {string} email El correo a eliminar.
     * @returns {string} Mensaje de éxito.
     */
    function deleteRecipient(newsletterId, email) {
      const spreadsheet = getProjectSpreadsheet();
      const sheet = _getSheetAndEnsureHeaders(spreadsheet, RECIPIENTS_SHEET_NAME, RECIPIENTS_HEADERS);
      const data = sheet.getDataRange().getValues();
      
      for (let i = data.length - 1; i > 0; i--) {
        if (data[i][0] === newsletterId && data[i][1].trim().toLowerCase() === email.trim().toLowerCase()) {
          sheet.deleteRow(i + 1);
          return `Correo '${email}' eliminado.`;
        }
      }
      throw new Error('No se encontró el correo para eliminar.');
    }
    
    /**
     * Obtiene los destinatarios de una newsletter específica.
     * @param {string} newsletterId El ID de la newsletter.
     * @returns {Array<string>} Lista de correos.
     */
    function getRecipients(newsletterId) {
        const spreadsheet = getProjectSpreadsheet();
        const sheet = _getSheetAndEnsureHeaders(spreadsheet, RECIPIENTS_SHEET_NAME, RECIPIENTS_HEADERS);
        
        // FIX: Se añade validación y se hace la comparación más robusta.
        // Esto previene errores si el ID no se pasa o si hay inconsistencias de tipo (número vs. texto)
        // o espacios en blanco accidentales en la hoja de cálculo.
        if (!newsletterId) {
            console.error("getRecipients fue llamado sin un newsletterId válido.");
            return [];
        }
        const targetId = String(newsletterId).trim();
    
        return sheet.getDataRange().getValues()
            .filter(row => row[0] && String(row[0]).trim() === targetId) // Comparamos texto con texto, ignorando espacios.
            .map(row => row[1]);
    }
    
    
    // --- GESTIÓN DE TRIGGERS ---
    
    /**
     * Configura el trigger principal que se ejecuta cada hora.
     * Elimina los triggers antiguos para asegurar que solo haya uno.
     */
    function setupMainTrigger() {
      deleteAllProjectTriggers();
      ScriptApp.newTrigger(MASTER_TRIGGER_HANDLER)
        .timeBased()
        .everyHours(1)
        .create();
      console.log(`Trigger principal '${MASTER_TRIGGER_HANDLER}' configurado para ejecutarse cada hora.`);
    }
    
    /**
     * El manejador de trigger principal. Se ejecuta cada hora, busca newsletters
     * que deban enviarse y lanza el proceso para cada una.
     */
    function masterTriggerHandler() {
      const now = new Date();
      const currentDay = Utilities.formatDate(now, Session.getScriptTimeZone(), 'EEEE').toUpperCase();
      const currentHour = now.getHours();
    
      console.log(`Master trigger ejecutado. Día: ${currentDay}, Hora: ${currentHour}`);
    
      const newsletters = getNewslettersWithData();
      const dueNewsletters = newsletters.filter(n => 
        n.isEnabled &&
        n.dayOfWeek.toUpperCase() === currentDay &&
        Number(n.hour) === currentHour
      );
    
      if (dueNewsletters.length > 0) {
        console.log(`Se encontraron ${dueNewsletters.length} newsletters para enviar.`);
        dueNewsletters.forEach(config => {
          try {
            console.log(`Iniciando proceso para la newsletter: "${config.name}" (ID: ${config.id})`);
            ejecutarProcesoParaNewsletter(config);
          } catch (e) {
            console.error(`Error al procesar la newsletter "${config.name}" (ID: ${config.id}): ${e.message}`);
          }
        });
      } else {
        console.log("No hay newsletters programadas para esta hora.");
      }
    }
    
    /** Elimina todos los triggers del proyecto. */
    function deleteAllProjectTriggers() {
        const triggers = ScriptApp.getProjectTriggers();
        triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
    }
    
    
    /**
     * Devuelve el prompt por defecto para nuevas newsletters.
     * @returns {string} El texto del prompt.
     */
    function getDefaultPrompt() {
        return `Actúa como un experto redactor de newsletters.
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
    }
