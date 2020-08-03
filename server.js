const express = require('express')

const app = express()

const {dayslist, dayslist2ics} = require('./index.js')
const { ft } = require('./conf.js')

app.listen()

app.get('/', (req, res, next) => {
  console.log(req.query)

  let {ftpt, tzid, start, hollidays='', calname} = req.query

  hollidays = hollidays.split(',').filter(el => el.length) // ',' split + remove empty

  const days = dayslist(ftpt, tzid, start, hollidays)
  const ics = dayslist2ics(days, ftpt)

  res.attachment(`${calname || 'ironhack'}.ics`)
  res.send(ics)
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`app listening on port ${port}`))