const fs = require('fs');
const path = require('path');

function renderEmailTemplate(data) {
  try {
    // Read the HTML template
    const templatePath = path.join(
      __dirname,
      '../email-templates/notification-template.html'
    );
    let template = fs.readFileSync(templatePath, 'utf8');

    // Replace template variables with actual data
    const replacements = {
      '{{organization}}': data.organization || 'Unknown Organization',
      '{{dataType}}': data.dataType || 'Unknown Data Type',
      '{{purpose}}': data.purpose || 'Unknown Purpose',
      '{{accessLevel}}': (data.accessLevel || 'medium').toLowerCase(),
      '{{status}}': (data.status || 'pending').toLowerCase(),
      '{{retentionDays}}': data.retentionDays || 30,
      '{{userConsent}}': data.userConsent ? 'yes' : 'no',
      '{{dataMinimized}}': data.dataMinimized ? 'yes' : 'no',
      '{{zkProofUsed}}': data.zkProofUsed ? 'yes' : 'no',
      '{{timestamp}}': data.timestamp || new Date().toLocaleString(),
      '{{txHash}}': data.txHash || 'N/A',
      '{{dashboardUrl}}':
        process.env.DASHBOARD_URL || 'https://airavat-userdash.vercel.app/',
      '{{supportUrl}}':
        process.env.SUPPORT_URL || 'https://airavat.com/support',
    };

    // Apply all replacements
    Object.keys(replacements).forEach((key) => {
      template = template.replace(new RegExp(key, 'g'), replacements[key]);
    });

    return template;
  } catch (error) {
    console.error('Error rendering email template:', error);
    // Fallback to simple text template
    return `
      <html>
        <body>
          <h2>Data Access Notification</h2>
          <p>Your data was accessed by ${data.organization} for the purpose: "${data.purpose}" on ${data.timestamp}.</p>
          <p>If this was not you, please contact support.</p>
          <p>- Airavat Team</p>
        </body>
      </html>
    `;
  }
}

module.exports = { renderEmailTemplate };
