import { readonly, ref, computed } from "vue";
import ApiService from "@/services/ApiService";

const airbuddiesFlightData = ref([]);
const checkedAirbuddFlightIds = ref([]);

export default () => {
  // Getters

  const activeAirbuddyFlights = computed(() => {
    let tmp = [];
    airbuddiesFlightData.value.forEach((element) => {
      tmp.push({
        buddyName: element.user.firstName,
        buddyFlightId: element.id,
        isActive: checkedAirbuddFlightIds.value.includes(element.id),
        fixes: element.fixes,
      });
    });
    return tmp;
  });

  // Mutations
  const updateCheckedAirbuddies = (data) => {
    checkedAirbuddFlightIds.value = data;
  };

  // Actions
  const fetchAll = async (airbuddies) => {
    if (airbuddiesFlightData.value.length > 0) return;
    airbuddies.forEach(async (buddy) => {
      airbuddiesFlightData.value.push(
        (await ApiService.getFlight(buddy.externalId)).data
      );
    });
  };

  return {
    fetchAll,
    updateCheckedAirbuddies,
    airbuddiesFlightData: readonly(airbuddiesFlightData),
    checkedAirbuddFlightIds: readonly(checkedAirbuddFlightIds),

    activeAirbuddyFlights,
  };
};
