import { ref, computed } from "@vue/reactivity";
import ApiService from "@/services/ApiService";

const notifications = ref(0);

export default () => {
  // Getters
  const getNotifications = computed(() => notifications.value);

  // Actions
  const refreshNotifications = async () => {
    try {
      const res = await ApiService.getAdminNotifications();
      notifications.value = res.data;
    } catch (error) {
      console.log(error);
      notifications.value = 0;
    }
  };

  return {
    getNotifications,
    refreshNotifications,
  };
};
