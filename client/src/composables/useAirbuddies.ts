import { readonly, ref, computed } from "vue";
import type { BuddyTrack } from "@/types/BuddyTrack";
import ApiService from "@/services/ApiService";
import type { Flight } from "@/types/Flight";

const airbuddiesFlightData = ref<Flight[]>([]);
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
  const fetchAll = async (airbuddies: Flight[]): Promise<void> => {
    if (airbuddiesFlightData.value.length > 0) return;

    airbuddiesFlightData.value = (
      await Promise.all(
        airbuddies.map((buddy) =>
          ApiService.getFlight(buddy.externalId.toString())
        )
      )
    ).map(({ data }) => data);
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
