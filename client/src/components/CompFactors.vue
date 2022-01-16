<template>
  <h4>Faktoren</h4>
  <table class="table">
    <thead>
      <tr>
        <th></th>
        <th>Faktoren</th>
        <th colspan="3">Zielflug/JOJO</th>
        <th colspan="3">Dreieck</th>
        <th colspan="3">FAI-Dreieck</th>
      </tr>
      <tr>
        <th></th>
        <th></th>
        <th></th>
        <th>Gesamt</th>
        <th>min. km</th>
        <th></th>
        <th>Gesamt</th>
        <th>min. km</th>
        <th></th>
        <th>Gesamt</th>
        <th>min. km</th>
      </tr>
    </thead>

    <tbody>
      <tr>
        <td>
          <RankingClass
            :ranking-class="{
              key: 'hgFlex',
              description: 'HG FAI-1 (Drachen Turm)',
            }"
            :show-description="true"
          />
        </td>
        <td>2,20</td>
        <td>1,10</td>
        <td>2,42</td>
        <td>24,8</td>
        <td>1,70</td>
        <td>3,74</td>
        <td>16,0</td>
        <td>1,90</td>
        <td>4,18</td>
        <td>14,4</td>
      </tr>
      <tr>
        <td>
          <RankingClass
            :ranking-class="{
              key: 'hgFixed',
              description: 'HG FAI-1 (Drachen turmlos)',
            }"
            :show-description="true"
          />
        </td>
        <td>1,90</td>
        <td>1,10</td>
        <td>2,09</td>
        <td>28,7</td>
        <td>1,70</td>
        <td>3,23</td>
        <td>18,6</td>
        <td>1,90</td>
        <td>3,61</td>
        <td>16,6</td>
      </tr>
      <tr>
        <td>
          <span>HG FAI-5 (Starrflügel)</span>
        </td>
        <td>1,50</td>
        <td>1,10</td>
        <td>1,65</td>
        <td>36,4</td>
        <td>1,50</td>
        <td>2,25</td>
        <td>26,7</td>
        <td>1,80</td>
        <td>2,70</td>
        <td>22,2</td>
      </tr>
      <tr>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
      <tr>
        <td>
          <span>GS Sport low (EN A+B mit einer Streckung &lt;5,2)</span>
        </td>
        <td>2,80</td>
        <td>1,10</td>
        <td>3,08</td>
        <td>19,5</td>
        <td>2,20</td>
        <td>6,16</td>
        <td>9,7</td>
        <td>2,50</td>
        <td>7,00</td>
        <td>8,6</td>
      </tr>
      <tr>
        <td>
          <span>GS Sport high (EN A+B mit einer Streckung &gt;=5,2)</span>
        </td>
        <td>2,70</td>
        <td>1,10</td>
        <td>2,97</td>
        <td>20,2</td>
        <td>2,10</td>
        <td>5,67</td>
        <td>10,6</td>
        <td>2,30</td>
        <td>6,21</td>
        <td>9,7</td>
      </tr>
      <tr>
        <td>
          <span>GS Intermediate low (EN C mit einer Streckung &lt;6,4)</span>
        </td>
        <td>2,60</td>
        <td>1,10</td>
        <td>2,86</td>
        <td>21,0</td>
        <td>2,10</td>
        <td>5,46</td>
        <td>11,0</td>
        <td>2,30</td>
        <td>5,98</td>
        <td>10,0</td>
      </tr>
      <tr>
        <td>
          <span>GS Intermediate high (EN C mit einer Streckung &gt;=6,4)</span>
        </td>
        <td>2,50</td>
        <td>1,10</td>
        <td>2,75</td>
        <td>21,8</td>
        <td>2,10</td>
        <td>5,25</td>
        <td>11,4</td>
        <td>2,30</td>
        <td>5,75</td>
        <td>10,4</td>
      </tr>
      <tr>
        <td>
          <span>GS Performance low (EN-D und einer Streckung von &lt;7,0)</span>
        </td>
        <td>2,40</td>
        <td>1,10</td>
        <td>2,64</td>
        <td>22,7</td>
        <td>2,10</td>
        <td>5,04</td>
        <td>11,9</td>
        <td>2,30</td>
        <td>5,52</td>
        <td>10,9</td>
      </tr>
      <tr>
        <td>
          <span
            >GS Competition high (EN-D oder CCC und einer Streckung von 7,0 und
            mehr)</span
          >
        </td>
        <td>2,20</td>
        <td>1,10</td>
        <td>2,42</td>
        <td>24,8</td>
        <td>2,00</td>
        <td>4,40</td>
        <td>13,6</td>
        <td>2,20</td>
        <td>4,84</td>
        <td>12,4</td>
      </tr>
      <tr>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
      <tr>
        <td>
          <span>GS TANDEM</span>
        </td>
        <td>3,00</td>
        <td>1,10</td>
        <td>3,30</td>
        <td>18,2</td>
        <td>2,25</td>
        <td>6,75</td>
        <td>8,9</td>
        <td>2,75</td>
        <td>8,25</td>
        <td>7,3</td>
      </tr>

      <tr>
        <td></td>
      </tr>
    </tbody>

    <tfoot>
      <tr>
        <td>Mindestpunkte:60</td>
      </tr>
    </tfoot>
  </table>

  <b><u>Faktoren Aufgaben:</u></b>

  <br /><br />
  <table class="TableMain" border="0" cellpadding="0" cellspacing="0">
    <tbody>
      <tr>
        <td style="white-space: nowrap">
          <img src="../images/Aufgaben/Aufg_ziel.png" />
        </td>
        <td style="width: 100%"><b>Freie Strecke (Zielflug)</b></td>
      </tr>
      <tr>
        <td></td>
        <td>
          OHNE GPS-Track wird nur die einfache Entfernung zwischen angegebenem
          Start und Landeplatz gewertet, keine Wegpunkte (online Einreichung per
          Formular).
        </td>
      </tr>

      <tr>
        <td colspan="2"></td>
      </tr>

      <tr>
        <td style="white-space: nowrap">
          <img src="../images/Aufgaben/Aufg_jojo.png" />
        </td>
        <td><b>Freie Strecke (JOJO)</b></td>
      </tr>
      <tr>
        <td></td>
        <td>
          MIT GPS-Track wird die Auswertung unter Berücksichtigung von
          Wegpunkten optimiert (JOJO Wertung) - Die Auswertung erfolgt
          automatisch nach Einreichen des Fluges und wird nicht nachbearbeitet.
        </td>
      </tr>

      <tr>
        <td colspan="2"></td>
      </tr>

      <tr>
        <td style="white-space: nowrap">
          <img src="../images/Aufgaben/Aufg_dreieck.png" />
        </td>
        <td><b>Geschlossenes Dreieck</b></td>
      </tr>
      <tr>
        <td></td>
        <td>
          Ein Flug kann als Dreiecksflug gewertet werden, wenn die Entfernung
          zwischen Abflugpunkt und Endpunkt weniger als 20 % der durch die drei
          Wegpunkte definierten Dreiecksstrecke beträgt. Als Wertungsstrecke
          gilt dann die Dreiecksstrecke um die drei Wegpunkte reduziert um den
          Abstand zwischen Abflugpunkt und Endpunkt.
        </td>
      </tr>

      <tr>
        <td colspan="2"></td>
      </tr>

      <tr>
        <td style="white-space: nowrap">
          <img src="../images/Aufgaben/Aufg_fai.png" />
        </td>
        <td><b>FAI-Dreieck</b></td>
      </tr>
      <tr>
        <td></td>
        <td>
          Es gelten die Regeln eines Dreiecksflugs, zusätzlich muss es sich um
          ein FAI-Dreieck nach der Definition handeln, dass der kürzeste
          Schenkel mindestens 28 % der Gesamtstrecke beträgt.
        </td>
      </tr>

      <tr>
        <td colspan="2"></td>
      </tr>

      <tr>
        <td colspan="2">
          <b><u>Mindestpunktzahl:</u></b>
        </td>
      </tr>
      <tr>
        <td></td>
        <td>
          Die Mindestpunktzahl wird für 2021 auf
          <b>60 Punkte</b> gesetzt.
        </td>
      </tr>

      <tr>
        <td colspan="2"></td>
      </tr>

      <tr>
        <td colspan="2">
          <b><u>Hinweise:</u></b>
        </td>
      </tr>
      <tr>
        <td></td>
        <td>
          F-Schlepp: Schlepphöhe darf 1000m und 5km Radius vom Flugfeld nicht
          überschreiten.
        </td>
      </tr>
    </tbody>
  </table>
</template>
