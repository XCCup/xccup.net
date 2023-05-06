### Automatischer Upload von Flügen

Verschiedene internetfähige Tracker bieten Euch die Möglichkeit Flüge direkt aus dem Gerät auf XC Plattformen hochzuladen.
Flymaster und Skytraxx bieten dies für den XCCup an. Apps, in denen Leonardo-Server durch Euch selbst konfiguriert werden können (z.B. Flyskyhy), werden durch die XCCup API unterstützt.
Wer die XCCup API direkt ansprechen möchte, erhält hier ebenfalls alle notwendigen Informationen.

###### Hinweis
Beim Upload wird Dein im Profil als Standard definiertes Gerät angenommen. 

#### Flymaster
- Gehe auf lt.flymaster.net 
- Navigiere zu "My Account" > "My Instruments" > "Edit" > "XC-Servers" > "Add XC-Server" 
- Wähle den "XCCup" aus
- Gebe die Zugangsdaten für den XCCup ein
- Aktiviere "Auto Upload"

#### Skytraxx
- Stelle sicher, dass die neue Firmware auf Deinem Gerät installiert ist
- Im Hauptmenü auf Einstellungen gehen
- Auf Pilot klicken
- Profil erstellen mit Name, Schirmmarke und -typ, Zulassung 
- Eingegebenes Profil auswählen (sollte jetzt in Einstellungen neben Pilot angezeigt sein)
- Man kann mehrere Profile erstellen, wenn man mit verschiedenen Schirmen fliegt. Dann einfach sicherstellen, dass das korrekte Profil vor dem Flug ausgewählt wird.
- In Einstellungen auf OLC klicken
- Profile klicken
- Hinzufügen klicken
- Den relevanten Contest auswählen (DHV-XC, XContest, XCglobe oder XCCup)
- Profilname eingeben
- Dann Benutzername und Passwort für den gewählten Contest eingeben (derselbe BN und dasselbe PW wie in der Webversion)
- Login testen
- Nach dem Flug im Hauptmenü zum Flugbuch gehen und den Flug auswählen (normalerweise wird der Flug unmittelbar nach der Landung automatisch angezeigt und dieser Schritt ist nicht notwendig)
- Im Flugmenü auf Flug Hochladen klicken
- Den gewünschten Contest auswählen und der Flug wird hochgeladen 

#### Flyskyhy
- Wähle "Other Leonardo Server" aus
- Gebe die URL https://xccup.net/api/flights/leonardo an
- Fülle Deine Zugangsdaten aus

#### XCCup API
Bei der Implementierung der API haben wir versucht uns an den "Leonardo-Standard" zu halten.

* URL: https://xccup.net/api/flights/leonardo
* HTTP-Method: POST
* Content-Type: multipart/form-data
* Fields:
    * user: User e-mail
    * pass: User password
    * IGCigcIGC: IGC file content (plain-text)
    * igcfn: IGC file name
    * report: Flight report (optional)

