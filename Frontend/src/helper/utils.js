export function isIsoDateWithoutTime(string) {
    const regex = /^\d{4}-(0[0-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/g;
    return string?.match(regex) != null
}

export function convertHeightStringToMetersValue(value){
    if (value == "GND") return 0;
    if (value.includes("ft")) return Math.round(parseInt(value.substring(0, 5)) * 0.3048);
    if (value.includes("FL")) return Math.round(parseInt(value.substring(2, value.length)) * 30.48);

    return 0;
}