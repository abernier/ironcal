#!/usr/bin/env node

const {readFileSync} = require('fs')
const {resolve} = require('path')

const ics = require('ics')

const conf = require('./conf.js')
const main = require('./index.js')

var argv = require('minimist')(process.argv.slice(2));
// console.log(argv);

const ftpt = argv._[0] || 'ft'
const start = argv.start
const hollidays = argv.hollidays && argv.hollidays.split(',')
const help = argv.help

const man = readFileSync(resolve(__dirname, './man.txt'), {encoding: 'utf-8'});
if (help) {
  console.log(man);
  process.exit(0);
}

const ret = main(ftpt, start, hollidays)
// console.log(JSON.stringify(ret, null, 4))

// ics: see https://www.npmjs.com/package/ics/v/2.10.0
const { error, value } = ics.createEvents(ret.map(day => {
  // console.log(day)

  return {
    title: `Ironhack`,
    start: [day.getFullYear(), day.getMonth()+1, day.getDate(), day.getHours(), day.getMinutes()],
    duration: { minutes: conf[ftpt].durationInHours*60 }
  }
}))

if (error) {
  console.error(error);
  process.exit(1);
}

console.log(value)