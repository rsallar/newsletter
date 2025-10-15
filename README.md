# Generador Automatizado de Newsletter con Google Apps Script y Gemini

Este proyecto es un potente sistema automatizado para la generación de newsletters construido sobre Google Apps Script. Utiliza los **feeds RSS de Google News** para encontrar las últimas noticias relevantes sobre tus temas de interés, la **API de Gemini** para la generación de contenido mediante inteligencia artificial y **Gmail** para enviar la newsletter final. Todo se gestiona a través de una sencilla interfaz web, también alojada como una aplicación web de Google Apps Script.

## Características

-   **Interfaz de Usuario Web**: Una interfaz fácil de usar para configurar palabras clave, gestionar listas de destinatarios y activar la generación manual de la newsletter.
-   **Búsqueda de Noticias en Tiempo Real**: Utiliza los feeds RSS de Google News para encontrar las noticias más relevantes de la última semana en el momento exacto de la generación. No necesita API Key para la búsqueda.
-   **Generación de Newsletter con IA**:
    -   Recopila los principales artículos de noticias (enlaces, títulos, fragmentos) para tus palabras clave.
    -   Utiliza la API de Gemini para analizar todos los artículos recopilados.
    -   Genera un borrador de newsletter coherente y bien estructurado en formato HTML.
-   **Flujo de Trabajo Totalmente Automatizado**:
    -   Un único **activador (trigger) semanal** ejecuta todo el proceso: busca noticias, genera la newsletter y la envía a tu lista de correo.
-   **Control Manual**: La interfaz web te permite activar todo el proceso bajo demanda con un solo clic, mostrando un registro en tiempo real del progreso.
-   **Almacenamiento Persistente**: Utiliza una Hoja de Cálculo de Google (creada y gestionada automáticamente) para almacenar la configuración y la lista de correos electrónicos.

## Requisitos Previos

Antes de empezar, asegúrate de tener lo siguiente:

