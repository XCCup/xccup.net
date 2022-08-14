<template>
  <div class="container py-2">
    <h3>
      Von Luftr&auml;umen, H&ouml;henmessungen und Standardatmosp&auml;hren
    </h3>
    <figcaption class="blockquote-footer">Stephan Sch&ouml;pe</figcaption>

    <p>
      In letzter Zeit mehren sich vertikale Luftraumverletzungen und uns
      erreichen viele Fragen dazu. Ich versuche daher in diesem Artikel zu
      erl&auml;utern, wie Luftr&auml;ume im XCCup &uuml;berpr&uuml;ft werden und
      an welcher Stelle Verwirrungen auftreten k&ouml;nnen.
    </p>
    <p />

    <p>
      Generell gibt es laut Ausschreibung keine Toleranzen. Bei der Entwicklung
      des aktuellen XCCup haben wir also auch keine eingebaut.
    </p>

    <p>
      Seitliche Einfl&uuml;ge in Luftr&auml;ume sind relativ einfach zu
      erkennen. Horizontal ist GPS heutzutage sehr genau. Wenn man drin ist, ist
      man drin. <br />
      Vertikale Luftraum-Ann&auml;herungen und Einfl&uuml;ge sind deutlich
      schwieriger zu pr&uuml;fen und einzuhalten, denn generell ist eine
      korrekte H&ouml;henmessung sehr schwierig.
    </p>
    <p>
      Um dies zu nachvollziehen zu k&ouml;nnen, muss man die Unterschiede
      zwischen folgenden Begriffen verstehen:
    </p>

    <h6>GPS H&ouml;he</h6>
    <p>
      Die vom GPS ermittelte H&ouml;he wird mit zunehmender H&ouml;he unter
      Umst&auml;nden sehr ungenau. Daher wird in der Luftfahrt der Luftdruck zur
      H&ouml;henmessung eingesetzt.
    </p>
    <h6>Barometrische H&ouml;he</h6>
    <p>
      Wer sich noch an seine B-Schein Theorie erinnert weiß, dass sich der
      Luftdruck leider regelm&auml;ßig &auml;ndert. Die meisten modernen
      Ger&auml;te checken vor dem Start die aktuelle GPS H&ouml;he und
      kalibrieren damit die barometrische H&ouml;henmessung. Manche Ger&auml;te
      beziehen den aktuellen QNH vom n&auml;chsten Flugplatz oder entnehmen die
      H&ouml;he des aktuellen Standortes einer H&ouml;hendatenbank<sup>1</sup>.
      Alternativ kann man auch am Startplatz manuell die H&ouml;he, oder den
      aktuellen &ouml;rtlichen QNH einstellen. Alle drei Varianten f&uuml;hren
      bei sachgerechter Umsetzung zum gleichen Ergebnis: einem korrekt
      eingestellten H&ouml;henmesser.
    </p>
    <h6>Flugfl&auml;che (FL / Flightlevel)</h6>
    <p>
      Bei Luftr&auml;umen, die als Flugfl&auml;chen angegeben sind (z. B.:
      FL100) ist der H&ouml;henmesser hingegen auf ISA Standardatmosph&auml;re
      einzustellen (1013,25 hPa). Einige moderne Ger&auml;te bieten die
      M&ouml;glichkeit beides (QNH H&ouml;he + ISA H&ouml;he) gleichzeitig
      anzuzeigen.
    </p>

    <h5>Was steht im IGC-File?</h5>
    <p>
      Laut IGC-Spezifikation wird in einem IGC-File f&uuml;r jede Position die
      GPS H&ouml;he und die H&ouml;he nach ISA Standard Atmosph&auml;re
      gespeichert (1013,25 hPa). Die korrekt eingestellte barometrische
      H&ouml;he im Ger&auml;t sieht also nur der Pilot w&auml;hrend des Fluges.
      Sie ist aber zumindest bei Luftr&auml;umen, die in MSL angegeben sind die
      einzige aussagekr&auml;ftige H&ouml;henmessung. (MSL = Mean Sea Level /
      Normal Null)
    </p>
    <h5>Und jetzt?</h5>
    <p>
      Praktisch bedeutet dies, dass sich zur Kontrolle von Luftr&auml;umen nur
      die GPS H&ouml;he eignet. Dies hat zwei Gr&uuml;nde:
    </p>
    <p>
      Zum einen loggen nicht alle Ger&auml;te die Druckh&ouml;he und somit
      w&auml;re es unfair, wenn man bei einem Piloten die Druckh&ouml;he, bei
      einem Anderen aber die GPS H&ouml;he verwenden w&uuml;rde<sup>2</sup>.
    </p>

    <p>
      Zum anderen m&uuml;sste man die (ISA-)Druckh&ouml;he aus dem IGC-File erst
      mit dem lokalen QNH umrechnen auf die tats&auml;chliche
      H&ouml;he<sup>3</sup>. Zumindest bei Luftr&auml;umen, die in MSL angegeben
      sind. <br />
      Flugfl&auml;chen kann man perfekt per Standard Druckh&ouml;he messen, da
      diese sich an dieser orientieren. An Hochdrucktagen liegt die
      tats&auml;chliche H&ouml;he des Flightlevel also etwas h&ouml;her und an
      Tiefdrucktagen etwas tiefer.
      <!-- (Wer sich damit besch&auml;ftigen m&ouml;chte
      findet hier einen Rechner, den ich mir mal zum Rumspielen gebaut habe:
      <a href="https://fl.stephanschoepe.de" target="_blank"
        >https://fl.stephanschoepe.de</a
      >) -->
    </p>

    <p>
      Im XCCup verwenden wir also nur die GPS-H&ouml;he aus dem IGC-File um
      Luftr&auml;ume zu checken. Bei Einfl&uuml;gen von nur wenigen Metern
      vertikal schauen wir aber im Zweifel manuell auf die Druckh&ouml;he und
      rechnen diese mit dem passenden QNH in die absolute H&ouml;he um (Dies ist
      nicht ganz genau, da auch die Temperatur und die Schichtung der
      Atmosph&auml;re eine Rolle spielen, aber genauer als GPS in der
      H&ouml;he). <br />
      Auch bei extremen Tiefdrucklagen mit hoher Basis haben wir einen Blick auf
      die maximale H&ouml;he (Siehe oben - die generelle H&ouml;henbegrenzung im
      XCCup Gebiet von FL100 sinkt in der tats&auml;chlichen H&ouml;he ab). Im
      Zweifel entscheiden wir immer zugunsten des Piloten.
    </p>
    <p>
      Ob dies die beste Vorgehensweise ist, kann man nat&uuml;rlich infrage
      stellen. In der laufenden Saison k&ouml;nnen wir sie aber nicht mehr
      &auml;ndern. Im Zweifel lohnt es sich aber generell vertikal Abstand zu
      Luftr&auml;umen zu halten, falls es doch unbeabsichtigter Weise noch
      steigt. Nicht nur, damit der Flug eingereicht werden kann, sondern um
      generell keine Luftraumverletzungen zu provozieren. Dann braucht man auch
      keine Toleranzen und auf 50 Meter kommt es meistens nicht an. Die meisten
      weiten Fl&uuml;ge im XCCup kamen ohne große Ann&auml;herung an einen
      Luftraum aus.
    </p>

    <h5>Andere online Wettbewerbe</h5>

    <p>
      Manchmal argumentieren Piloten, dass ein Flug in einem anderen
      Online-Wettbewerb keine Luftraumverletzung h&auml;tte. Das kann gut sein.
      Vielleicht gibt es dort Toleranzen oder andere Interpretationen in der
      Umsetzung. Wir haben da leider keine Einsicht in den Prozess<sup>4</sup>.
      Falls jemand allerdings einen Fehler in der Umsetzung im XCCup finden
      sollte, freuen wir uns &uuml;ber Hinweise dazu und korrigieren diesen
      nat&uuml;rlich.
    </p>

    <p>
      F&uuml;r Verbesserungsvorschl&auml;ge sind wir offen. Auch wenn in der
      laufenden Saison nat&uuml;rlich nichts ver&auml;ndert werden kann. In
      einer optimalen Welt h&auml;tte jedes IGC-File GPS und Druckh&ouml;he und
      wir h&auml;tten von jedem Flug den zugeh&ouml;rigen QNH (QNH haben wir
      seit Kurzem, befindet sich aber noch in der Testphase). So k&ouml;nnten
      wir f&uuml;r FL Luftr&auml;ume die ISA H&ouml;he und f&uuml;r MSL die
      angen&auml;herte barometrische H&ouml;he verwenden.<br />
      Oder man h&auml;lt einfach entsprechenden Abstand und es wird f&uuml;r
      alle Beteiligten stressfreier 😜
    </p>
    <hr />
    <p>
      <sup>1</sup>Die automatische Kalibrierung wird genauer, wenn man das
      Ger&auml;t schon einige Zeit vor dem Start einschaltet und w&auml;hrend
      dessen nicht bewegt. Ansonsten k&ouml;nnte es sein, dass man mit falsch
      eingestellten H&ouml;henmesser los fliegt.
    </p>

    <p>
      <sup>2</sup>Man k&ouml;nnte in Erw&auml;gung ziehen, in Zukunft nur noch
      IGC-Files mit GPS und Druckh&ouml;he zuzulassen.
    </p>
    <p>
      <sup>3</sup>Theoretisch spielt noch die Temperatur und die Schichtung der
      Atmosph&auml;re eine Rolle, um ganz genau zu rechnen.
    </p>

    <p>
      <sup>4</sup>Der Code und somit auch der Prozess der Kontrolle der
      Luftr&auml;ume des XCCup ist &ouml;ffentlich von jedem transparent
      einsehbar:
      <a href="https://github.com/XCCup/xccup.net" target="_blank"
        >https://github.com/XCCup/xccup.net</a
      >
    </p>
  </div>
</template>
