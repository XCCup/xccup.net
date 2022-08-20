import { readonly, ref, computed } from "vue";
import type { Airbuddy, BuddyTrack, AirbuddyFlight } from "@/types/Airbuddy";
import ApiService from "@/services/ApiService";
import type { Flight } from "@/types/Flight";
import type { DeepReadonly } from "vue";

const airbuddiesFlightData = ref<AirbuddyFlight[]>([]);
const checkedAirbuddyFlightIds = ref<string[]>([]);

export default () => {
  // Getters
  const activeAirbuddyFlights = computed((): BuddyTrack[] => {
    const buddyTracks: BuddyTrack[] = [];
    airbuddiesFlightData.value.forEach((element) => {
      buddyTracks.push({
        buddyName: element.user.firstName,
        buddyFlightId: element.id,
        isActive: checkedAirbuddyFlightIds.value.includes(element.id),
        fixes: element.fixes,
      });
    });
    return buddyTracks;
  });

  const airbuddiesInUse = computed((): boolean =>
    checkedAirbuddyFlightIds.value.length ? true : false
  );

  // Mutations
  const updateCheckedAirbuddies = (checkedAirBuddyIds: string[]): void => {
    checkedAirbuddyFlightIds.value = checkedAirBuddyIds;
  };

  // Actions
  const fetchAll = async (
    airbuddies: DeepReadonly<AirbuddyFlight[]>
  ): Promise<void> => {
    if (airbuddiesFlightData.value.length > 0) return;

    airbuddiesFlightData.value = (
      await Promise.all(
        airbuddies.map((buddy) =>
          ApiService.getFlight(buddy.externalId.toString())
        )
      )
    ).map(({ data }) => data);
    // Map fetched buddy flight with displayed flight
    // Should be obsolet when we refactor the component
    airbuddies.forEach((b) => {
      const found = airbuddiesFlightData.value.find(
        (f) => f.externalId == b.externalId
      );
      if (found) found.correlationPercentage = b.correlationPercentage;
    });
  };

  const resetAirbuddyData = (): void => {
    airbuddiesFlightData.value = [];
    checkedAirbuddyFlightIds.value = [];
  };

  return {
    fetchAll,
    updateCheckedAirbuddies,
    resetAirbuddyData,
    airbuddiesFlightData: readonly(airbuddiesFlightData),
    checkedAirbuddyFlightIds: readonly(checkedAirbuddyFlightIds),
    activeAirbuddyFlights,
    airbuddiesInUse,
  };
};
