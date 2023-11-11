// oauth.js
const { google } = require('googleapis');
const readline = require('readline-promise');
const GMAIL = require('./gmail')

// Function to authenticate using OAuth
const authenticate = async (credentials) => {
    const oauth2Client = new google.auth.OAuth2(
        credentials.web.client_id,
        credentials.web.client_secret,
        credentials.web.redirect_uris[0]
    );

    // Generate authentication URL
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: GMAIL.SCOPES,
    });

    console.log('Authorize this app by visiting this URL:', authUrl);

    return new Promise((resolve, reject) => {
        const rltemp = readline.default
        const rl = rltemp.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        // Get the authorization code from the user
        rl.question('Enter the code from the URL here: ', async (code) => {
            rl.close();

            try {
                // Get access token using the authorization code
                const { tokens } = await oauth2Client.getToken(code);
                oauth2Client.setCredentials(tokens);
                resolve(oauth2Client);
            } catch (error) {
                reject(error);
            }
        });

        // Close the readline interface
        rl.on('close', () => {
            console.log('Authentication closed.');
        });
    });
};

module.exports = {
    authenticate,
};
