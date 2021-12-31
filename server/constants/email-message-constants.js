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
// TODO: Replace subjects with nicer sounding text
module.exports.CONFIRM_CHANGE_EMAIL_TITLE = "E-Mail bestätigen XCCup.net";
module.exports.NOTIFY_CHANGE_EMAIL_TITLE =
  "Änderungen deiner Email Adresse im XCCup";

module.exports.CONFIRM_CHANGE_EMAIL_TEXT = (firstName, confirmLink, newEmail) =>
  `Hallo ${firstName}!

um die Änderung deiner Email-Adresse (${newEmail}) zu bestätigen klicke bitte auf folgenden Link:
${confirmLink}

Dein XCCup Team
    
`;
// TODO: Replace admin email
module.exports.NOTIFY_CHANGE_EMAIL_TEXT = (firstName, newEmail) =>
  `Hallo ${firstName}!

Du hast die Änderung deiner Email-Adresse angefordert. Wir haben dir eine Email mit einem Aktivierungslink an deine neue Email-Adresse (${newEmail}) geschickt.

Falls du diese Änderung nicht angefordert hast wende dich bitte an xccup-beta@stephanschoepe.de

Dein XCCup Team
    
`;

module.exports.AIRSPACE_VIOLATION_TITLE = "Luftraumverletzung auf XCCup.net";

module.exports.AIRSPACE_VIOLATION_TEXT = (firstName, flightLink) =>
  `Hallo ${firstName}!

Du hast einen Flug hochgeladen, der eine Luftraumverletzung beinhaltet.
${flightLink}

Bitte gebe eine Stellungsnahme zu dieser Luftraumverletzung ab, falls Du dies noch nicht getan hast. 
Die Moderatoren werden dies in Kürze bewerten. Bis dahin ist dein Flug nicht in den offiziellen Listen aufzufinden.

Dein XCCup Team
    
`;

module.exports.NEW_FLIGHT_COMMENT_TITLE = "Kommentar auf XCCup.net";

module.exports.NEW_FLIGHT_COMMENT_TEXT = (
  firstName,
  commenterName,
  commentMessage,
  flightLink
) =>
  `Hallo ${firstName}!

Dein Flug hat einen Kommentar erhalten.
${flightLink}

${commenterName} schrieb:
${commentMessage}


Falls Du in Zukunft keine Mails mehr zu neuen Kommentar erhalten möchtest, kannst Du dies in Deinem Profil einstellen.  

Dein XCCup Team
    
`;
