// Placeholder values
const recipients = require('fs').readFileSync('list.txt', 'utf8').trim().split('\n');

// Function to generate a random number of a given length
function generateRandomNumber(count) {
    return Math.floor(Math.random() * Math.pow(10, count)).toString().padStart(count, '0');
}

// Function to generate a random string of a given length and case
function generateRandomString(count, type) {
    let chars;
    if (type === 'lower') {
        chars = 'abcdefghijklmnopqrstuvwxyz';
    } else if (type === 'upper') {
        chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    }
    let randomString = '';
    for (let i = 0; i < count; i++) {
        randomString += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return randomString;
}

// Function to replace placeholders in the content with specified values
function replacePlaceholders(content, recipient) {
    // Check if recipient is an array
    if (!Array.isArray(recipient)) {
        console.error('Recipient should be an array.');
        return content;
    }

    // Iterate over each recipient
    recipient.forEach((email, index) => {
        // Define placeholders dynamically based on index
        const placeholders = {
            '##date1##': new Date().toLocaleString('en-US', { timeZone: 'UTC' }), // Current date and time in a readable format
            '##date##': new Date().toISOString(), // Current date and time in ISO format
            '##victimemail##': email, // Victim's email address
            '##victimdomain##': email.split('@')[1], // Victim's domain name with extension
            '##victimdomain1##': email.split('@')[1].split('.')[0].charAt(0).toUpperCase() + email.split('@')[1].split('.')[0].slice(1), // Victim's domain name with first letter capitalized
            '##victimdomain2##': email.split('@')[1].split('.')[0].toUpperCase(), // Victim's domain name in all uppercase
            '##victimdomainlogo##': email.split('@')[1] ? (email.split('@')[1].includes('microsoft.com') ? 'Microsoft Logo' : 'Path/URL to Default Logo') : 'Path/URL to Default Logo', // Display Microsoft logo if domain is microsoft.com, otherwise display default logo path or URL
            '##link##': 'https://youtube.com' // Default link URL
        };

        // Add placeholders for random number and strings
        for (let i = 1; i <= 10; i++) {
            const numPlaceholder = `##num${i}##`;
            placeholders[numPlaceholder] = generateRandomNumber(i);
        }

        for (let i = 1; i <= 10; i++) {
            const lowerStringPlaceholder = `##stringlower${i}##`;
            placeholders[lowerStringPlaceholder] = generateRandomString(i, 'lower');
            const upperStringPlaceholder = `##stringupper${i}##`;
            placeholders[upperStringPlaceholder] = generateRandomString(i, 'upper');
        }

        // Replace placeholders in the content
        for (const key in placeholders) {
            if (placeholders.hasOwnProperty(key)) {
                const regex = new RegExp(key, 'g');
                content = content.replace(regex, placeholders[key]);
            }
        }
    });

    return content;
}

module.exports = {
    replacePlaceholders
};
