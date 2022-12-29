module.exports.MAIL_MESSAGE_PREFIX = (fromName) =>
  `Diese Mail wurde Dir über den XCCup von ${fromName} gesendet. 
  
Du kannst direkt auf diese E-Mail antworten.

------
  
`;

module.exports.REGISTRATION_TITLE = "Deine Anmeldung bei XCCup.net";

module.exports.REGISTRATION_TEXT = (firstName, activationLink) =>
  `Hallo ${firstName}! Willkommen beim XCCup.

Um dein Konto zu aktivieren klicke bitte auf den folgenden Link:
${activationLink}

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

module.exports.CONFIRM_CHANGE_EMAIL_TEXT = (firstName, confirmLink, newEmail) =>
  `Hallo ${firstName}!

um die Änderung deiner Email-Adresse (${newEmail}) zu bestätigen klicke bitte auf folgenden Link:
${confirmLink}

Dein XCCup Team

`;
module.exports.NOTIFY_CHANGE_EMAIL_TITLE =
  "Änderungen deiner Email Adresse im XCCup";

// TODO: Replace admin email with Constant or env
module.exports.NOTIFY_CHANGE_EMAIL_TEXT = (firstName, newEmail) =>
  `Hallo ${firstName}!

Du hast die Änderung deiner Email-Adresse angefordert. Wir haben dir eine Email mit einem Aktivierungslink an deine neue Email-Adresse (${newEmail}) geschickt.

Falls du diese Änderung nicht angefordert hast wende dich bitte an info@xccup.net

Dein XCCup Team
    
`;

module.exports.AIRSPACE_VIOLATION_TITLE = "Luftraumverletzung auf XCCup.net";

module.exports.AIRSPACE_VIOLATION_TEXT = (firstName, flightLink) =>
  `Hallo ${firstName}!

Du hast einen Flug hochgeladen, der eine Luftraumverletzung beinhaltet.
${flightLink}

Bitte gebe eine Stellungsnahme zu dieser Luftraumverletzung ab. 
Nutze zur Stellungnahme bitte das Feld "Luftraumkommentar" (Flug bearbeiten) in deinem Flug.
Die Moderatoren werden dies in Kürze bewerten. Bis dahin ist dein Flug nicht in den offiziellen Listen aufzufinden.

Dein XCCup Team
    
`;

module.exports.AIRSPACE_VIOLATION_ACCEPTED_TITLE =
  "Luftraumprüfung abgeschlossen (Akzeptiert)";

module.exports.AIRSPACE_VIOLATION_ACCEPTED_TEXT = (firstName, flightLink) =>
  `Hallo ${firstName}!

Deine mögliche Luftraumverletzung wurde geprüft und akzeptiert. Dein Flug ist ab nun regulär auf der Webseite einsehbar.
${flightLink}

Dein XCCup Team
    
`;
module.exports.NEW_PERSONAL_BEST_TITLE = "Neue persönliche Bestleistung 🎉🥳🍾";

module.exports.NEW_PERSONAL_BEST_TEXT = (firstName, flightLink) =>
  `Hallo ${firstName},

Herzlichen Glückwunsch zur neuen persönlichen Bestleistung!
${flightLink}

Dein XCCup Team`;

module.exports.AIRSPACE_VIOLATION_REJECTED_TITLE =
  "Luftraumprüfung abgeschlossen (Abgelehnt)";

module.exports.AIRSPACE_VIOLATION_REJECTED_TEXT = (firstName, message) =>
  `Hallo ${firstName}!

Deine Luftraumverletzung wurde geprüft und der Flug abgelehnt. 

Begründung:
${message}

Dein XCCup Team
    
`;

module.exports.NEW_AIRSPACE_VIOLATION_TITLE = "Neuer Flug mit LRV";

module.exports.NEW_AIRSPACE_VIOLATION_TEXT = (
  flight,
  user,
  airspaceViolation
) => `Hallo Admins!
Es wurde versucht einen Flug mit einer Luftraumverletzung hochzuladen.
Flug ID: ${flight.externalId}
Pilot: ${user.firstName} ${user.lastName}
Luftraumverletzung: 
${airspaceViolation}
Euer Server-Knecht
    
`;

module.exports.NEW_G_CHECK_INVALID_TITLE = "Neuer Flug mit negativem G-Check";

module.exports.NEW_G_CHECK_INVALID_TEXT = (
  firstName,
  lastName
) => `Hallo Admins!

Es wurde versucht einen Flug mit einem negativen G-Check hochzuladen.

Pilot: ${firstName} ${lastName}

Euer Server-Knecht
    
`;

module.exports.GOOGLE_ELEVATION_ERROR_TITLE =
  "Fehler beim Abrufen der Google Elevation API";

module.exports.GOOGLE_ELEVATION_ERROR_TEXT = (flightId, error) => `Hallo Admins!

Beim Flug https://xccup.net/flug/${flightId} ist ein Fehler beim Abruf der GND Daten aufgetreten.

${error}

Euer Server-Knecht`;

module.exports.NEW_ADMIN_TASK_TITLE = "Neue Admin Aufgabe";

module.exports.NEW_ADMIN_TASK_TEXT = `Hallo Admins!

Es es gibt was Neues für Euch zu tun. Schaut doch mal vorbei https://xccup.net/admin

Euer Server-Knecht
    
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


Falls Du in Zukunft keine Mails mehr zu neuen Kommentaren erhalten möchtest, kannst Du dies in Deinem Profil einstellen.  

Dein XCCup Team
    
`;

module.exports.NEW_FLIGHT_COMMENT_RESPONSE_TEXT = (
  firstName,
  commenterName,
  commentMessage,
  flightLink
) =>
  `Hallo ${firstName}!

Auf deinen Kommentar wurde geantwortet.
${flightLink}

${commenterName} schrieb:
${commentMessage}


Falls Du in Zukunft keine Mails mehr zu neuen Kommentaren erhalten möchtest, kannst Du dies in Deinem Profil einstellen.  

Dein XCCup Team
    
`;

module.exports.ADDED_TO_TEAM_TITLE = "Dein Team auf XCCup.net";

module.exports.ADDED_TO_TEAM_TEXT = (teamName) =>
  `Hallo!

Du wurdest dem Team ${teamName} hinzugefügt.

Wir wünschen Euch viel Erfolg in der neuen Saison!

Falls Du garnicht in das Team aufgenommen werden wolltest, wende Dich bitte direkt an uns.

Dein XCCup Team
    
`;

module.exports.DAILY_WINNER_TITLE = (date) => `XCCup Tagessieger ${date}`;

module.exports.DAILY_WINNER_TEXT = (numberOfFlights, winnerId, currentTime) =>
  `Hallo Bärbel,
Heute gab es insgesamt ${numberOfFlights} Wertungsflüge. 
        
Bis jetzt ${currentTime} liegt der Flug https://xccup.net/flug/${winnerId} vorne. Den aktuellen Stand findest du auf der Startseite https://xccup.net.
        
Viele Grüße Deine Admins`;
