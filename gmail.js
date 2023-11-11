// gmail.js
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.settings.basic', 'https://www.googleapis.com/auth/gmail.labels', 'https://www.googleapis.com/auth/gmail.modify'];

// Function to list unread messages
const listUnreadMessages = async (gmail) => {
    const response = await gmail.users.messages.list({
        userId: 'me',
        q: 'label:UNREAD',
    });

    return response.data.messages || [];
};

// Function to get details of a message
const getMessageDetails = async (gmail, messageId) => {
    return await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
    });
};

// Function to create a label
const createLabel = async (gmail, labelName) => {
    return await gmail.users.labels.create({
        userId: 'me',
        requestBody: {
            name: labelName,
            messageListVisibility: 'show',
            labelListVisibility: 'labelShow',
        },
    });
};

// Function to list labels
const listLabels = async (gmail) => {
    const response = await gmail.users.labels.list({
        userId: 'me',
    });

    return response.data.labels || [];
};

// Function to modify a message
const modifyMessage = async (gmail, messageId, labelIdsToAdd, labelIdsToRemove) => {
    return await gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
            addLabelIds: labelIdsToAdd,
            removeLabelIds: labelIdsToRemove,
        },
    });
};

// Function to get sender email address
const getSenderEmailAddress = async (emailDetails) => {
    try {

        const headers = emailDetails.data.payload.headers;

        // Find the 'From' header
        const fromHeader = headers.find(header => header.name === 'From');

        if (fromHeader) {
            // Extract the email address from the 'From' header
            const senderEmail = fromHeader.value;
            console.log(`Sender's email address: ${senderEmail}`);
            return senderEmail;
        } else {
            console.log('No "From" header found.');
            return null;
        }
    } catch (err) {
        console.error('Error getting sender email address:', err);
        return null;
    }
}

// Function to make body of mail
const makeBody = (to, from, subject, message) => {
    var str = ["Content-Type: text/plain; charset=\"UTF-8\"\n",
        "MIME-Version: 1.0\n",
        "Content-Transfer-Encoding: 7bit\n",
        "to: ", to, "\n",
        "from: ", from, "\n",
        "subject: ", subject, "\n\n",
        message
    ].join('');

    var encodedMail = new Buffer(str).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');
    return encodedMail;
}


module.exports = {
    listUnreadMessages,
    getMessageDetails,
    createLabel,
    listLabels,
    modifyMessage,
    getSenderEmailAddress,
    makeBody,
    SCOPES
};