1.  **Una Cuenta de Google**: Para alojar el proyecto de Apps Script, usar Gmail, Google Sheets, etc.
2.  **Node.js y npm**: Necesario para instalar la herramienta de línea de comandos `clasp`. Puedes descargarlo desde [nodejs.org](https://nodejs.org/).
3.  **Google Gemini API Key**: Necesitas una clave de API de Google AI Studio.
    -   Puedes obtener una de forma gratuita desde [Google AI Studio](https://aistudio.google.com/app/apikey).
    -   Tu clave de API debe estar asociada a un proyecto de Google Cloud donde la **"Generative Language API"** esté habilitada. Si no lo está, puedes habilitarla [aquí](https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com).

## Guía de Instalación y Configuración

Sigue estos pasos cuidadosamente para poner en marcha el proyecto.

### **Paso 1:** Clona el Repositorio e Instala `clasp`

Clona este repositorio en tu máquina local e instala `clasp` de forma global a través de npm.

```bash
git clone <URL_DEL_REPOSITORIO>
cd <NOMBRE_DEL_REPOSITORIO>
npm install -g @google/clasp
clasp login
```
Después de ejecutar `clasp login`, sigue las instrucciones para iniciar sesión con tu cuenta de Google.

### **Paso 2:** Crea y Vincula el Proyecto de Google Apps Script

1.  Ve al [panel de Google Apps Script](https://script.google.com/home) y crea un **Nuevo proyecto**.
2.  Dale un nombre a tu proyecto (ej. "Newsletter Automatizada").
3.  Ve a **Configuración del proyecto** ⚙️ y copia el **ID de la secuencia de comandos**.
4.  Pega el ID en el archivo `.clasp.json` de tu proyecto local, reemplazando el valor existente de `scriptId`.

### **Paso 3:** Crea tu Fichero de Configuración (`config.gs`)

Para mantener tus claves y contraseñas seguras, se almacenan en un archivo que no se sube al repositorio de Git (`.gitignore`). Debes crear este archivo manualmente.

1.  En la **raíz de tu proyecto local**, crea un **nuevo archivo** y nómbralo exactamente `config.gs`.
2.  Copia y pega el siguiente código en tu nuevo archivo `config.gs`:

    ```javascript
    // config.gs
    const GEMINI_API_KEY = 'AQUÍ_VA_TU_API_KEY_DE_GEMINI';
    const WEB_APP_PASSWORD = 'AQUÍ_VA_TU_CONTRASEÑA_SECRETA';
    ```

3.  Reemplaza los textos de los placeholders:
    *   `AQUÍ_VA_TU_API_KEY_DE_GEMINI`: Pega tu API Key de Gemini real.
    *   `AQUÍ_VA_TU_CONTRASEÑA_SECRETA`: Escribe una contraseña segura que usarás para acceder al panel de administración de la aplicación web. **Si dejas este campo vacío o no lo defines, el acceso no funcionará.**

### **Paso 4:** Sube tu Código y Habilita los Servicios

1.  **Sube el código a tu proyecto de Apps Script:**

    ```bash
    clasp push
    ```    (Si te pregunta si quieres sobreescribir el manifiesto, responde `y`).

2.  **Habilita el Servicio Avanzado de Gmail:**
    -   Abre el proyecto en el editor de Apps Script (`clasp open`).
    -   En el menú de la izquierda, haz clic en **Servicios** (+).
    -   Busca **"Gmail API"**, selecciónala y haz clic en **Agregar**. Esto es necesario para que el script pueda enviar correos.

### **Paso 5:** Despliega la Aplicación Web

1.  En el editor de Apps Script, haz clic en **Desplegar** > **Nuevo despliegue**.
2.  Selecciona el tipo de despliegue ⚙️ > **Aplicación web**.
3.  **Descripción**: Despliegue inicial.
4.  **Ejecutar como**: **Yo** (tu cuenta de Google).
5.  **Quién tiene acceso**: **Solo yo**.
6.  Haz clic en **Desplegar**.
7.  **Autoriza los permisos**: La primera vez, Google te pedirá que autorices los permisos que el script necesita (gestionar Hojas de Cálculo, enviar correos, etc.). Es posible que tengas que ir a "Configuración avanzada" y "Ir a... (no seguro)".
8.  Copia la **URL de la aplicación web**. Esta es la URL de tu interfaz de usuario.

## Cómo Usar la Aplicación

1.  **Abre la Aplicación Web**: Pega la URL de la aplicación web que copiaste en el paso anterior en tu navegador. Te pedirá la contraseña que definiste en el archivo `config.gs`.

2.  **Configura las Palabras Clave**:
    -   En la sección "Configurar Palabras Clave", introduce una lista de temas que quieres seguir, separados por comas.
    -   Selecciona el modelo de IA que deseas utilizar y ajusta el prompt si es necesario.
    -   Haz clic en **Guardar Configuración y Activar Proceso Semanal**.
    -   Esta acción guarda tus preferencias y configura el **activador semanal** que automatiza todo el proceso.

3.  **Gestiona la Lista de Correos**:
    -   Usa la sección "Gestión de Correos Electrónicos" para añadir o eliminar las direcciones de los destinatarios.

4.  **Espera o Ejecuta Manualmente**:
    -   El sistema ahora se ejecutará automáticamente una vez por semana.
    -   Si quieres probar el proceso inmediatamente, haz clic en el botón **"Buscar Noticias y Enviar Newsletter"**. Aparecerá una ventana de registro que muestra el progreso en tiempo real de todo el flujo de trabajo.
```

### Resumen de los cambios

*   **En el Paso 3**: He añadido la variable `WEB_APP_PASSWORD` al bloque de código de `config.gs` y he incluido una instrucción clara para que el usuario establezca su propia contraseña.
*   **En la sección "Cómo Usar la Aplicación"**: He añadido una nota en el primer punto para recordarle al usuario que se le pedirá la contraseña que acaba de configurar.