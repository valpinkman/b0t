import format from 'date-fns/format'
import startOfWeek from 'date-fns/startOfWeek'
import endOfWeek from 'date-fns/endOfWeek'
import subWeeks from 'date-fns/subWeeks'

type DateArg = Date | number

/**
 * getMonday
 * find the monday of the provided date
 * returns it as a formated string 'YYYY-MM-DD'
 * @param {Date} startingDate
 * @returns string
 */
export const getMonday = (startingDate: DateArg = Date.now()): string => {
  const start = startOfWeek(startingDate, { weekStartsOn: 1 })
  const clean = format(start, 'yyyy-MM-dd')
  return clean
}

/**
 * getMonday
 * find the monday of the provided date
 * returns it as a formated string 'YYYY-MM-DD'
 * @param {Date} startingDate
 * @returns string
 */
export const getSunday = (startingDate: DateArg = Date.now()): string => {
  const end = endOfWeek(startingDate, { weekStartsOn: 1 })
  const clean = format(end, 'yyyy-MM-dd')
  return clean
}

/**s
 * getPreviousMonday
 * uses weeksAgo to find previous mondays
 * @param {number} weeksAgo
 * @returns string
 */
export const getPreviousMonday = (weeksAgo: number = 0) => {
  const now = Date.now()
  const weekBefore = subWeeks(now, weeksAgo)
  return getMonday(weekBefore)
}
