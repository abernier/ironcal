module.exports = {
  ft: {
    weeks: 9,
    unit: 1, // day is the unit
    weekdaysValues: {
      'MO': ['09:00'],
      'TU': ['09:00'],
      'WE': ['09:00'],
      'TH': ['09:00'],
      'FR': ['09:00']
    },
    durationInHours: 7
  },
  pt: {
    weeks: 24,
    unit: .5, // halfday is the unit
    weekdaysValues: {
      'TU': ['18:30'],
      'TH': ['18:30'],
      'SA': ['10:00', '14:00'] // a saturday counts for 2 halfdays (unit)
    },
    durationInHours: 3
  }
}