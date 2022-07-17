export function formatFlightDuration(duration: number | undefined): string {
  if (!duration) return "";
  const ms = duration * 60 * 1000;

  //@ts-expect-error
  let minutes: number | string = parseInt((ms / (1000 * 60)) % 60);

  //@ts-expect-error
  let hours = parseInt((ms / (1000 * 60 * 60)) % 24);
  minutes = minutes < 10 ? "0" + minutes : minutes;

  return hours + ":" + minutes + "h";
}

