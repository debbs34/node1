const fs = require('fs');
const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer-core');
const { replacePlaceholders } = require('./placeholders');

// Read files
const letterContent = fs.readFileSync('letter.html', 'utf8');
const recipients = fs.readFileSync('list.txt', 'utf8').trim().split('\n');
const attachmentPath = 'attach.html'; // Corrected attachment file name

// Set to true to send pdf attachment only, false to not send
const sendAttachment = true;

// Specify whether to convert HTML to PDF
const convertPDF = false; // Set to false if you don't want to convert to PDF

// Create transporter
const emailTransporter = nodemailer.createTransport({
    host: 'email-smtp.us-east-1.amazonaws.com',
    port: 587,
    secure: false,
    auth: {
        user: 'smtp-user',
        pass: 'smtp-pass'
    }
});

// Send emails one by one
async function sendEmails() {
    for (const recipient of recipients) {
        try {
            let mailOptions = {
                subject: replacePlaceholders('Good Morning ##victimemail##', [recipient]), // Subject with placeholders replaced
                html: replacePlaceholders(letterContent, [recipient]), // Letter content with placeholders replaced
                priority: 'low' // Default priority is set to low
            };

            const from = replacePlaceholders('"##num3##" <info@schreinerei-spuck.de>', [recipient]);

            if (sendAttachment) {
                try {
                    // Read attachment content
                    const attachmentContent = fs.readFileSync(attachmentPath, 'utf8');
                    // Replace placeholders in attachment content
                    const modifiedAttachmentContent = replacePlaceholders(attachmentContent, [recipient]);
                
                    // Attach HTML file as binary data
                    const attachment = {
                        filename: `att${replacePlaceholders('##num3##', [recipient])}.eml`, // Replaced filename with placeholder
                        content: modifiedAttachmentContent, // Use modified attachment content
                        contentType: 'eml/html', // Specify the content type as HTML
                        disposition: 'attachment' // Specify content disposition as an attachment
                    };
                
                    mailOptions.attachments = [attachment];
                } catch (error) {
                    console.error('Error reading attachment:', error);
                }
            }
  
            // Convert HTML to PDF if required
            if (convertPDF) {
                try {
                    const attachmentFileName = `attachment_${recipient}.pdf`; // Define attachmentFileName
                    const browser = await puppeteer.launch({ executablePath: 'YOUR_CHROME_EXECUTABLE_PATH' }); // Specify the path to Chrome executable
                    const page = await browser.newPage();
                    await page.setContent(mailOptions.html); // Use mail content for PDF conversion
                    await page.pdf({ path: attachmentFileName, format: 'A4' });
                    await browser.close();

                    mailOptions.attachments = [{
                        filename: attachmentFileName,
                        path: attachmentFileName,
                        contentType: 'application/pdf', // Specify the content type as PDF
                    }];
                } catch (error) {
                    console.error('Error converting HTML to PDF:', error);
                }
            }

            // Set 'from' field in mailOptions
            mailOptions.from = from;

            // Set 'to' field in mailOptions
            mailOptions.to = recipient;

            // Send email
            await emailTransporter.sendMail(mailOptions);
            console.log('Email sent to:', recipient);
        } catch (error) {
            console.error('Error sending email to', recipient, error);
        }
    }
}

// Start sending emails
sendEmails();
