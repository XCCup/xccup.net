const { easter } = require("date-easter");

function isEaster(currentDate) {
  // Eastern is meant as easter monday
  const easterDate = new Date(Date.parse(easter(currentDate)));
  return sameDay(currentDate, easterDate);
}

function isPentecost(currentDate) {
  // 7 weeks after easter
  const easterDate = new Date(Date.parse(easter(currentDate)));
  const pentecostDate = new Date(easterDate.valueOf());
  pentecostDate.setDate(pentecostDate.getDate() + 7 * 7);
  return sameDay(currentDate, pentecostDate);
}

function isCorpusChristi(currentDate) {
  //60 days after easter
  const easterDate = new Date(Date.parse(easter(currentDate)));
  const chorpusDate = new Date(easterDate.valueOf());
  chorpusDate.setDate(chorpusDate.getDate() + 60);
  return sameDay(currentDate, chorpusDate);
}

function isAscension(currentDate) {
  //39 days after easter
  const easterDate = new Date(Date.parse(easter(currentDate)));
  const ascensionDate = new Date(easterDate.valueOf());
  ascensionDate.setDate(ascensionDate.getDate() + 39);
  return sameDay(currentDate, ascensionDate);
}

function isFirstOfMay(currentDate) {
  return currentDate.getMonth() == 4 && currentDate.getDate() == 1;
}

function isHoliday(currentDate) {
  console.debug("Check for holiday");
  return (
    isFirstOfMay(currentDate) ||
    isEaster(currentDate) ||
    isPentecost(currentDate) ||
    isAscension(currentDate) ||
    isCorpusChristi(currentDate)
  );
}

function isNoWorkday(dateAsString) {
  const currentDate = new Date(dateAsString);
  const numberOfday = new Date(currentDate).getDay();
  switch (numberOfday) {
    case 0: //Sunday
    case 5: //Friday
    case 6: //Saturday
      return true;
    default:
      return isHoliday(currentDate);
  }
}

function sameDay(date1, date2) {
  return (
    date1.getDate() === date2.getDate() && date1.getMonth() === date2.getMonth()
  );
}

exports.isEaster = isEaster;
exports.isPentecost = isPentecost;
exports.isCorpusChristi = isCorpusChristi;
exports.isAscension = isAscension;
exports.isFirstOfMay = isFirstOfMay;
exports.isHoliday = isHoliday;
exports.isNoWorkday = isNoWorkday;
