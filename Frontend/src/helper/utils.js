export function isIsoDateWithoutTime(string) {
    const regex = /^\d{4}-(0[0-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/g;
    return string?.match(regex) != null
}