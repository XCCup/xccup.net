module.exports.MAIL_MESSAGE_PREFIX = (fromName, fromMail) =>
  `Diese Mail wurde Dir über den XCCup von ${fromName} gesendet. 
  
Bitte antworte nicht direkt auf diese E-Mail, sondern nehme doch bitte über ${fromMail} Kontakt mit ${fromName} auf.

------
  
`;

module.exports.REGISTRATION_TEXT = (firstName, activateLink) =>
  `Liebe/r ${firstName}! Willkommen beim XCCup.
  
Um dein Konto final zu aktivieren klicke bitte auf den folgenden Link:
${activateLink}

Wir wünschen Dir allzeit gute Flüge und viel Spaß.

Dein XCCup Team
    
`;
