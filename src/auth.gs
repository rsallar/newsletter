
/**
 * Comprueba si la contraseña proporcionada por el usuario coincide
 * con la configurada en el fichero config.gs.
 * @param {string} submittedPassword La contraseña enviada desde el formulario de login.
 * @returns {boolean} True si la contraseña es correcta, de lo contrario false.
 */
function checkPassword(submittedPassword) {
  if (typeof WEB_APP_PASSWORD === 'undefined' || WEB_APP_PASSWORD === '') {
    console.error("La contraseña (WEB_APP_PASSWORD) no está definida en config.gs. Acceso denegado por seguridad.");
    return false;
  }
  
  const isCorrect = submittedPassword === WEB_APP_PASSWORD;
  
  if (isCorrect) {
    console.log("Intento de login exitoso.");
  } else {
    console.warn("Intento de login fallido con una contraseña incorrecta.");
  }
  
  return isCorrect;
}

/**
 * NUEVO: Verifica la contraseña y, si es correcta, crea un token de sesión temporal.
 * Se llama desde la página de login usando google.script.run.
 * @param {string} submittedPassword La contraseña que el usuario ha introducido.
 * @returns {string} La URL base de la aplicación web para la redirección.
 * @throws {Error} Si la contraseña es incorrecta.
 */
function authenticateAndStoreToken(submittedPassword) {
  if (checkPassword(submittedPassword)) {
    const token = Utilities.getUuid(); // Genera un token único y aleatorio.
    const properties = PropertiesService.getUserProperties();
    
    // Almacenamos el token y una marca de tiempo. El token será válido por 15 segundos.
    properties.setProperty('authToken', token);
    properties.setProperty('authTimestamp', new Date().getTime().toString());
    
    console.log("Token de sesión temporal creado para el usuario.");
    
    // Devolvemos la URL base para que el cliente sepa a dónde redirigir.
    return ScriptApp.getService().getUrl();
  } else {
    throw new Error('Contraseña incorrecta. Por favor, inténtalo de nuevo.');
  }
}

/**
 * NUEVO: Comprueba si existe un token de sesión válido y reciente para el usuario.
 * Esta función es llamada por doGet() al cargar la página.
 * @returns {boolean} True si el usuario está autenticado, de lo contrario false.
 */
function isUserAuthenticated() {
  const properties = PropertiesService.getUserProperties();
  const token = properties.getProperty('authToken');
  const timestamp = properties.getProperty('authTimestamp');

  // Si no hay token o marca de tiempo, no está autenticado.
  if (!token || !timestamp) {
    return false;
  }

  // El token es de un solo uso. Se borra inmediatamente después de leerlo
  // para evitar que se pueda reutilizar (ej. recargando la página).
  properties.deleteProperty('authToken');
  properties.deleteProperty('authTimestamp');

  const now = new Date().getTime();
  const tokenAgeSeconds = (now - Number(timestamp)) / 1000;

  // El token solo es válido durante 15 segundos para dar tiempo a la redirección.
  if (tokenAgeSeconds < 15) {
    console.log(`Token de sesión validado (antigüedad: ${tokenAgeSeconds.toFixed(2)}s).`);
    return true;
  } else {
    console.warn(`Se encontró un token de sesión caducado (antigüedad: ${tokenAgeSeconds.toFixed(2)}s) y fue eliminado.`);
    return false;
  }
}
