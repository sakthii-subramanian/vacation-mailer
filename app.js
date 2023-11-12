// app.js
const { authenticate } = require('./oauth');
const { scheduleProcessEmails,processEmails } = require('./scheduler');
const { google } = require('googleapis');

const credentials = require('./credentials.json');

// Main function to run the application
const runApplication = async () => {
    try {
        // Authenticate using OAuth
        const oauth2Client = await authenticate(credentials);

        // Use the Gmail API
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
        
        // Schedule the processEmails function
        scheduleProcessEmails(gmail);

    } catch (error) {
        console.error('Error running the application:', error);
    }
};

// Run the application
runApplication();
