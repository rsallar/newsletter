# Automated Newsletter Generator with Google Apps Script & Gemini API

This project is a powerful, automated newsletter generation system built on Google Apps Script. It uses the **Google Search API** to find the latest relevant news on your topics, the **Gemini API** for AI-powered content generation, and **Gmail** for sending the final newsletter. It's managed through a simple web interface, also hosted as a Google Apps Script web app.

## Features

-   **Web-Based UI**: An easy-to-use interface to configure keywords, manage recipient lists, and trigger the newsletter generation manually.
-   **Real-time News Fetching**: Uses the Google Search API to find the most relevant news from the past week at the exact moment of generation.
-   **AI-Powered Newsletter Generation**:
    -   Collects top search results (links, titles, snippets) for your keywords.
    -   Uses the Gemini API to analyze all the collected articles.
    -   Generates a cohesive and well-structured newsletter draft.
-   **Fully Automated Workflow**:
    -   A single **weekly trigger** runs to perform the entire process: search for news, generate the newsletter, and send it to your mailing list.
-   **Manual Control**: The web UI allows you to trigger the entire process on demand.
-   **Persistent Storage**: Uses a Google Spreadsheet (created and managed automatically) to store configuration and the email list.

## Prerequisites

Before you begin, ensure you have the following:

1.  **A Google Account**: To host the Apps Script project, use Gmail, Google Sheets, etc.
2.  **Node.js and npm**: Required to install the `clasp` command-line tool.
3.  **Google Gemini API Key**: You need an API key from Google AI Studio. You can get one for free [here](https://aistudio.google.com/app/apikey). This key will be used for both Gemini and the Search API.
4.  **A Google Cloud Project**: Your API key must be associated with a Google Cloud project where the "Custom Search JSON API" is enabled.

## Setup and Installation Guide

Follow these steps carefully to get the project up and running.

### Step 1: Clone the Repository & Install `clasp`

Clone this repository and install `clasp` globally.

```bash
git clone <repository_url>
cd <repository_name>
npm install -g @google/clasp
clasp login
```

### Step 2: Create and Link Google Apps Script Project

1.  Go to the [Google Apps Script dashboard](https://script.google.com/home) and create a **New project**.
2.  Give your project a name (e.g., "Automated Newsletter").
3.  Go to **Project Settings** ⚙️ and copy the **Script ID**.
4.  Paste the Script ID into the `.clasp.json` file in your local project.

### Step 3: Configure Google Cloud & Search API

This is the most critical new step.

1.  **Enable the Custom Search API**:
    -   Go to the [Google Cloud Console API Library](https://console.cloud.google.com/apis/library).
    -   Make sure you have a project selected (or create a new one). This should be the same project associated with your Gemini API Key.
    -   Search for "**Custom Search JSON API**" and click **Enable**.

2.  **Create a Programmable Search Engine**:
    -   Go to the [Programmable Search Engine control panel](https://programmablesearchengine.google.com/controlpanel/all).
    -   Click **Add**.
    -   Give your search engine a name (e.g., "Newsletter Search").
    -   In the "What to search?" section, select **Search the entire web**.
    -   Complete the setup.
    -   Once created, you will be on the control panel for your new search engine. In the "Basics" tab, find the **Search engine ID** and click **Copy**. This ID starts with `cx`.

### Step 4: Configure Your Project Files

1.  **Open `src/config.gs`**:
    -   Paste your Gemini API Key.
    -   Paste the **Search engine ID** you just copied.

    ```javascript
    // src/config.gs
    const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_GOES_HERE';
    const SEARCH_ENGINE_ID_CX = 'YOUR_SEARCH_ENGINE_ID_GOES_HERE'; // Starts with 'cx'
    ```

### Step 5: Push Your Code and Deploy

1.  **Push the code to your Apps Script project:**
    ```bash
    clasp push
    ```
    (Say `y` to overwrite the manifest if prompted).

2.  **Deploy as a Web App:**
    -   Open the project in the Apps Script editor (`clasp open`).
    -   Click **Deploy** > **New deployment**.
    -   Select type ⚙️ > **Web app**.
    -   **Execute as**: **Me**
    -   **Who has access**: **Only myself**
    -   Click **Deploy** and complete the authorization flow (you may need to go to "Advanced" and "Go to... (unsafe)").
    -   Copy the **Web app URL**. This is your UI.

## How to Use the Application

1.  **Open the Web App**: Paste the Web app URL into your browser.

2.  **Configure Keywords**:
    -   In the "Configure Keywords" section, enter a list of topics you want to follow, separated by commas.
    -   Click **Save and Update Configuration**.
    -   This action will save your keywords and set up the **weekly trigger** that automates the entire process. The old Gmail filters and labels are no longer used.

3.  **Manage Email List**:
    -   Use the "Email Management" section to add or remove recipient email addresses.

4.  **Wait or Run Manually**:
    -   The system will now run automatically once a week (every Friday morning).
    -   If you want to test the process immediately, click the **"Buscar Noticias y Enviar Newsletter"** button to run the entire workflow on demand.
