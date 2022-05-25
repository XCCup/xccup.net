import { ref, computed } from "@vue/reactivity";
import ApiService from "@/services/ApiService";

const notifications = ref(0);
let latestRefresh: number | null = null;

export default () => {
  // Getters
  const getNotifications = computed(() => notifications.value);

  // Actions
  const refreshNotifications = async () => {
    if (latestRefresh && latestRefresh + 1000 > Date.now()) return;
    try {
      latestRefresh = Date.now();
      const res = await ApiService.getAdminNotifications();
      notifications.value = res.data;
    } catch (error) {
      console.log(error);
      latestRefresh = null;
      notifications.value = 0;
    }
  };

  return {
    getNotifications,
    refreshNotifications,
  };
};
