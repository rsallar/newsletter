# Automated Newsletter Generator with Google Apps Script & Gemini API

This project is a powerful, fully automated newsletter generation system built entirely on Google Apps Script. It leverages Google Alerts to monitor topics, the Gemini API for AI-powered content summarization and generation, and Gmail for collecting content and sending the final newsletter. It's managed through a simple web interface, also hosted as a Google Apps Script web app.

## Features

-   **Web-Based UI**: An easy-to-use interface to configure keywords, manage recipient lists, and trigger actions manually.
-   **Automated Setup**: Automatically creates and manages Gmail labels and filters to organize incoming Google Alerts.
-   **AI-Powered Content Curation**:
    -   Collects links from Google Alerts emails.
    -   Uses the Gemini API to fetch and summarize the content of each link.
-   **AI-Powered Newsletter Generation**:
    -   Uses the Gemini API to analyze all the collected summaries for the week.
    -   Generates a cohesive and well-structured newsletter draft.
-   **Fully Automated Workflow**:
    -   A **daily trigger** runs to collect and summarize new content.
    -   A **weekly trigger** runs to generate and send the newsletter to your mailing list.
-   **Manual Control**: The web UI allows you to manually trigger the content collection or newsletter generation processes at any time.
-   **Persistent Storage**: Uses a Google Spreadsheet (created and managed automatically) to store collected content, configuration, and the email list.

## Prerequisites

Before you begin, ensure you have the following:

1.  **A Google Account**: To host the Apps Script project, use Gmail, Google Sheets, etc.
2.  **Node.js and npm**: Required to install the `clasp` command-line tool. You can download them from [nodejs.org](https://nodejs.org/).
3.  **Google Gemini API Key**: You need an API key from Google AI Studio. You can get one for free [here](https://aistudio.google.com/app/apikey).
4.  **Git**: To clone the repository.

## Setup and Installation Guide

Follow these steps carefully to get the project up and running.

### Step 1: Clone the Repository

First, clone this repository to your local machine.

```bash
git clone https://github.com/your-username/your-repository-name.git
cd your-repository-name
```

*(Replace the URL with the actual repository URL)*

### Step 2: Install and Log in with `clasp`

`clasp` is a command-line tool from Google that lets you manage your Apps Script projects locally.

1.  **Install `clasp` globally:**
    ```bash
    npm install -g @google/clasp
    ```

2.  **Log in to your Google Account:**
    ```bash
    clasp login
    ```
    This command will open a web browser, asking you to log in to your Google account and authorize `clasp` to manage your Apps Script projects.

### Step 3: Create a Google Apps Script Project

1.  Go to the [Google Apps Script dashboard](https://script.google.com/home).
2.  Click on **New project**.
3.  Give your project a name, for example, "Automated Newsletter".
4.  Click on the **Project Settings** ⚙️ icon on the left sidebar.
5.  In the "General" settings, find the **Script ID** and click **Copy**.

### Step 4: Link Your Local Code to the Apps Script Project

Open the `.clasp.json` file in your cloned repository. Replace the existing `scriptId` with the one you just copied.

```json
// .clasp.json
{
  "scriptId": "YOUR_COPIED_SCRIPT_ID_GOES_HERE",
  "rootDir": "",
  // ... other settings
}
```

### Step 5: Configure Your Gemini API Key

Open the file `src/config.gs` and replace the placeholder with your actual Gemini API key.

```javascript
// src/config.gs
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_GOES_HERE';
```

### Step 6: Push Your Code to Google

Now, upload all the local files to your Google Apps Script project using `clasp`.

```bash
clasp push
```

You might be asked if you want to overwrite the project manifest (`appsscript.json`). Type **`y`** and press Enter. This step enables the required Advanced Google Services (like the Gmail API) automatically.

### Step 7: Deploy as a Web App

To use the web interface, you need to deploy the script as a web app.

1.  Open your project in the Apps Script editor by running:
    ```bash
    clasp open
    ```
2.  In the editor, click the **Deploy** button in the top-right corner and select **New deployment**.
3.  Click the gear icon next to "Select type" and choose **Web app**.
4.  Fill in the deployment configuration:
    -   **Description**: (Optional) e.g., "Newsletter Config UI"
    -   **Execute as**: **Me** (`your.email@google.com`)
    -   **Who has access**: **Only myself**
5.  Click **Deploy**.
6.  **IMPORTANT**: A popup will appear asking you to **Authorize access**.
    -   Click the **Authorize access** button.
    -   Choose your Google account.
    -   You will likely see a "Google hasn’t verified this app" screen. This is normal for personal scripts. Click **Advanced**, and then click **Go to [Your Project Name] (unsafe)**.
    -   Review the permissions the script needs and click **Allow**.
7.  After authorizing, a new window will show your deployment details. Copy the **Web app URL**. This is the link to your application's user interface.

**Congratulations! Your setup is complete.**

## How to Use the Application

1.  **Open the Web App**: Paste the Web app URL you copied during deployment into your browser.

2.  **Configure Keywords**:
    -   In the "Configure Keywords" section, enter a list of topics you want to follow, separated by commas (e.g., `artificial intelligence, serverless computing, web development`).
    -   Click **Save and Update Configuration**.
    -   This action will:
        -   Save your keywords.
        -   Create a `Newsletter-Alerts` label in your Gmail.
        -   Create a Gmail filter to automatically apply this label to incoming Google Alerts and skip the inbox.
        -   Set up the daily and weekly triggers that automate the entire process.

3.  **(Required Manual Step) Create Google Alerts**:
    -   The application will display instructions. You must go to [google.com/alerts](https://www.google.com/alerts).
    -   For **each keyword** you entered, create a new alert.
    -   Make sure the "Deliver to" option is set to your email address. A frequency of "At most once a day" is recommended.

4.  **Manage Email List**:
    -   Use the "Email Management" section to add or remove recipient email addresses for your newsletter.

5.  **Wait or Run Manually**:
    -   The system will now run automatically. It will collect content every day and send a newsletter every Friday morning.
    -   If you want to test the process immediately, use the **Manual Actions** buttons to collect content or generate and send the newsletter on demand.

---

This project is licensed under the MIT License.