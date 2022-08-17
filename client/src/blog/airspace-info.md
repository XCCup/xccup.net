### Von Lufträumen, Höhenmessungen und Standardatmospähren

<figcaption class="blockquote-footer">Stephan Schöpe</figcaption>

In letzter Zeit mehren sich vertikale Luftraumverletzungen und uns erreichen viele Fragen dazu. Ich versuche daher in diesem Artikel zu erläutern, wie Lufträume im XCCup überprüft werden und an welcher Stelle Verwirrungen auftreten können.

Generell gibt es laut Ausschreibung keine Toleranzen. Bei der Entwicklung des aktuellen XCCup haben wir also auch keine eingebaut.

Seitliche Einflüge in Lufträume sind relativ einfach zu erkennen. Horizontal ist GPS heutzutage sehr genau. Wenn man drin ist, ist man drin.
Vertikale Luftraum-Annäherungen und Einflüge sind deutlich schwieriger zu prüfen und einzuhalten, denn generell ist eine korrekte Höhenmessung schwierig.

Um dies zu nachvollziehen zu können, muss man die Unterschiede zwischen folgenden Begriffen verstehen:

###### GPS Höhe
Die vom GPS ermittelte Höhe wird mit zunehmender Höhe unter Umständen sehr ungenau. Daher wird in der Luftfahrt weiterhin der Luftdruck zur Höhenmessung eingesetzt.

