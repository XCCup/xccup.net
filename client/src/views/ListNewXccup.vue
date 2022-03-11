<template>
  <div class="container py-4">
    <h3>Der neue XCCup</h3>
    <p>
      Da die alte Webseite aus einer Zeit stammte, in der Smartphones noch kein
      Thema waren ist die Bedienung auf mobilen Geräten eher umständlich
      gewesen. Aus diesem Grund haben wir den XCCup mit Fokus auf mobile Geräte
      von neu auf programmiert.
    </p>

    <p>
      So gut wie alle Funktionen haben wir dabei übernommen und zusätzlich noch
      einige Neue hinzugefügt.
    </p>

    <p>
      <strong>
        Vor dem ersten Login müsst ihr auf "Passwort vergessen" klicken und ein
        neues Passwort anfordern. Verwendet dazu bitte eure im alten XCCup
        benutzte E-Mail-Adresse.
      </strong>
    </p>

    <h5>Neue Funktionen:</h5>
    <ul>
      <li>
        Es ist nun möglich auf Kommentare zu antworten, statt einfach nur einen
        Weiteren unter die Vorhandenen zu schreiben.
      </li>
      <li>
        Airbuddies: Solltet ihr zusammen mit anderen Piloten geflogen sein könnt
        ihr dessen Tracklog einblenden. Ihr müsst nichts weiter tun, als euren
        Flug hochzuladen und findet dann einen Button “Airbuddies” unter dem
        Barogramm. (Natürlich nur, wenn der andere Pilot auch seinen Flug
        hochgeladen hat und eine min. Punktzahl von aktuell 30 Punkten erflogen
        hat)
      </li>
      <li>
        Die Tabellen der Wertungen zeigen abhängig von der Gerätegröße
        unterschiedlich viele Details an. Dies unterstützt die Lesbarkeit auf
        kleinen Geräten. Hier Ihr könnt Euer Smartphone, o.ä. auch im Querformat
        benutzen.
      </li>

      <li>
        Ihr könnt einen Hike&Fly Flug als solchen kennzeichnen. Die Höhenmeter
        werden in den Flugdetails angezeigt.
      </li>

      <li>
        Ihr könnt jetzt unterschiedliche Schirme im Profil hinterlegen und aus
        diesen beim Hochladen eines neuen Fluges auswählen.
      </li>

      <li>
        "Dark mode" abhängig von euren Geräteeinstellungen. (Dieser ist was die
        Farben angeht noch nicht ganz perfekt…)
      </li>

      <li>Eine Übersicht der Flüge des aktuellen Tages inkl. Karte.</li>

      <li>
        Die Validität der IGC-Datei wird nach dem Hochladen geprüft (G-Record)
      </li>

      <li>
        Eine offene API um ggf. Daten für die eigene Vereinswertung leichter
        auszulesen. Gerne kommen wir Euch da entgegen, falls ihr hier besondere
        Wünsche habt. Nehmt einfach Konktakt mit uns Admins auf.
      </li>
      <li>
        Das komplette Projekt ist "Open Source" - wer möchte, kann sich gerne
        einbringen:
        <a href="https://github.com/XCCup/xccup.net" target="_blank"
          >https://github.com/XCCup/xccup.net</a
        >
      </li>
    </ul>
    <h5>
      Es gab aber auch Änderungen, auf die wir explizit hinweisen möchten. Hier
      müsst ihr ggf. selbst tätig werden.
    </h5>

    <ul>
      <li>
        <strong>Geburtstag:</strong> <br />Der Geburtstag war in der alten
        Plattform nicht bei jedem Teilnehmer korrekt im Profil hinterlegt. Falls
        ihr an der Seniorenwertung teilnehmen wollt, müsst ihr diesen auf
        Korrektheit in Eurem Profil prüfen.
      </li>
      <li>
        <strong>RLP Pokal / Lux Championat:</strong> <br />Bisher musstet ihr
        für die Teilnahme an diesen Wertungen einen entsprechenden Haken in
        Eurem Profil setzen. Diesen Haken gibt es nun nicht mehr. Ihr nehmt
        automatisch an diesen Wertungen teil, wenn ihr das entsprechende
        (Bundes-)Land in Eurem Profil eingestellt habt.
      </li>

      <li>
        <strong>Qualifikation Mosel Open RLP/SL/NRW: </strong>
        <br />Für die Mosel Open werden jedes Jahr Plätze für Teilnehmer aus dem
        Saarland, Rheinland-Pfalz und Nordrhein-Westfalen reserviert. Die
        Vergabe der Plätze für das Saarland, Rheinland-Pfalz erfolgte bislang
        schon über den XCCup. Dies soll in Zukunft auch für NRW erfolgen. Dazu
        müsst ihr ebenfalls das Bundesland in Eurem Profil korrekt eintragen.
      </li>

      <li>
        <strong>T-Shirt Versand:</strong>
        <br />Ihr habt jetzt ebenfalls die Möglichkeit, Eure vollständige
        postalische Anschrift in Eurem Profil zu hinterlegen. Damit haben wir
        als XCCup in Zukunft die Möglichkeit, Euch Eure erflogenen XCCup
        T-Shirts zum Jahresende per Post zu zusenden.
      </li>

      <li>
        <strong>Startplätze:</strong>
        <br />In der Vergangenheit war es möglich, bei einer Streckenmeldung
        manuell einen Startplatz einzugeben. Diese Möglichkeit besteht aus
        diversen Gründen nicht mehr. Es gibt jedoch die Möglichkeit über
        Formulare einen neuen Startplatz an uns zu melden. Welche Startplätze
        aktuell im System hinterlegt sind, seht ihr in der Fluggebietsübersicht
        unter Info.
      </li>

      <li>
        <strong>Streckenmeldungen:</strong>
        <br />Eine Streckenmeldung ist nur noch mit einem gültigen IGC-File
        möglich. Eine Meldung mittels Start-/Landezeugen ist nicht mehr möglich.
      </li>
    </ul>
    <p>
      Die „alte“ Plattform wird noch eine Zeit lang als Archiv - bis alle Daten
      übertragen worden sind - betrieben.
      <a href="https://archiv.xccup.net" target="_blank"
        >https://archiv.xccup.net</a
      >
      <br />
      Streckenmeldungen in der „alten“ Welt werden nicht für die kommende Saison
      gezählt.
    </p>
    <h4>Leonardo Schnittstelle</h4>
    <p>
      Ihr könnt Flüge direkt von euren Instrumenten hochladen, wenn diese die
      Option bieten Flüge direkt an einen Leonardo Server zu senden.
      <br />
      Die URL ist: <code>https://xccup.net/api/flights/leonardo</code> <br />Das
      in eurem Instrument angegebene Fluggerät wird ignoriert. Stattdessen wird
      das Standardgerät aus eurem XCCup Profil zur Berechnung der Punkte
      verwendet.
    </p>
  </div>
</template>

<script setup>
import { setWindowName } from "../helper/utils";

setWindowName("Der neue XCCup");
</script>

<style scoped></style>
