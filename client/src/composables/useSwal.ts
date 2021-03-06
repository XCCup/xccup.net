import Swal from "sweetalert2";

const DEFAULT_SUCCESS_MSG = "Änderung erfolgreich";
const DEFAULT_FAILED_MSG = "Da ist leider was schief gelaufen";
const DEFAULT_CONFIRM_COLOR = "#08556d";

function createToast() {
  return Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });
}

export default () => {
  const showSuccessToast = (message = DEFAULT_SUCCESS_MSG) => {
    createToast().fire({
      icon: "success",
      title: message,
    });
  };

  const showFailedToast = (message = DEFAULT_FAILED_MSG) => {
    createToast().fire({
      icon: "error",
      title: message,
    });
  };

  const showSuccessAlert = async (text: string) => {
    await Swal.fire({
      icon: "success",
      confirmButtonColor: DEFAULT_CONFIRM_COLOR,
      text,
    });
  };

  const showInfoBox = async (text: string, title?: string, footer?: string) => {
    await Swal.fire({
      icon: "question",
      title,
      text,
      footer,
    });
  };

  return {
    showSuccessToast,
    showFailedToast,
    showSuccessAlert,
    showInfoBox,
  };
};