###### Barometrische Höhe
Wer sich noch an seine B-Schein Theorie erinnert weiß, dass sich der Luftdruck leider regelmäßig ändert. Die meisten modernen Geräte checken vor dem Start die aktuelle GPS Höhe und kalibrieren damit die barometrische Höhenmessung. Manche Geräte beziehen den aktuellen [QNH](https://www.dwd.de/DE/service/lexikon/Functions/glossar.html?lv3=102126&lv2=102116) vom nächsten Flugplatz oder entnehmen die Höhe des aktuellen Standortes einer Höhendatenbank<sup>1</sup>. Alternativ kann man auch am Startplatz manuell die Höhe, oder den aktuellen örtlichen QNH einstellen. Alle drei Varianten führen bei sachgerechter Umsetzung zum gleichen Ergebnis: einem korrekt eingestellten Höhenmesser.

###### Flugfläche (FL / Flightlevel)
Bei Lufträumen, die als Flugflächen angegeben sind (z.B.: FL100) ist der Höhenmesser hingegen auf ICAO Standard Atmosphäre einzustellen ([ISA](https://www.dwd.de/DE/service/lexikon/begriffe/S/Standardatmosphaere_pdf.pdf?__blob=publicationFile&v=3) - 1013,25 hPa). An Hochdrucktagen liegt die tatsächliche Höhe des Flightlevel somit etwas höher und an Tiefdrucktagen etwas tiefer.
Einige moderne Geräte bieten die Möglichkeit beides (QNH Höhe + Flugfläche) gleichzeitig anzuzeigen. Wer nur mit GPS Höhe oder QNH Baro Höhe fliegt, kann sich nicht darauf verlassen an Tiefdrucktagen nicht doch versehentlich zu hoch zu fliegen. Nur bei einem QNH von 1013 hPa ist die Barohöhe identisch mit der umgerechneten Höhe der Flugfläche. Pro Hektopascal Differenz zur Standardatsmosphäre verschiebt sich die Flugfläche um ca. 8m nach oben oder unten. Bei  Tiefdrucklagen von 1003 hPa sind das beispielsweise schon 80m! 

##### Was steht im IGC-File?
Laut IGC-Spezifikation wird in einem IGC-File für jede Position die GPS Höhe und die Höhe nach ICAO Standard Atmosphäre gespeichert. Die korrekt eingestellte barometrische Höhe im Gerät sieht also nur der Pilot während des Fluges. Sie ist aber zumindest bei Lufträumen, die in MSL angegeben sind, die einzige aussagekräftige Höhenmessung. (MSL = Mean Sea Level / Normal Null)

##### Und jetzt?
Praktisch bedeutet dies allerdings, dass sich zur Überprüfung auf Luftraumverletzungen nur die GPS Höhe eignet. Dies hat zwei Gründe:

Zum einen loggen nicht alle Geräte die Druckhöhe und somit wäre es unfair, wenn man bei einem Piloten die Druckhöhe, bei einem Anderen aber die GPS Höhe verwenden würde<sup>2</sup>.

Zum anderen müsste man die (ISA-)Druckhöhe aus dem IGC-File erst mit dem lokalen QNH umrechnen auf die tatsächliche Höhe<sup>3</sup>. Zumindest bei Lufträumen, die in MSL angegeben sind.
Flugflächen kann man perfekt mit den im IGC-File gespeicherten Höhen vergleichen, da sich beide ja auf die Standardatmosphäre beziehen.
Im XCCup verwenden wir also nur die GPS-Höhe aus dem IGC-File, um Lufträume zu checken. Bei Einflügen von nur wenigen Metern vertikal schauen wir aber im Zweifel manuell auf die Druckhöhe und rechnen diese mit dem passenden QNH in die absolute Höhe um (Dies ist nicht ganz genau, da auch die Temperatur und die Schichtung der Atmosphäre eine Rolle spielen, aber genauer als GPS in der Höhe).
Auch bei extremen Tiefdrucklagen mit hoher Basis haben wir einen Blick auf die maximale Höhe (Siehe oben - die generelle Höhenbegrenzung im XCCup Gebiet von FL100 sinkt in der tatsächlichen Höhe ab). Im Zweifel entscheiden wir immer zugunsten des Piloten.

Ob dies die beste Vorgehensweise ist, kann man natürlich infrage stellen. In der laufenden Saison können wir sie aber nicht mehr ändern. Im Zweifel lohnt es sich aber generell vertikal Abstand zu Lufträumen zu halten, falls es doch unbeabsichtigter Weise noch steigt. Nicht nur, damit der Flug eingereicht werden kann, sondern um generell keine Luftraumverletzungen zu provozieren. Dann braucht man auch keine Toleranzen und auf 50 Meter kommt es meistens nicht an. Die meisten weiten Flüge im XCCup kamen ohne große Annäherung an einen Luftraum aus. (Davon abgesehen empfiehlt die Deutsche Flugsicherung generell nur bis FL95 zu steigen um, den IFR Verkehr besser vom VFR Verkehr zu trennen: https://www.dhv.de/piloteninfos/gelaende-luftraum-natur/luftraumluftrecht/dfs-trennflaeche-fl-95/) 

Auch hilft es, wenn die Luftraumdaten aktuell sind. Wir verwenden diese Quelle: https://www.daec.de/fachbereiche/luftraum-flugsicherheit-flugbetrieb/luftraumdaten/


##### Andere online Wettbewerbe
Manchmal werden wir darauf hingewiesen, dass ein Flug in einem anderen Online-Wettbewerb keine Luftraumverletzung hätte. Das kann gut sein. Vielleicht gibt es dort Toleranzen, ältere Luftraumdaten oder andere Interpretationen in der Umsetzung. Wir haben da leider keine Einsicht in den Prozess<sup>4</sup>. Falls jemand allerdings einen Fehler in der Umsetzung im XCCup finden sollte, freuen wir uns über Hinweise dazu und korrigieren diesen natürlich.

Für Verbesserungsvorschläge sind wir immer offen (info@xccup.net). Auch wenn in der laufenden Saison natürlich nichts verändert werden kann. In einer optimalen Welt hätte jedes IGC-File GPS und Druckhöhe und wir hätten von jedem Flug den zugehörigen QNH (Den haben wir seit Kurzem, befindet sich aber noch in der Testphase). So könnten wir für FL Lufträume die ISA Höhe und für MSL die angenäherte barometrische Höhe verwenden.
Oder man hält einfach entsprechenden Abstand und es wird für alle Beteiligten stressfreier 😜

***

<sup>1</sup>Die automatische Kalibrierung wird genauer, wenn man das Gerät schon einige Zeit vor dem Start einschaltet und während dessen nicht bewegt. Ansonsten könnte es sein, dass man mit falsch eingestellten Höhenmesser los fliegt.

<sup>2</sup>Man könnte in Erwägung ziehen, in Zukunft nur noch IGC-Files mit GPS und Druckhöhe zuzulassen.

<sup>3</sup>Theoretisch spielt noch die Temperatur und die Schichtung der Atmosphäre eine Rolle, um ganz genau zu rechnen.

<sup>4</sup>Der Code und somit auch der Prozess der Kontrolle der Lufträume des XCCup ist öffentlich von jedem transparent einsehbar: https://github.com/XCCup/xccup.net