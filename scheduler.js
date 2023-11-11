// scheduler.js
const schedule = require('node-schedule');
const { listUnreadMessages, getMessageDetails, createLabel, listLabels, modifyMessage, getSenderEmailAddress, makeBody } = require('./gmail');

const repliedOnce = [];

// Function to schedule the processEmails function at random intervals
const scheduleProcessEmails = (gmail) => {
    const randomInterval = Math.floor(Math.random() * (120 - 45 + 1)) + 45;

    console.log(`Scheduling processEmails in ${randomInterval} seconds`);

    // Schedule the job
    schedule.scheduleJob(`*/${randomInterval} * * * * *`, async () => {
        await processEmails(gmail);
        scheduleProcessEmails(gmail); // Reschedule for the next random interval
    });
};

// Function to process unread emails
const processEmails = async (gmail) => {
    try {
        const messages = await listUnreadMessages(gmail);

        if (messages.length > 0) {
            console.log('unread count:', messages.length);

            for (const message of messages) {
                const messageId = message.id;
                const emailDetails = await getMessageDetails(gmail, messageId);

                const hasPriorReplies = emailDetails.data.payload.headers.some(
                    (header) => header.name === 'In-Reply-To'
                );

                if (!hasPriorReplies && !repliedOnce.includes(messageId)) {
                    const hasAttentionLabel = emailDetails.data.labelIds.includes('attentionrequired');

                    if (!hasAttentionLabel) {
                        var senderEmail = await getSenderEmailAddress(emailDetails)

                        if (senderEmail) {
                            var raw = makeBody(senderEmail, 'sakthi.subramanian.24@gmail.com', 'OUT OF OFFICE', 'Hey, I am vacation. wil get back to you in 2 days.Sorry for the delay.\nRegards,\nSakthi');
                            // Send a reply
                            await gmail.users.messages.send({
                                userId: 'me',
                                requestBody: {
                                    threadId: emailDetails.data.threadId,
                                    raw: raw, // Provide the actual content
                                },
                            });
                            // Push messageid to array
                            repliedOnce.push(messageId)
                        }


                        // Add labels to the email
                        const labelsResponse = await gmail.users.labels.list({
                            userId: 'me',
                        });

                        const labels = labelsResponse.data.labels;
                        var attentionLabel = labels.find((label) => label.name === 'attentionrequired');

                        // If the label doesn't exist, create it
                        if (!attentionLabel) {
                            const createLabelResponse = createLabel(gmail, 'attentionrequired')
                            attentionLabel = createLabelResponse.data;
                        }

                        await modifyMessage(gmail, messageId, [attentionLabel.id], ['INBOX'])

                        console.log(`Replied to and labeled email with ID: ${messageId}`);
                    } else {
                        console.log(`Already added to label`);
                    }
                } else {
                    console.log(`Skipped email with prior replies. ID: ${messageId}`);
                }
            }
        } else {
            console.log('No unread messages to reply to');
        }
    } catch (err) {
        console.error('Error processing emails:', err);
    }
};

module.exports = {
    scheduleProcessEmails,
};
