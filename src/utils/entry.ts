import { DateRange, EntryInstance, EntryType, RoutineEnum } from '@/entry/types-constants';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { getDaysFromDateToDateNow, getMonthsFromDateToDateNow, getWeeksFromDateToDateNow } from './date';
dayjs.extend(weekOfYear);

// any entry type, today have any entry, you count it, how many days you have been recording
export const calcRecordedLongestStreaks = (entryInstancesMap: { [key: string]: EntryInstance[] }) => {
  const entryKeys = Object.keys(entryInstancesMap);
  const sortedDates = entryKeys.sort();
  let longestStreak = 0;
  let currentStreak = 0;
  let previousDate = null;
  for (const date of sortedDates) {
    const entries = entryInstancesMap[date];

    if (entries.length > 0 && previousDate && dayjs(date).diff(dayjs(previousDate), 'day') === 1) {
      currentStreak++;
    } else {
      currentStreak = entries.length > 0 ? 1 : 0; // if today have no entry, reset streak
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    previousDate = entries.length > 0 ? date : null;
  }

  return longestStreak;
};

// any entry type, from today to back, how many days you have been recording
export const calcRecordedCurrentStreaks = (entryInstancesMap: { [key: string]: EntryInstance[] }) => {
  const entryKeys = Object.keys(entryInstancesMap);
  const sortedDates = entryKeys.sort();
  let now = dayjs();
  let currentStreak = 0;
  while (entryInstancesMap[now.format('YYYY-MM-DD')]?.length) {
    currentStreak++;
    now = now.subtract(1, 'day');
  }
  return currentStreak;
};

const groupByWeek = (dates: string[]): Record<string, string[]> => {
  const grouped: Record<string, string[]> = {};
  for (const date of dates) {
    const day = dayjs(date);
    const week = `${day.format('YYYY')}-${dayjs(day).week()}`;
    if (!grouped[week]) {
      grouped[week] = [];
    }
    grouped[week].push(date);
  }
  return grouped;
};

const groupByMonth = (dates: string[]): Record<string, string[]> => {
  const grouped: Record<string, string[]> = {};
  for (const date of dates) {
    const month = dayjs(date).format('YYYY-MM');
    if (!grouped[month]) {
      grouped[month] = [];
    }
    grouped[month].push(date);
  }
  return grouped;
};

export const calcEntryTypeLongestStreaks = (entryInstancesMap: { [key: string]: EntryInstance[] }, routine?: RoutineEnum) => {
  const sortedDates = Object.keys(entryInstancesMap).sort();
  const entryTypeStreaks: Record<string, number> = {};
  const entryTypeMaxStreaks: Record<string, number> = {};
  switch (routine) {
    case RoutineEnum.daily: {
      for (const date of sortedDates) {
        const entries = entryInstancesMap[date]; // date - > 2023-08-01
        const entryTypesToday = new Set(entries.map((entry) => entry.entryTypeId));

        // check if each entryType is consecutive
        for (const entryType of entryTypesToday) {
          let streak = 1; // default start new streak
          // if (idx > 0) {
          const previousDate = dayjs(date).subtract(1, 'day').format('YYYY-MM-DD');
          const previousEntryTypes = entryInstancesMap?.[previousDate]?.length
            ? new Set(entryInstancesMap[previousDate].map((entry) => entry.entryTypeId))
            : new Set();
          if (previousEntryTypes.has(entryType)) {
            streak = (entryTypeStreaks[entryType] || 0) + 1; // if consecutive, increase streak
          }
          // }

          entryTypeStreaks[entryType] = streak;
          entryTypeMaxStreaks[entryType] = Math.max(entryTypeMaxStreaks[entryType] || 0, streak);
        }

        // if some entryType have no entry today, reset streak
        for (const entryType in entryTypeStreaks) {
          if (!entryTypesToday.has(entryType)) {
            entryTypeMaxStreaks[entryType] = Math.max(entryTypeMaxStreaks[entryType] || 0, entryTypeStreaks[entryType]);
            entryTypeStreaks[entryType] = 0;
          }
        }
      }
      return entryTypeMaxStreaks;
    }
    case RoutineEnum.weekly: {
      const groupedByWeek = groupByWeek(sortedDates); /** {
				"2023-31": [
						"2023-08-01",
						"2023-08-02",
						"2023-08-03",
						"2023-08-04"
				]
		} */
      const weekKeys = Object.keys(groupedByWeek).sort();
      for (const week of weekKeys) {
        const entriesKeys = groupedByWeek[week]; // ['2023-08-01', '2023-08-02', '2023-08-03']
        const entryTypeCurWeek = new Set(
          entriesKeys
            .map((key) => entryInstancesMap[key])
            .flat(1)
            .map((entry) => entry?.entryTypeId),
        );
        // check if each entryType is consecutive
        for (const entryType of entryTypeCurWeek) {
          let streak = 1;
          // if (idx > 0) {
          const [y, w] = week.split('-').map((v) => parseInt(v, 10));
          let previousWeek;
          if (!(w - 1)) {
            previousWeek = `${y - 1}-${dayjs()
              .year(y - 1)
              .endOf('year')
              .week()}`;
          } else previousWeek = `${y}-${w - 1}`;

          const previousEntryTypes = groupedByWeek?.[previousWeek]?.length
            ? new Set(
                groupedByWeek[previousWeek]
                  .map((key) => entryInstancesMap[key])
                  .flat(1)
                  .map((entry) => entry?.entryTypeId),
              )
            : new Set();
          if (previousEntryTypes.has(entryType)) {
            streak = (entryTypeStreaks[entryType] || 0) + 1; // if consecutive, increase streak
          }
          // }
          entryTypeStreaks[entryType] = streak;
          entryTypeMaxStreaks[entryType] = Math.max(entryTypeMaxStreaks[entryType] || 0, streak);
        }
        // if some entryType have no entry today, reset streak
        for (const entryType in entryTypeStreaks) {
          if (!entryTypeCurWeek.has(entryType)) {
            entryTypeMaxStreaks[entryType] = Math.max(entryTypeMaxStreaks[entryType] || 0, entryTypeStreaks[entryType]);
            entryTypeStreaks[entryType] = 0;
          }
        }
      }
      return entryTypeMaxStreaks;
    }
    case RoutineEnum.monthly: {
      const groupedByMonth = groupByMonth(sortedDates); /** {
				"2023-08": [
						"2023-08-01",
						"2023-08-02",
						"2023-08-03",
						"2023-08-04"
				]
		} */
      const monthKeys = Object.keys(groupedByMonth).sort();
      for (const month of monthKeys) {
        const entriesKeys = groupedByMonth[month];

        const entryTypeCurMonth = new Set(
          entriesKeys
            .map((key) => entryInstancesMap[key])
            .flat(1)
            .map((entry) => entry?.entryTypeId),
        );

        // check if each entryType is consecutive
        for (const entryType of entryTypeCurMonth) {
          let streak = 1;
          const previousMonth = dayjs(month).subtract(1, 'month').format('YYYY-MM');
          const previousEntryTypes = groupedByMonth?.[previousMonth]?.length
            ? new Set(
                groupedByMonth[previousMonth]
                  .map((key) => entryInstancesMap[key])
                  .flat(1)
                  .map((entry) => entry?.entryTypeId),
              )
            : new Set();

          if (previousEntryTypes.has(entryType)) {
            streak = (entryTypeStreaks[entryType] || 0) + 1; // if consecutive, increase streak
          }
          entryTypeStreaks[entryType] = streak;
          entryTypeMaxStreaks[entryType] = Math.max(entryTypeMaxStreaks[entryType] || 0, streak);
        }
        // if some entryType have no entry this month, reset streak
        for (const entryType in entryTypeStreaks) {
          if (!entryTypeCurMonth.has(entryType)) {
            entryTypeMaxStreaks[entryType] = Math.max(entryTypeMaxStreaks[entryType] || 0, entryTypeStreaks[entryType]);
            entryTypeStreaks[entryType] = 0;
          }
        }
      }
      return entryTypeMaxStreaks;
    }
    case RoutineEnum.adhoc:
    default:
      return entryTypeMaxStreaks;
  }
};

export const getEntryInstanceDateRange = (entryInstancesMap: { [key: string]: EntryInstance[] }, range: DateRange) => {
  const now = dayjs();
  const dates = Object.keys(entryInstancesMap).sort();
  let earliestDay = dates[0];
  const pre7Day = now.subtract(6, 'day');
  if (pre7Day.isBefore(earliestDay)) earliestDay = pre7Day.format('YYYY-MM-DD');
  switch (range) {
    case 'week':
      return getWeeksFromDateToDateNow(earliestDay);
    case 'month':
      return getMonthsFromDateToDateNow(earliestDay);
    case 'day':
    default:
      return getDaysFromDateToDateNow(earliestDay);
  }
};

// get total instance count of this entryType
export const getEntryTypesTotalInstance = (entryInstancesMap: { [key: string]: EntryInstance[] }) => {
  const entryTypeTotalInstance: { [key: string]: number } = {};
  for (const key in entryInstancesMap) {
    if (!entryInstancesMap?.[key]?.length) continue;
    for (const { entryTypeId } of entryInstancesMap[key]) {
      entryTypeTotalInstance?.[entryTypeId] ? entryTypeTotalInstance[entryTypeId]++ : (entryTypeTotalInstance[entryTypeId] = 1);
    }
  }
  return entryTypeTotalInstance;
};

// sort by total instance count of this entryType, all days and all instances are counted, the more, the more commonly used
export const sortEntryTypesArray = (entryTypeArray: EntryType[], entryInstancesMap: { [key: string]: EntryInstance[] }) => {
  const entryTypeTotalInstance = getEntryTypesTotalInstance(entryInstancesMap);
  entryTypeArray.sort((a, b) => {
    const sumA = entryTypeTotalInstance?.[a.id] ?? 0;
    const sumB = entryTypeTotalInstance?.[b.id] ?? 0;
    if (sumA > sumB) return -1;
    else return 1;
  });
  console.log({ entryTypeTotalInstance, entryTypeArray, entryInstancesMap });
  return entryTypeArray;
};
