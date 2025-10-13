# Automated Newsletter Generator with Google Apps Script & Gemini API

This project is a powerful, automated newsletter generation system built on Google Apps Script. It uses **Google News RSS feeds** to find the latest relevant news on your topics, the **Gemini API** for AI-powered content generation, and **Gmail** for sending the final newsletter. It's managed through a simple web interface, also hosted as a Google Apps Script web app.

## Features

-   **Web-Based UI**: An easy-to-use interface to configure keywords, manage recipient lists, and trigger the newsletter generation manually.
-   **Real-time News Fetching**: Uses Google News RSS feeds to find the most relevant news from the past week at the exact moment of generation.
-   **AI-Powered Newsletter Generation**:
    -   Collects top news articles (links, titles, snippets) for your keywords.
    -   Uses the Gemini API to analyze all the collected articles.
    -   Generates a cohesive and well-structured newsletter draft.
-   **Fully Automated Workflow**:
    -   A single **weekly trigger** runs to perform the entire process: search for news, generate the newsletter, and send it to your mailing list.
-   **Manual Control**: The web UI allows you to trigger the entire process on demand with a single click, showing a real-time log of the progress.
-   **Persistent Storage**: Uses a Google Spreadsheet (created and managed automatically) to store configuration and the email list.

## Prerequisites

Before you begin, ensure you have the following:

1.  **A Google Account**: To host the Apps Script project, use Gmail, Google Sheets, etc.
2.  **Node.js and npm**: Required to install the `clasp` command-line tool.
3.  **Google Gemini API Key**: You need an API key from Google AI Studio. You can get one for free [here](https://aistudio.google.com/app/apikey). Your API key must be associated with a Google Cloud Project where the "Generative Language API" is enabled.

## Setup and Installation Guide

Follow these steps carefully to get the project up and running.

### **Step 1:** Clone the Repository & Install `clasp`

Clone this repository and install `clasp` globally.

```bash
git clone <repository_url>
cd <repository_name>
npm install -g @google/clasp
clasp login
```

### **Step 2:** Create and Link Google Apps Script Project

1.  Go to the [Google Apps Script dashboard](https://script.google.com/home) and create a **New project**.
2.  Give your project a name (e.g., "Automated Newsletter").
3.  Go to **Project Settings** ⚙️ and copy the **Script ID**.
4.  Paste the Script ID into the `.clasp.json` file in your local project.

### **Step 3:** Create and Configure Your Secrets File

To keep your secret keys secure, they are stored in a file that is not tracked by Git. You must create this file manually.

1.  In your local project, navigate to the `src/` folder.
2.  Create a **new file** and name it exactly `config.gs`.
3.  Copy and paste the following code into your new `src/config.gs` file:

    ```javascript
    // src/config.gs
    const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_GOES_HERE';
    ```

4.  Replace the placeholder text with your actual **Gemini API Key**.

### **Step 4:** Push Your Code and Deploy

1.  **Push the code to your Apps Script project:**

    ```bash
    clasp push
    ```
    (Say `y` to overwrite the manifest if prompted).

2.  **Deploy as a Web App:**
    -   Open the project in the Apps Script editor (`clasp open`).
    -   Click **Deploy** > **New deployment**.
    -   Select type ⚙️ > **Web app**.
    -   **Description**: Initial deployment.
    -   **Execute as**: **Me**
    -   **Who has access**: **Only myself**
    -   Click **Deploy** and complete the authorization flow (you may need to go to "Advanced" and "Go to... (unsafe)").
    -   Copy the **Web app URL**. This is your UI.

## How to Use the Application

1.  **Open the Web App**: Paste the Web app URL into your browser.

2.  **Configure Keywords**:
    -   In the "Configure Keywords" section, enter a list of topics you want to follow, separated by commas.
    -   Click **Save Configuración and Activar Proceso Semanal**.
    -   This action saves your keywords and sets up the single **weekly trigger** that automates the entire process.

3.  **Manage Email List**:
    -   Use the "Email Management" section to add or remove recipient email addresses.

4.  **Wait or Run Manually**:
    -   The system will now run automatically once a week.
    -   If you want to test the process immediately, click the **"Buscar Noticias y Enviar Newsletter"** button. A log window will appear showing the real-time progress of the entire workflow.
