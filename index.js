const conf = require('./conf.js')

require("luxon")
const { RRule, RRuleSet } = require("rrule")

const moment = require('moment-timezone')

const ics = require('ics')

const defaults = {
  ftpt: 'ft',
  tzid: 'Europe/Paris'
}

function utc(str) {
  //
  // Convert a str '2020-06-02' to an UTC date
  //

  const arr = str.split('-')
  arr[1]--;
  
  return Date.UTC(...arr)
}

// List of RRule's days abbrs: ["MO", "TU", ...]
const RRuleWeekdays = [RRule.SU, RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA].map(el => el.toString());

function dayslist(ftpt=defaults.ftpt, tzid=defaults.tzid, start=new Date().toISOString().split('T')[0], hollidays=[]) {
  const dtstart = new Date(utc(start))

  const weeks = conf[ftpt].weeks // ex: 24
  const unit = conf[ftpt].unit // ex: .5
  const weekdaysValues = conf[ftpt].weekdaysValues // {TU: ['18:30'], TH: ['18:30'], SA: ['10:00','14:00']}
  const unitsPerWeek = Object.values(weekdaysValues).reduce((acc, curr) => acc + curr.length, 0) // 5 for FT / 4 for PT

  //
  // 1. Constitute a set of reccuring dates
  //

  const rrules = []

  const TOTAL = 600 // We want a quite big amount of dates (to have enough for 2.)

  const weekdays = Object.keys(weekdaysValues) // ex: ["TU", "TH", "SA"]
  weekdays.forEach(weekday => {
    const weekdayValue = weekdaysValues[weekday].length // ex: 2 for "SA"

    // Trick: it will add X entries of this day: for ex, will add 2 Sa
    rrules.push(new RRule({
      interval: 24/weekdayValue, // every 12
      freq: RRule.HOURLY, // hours
      byweekday: weekday, // on: SA
      dtstart, // starting from
      count: TOTAL/weekdays.length // numbers of instances
    }))
  })

  // Constitute a `rruleSet` with all these `rrules`
  const rruleSet = new RRuleSet(true)
  rrules.forEach(rrule => {
    rrule.all().forEach(dt => rruleSet.rdate(dt))
  })
  // console.log(rruleSet.all())

  //
  // Exclude hollidays dates
  //

  const exrules = []
  hollidays.forEach(str => {
    const d = new Date(utc(str))

    const weekday = RRuleWeekdays[d.getDay()] // "SA"
    const weekdayValue = weekdaysValues[weekday]?.length // 2

    if (weekdayValue) { // if this holli-day is a working day => remove it
      exrules.push(new RRule({
        interval: 24/weekdayValue, // every 12
        freq: RRule.HOURLY, // hours
        dtstart: d,
        count: weekdayValue, // number of instances to remove
      }))
    }
    
  })

  // Remove all the `exrules` from the `rruleSet`
  exrules.forEach(exrule => {
    exrule.all().forEach(dt => rruleSet.exdate(dt))
  })

  //
  // 2. Pick dates from the big set of reccurring dates to have just enough to complete the number of weeks of the cohort
  //

  const days = []
  let sum = 0;

  const daySeries = rruleSet.all()

  let i = 0;
  
  // {TU: 0, TH: 0, SA: 0}
  const counters = Object.entries(weekdaysValues).reduce((o, [k, v]) => {
    o[k] = 0
    return o
  }, {})

  // FT: 45 days (9*5*1) / PT: 48 halfdays (24*4*.5)
  while (sum < weeks*unitsPerWeek*unit) {
    let d = daySeries[i]
    sum += unit
    
    const weekday = RRuleWeekdays[d.getDay()] // "SA"

    let j = counters[weekday]++
    j = j%weekdaysValues[weekday].length

    const [hours, mins] = weekdaysValues[weekday][j].split(':')

    const day = d.toISOString().split('T')[0];
    const d_with_time = moment.tz(`${day} ${hours}:${mins}`, tzid); // set local time
    // console.log(d_with_time.utc().format())

    days.push(d_with_time.utc().toDate()) // push as a normal JS-date
    
    i++;
  }

  return days;
}

function dayslist2ics(days, ftpt=defaults.ftpt) {
  // ics: see https://www.npmjs.com/package/ics/v/2.10.0
  const { error, value } = ics.createEvents(days.map(day => {
    // console.log(day)

    const start = [day.getUTCFullYear(), day.getUTCMonth()+1, day.getUTCDate(), day.getUTCHours(), day.getUTCMinutes()]

    return {
      title: `Ironhack`,
      start,
      startInputType: 'utc', // see: https://github.com/adamgibbons/ics/issues/126#issuecomment-586352771
      duration: { minutes: conf[ftpt].durationInHours*60 }
    }
  }))

  if (error) throw error

  return value
}

module.exports = {
  dayslist,
  dayslist2ics
}
