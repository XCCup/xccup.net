export function isIsoDateWithoutTime(string) {
    const regex = /^\d{4}-(0[0-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/g;
    return string?.match(regex) != null
}

export function convertHeightStringToMetersValue(value){
    const FACTOR_FT_TO_M = 0.3048

    if (value == "GND") return 0;
    //FL is calculated in relation to a local pressure value we don't know. Therefore we will return undefined.
    if (value.includes("FL")) return undefined;
    // if (value.includes("FL")) return Math.round(parseInt(value.substring(2, value.length)) * FACTOR_FT_TO_M * 100);
    if (value.includes("ft")) return Math.round(parseInt(value.substring(0, 5)) * FACTOR_FT_TO_M);

    return 0;
}