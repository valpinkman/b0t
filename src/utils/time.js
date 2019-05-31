/**
 * Time and Date related utils
 */

const startOfWeek = require('date-fns/start_of_week')
const endOfWeek = require('date-fns/end_of_week')
const subWeeks = require('date-fns/sub_weeks')
const format = require('date-fns/format')

/**
 * getMonday
 * find the monday of the provided date
 * returns it as a formated string 'YYYY-MM-DD'
 * @param {Date} startingDate
 * @returns string
 */
const getMonday = (startingDate = Date.now()) => {
  const start = startOfWeek(startingDate, { weekStartsOn: 1 })
  const clean = format(start, 'YYYY-MM-DD')
  return clean
}

/**
 * getMonday
 * find the monday of the provided date
 * returns it as a formated string 'YYYY-MM-DD'
 * @param {Date} startingDate
 * @returns string
 */
const getSunday = (startingDate = Date.now()) => {
  const end = endOfWeek(startingDate, { weekStartsOn: 1 })
  const clean = format(end, 'YYYY-MM-DD')
  return clean
}

/**
 * getPreviousMonday
 * uses weeksAgo to find previous mondays
 * @param {number} weeksAgo
 * @returns string
 */
const getPreviousMonday = (weeksAgo = 0) => {
  const now = Date.now()
  const weekBefore = subWeeks(now, weeksAgo)
  return getMonday(weekBefore)
}

module.exports.getMonday = getMonday
module.exports.getPreviousMonday = getPreviousMonday
module.exports.getSunday = getSunday
