module.exports.MAIL_MESSAGE_PREFIX = (fromName) =>
  `Diese Mail wurde Dir über den XCCup von ${fromName} gesendet. 
  
Du kannst direkt auf diese E-Mail antworten.

------
  
`;

module.exports.REGISTRATION_TITLE = "Deine Anmeldung bei XCCup.net";

module.exports.REGISTRATION_TEXT = (firstName, activateLink) =>
  `Liebe/r ${firstName}! Willkommen beim XCCup.

Um dein Konto final zu aktivieren klicke bitte auf den folgenden Link:
${activateLink}

Wir wünschen Dir allzeit gute Flüge und viel Spaß.

Dein XCCup Team
    
`;

module.exports.NEW_PASSWORD_TITLE = "Zugangsdaten XCCup.net";

module.exports.NEW_PASSWORD_TEXT = (firstName, password) =>
  `Hallo ${firstName}!

Dein Passwort wurde zurückgesetzt. 
Dein neues Passwort lautet: ${password}

Wir empfehlen Dir das Passwort bei der nächsten Anmeldung zu ändern.

Dein XCCup Team
    
`;

module.exports.REQUEST_NEW_PASSWORD_TITLE = "Passwort zurücksetzen XCCup.net";

module.exports.REQUEST_NEW_PASSWORD_TEXT = (firstName, resetLink) =>
  `Hallo ${firstName}!

Es wurde angefordert Dein Passwort zurückzusetzen.

Um den Vorgang abzuschließen klicke bitte auf folgenden Link:
${resetLink}

Du wirst darauf eine Mail mit Deinem neuen Passwort erhalten.

Dein XCCup Team
    
`;

module.exports.CONFIRM_NEW_ADDRESS_TITLE = "E-Mail bestätigen XCCup.net";

module.exports.CONFIRM_NEW_ADDRESS_TEXT = (firstName, confirmLink) =>
  `Hallo ${firstName}!

Du möchtest Deine hinterlegte E-Mail-Adresse ändern.

Um die Änderung abzuschließen klicke bitte auf folgenden Link:
${confirmLink}

Dein XCCup Team
    
`;
