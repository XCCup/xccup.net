<script setup lang="ts">
// @ts-expect-error
import metarParser from "metar-parser";
import { computed } from "vue";
import type { METAR } from "@/types/METAR";
import useMapPosition from "@/composables/useMapPosition";
import useFlight from "@/composables/useFlight";
import useSwal from "@/composables/useSwal";

const { showInfoBox } = useSwal();
const { flight } = useFlight();
const { getPositions } = useMapPosition();

const decodedMetars = computed(() => {
  if (!flight.value?.flightMetarData) {
    return [];
  }
  // @ts-expect-error TODO: Readonly ref…
  return decodeMetars(flight.value?.flightMetarData);
});

function decodeMetars(data: string[]): METAR[] {
  try {
    return data.map((metar): METAR => {
      return metarParser(metar);
    });
  } catch (error) {
    console.log(error);
    return [];
  }
}

const currentMetar = computed(() => {
  if (!getPositions?.value[0]?.time) return;
  return findClosestMetar(getPositions.value[0].time, decodedMetars.value);
});

// METAR only contains the day of the month not a complete date.
// To compare it to a timestamp we use the elapsed minutes of a day instead of the timestamp
function getElapsedMinutesOfDay(date: string | number): number {
  const _date = new Date(date);
  return _date.getHours() * 60 + _date.getMinutes();
}

function decodeClouds(data?: string): string {
  // TODO: No data?
  if (!data) return "Keine";
  switch (data) {
    case "NSC":
      return "Keine";
    case "NCD":
      return "Keine";
    case "CAVOK":
      return "Keine";
    case "FEW":
      return "1 bis 2 Achtel";
    case "SCT":
      return "3 bis 4 Achtel";
    case "BKN":
      return "5 bis 7 Achtel";
    case "OVC":
      return "8 Achtel";
  }
  return "";
}
function decodeWind(metar?: METAR): string {
  if (!metar) return "";
  let direction: number | string = "";
  if (typeof metar.wind.direction == "number")
    direction = metar.wind.direction + "°";
  if (typeof metar.wind.direction == "string") direction = metar.wind.direction;

  const speed = metar.wind.speedMps
    ? Math.round(metar.wind.speedMps * 3.6)
    : 0 + "km/h";

  return direction + " / " + speed + " km/h";
}
function findClosestMetar(
  timestamp: number,
  metars: METAR[]
): METAR | undefined {
  if (!metars.length || !timestamp) {
    return;
  }
  return metars.reduce((prev, curr) => {
    const aDiff = Math.abs(
      getElapsedMinutesOfDay(prev.time.date) - getElapsedMinutesOfDay(timestamp)
    );
    const bDiff = Math.abs(
      getElapsedMinutesOfDay(curr.time.date) - getElapsedMinutesOfDay(timestamp)
    );

    if (aDiff == bDiff) {
      return prev > curr ? prev : curr;
    } else {
      return bDiff < aDiff ? curr : prev;
    }
  });
}
</script>
<template>
  <div v-if="decodedMetars?.length" class="row row-cols-2 row-cols-md-4 my-2">
    <div class="col">
      <a
        href="#"
        @click.prevent="
          showInfoBox(
            'Vereinfachte METAR Darstellung der nächstgelegenen Flughäfen über den Verlauf des Fluges. So bekommt man ein ungefähres Bild der tatsächlichen meteorologischen Verhältnisse.',
            undefined,
            `<a href='https://de.wikipedia.org/wiki/METAR' target='_blank'>METAR erklärt (Wikipedia)</a>`
          )
        "
      >
        <i class="bi bi-info-circle"> Wetter (Beta)</i><br />
      </a>
    </div>
    <div class="col">
      <i class="bi bi-wind"></i>
      {{ decodeWind(currentMetar) }}
    </div>
    <div class="col">
      <i class="bi bi-arrow-bar-down"></i>
      {{ currentMetar?.altimeter.millibars ?? 0 }} hPa
    </div>
    <div class="col">
      <i class="bi bi-cloud"></i>
      {{ decodeClouds(currentMetar?.clouds[0]?.code) }}
    </div>
  </div>
  {{ currentMetar }}
</template>
<style></style>
